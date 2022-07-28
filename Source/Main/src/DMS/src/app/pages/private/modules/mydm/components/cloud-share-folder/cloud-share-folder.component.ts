import { Component, OnChanges, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';

import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';

import { CloudConfigurationService } from '../../services';
import { BaseCloudComponent } from '../base-cloud/base-cloud.component';
import { Configuration } from '@app/app.constants';
import { UserService, AuthenticationService } from '@app/services';
import { Router } from '@angular/router';
import { Uti } from '@app/utilities';
import { XnCommonActions, GlobalSearchActions } from '@app/state-management/store/actions';
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
var progressInterval;

@Component({
    selector: 'cloud-share-folder',
    templateUrl: './cloud-share-folder.component.html',
    styleUrls: ['./cloud-share-folder.component.scss'],
})
export class CloudShareFolderComponent extends BaseCloudComponent implements OnChanges {
    @Input() isShowDialog: boolean;
    @Input() idCloud: any;
    @Input() titleCloud: any;
    @Input() linkCloud: string;
    @Input() oldItemActivate: any;

    @Output() onClose: EventEmitter<any> = new EventEmitter();
    @Output() pushCloudNotification: EventEmitter<any> = new EventEmitter();

    public clouds = [];
    public dialogClass = 'prime-dialog ui-dialog-flat';

    //
    public UserEmail = '';
    public SharedLink = '';
    public SharedFolder = '';
    public MyDmEmail = '';
    public isLoading = false;
    public cloudConnection = cloneDeep(initCloudConnection);
    // test connection
    public testProgress = 0;
    public testResponse: 'error' | 'success' | '' = '';
    public testError = '';

    //
    public canSave = false;
    public isSaveSuccess = false;
    public cloudConnectionSetting = {
        params: [],
        idCloudConnection: '',
    };

    constructor(
        private cloudServices: CloudConfigurationService,
        protected store: Store<AppState>,
        protected globalSearchActions: GlobalSearchActions,
        protected consts: Configuration,
        protected userService: UserService,
        protected uti: Uti,
        protected router: Router,
        protected authService: AuthenticationService,
    ) {
        super(consts, userService, authService, uti, router, globalSearchActions, store);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['idCloud'] && this.idCloud && this.isShowDialog) {
            this.getCloudInfoById();
        }

        if (changes['isShowDialog'] && !this.isShowDialog) {
            this.resetData();
        }
    }

    public close() {
        this.onClose.emit();
    }

    public submitCloudConnection() {
        if (this.isLoading) return;
        this.isLoading = true;
        this.canSave = false;
        this.testConnection((isError: boolean) => {
            this.isLoading = false;
            if (isError) return;

            const request = this.cloudConnection;
            request.UserEmail = this.UserEmail;
            request.IdCloudProviders = this.idCloud;
            if (!request.ConnectionString) {
                request.ConnectionString = {};
            }
            // if (!request.IdCloudConnection) {
            //     request.IsActive = true;
            // }
            request.ConnectionString.UserEmail = this.UserEmail;
            request.ConnectionString.SharedFolder = this.SharedFolder;
            request.ConnectionString.SharedLink = this.SharedLink;
            request.cloudType = this.titleCloud;
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

            this.cloudConnectionSetting = {
                params: params,
                idCloudConnection: request.IdCloudConnection,
            };
            this.canSave = true;
        });
    }

    saveCloudConnection() {
        if (!this.cloudConnectionSetting || (this.cloudConnectionSetting && !this.cloudConnectionSetting.params))
            return;

        this.canSave = false;
        this.isSaveSuccess = false;
        this.cloudServices.saveCloudConnection(this.cloudConnectionSetting.params).subscribe(
            (response: any) => {
                this.storeTokenWhenChangeCloud(get(response, 'item.oAuthTokens'));
                this.canSave = true;
                if (!this.cloudConnectionSetting.idCloudConnection) {
                    this.pushCloudNotification.emit({
                        title: 'Connect successfully to MyCloud',
                        type: 'success',
                    });
                }
                this.closeAllTabsGlobalSearch();
                this.testResponse = '';
                this.isSaveSuccess = true;
                this.resetCloudConnectionSetting();
                // this.close();
            },
            (error) => {
                this.canSave = true;
                this.resetCloudConnectionSetting();
            },
        );
    }

    public checkValidateEmail(mail: string) {
        if (!mail) return false;
        const regex = new RegExp('^[a-z][a-z0-9_.]{3,32}@[a-z0-9]{2,}(.[a-z0-9]{2,4}){1,2}$');
        return !regex.test(mail);
    }

    public testConnection(callback?: any) {
        if (this.testProgress > 0) {
            return;
        }
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
                SharedFolder: this.SharedFolder,
                CloudType: this.titleCloud,
                SharedLink: this.SharedLink,
            })
            .subscribe(
                (response: any) => {
                    clearInterval(progressInterval);
                    const isSuccess = get(response, 'item.isSuccess');
                    this.testProgress = 0;
                    this.testResponse = isSuccess ? 'success' : 'error';
                    this.testError = get(response, 'item.errorMessage');
                    if (callback) callback(!isSuccess);
                },
                (error: any) => {
                    if (callback) callback(true);
                },
            );
    }

    public openNewTab() {
        window.open(this.linkCloud);
    }

    private resetData() {
        this.SharedLink = '';
        this.SharedFolder = '';
        this.UserEmail = '';
        this.cloudConnection = cloneDeep(initCloudConnection);
        this.testError = '';
        this.testResponse = '';
    }

    private getCloudInfoById() {
        this.cloudServices.getCloudConnection(this.idCloud).subscribe((response: any) => {
            const item = get(response, ['item']) || cloneDeep(initCloudConnection);
            const ConnectionString = JSON.parse(get(item, 'ConnectionString') || '{}');
            item.ConnectionString = ConnectionString;
            this.SharedLink = get(ConnectionString, 'SharedLink') || '';
            this.SharedFolder = get(ConnectionString, 'SharedFolder') || '';
            this.UserEmail = get(item, 'UserEmail') || '';
            this.MyDmEmail = item.MyDmEmail;
            this.cloudConnection = item;
        });
    }

    private resetCloudConnectionSetting() {
        this.cloudConnectionSetting = {
            idCloudConnection: '',
            params: [],
        };
    }
}
