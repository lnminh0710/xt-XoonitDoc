import {
    Component,
    OnChanges,
    Input,
    SimpleChanges,
    Output,
    EventEmitter,
    ChangeDetectorRef,
    OnDestroy,
    OnInit,
    Renderer2,
} from '@angular/core';
import { cloneDeep, get } from 'lodash-es';
import { CloudConfigurationService } from '../../services';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { BaseCloudComponent } from '../base-cloud/base-cloud.component';
import { UserService, AuthenticationService } from '@app/services';
import { Uti } from '@app/utilities';
import { Router } from '@angular/router';
import { Configuration, ServiceUrl } from '@app/app.constants';
import { GlobalSearchActions } from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
const initCloudConnection = {
    UserName: '',
    ClientId: '',
    Password: '',
    UserEmail: '',
    IdCloudProviders: '',
    IdCloudConnection: null,
    IsActive: true,
    ConnectionString: '{}',
};
let progressInterval;

@Component({
    selector: 'cloud-connect-dialog',
    templateUrl: './cloud-connect-dialog.component.html',
    styleUrls: ['./cloud-connect-dialog.component.scss'],
})
export class CloudConnectionDialogComponent extends BaseCloudComponent implements OnInit, OnChanges, OnDestroy {
    @Input() isShowDialog: boolean;
    @Input() idCloud: any;
    @Input() titleCloud: any;
    @Input() linkCloud: string;
    @Input() oldItemActivate: any;

    @Output() onClose: EventEmitter<any> = new EventEmitter();
    @Output() pushCloudNotification: EventEmitter<any> = new EventEmitter();
    stopListening: Function;

    public clouds = [];
    public dialogClass = 'prime-dialog ui-dialog-flat';

    //
    public UserEmail = '';
    public SharedLink = '';
    public SharedFolder = '';
    public isLoading = false;
    public cloudConnection = cloneDeep(initCloudConnection);
    // test connection
    public testResponse: 'error' | 'success' | '' = '';
    public testError = '';

    // folder name editable
    public isEditing = false;
    public isConnectCloudEmail = false;
    public originalSharedFolder = '';
    public SharedFolderError = '';

    //
    private _inputFolderNameChanged = new Subject<string>();
    private _untilDestroyed = new Subject<boolean>();
    private _urlLoginOrigin = new URL(Configuration.PublicSettings.externalLoginUrl).origin;

    //
    public canSave = false;
    public isSaveSuccess = false;
    public cloudConnectionSetting = {
        params: [],
        idCloudConnection: '',
    };

    private isSyncOnceTime = false;

    constructor(
        private cloudServices: CloudConfigurationService,
        private ref: ChangeDetectorRef,
        protected consts: Configuration,
        protected userService: UserService,
        protected uti: Uti,
        protected router: Router,
        protected authService: AuthenticationService,
        private serviceUrl: ServiceUrl,
        private renderer: Renderer2,
        protected store: Store<AppState>,
        protected globalSearchActions: GlobalSearchActions,
    ) {
        super(consts, userService, authService, uti, router, globalSearchActions, store);
        this.stopListening = renderer.listen('window', 'message', this.messageEventListener.bind(this));
        // this.gapiService.initClient();
        this._inputFolderNameChanged
            .pipe(debounceTime(300), takeUntil(this._untilDestroyed.asObservable()))
            .subscribe((val) => {
                this.SharedFolder = val;
            });
    }

    ngOnInit(): void {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isShowDialog'] && this.isShowDialog && this.idCloud) {
            this.getCloudInfoById();
        }

