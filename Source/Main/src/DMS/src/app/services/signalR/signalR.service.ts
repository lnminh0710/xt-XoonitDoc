import { Injectable, Injector, EventEmitter } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@aspnet/signalr';
import { MessagePackHubProtocol } from '@aspnet/signalr-protocol-msgpack';
import remove from 'lodash-es/remove';
import { BaseService } from '../base.service';
import { Uti } from '@app/utilities/uti';
import { SignalRNotifyModel, User } from '@app/models';
import { Configuration, SignalRActionEnum, SignalRJobEnum, SignalRTypenEnum } from '@app/app.constants';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { DocumentThumbnailActions } from '@app/state-management/store/actions';
import { FileProcessPopUpActions } from '@app/state-management/store/actions';

@Injectable()
export class SignalRService extends BaseService {
    public messageReceived = new EventEmitter<Array<SignalRNotifyModel>>();
    public messageWidgetSavedSuccessReceived = new EventEmitter<SignalRNotifyModel>();
    public messageReIndexElasticSearch = new EventEmitter<SignalRNotifyModel>();
    public aprrovalReceived = new EventEmitter<SignalRNotifyModel>();

    private connectionIsEstablished = false;
    private _hubConnection: HubConnection | undefined;
    private url: string = Configuration.PublicSettings.signalRApiUrl + '?env=web&groupName=' + location.host;
    private data: Array<SignalRNotifyModel> = [];
    private userLogin: User;
    private maximumRetryConnecting = 10000; //retry 10000 times
    private numofRetryConnecting = 0;
    private isStartingConnection = false;

    constructor(
        injector: Injector,
        protected uti: Uti,
        private store: Store<AppState>,
        private documentAction: DocumentThumbnailActions,
        private fileProcessPopupAction: FileProcessPopUpActions,
    ) {
        super(injector);

        this.userLogin = this.uti.getUserInfo();
        this.userLogin.color = this.getRandomColor();
        //this.url += '&idApplicationOwner=' + this.userLogin.idApplicationOwner + '&idLogin=' + this.userLogin.id;
        this.url += '&idLogin=' + this.userLogin.id;
    }

    //#region Init SignalR
    private createConnection() {
        this._hubConnection = new HubConnectionBuilder()
            .withUrl(this.url)
            .configureLogging(LogLevel.Information)
            .withHubProtocol(new MessagePackHubProtocol())
            .build();

        /*
        - Timeout for server activity. If the server hasn't sent a message in this interval, the client considers the server disconnected and triggers the onclose event.
        - This value must be large enough for a ping message to be sent from the server and received by the client within the timeout interval.
        - The recommended value is a number at least double the server's KeepAliveInterval value to allow time for pings to arrive.
        - Default is 30 seconds
        */
        this._hubConnection.serverTimeoutInMilliseconds = 120 * 60 * 1000; // 120 minutes

        // re-establish the connection if connection dropped
        this._hubConnection.onclose(() => {
            console.log('_hubConnection onclose', new Date());
            this.startConnection();
        });
    }

    private startConnection(): void {
        if (!this._hubConnection) {
            console.log('_hubConnection is null');
            return;
        }

        if (this.numofRetryConnecting > this.maximumRetryConnecting) {
            this.connectionIsEstablished = false;
            this.isStartingConnection = false;
            return;
        }

        if (this.isStartingConnection) return;

        this.isStartingConnection = true;
        this._hubConnection
            .start()
            .then(() => {
                this.connectionIsEstablished = true;
                this.isStartingConnection = false;
                this.numofRetryConnecting = 0;
                console.log('Hub connection started', new Date());
            })
            .catch((err) => {
                // console.log('Error while establishing connection, retrying...', new Date(), err);
                this.connectionIsEstablished = false;
                this.isStartingConnection = false;
                this.numofRetryConnecting++;
                setTimeout(() => {
                    this.startConnection();
                }, 10000);
            });
    }

    private registerOnServerEvents(): void {
        const listenerNames: string[] = ['ReceiveMessage', 'ReceiveMessageES'];

        listenerNames.forEach((listenerName) => {
            this._hubConnection.on(listenerName, (data: SignalRNotifyModel) => {
                this.processReceiveMessage(data);
            });
        });

        this._hubConnection.on('ReceiveMessageOCR', (data: SignalRNotifyModel) => {
            console.log('ReceiveMessageOCR:', data);
            if (this.isValidMessage(data)) {
                this.store.dispatch(this.documentAction.reloadDocument());
            }
        });
        this._hubConnection.on('ReceiveMessageDocumentProcessing', (data: SignalRNotifyModel) => {
            console.log('ReceiveMessageDocumentProcessing:', data);
            if (this.isValidMessage(data)) {
                this.store.dispatch(this.fileProcessPopupAction.receiveData(data));
            }
        });
    }

    public initHub() {
        if (!Configuration.PublicSettings.enableSignalR) return;

        this.createConnection();
        this.registerOnServerEvents();
        this.startConnection();
    }
    //#endregion

    //#region Helpers

    private getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
    //#endregion

