import { Component, OnInit, ChangeDetectorRef, Inject, Output, EventEmitter } from '@angular/core';
import 'rxjs/add/observable/forkJoin';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import cloneDeep from 'lodash-es/cloneDeep';
import remove from 'lodash-es/remove';
import pick from 'lodash-es/pick';
import findIndex from 'lodash-es/findIndex';
import get from 'lodash-es/get';
import includes from 'lodash-es/includes';
import isEqual from 'lodash-es/isEqual';
import has from 'lodash-es/has';
import { MatDialogRef, MAT_DIALOG_DATA } from '@xn-control/light-material-ui/dialog';
import { cloudConfigs } from './resource';
import {
    CloudModel,
    CloudTypeEnum,
    RemoteConfigurationDialogModel,
    RemoteConfigurationModel,
} from '../../models/cloud-configuration.model';
import { CloudConfigurationService } from '../../services';
import { ToasterService } from 'angular2-toaster';
import { ErrorHandleMessageModel } from '@app/models/error-handle/error-handle-message.model';
import { XnCommonActions, GlobalSearchActions } from '@app/state-management/store/actions';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { BaseCloudComponent } from '../base-cloud/base-cloud.component';
import {
    Configuration,
    GlobalSettingConstant,
    PasswordDisplay,
    ErrorMessageTypeEnum,
    AuthenType,
} from '@app/app.constants';
import { UserService, AuthenticationService } from '@app/services';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { Router } from '@angular/router';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { catchError } from 'rxjs/operators';
import { equal } from 'assert';
var progressInterval;
var saveProgressInterval;
const initCloudConnection = {
    UserName: '',
    CloudType: 'SFTP',
    ClientId: '',
    Password: '',
    UserEmail: '',
    IdCloudProviders: '',
    IdCloudConnection: null,
    IsActive: true,
    ConnectionString: {},
};

@Component({
    selector: 'cloud-remote-connection',
    templateUrl: './cloud-remote-connection.component.html',
    styleUrls: ['./cloud-remote-connection.component.scss'],
})
export class CloudRemoteConnectionComponent extends BaseCloudComponent implements OnInit {
    public isCanSave = false;
    public isCanTestConnection = true;
    public onClose: any;
    public pushCloudNotification: any;
    public clouds = [];
    public idCloud: any;
    public titleCloud: string;
    public linkCloud: string;
    public isShowShareDialog = false;
    public oldItemActivate: any;
    public remoteConnectionModel: RemoteConfigurationModel = {};
    public remoteConnectionModelOriginal: RemoteConfigurationModel = {};
    public isLoading = false;
    public isSaving = false;
    public cloudConnection = cloneDeep(initCloudConnection);
    public UserEmail = 'mydm@email.com';
    public SharedLink = '';
    public SharedFolder = '';
    public MyDmEmail = '';
    // test connection
    public testResponse: 'error' | 'success' | '' = '';
    public testProgress = 0;
    public testError = '';
    // save connection
    public saveResponse: 'error' | 'success' | '' = '';