        if (changes['isShowDialog'] && !this.isShowDialog) {
            this.resetData();
        }
    }

    ngOnDestroy() {
        this.resetData();
        this._untilDestroyed.next(true);
        this._untilDestroyed.complete();
        this.stopListening();
    }

    private messageEventListener(event: MessageEvent) {
        if (event.origin === this._urlLoginOrigin) {
            const data = JSON.parse(event.data);
            this._syncFolder(data);
        }
    }

    public connectCloud(noHideError?: boolean) {
        this.isConnectCloudEmail = true;
        if (!noHideError) {
            this.testResponse = '';
        }
        if (this.isEditing) {
            this.cancelEditShareFolder();
        }

        this.loginExternal();
    }

    private loginExternal() {
        let provider = '';
        switch (this.titleCloud) {
            case 'GoogleDrive':
                provider = 'Google';
                break;
            case 'OneDrive':
                provider = 'Microsoft';
                break;
        }
        const url =
            Configuration.PublicSettings.externalLoginUrl +
            '/?provider=' +
            provider +
            '&targetOrigin=' +
            location.origin;
        const newWindow = Uti.openPopupCenter(url, 'External Login', 500, 700);
        var timer = setInterval(
            function () {
                if (newWindow && newWindow.closed) {
                    clearInterval(timer);
                    this.isConnectCloudEmail = false;
                }
            }.bind(this),
            1000,
        );
    }

    public close() {
        if (this.isLoading) return;
        this.onClose.emit();
    }

    public onChangeShareFolder(value: any) {
        this._inputFolderNameChanged.next(value);
    }

    public cancelEditShareFolder() {
        this.isEditing = false;
        this.SharedFolder = this.originalSharedFolder;
        this.originalSharedFolder = '';
        this.SharedFolderError = '';
    }

    public renameFolder() {
        this.isEditing = false;
        this.testResponse = '';
        this.saveCloudConnectionWhenEdit();
        return;
    }

    public testConnection(callback?: any) {
        if (this.isLoading || !this.cloudConnectionSetting.params) {
            return;
        }
        this.isLoading = true;
        this.canSave = false;
        this.testResponse = '';

        const connectionString = this.cloudConnectionSetting.params[0]
            ? this.cloudConnectionSetting.params[0].ConnectionString
            : this.cloudConnection?.ConnectionString;
        this.cloudServices
            .testCloudConnection({
                UserEmail: this.UserEmail,
                SharedFolder: this.SharedFolder,
                CloudType: this.titleCloud,
                SharedLink: this.SharedLink,
                ConnectionString: connectionString,
            })
            .subscribe(
                (response: any) => {
                    clearInterval(progressInterval);
                    const isSuccess = get(response, 'item.isSuccess');
                    this.canSave = isSuccess;
                    this.isLoading = false;
                    this.testResponse = isSuccess ? 'success' : 'error';
                    this.testError = get(response, 'item.errorMessage');
                    if (callback) callback(!isSuccess);
                },
                (error: any) => {
                    const unAuthorizedReg = new RegExp('Unauthorized', 'i');
                    this.isLoading = false;
                    this.canSave = false;
                    if (unAuthorizedReg.test(get(error, 'error.ResultDescription'))) {
                        this.testError = 'Please re login cloud';
                        this.testResponse = 'error';
                        this.connectCloud(true);
                    }
                    if (callback) callback(true);
                },
            );
    }

    private resetData() {
        this.SharedLink = '';
        this.SharedFolder = '';
        this.UserEmail = '';
        this.cloudConnection = cloneDeep(initCloudConnection);
        this.testError = '';
        this.testResponse = '';
        this.isEditing = false;
        this.SharedFolderError = '';
        this.isLoading = false;
    }

    private getCloudInfoById() {
        this.cloudServices.getCloudConnection(this.idCloud).subscribe((response: any) => {
            const item = get(response, ['item']) || cloneDeep(initCloudConnection);
            const ConnectionString = JSON.parse(get(item, 'ConnectionString') || '{}');
            item.ConnectionString = ConnectionString;
            this.SharedLink = get(ConnectionString, 'SharedLink') || '';
            this.SharedFolder = get(ConnectionString, 'SharedFolder') || '';
            this.UserEmail = get(item, 'UserEmail') || '';
            this.cloudConnection = item;
        });
    }

    private _syncFolder(data: any) {
        this.isLoading = true;

        const request = this.cloudConnection;
        const email = get(data, 'user.emailaddress');

        const params = [];
        request.UserEmail = email;
        request.IdCloudProviders = this.idCloud;
        if (!request.ConnectionString) {
            request.ConnectionString = {};
        }
        // if (!request.IdCloudConnection) {
        //     request.IsActive = true;
        // }
        request.ConnectionString.UserEmail = email;
        request.ConnectionString.SharedFolder = this.SharedFolder;
        switch (this.titleCloud) {
            case 'GoogleDrive':
                request.ConnectionString.CloudToken = data.token;
                request.CloudType = this.titleCloud;
                if (this.UserEmail && request?.ConnectionString?.UserEmail !== data?.user?.emailaddress) {
                    request.IsChangeEmail = true;
                    delete request.ConnectionString.SharedFolderId;
                }
                break;
            case 'OneDrive':
                request.ConnectionString.cloudToken = data.token;
                request.ConnectionString.driveType = get(data, 'user.driveType');
                request.cloudType = this.titleCloud;
                if (this.UserEmail) {
                    request.IsChangeEmail = true;
                    delete request.ConnectionString.SharedFolderId;
                }
                break;
        }

        params.push(request);
        if (this.oldItemActivate) {
            params.push({
                ...this.oldItemActivate,
                ConnectionString: null,
                UserName: null,
                ClientId: '',
                Password: null,
                UserEmail: null,
            });
        }

        this.cloudConnectionSetting = {
            params: params,
            idCloudConnection: request.IdCloudConnection,
        };

        this.SharedFolder = request.ConnectionString.SharedFolder || '';
        this.UserEmail = request.ConnectionString.UserEmail || '';
        this.isLoading = false;
        this.isSyncOnceTime = true;
    }

    public saveCloudConnection() {
        this.cloudServices.saveCloudConnection(this.cloudConnectionSetting.params).subscribe(
            (response: any) => {
                this.isLoading = false;

                if (!get(response, 'item.wsEditReturn.isSuccess')) {
                    this.SharedFolderError = get(response, 'item.wsEditReturn.userErrorMessage');
                    this.getCloudInfoById();
                    setTimeout(() => {
                        this.SharedFolderError = '';
                    }, 3000);
                    return;
                }

                const oAuthTokens = get(response, 'item.oAuthTokens');
                if (oAuthTokens) {
                    this.storeTokenWhenChangeCloud(oAuthTokens);
                }
                this.isSaveSuccess = true;
                this.testResponse = 'success';

                if (!this.cloudConnectionSetting.idCloudConnection) {
                    this.pushCloudNotification.emit({
                        title: 'Connect successfully to MyCloud',
                        type: 'success',
                    });
                }
                this.closeAllTabsGlobalSearch();
                setTimeout(() => {
                    this.testResponse = '';
                }, 3000);
                this.getCloudInfoById();
                this.close();
            },
            (error) => {
                const unAuthorizedReg = new RegExp('Unauthorized', 'i');
                if (unAuthorizedReg.test(get(error, 'error.ResultDescription'))) {
                    this.testError = 'Please re login cloud';
                    this.testResponse = 'error';
                    this.connectCloud(true);
                }
                this.isLoading = false;
                this.isSaveSuccess = false;
            },
        );
    }

    public saveCloudConnectionWhenEdit(isError?: boolean) {
        if (isError) {
            this.isLoading = false;
            return;
        }

        this.isSaveSuccess = false;

        const request = this.cloudConnection;
        request.UserEmail = this.UserEmail;
        request.IdCloudProviders = this.idCloud;
        if (!request.ConnectionString) {
            request.ConnectionString = {};
        }

        request.ConnectionString.UserEmail = this.UserEmail;
        request.ConnectionString.SharedFolder = this.SharedFolder;
        request.ConnectionString.SharedLink = this.SharedLink;
        request.cloudType = this.titleCloud;

        this.cloudConnectionSetting = {
            params: [request],
            idCloudConnection: request.IdCloudConnection,
        };
        this.SharedFolder = request.ConnectionString.SharedFolder || '';
    }

    public showControlEditFolderName() {
        if (!this.isSyncOnceTime) {
            this.loginExternal();
            return;
        }
        this.isEditing = true;
        this.originalSharedFolder = this.SharedFolder;
    }
}