    //#region Invoke: SendMessage
    public sendMessage(message: SignalRNotifyModel): void {
        if (!Configuration.PublicSettings.enableSignalR || this.isStartingConnection) return;

        if (!this.connectionIsEstablished) {
            this.numofRetryConnecting = 0;
            if (this._hubConnection) {
                this.startConnection();
                console.error('Can not connect to SignalR server');
            }
            return;
        }

        //ES - ReIndex
        if (message.Type == SignalRTypenEnum.ES && message.Job == SignalRJobEnum.ES_ReIndex) {
            this._hubConnection.invoke('SendMessageES', message).catch(this.errorHandler.bind(this));
            return;
        }

        //Process for WidgetForm-Editing before sending message to Server
        if (message.Type == SignalRTypenEnum.WidgetForm && message.Job == SignalRJobEnum.Editing) {
            this.widgetFormEditing_SendMessage(message);
        }
        if (message.Type == SignalRTypenEnum.DocumentProcessing) {
            this._hubConnection.invoke('SendMessageDocumentProcessing', message).catch(this.errorHandler.bind(this));
            return;
        }
        if (message.Type == SignalRTypenEnum.DocumentProcessingGetList) {
            message.Action = 'DocumentProcessing_GetProcessingList';
            this._hubConnection
                .invoke('SendMessageDocumentProcessingGetList', message)
                .catch(this.errorHandler.bind(this));
            return;
        }
        this._hubConnection.invoke('SendMessage', message).catch(this.errorHandler.bind(this));
    }

    private errorHandler(err: Error): void {
        if (!err.message) return;

        console.log(err);
        /*
            console.log(err.message);
            //reconnect
            if (!this.isStartingConnection && err.message.indexOf('Cannot send data if the connection is not in the \'Connected\' State') !== -1) {
                console.log(' -> reconnect connection SignalR');
                this.numofRetryConnecting = 0;
                this.connectionIsEstablished = false;
                this.startConnection();
            }
        */
    }
    //#endregion

    //#region process: ReceiveMessage
    private processReceiveMessage(message: SignalRNotifyModel) {
        if (message.Job == SignalRJobEnum.Disconnected && message.UserName == 'api_web') return;

        if (
            (message.Type == SignalRTypenEnum.ES && message.Job == SignalRJobEnum.ES_ReIndex) ||
            (message.Job == SignalRJobEnum.Disconnected && message.UserName == 'ES')
        ) {
            this.esReIndex_ReceiveMessage(message);
            return;
        }

        if (message.Type == SignalRTypenEnum.Approval) {
            this.approval_ReceiveMessage(message);
            return;
        }

        //F5, Close Browser, or User Disconnected with SignalR server
        if (message.Job == SignalRJobEnum.Disconnected && message.UserName) {
            //Remove all data of Disconnected User
            remove(this.data, {
                UserName: message.UserName,
            });
        }

        if (
            (message.Type == SignalRTypenEnum.WidgetForm && message.Job == SignalRJobEnum.Editing) ||
            message.Job == SignalRJobEnum.Disconnected
        ) {
            this.widgetFormEditing_ReceiveMessage(message);
        }
    }

    //#endregion

    //#region WidgetForm: Editing
    public createMessageWidgetFormEditing(): SignalRNotifyModel {
        return this.createSingalRNotifyModel(SignalRTypenEnum.WidgetForm, SignalRJobEnum.Editing);
    }

    private widgetFormEditing_DisplayEditingUsers(model: SignalRNotifyModel) {
        //display editing users
        let items = this.data.filter(
            (p) =>
                p.Type == model.Type &&
                p.Job == model.Job &&
                p.ObjectId == model.ObjectId &&
                p.Action == SignalRActionEnum.ConnectEditing &&
                p.UserName != this.userLogin.loginName,
        );
        this.messageReceived.emit(items);
    }

    private widgetFormEditing_SendMessage(message: SignalRNotifyModel) {
        //SavedSuccessfully only processing for case ReceiveMessage
        if (message.Action == SignalRActionEnum.SavedSuccessfully) return;

        let connectedItemByUserLogin = this.data.find(
            (p) =>
                p.Type == message.Type &&
                p.Job == message.Job &&
                p.ObjectId == message.ObjectId &&
                p.UserName == this.userLogin.loginName,
        );

        switch (message.Action) {
            case SignalRActionEnum.IsThereAnyoneEditing:
                if (connectedItemByUserLogin) break;

                //Only adding when it does not exist
                this.data.push(message);
                break;
            case SignalRActionEnum.ConnectEditing:
            case SignalRActionEnum.StopEditing:
                //If UserLogin does not connect -> do nothing
                if (!connectedItemByUserLogin) break;

                //Only processing when UserLogin connecting
                let updateItem = this.data.find(
                    (p) =>
                        p.Type == message.Type &&
                        p.Job == message.Job &&
                        p.ObjectId == message.ObjectId &&
                        p.UserName == message.UserName,
                );

                if (updateItem) {
                    if (message.Action == SignalRActionEnum.StopEditing) {
                        updateItem.Data = null;
                        updateItem.Action = SignalRActionEnum.StopEditing;
                    } else {
                        updateItem.Action = SignalRActionEnum.ConnectEditing;
                        updateItem.Data = message.Data;
                    }
                } else {
                    this.data.push(message);
                }
                break;
            case SignalRActionEnum.DisconnectEditing:
                //If UserLogin does not connect -> do nothing
                if (!connectedItemByUserLogin) break;

                //remove editing user out of list
                remove(this.data, {
                    Type: message.Type,
                    Job: message.Job,
                    ObjectId: message.ObjectId,
                    UserName: message.UserName,
                });
                break;
            default:
                break;
        } //switch

        this.widgetFormEditing_DisplayEditingUsers(message);
    }