    public saveProgress = 0;
    public saveError = '';
    public passType = PasswordDisplay.PASSWORD;
    public PASSWORD_DISPLAY_CONSTANT = PasswordDisplay;
    public notificationTitle = '';
    public notificationType = '';
    public remoteConnectionForm: FormGroup;
    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;
    public dataFields = {
        TYPE: <ControlData>{ controlName: 'Type', displayName: 'Type', order: 1 },
        HOST: <ControlData>{ controlName: 'HostName', displayName: 'Host', order: 2 },

        PORT: <ControlData>{ controlName: 'PortNumber', displayName: 'Port', order: 3 },
        USER_NAME: <ControlData>{ controlName: 'UserName', displayName: 'User Name', order: 4 },
        PASS: <ControlData>{ controlName: 'Password', displayName: 'Password', order: 5 },
        FOLDER: <ControlData>{ controlName: 'Folder', displayName: 'Folder Name', order: 6 },
    };
    public cloudData: any;
    public remoteType = [
        { idType: 'SFTP', valueType: 'SFTP' },
        { idType: 'FTP', valueType: 'FTP' },
    ];
    public errHandleMes = new ErrorHandleMessageModel();
    public cloudList: CloudModel[] = [];
    constructor(
        public dialogRef: MatDialogRef<CloudRemoteConnectionComponent>,
        @Inject(MAT_DIALOG_DATA) public data: RemoteConfigurationDialogModel,
        protected store: Store<AppState>,
        protected globalSearchActions: GlobalSearchActions,
        private fb: FormBuilder,
        private cloudServices: CloudConfigurationService,
        private ref: ChangeDetectorRef,
        private toasterService: ToasterService,
        private commonActions: XnCommonActions,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        protected configuration: Configuration,
        protected userService: UserService,
        protected uti: Uti,
        protected router: Router,
        protected authService: AuthenticationService,
    ) {
        super(configuration, userService, authService, uti, router, globalSearchActions, store);
        this.cloudData = data.cloudModel;
        this.cloudList = data.cloudList;
        this.idCloud = this.cloudData.IdCloudProviders;
        this.pushCloudNotification = data.callbackPush;
        this.onClose = data.callbackClose;
        this.oldItemActivate = data.oldItemActivate;
    }
    public close() {
        this.onClose();
        this.dialogRef.close();
    }
    ngOnInit() {
        this.getCloudInfoById();
    }
    public showHidePassword() {
        this.passType = this.xnErrorMessageHelper.changePasswordType(this.passType);
    }
    onSelectRemoteTypeChange(event) {
        this.getRemoteModel(event.value);
        this.initForm();
    }
    private getRemoteModel(remoteType: string) {
        if (remoteType && remoteType === this.remoteConnectionModelOriginal.Type) {
            this.remoteConnectionModel = this.remoteConnectionModelOriginal;
            return;
        }
        var remoteConnectionModel: RemoteConfigurationModel = {};
        remoteConnectionModel.Type = remoteType;
        remoteConnectionModel.PortNumber = remoteType === 'SFTP' ? 22 : 21;
        remoteConnectionModel.HostName = '';
        remoteConnectionModel.UserName = '';
        remoteConnectionModel.Password = '';
        remoteConnectionModel.Folder = '';
        this.remoteConnectionModel = remoteConnectionModel;
    }
    initForm() {
        this.remoteConnectionForm = this.fb.group({
            [this.dataFields.TYPE.controlName]: [this.remoteConnectionModel.Type || 'SFTP', [Validators.required]],
            [this.dataFields.HOST.controlName]: [this.remoteConnectionModel.HostName || '', [Validators.required]],
            [this.dataFields.PORT.controlName]: [this.remoteConnectionModel.PortNumber || '', []],

            [this.dataFields.USER_NAME.controlName]: [this.remoteConnectionModel.UserName || '', []],
            [this.dataFields.PASS.controlName]: [this.remoteConnectionModel.Password || '', []],
            [this.dataFields.FOLDER.controlName]: [this.remoteConnectionModel.Folder || '', []],
        });

        this.remoteConnectionForm.valueChanges.subscribe((data: RemoteConfigurationModel) => {
            this.checkIsEnebleTestConnection(data);
        });
    }
    private checkIsEnebleTestConnection(data: RemoteConfigurationModel) {
        if (this.testResponse === 'success') {
            const _equal =
                isEqual(data.Type, this.remoteConnectionModel.Type) &&
                isEqual(data.HostName, this.remoteConnectionModel.HostName) &&
                isEqual(data.PortNumber, this.remoteConnectionModel.PortNumber) &&
                isEqual(data.UserName, this.remoteConnectionModel.UserName) &&
                isEqual(data.Password, this.remoteConnectionModel.Password) &&
                isEqual(data.Folder, this.remoteConnectionModel.Folder);
            this.isCanTestConnection = !_equal;
            this.isCanSave = !this.isCanTestConnection;
        }
    }
    public numberOnly(event): boolean {
        const charCode = event.which ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    }
    private getDataForm() {
        const formData = this.remoteConnectionForm.value;
        const dataForm = {
            Type: formData[this.dataFields.TYPE.controlName],
            HostName: formData[this.dataFields.HOST.controlName],
            PortNumber: formData[this.dataFields.PORT.controlName],
            UserName: formData[this.dataFields.USER_NAME.controlName],
            Password: formData[this.dataFields.PASS.controlName],
            Folder: formData[this.dataFields.FOLDER.controlName],
        } as RemoteConfigurationModel;
        this.remoteConnectionModel = dataForm;
    }

    public submitCloudConnection() {
        if (this.saveProgress > 0) {
            return;
        }
        if (this.isSaving) return;
        this.isSaving = true;
        //  this.isCanTestConnection = true;
        this.getDataForm();
        this.saveResponse = '';
        saveProgressInterval = setInterval(() => {
            this.saveProgress += 1;
            if (this.saveProgress === 99) {
                clearInterval(saveProgressInterval);
            }
        }, 10);

        var request = this.cloudConnection;
        request.UserEmail = this.UserEmail;
        request.IdCloudProviders = this.idCloud;
        if (!request.ConnectionString) {
            request.ConnectionString = {};
        }
        if (!request.IdCloudConnection && this.cloudList?.every(cloud => !cloud.IsActive)) {
            request.IsActive = true;
        }
        request.ConnectionString.SharedFolder = this.remoteConnectionModel.Folder;
        request.CloudType = this.titleCloud || 'SFTP';
        request.ClientId = this.generateClientID(this.remoteConnectionModel);
        request.ConnectionString.UserEmail = this.UserEmail;
        //   request.ConnectionString.SharedFolder = this.SharedFolder;
        request.ConnectionString.SharedLink = this.SharedLink;
        request.ConnectionString.SftpConnection = this.remoteConnectionModel;

        const params = [];
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
        this.cloudServices.saveCloudConnection(params).subscribe(
            (response: any) => {
                clearInterval(saveProgressInterval);
                this.isSaving = false;
                this.isCanSave = false;
                this.saveProgress = 0;
                const wsEditReturn = get(response, 'item.wsEditReturn');
                if (wsEditReturn) {
                    const isSuccess = get(wsEditReturn, 'isSuccess');

                    this.saveResponse = isSuccess ? 'success' : 'error';
                    if (isSuccess) {
                        this.storeTokenWhenChangeCloud(get(response, 'item.oAuthTokens'));

                        if (!request.IdCloudConnection) {
                            this.pushCloudNotification({
                                title: 'Connect successfully to Remote Connection',
                                type: 'success',
                            });
                        }
                        this.closeAllTabsGlobalSearch();
                        setTimeout(() => {
                            this.saveResponse = '';
                        }, 3000);
                        this.close();
                    } else {
                        const errorMsg = 'Save Cloud Connection Fail!';
                        this.saveResponse = 'error';
                        this.saveError = errorMsg;
                    }
                }

                // this.close();
            },
            (error) => {
                this.saveProgress = 0;
                this.isSaving = false;
                const errorMsg = 'Save Cloud Connection Fail!';
                this.saveResponse = 'error';
                this.saveError = errorMsg;
            },
        );
    }

    public testConnection() {
        if (this.testProgress > 0) {
            return;
        }
        if (this.isLoading) return;
        this.isLoading = true;
        this.getDataForm();
        this.testResponse = '';
        progressInterval = setInterval(() => {
            this.testProgress += 1;
            if (this.testProgress === 99) {
                clearInterval(progressInterval);
            }
        }, 10);
        this.cloudServices
            .testCloudConnection({
                UserEmail: this.UserEmail,
                SharedFolder: this.remoteConnectionModel.Folder,
                CloudType: this.titleCloud || 'SFTP',
                SharedLink: this.SharedLink,
                SftpConnection: this.remoteConnectionModel,
            })
            .subscribe(
                (response: any) => {
                    clearInterval(progressInterval);
                    this.isLoading = false;
                    const isSuccess = get(response, 'item.isSuccess');
                    this.testProgress = 0;
                    this.testResponse = isSuccess ? 'success' : 'error';
                    this.testError = get(response, 'item.errorMessage');
                    this.isCanTestConnection = !isSuccess;
                    this.isCanSave = isSuccess;
                    // if (callback) callback(!isSuccess);
                },
                (error: any) => {
                    this.isLoading = false;
                    this.testProgress = 0;
                    this.testResponse = 'error';
                    this.testError = 'Fail to connect to Remote Connection!';
                    this.isCanSave = false;
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
    }
    private generateClientID(model: RemoteConfigurationModel) {
        return model.Type + '_' + model.HostName + '_' + model.UserName;
    }

    private getCloudInfoById() {
        this.cloudServices.getCloudConnection(this.idCloud).subscribe((response: any) => {
            const item = get(response, ['item']) || cloneDeep(initCloudConnection);

            try {
                const ConnectionString: RemoteConfigurationModel = JSON.parse(get(item, 'ConnectionString') || '{}');
                this.remoteConnectionModel = get(ConnectionString, 'SftpConnection') || {};
                this.remoteConnectionModelOriginal = this.remoteConnectionModel;
                this.SharedLink = get(ConnectionString, 'SharedLink') || '';
                this.SharedFolder = get(ConnectionString, 'SharedFolder') || '';
                item.ConnectionString = ConnectionString;
            } catch (err) {}
            this.initForm();

            this.UserEmail = get(item, 'UserEmail') || this.cloudData.UserEmail || 'mydm@email.com';
            this.MyDmEmail = item.MyDmEmail;
            this.cloudConnection = item;
        });
    }
}