    private widgetFormEditing_ReceiveMessage(message: SignalRNotifyModel) {
        //If a message is fired by myself -> do nothing
        if (message.UserName === this.userLogin.loginName) return;

        if (message.Job == SignalRJobEnum.Disconnected) {
            //display editing users
            let items = this.data.filter(
                (p) =>
                    p.Type == SignalRTypenEnum.WidgetForm &&
                    p.Job == SignalRJobEnum.Editing &&
                    p.Action == SignalRActionEnum.ConnectEditing &&
                    p.UserName != this.userLogin.loginName,
            );
            this.messageReceived.emit(items);

            return;
        }

        switch (message.Action) {
            case SignalRActionEnum.IsThereAnyoneEditing:
                //I am 'user login' and I am editing this item
                let connectedItemByUserLogin = this.data.find(
                    (p) =>
                        p.Type == message.Type &&
                        p.Job == message.Job &&
                        p.ObjectId == message.ObjectId &&
                        p.UserName == this.userLogin.loginName &&
                        p.Action == SignalRActionEnum.ConnectEditing,
                );

                if (connectedItemByUserLogin) {
                    //If another user notifies me and I am also editing this item, I must notify they again.
                    this._hubConnection
                        .invoke('SendMessage', connectedItemByUserLogin)
                        .catch(this.errorHandler.bind(this));
                }

                break;
            case SignalRActionEnum.ConnectEditing:
            case SignalRActionEnum.StopEditing:
                this.widgetFormEditing_SendMessage(message);

                break;
            case SignalRActionEnum.DisconnectEditing:
                //remove editing user out of list
                remove(this.data, {
                    Type: message.Type,
                    Job: message.Job,
                    ObjectId: message.ObjectId,
                    UserName: message.UserName,
                });

                this.widgetFormEditing_DisplayEditingUsers(message);
                break;
            case SignalRActionEnum.SavedSuccessfully:
                //If I'am editing on this item -> show dialog to do: Keep Data/ Reload Data,...
                let item = this.data.find(
                    (p) =>
                        p.Type == message.Type &&
                        p.Job == message.Job &&
                        p.ObjectId == message.ObjectId &&
                        p.UserName == this.userLogin.loginName,
                );

                if (item && item.UserName) {
                    this.messageWidgetSavedSuccessReceived.emit(message);
                }
                break;
            default:
                break;
        } //switch
    }
    //#endregion

    //#region Elastic Search: ReIndex
    public createMessageESReIndex(): SignalRNotifyModel {
        return this.createSingalRNotifyModel(SignalRTypenEnum.ES, SignalRJobEnum.ES_ReIndex);
    }
    public createMessageDocumentProcessingGetList(): SignalRNotifyModel {
        return this.createSingalRNotifyModel(
            SignalRTypenEnum.DocumentProcessingGetList,
            SignalRJobEnum.DocumentProcessingGetList,
        );
    }

    private esReIndex_ReceiveMessage(message: SignalRNotifyModel) {
        //If a message is fired by myself -> do nothing
        if (message.UserName === this.userLogin.loginName) return;

        this.messageReIndexElasticSearch.emit(message);
    }
    //#endregion

    // #region [Private methods]
    private createSingalRNotifyModel(signalRTypenEnum: SignalRTypenEnum, signalRJobEnum: SignalRJobEnum) {
        return new SignalRNotifyModel({
            GroupName: location.host,
            Type: signalRTypenEnum,
            Job: signalRJobEnum,
            Color: this.userLogin.color,
            UserName: this.userLogin.loginName,
            IdLogin: this.userLogin.id,
            DisplayName: this.userLogin.fullName
                ? this.userLogin.fullName
                : this.userLogin.lastname + ' ' + this.userLogin.firstname,
            IpAddress: Configuration.PublicSettings.ipAddress,
        });
    }

    private isValidMessage(data: SignalRNotifyModel) {
        if (data.Job == SignalRJobEnum.Disconnected || (data.GroupName && data.GroupName !== location.host)) {
            console.log('Do nothing: ', data);
            // Do nothing if Disconnected  or is not the same domain
            return false;
        }

        return true;
    }
    //#endregion [Private methods]

    //#region Approval
    private approval_ReceiveMessage(message: SignalRNotifyModel) {
        //If a message is fired by myself -> do nothing
        if (message.UserName && message.UserName === this.userLogin.loginName) return;

        this.aprrovalReceived.emit(message);
    }
    //#endregion
}
