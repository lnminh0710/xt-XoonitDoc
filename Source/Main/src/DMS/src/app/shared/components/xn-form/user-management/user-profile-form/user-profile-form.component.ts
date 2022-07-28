import {
    Component, Input, Output, EventEmitter,
    OnInit, OnDestroy, ChangeDetectorRef,
    ViewChildren, QueryList, Injector, ViewChild
} from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import {
    UpdatePasswordResultMessageEnum,
    ComboBoxTypeConstant
} from '@app/app.constants';
import { Uti, CustomValidators, LocalStorageProvider, SessionStorageProvider, LocalStorageHelper } from '@app/utilities';
import isNil from 'lodash-es/isNil';
import {
    ControlGridModel,
    FormOutputModel,
    ApiResultResponse,
    LanguageSettingModel,
    User, MessageModel
} from '@app/models';
import { UserManagementFormBase } from '@app/shared/components/xn-form/user-management/um-form-base/um-form-base';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { Router } from '@angular/router';
import {
    UserProfileService,
    ValidationService,
    PropertyPanelService,
    AuthenticationService,
    UserService,
    CommonService,
    ModalService
} from '@app/services';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { Store, ReducerManagerDispatcher } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription, of } from 'rxjs';
import { ControlMessagesComponent } from '@app/shared/components/xn-form/common/control-message';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import { UploadFileMode, MessageModal, LocalSettingKey } from '@app/app.constants';
import {
    ProcessDataActions,
    CustomAction
} from '@app/state-management/store/actions';
import { XnAgGridComponent } from '../../../xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { ColHeaderKey } from '../../../xn-control/xn-ag-grid/shared/ag-grid-constant';
import { finalize, filter } from 'rxjs/operators';

@Component({
    selector: 'um-user-profile-form',
    styleUrls: ['./user-profile-form.component.scss'],
    templateUrl: './user-profile-form.component.html'
})
export class UserProfileFormComponent extends UserManagementFormBase implements OnInit, OnDestroy {
    public passwordIsMatched: boolean = true;
    public passwordIsCorrect: boolean = true;
    public oldPasswordIsWrong: boolean = false;
    public roleDatasource: ControlGridModel = new ControlGridModel();
    public userProfileCss: string = '';
    public avataCss: string = '';
    public fileData: any = {};
    public uploadMessage: string = '';
    public loginPictureUrl: string = '';
    public imageLoaded: boolean = false;
    public isSearchingUserName: boolean = false;
    public languages: Array<any> = [];
    public checkedRoles: any[] = [];

    private pictureDirty: boolean = false;
    private roleDirty: boolean = false;
    private loginPicture: string = '';
    private userId: any;
    private userCached: any = {};
    private userRoleCached: Array<any> = [];
    private hasPasswordUpdate: boolean = false;
    private rowsDataState: Observable<any>;
    private rowsDataStateSubscription: Subscription;
    private currentUser: User;
    private isChangeLanguage: boolean;
    private normalUserRoleID = 2;

    @ViewChildren('controlMessagePassword') private controlMessagePasswords: QueryList<ControlMessagesComponent>;

    private xnAgGridComponent: XnAgGridComponent;
    @ViewChild(XnAgGridComponent) set xnAgGridComponentInstance(xnAgGridComponentInstance: XnAgGridComponent) {
        this.xnAgGridComponent = xnAgGridComponentInstance;
    }

    @Input() gridId: string;
    @Input() isUserEditting: boolean = false;
    @Input() useInDropdown: boolean = false;
    // Set userId when user edit themself profile
    @Input() set userEdittingId(data: any) {
        this.userId = data;
    }
    @Input() set globalProperties(globalProperties: any[]) {
        this.globalDateFormat = this.propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
    }

    @Output() outputData: EventEmitter<any> = new EventEmitter();
    @Output() loaded: EventEmitter<any> = new EventEmitter();
    constructor(
        private toasterService: ToasterService,
        private userProfileService: UserProfileService,
        private uti: Uti,
        private ref: ChangeDetectorRef,
        private propertyPanelService: PropertyPanelService,
        private store: Store<AppState>,
        private authenticationService: AuthenticationService,
        private userService: UserService,
        private dispatcher: ReducerManagerDispatcher,
        private commonService: CommonService,
        private userServ: UserService,
        private modalService: ModalService,
        protected router: Router,
        protected injector: Injector
    ) {
        super(injector, router);
        this.formEditModeState = this.store.select(state => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).formEditMode);
        this.rowsDataState = this.store.select(state => widgetContentReducer.getWidgetContentDetailState(state, this.ofModule.moduleNameTrim).rowsData);
    }

    public ngOnInit() {
        this.getCurrentUser();
        this.getMainLanguages();
        this.subscription();
        this.udpateUserProfileAfterUpload = this.udpateUserProfileAfterUpload.bind(this);
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public ngAfterViewInit() {
        this.userProfileCss = this.useInDropdown ? 'col-xs-12' : (this.isUserEditting ? 'col-xs-12  col-md-9' : 'col-xs-12  col-md-6');
        this.avataCss = this.useInDropdown ? '' : (this.isUserEditting ? 'col-xs-12  col-md-3' : 'col-xs-12  col-md-2');
        this.createForm();
        this.buildDataForRole();
        this.ref.detectChanges();
    }

    /**
     * getCurrentUser
     */
    private getCurrentUser() {
        this.userServ.currentUser.subscribe((user: User) => {
            this.appErrorHandler.executeAction(() => {
                this.currentUser = user;
            });
        });
    }

    /**
     * getMainLanguages
     */
    private getMainLanguages() {
        this.commonService.getListComboBox('' + ComboBoxTypeConstant.language)
            .subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.language) {
                        return;
                    }
                    this.languages = response.item.language;
                });
            });
    }

    public isValid(): boolean {
        this.formGroup.updateValueAndValidity();
        let passwordValid = true;
        if (this.hasPasswordUpdate) {
            passwordValid = this.passwordIsMatched && this.passwordIsCorrect;
        }
        return this.formGroup.valid && passwordValid;
    }

    public isDirty(): boolean {
        this.formGroup.updateValueAndValidity();
        return this.formGroup.dirty || this.pictureDirty || this.roleDirty;
    }

    public onRoleChanged(e) {
        if (!this.userId) {
            this.setValueForOutputModel(new FormOutputModel({
                submitResult: null,
                formValue: this.formGroup.value,
                isValid: this.formGroup.valid,
                isDirty: true,
                returnID: null
            }));
            return;
        }
        if (e && (e.itemData || !isNil(e.length))) {
            const userLogin = this.uti.getUserInfo();

            if (userLogin.id == this.userId && !this.roleDirty) {
                this.modalService.warningMessageHtmlContent(new MessageModel({
                    headerText: 'Change User Role',
                    messageType: MessageModal.MessageType.error,
                    message: [{ key: 'Modal_Message__YouAreUpdatingRole' }],
                    buttonType1: MessageModal.ButtonType.danger,
                    callBack: () => {
                        this.roleDirty = true;
                        this.setValueForOutputModel({
                            submitResult: null,
                            formValue: this.formGroup.value,
                            isValid: this.formGroup.valid,
                            isDirty: true,
                            returnID: null
                        });
                    },
                    showCloseButton: false
                }));
            }
        }

        this.roleDirty = true;
        this.setValueForOutputModel({
            submitResult: null,
            formValue: this.formGroup.value,
            isValid: this.formGroup.valid,
            isDirty: true,
            returnID: null
        });
    }

    public submit() {
        this.formGroup['submitted'] = true;
        try {
            if (!this.isValid() || !this.isDirty()) {
                this.setFormOutputData(false);
                return;
            }

            if (this.noRequiredRole()) {
                this.setFormOutputData(false);
                this.toasterService.pop('warning', 'Warning', 'Normal User role must be selected');
                return;
            }

            this.updateUserProfile();
        } catch (ex) {
            this.setFormOutputData(true);
        }
    }

    public prepareSubmitData(): any {
        this.formGroup.updateValueAndValidity();
        let value = this.formGroup.value;
        let userRoles = [];
        let result = {
            LoginName: value.loginWithName,
            NickName: value.nickName,
            FirstName: value.firstName,
            LastName: value.lastName,
            FullName: value.fullName,
            DateOfBirth: Uti.parseToRightDate(value.dateOfBirth),
            Email: value.email,
            IdRepLanguage: value.idRepLanguage
        };
        if (this.loginPicture) {
            result['LoginPicture'] = this.loginPicture;
        }
        if (this.hasPasswordUpdate) {
            result['Password'] = value.cipher;
        } else if (!this.formEditMode && !this.isUserEditting) {
            // In adding case we will generate the password and send this password for user through email
            result['Password'] = Uti.randomPassword(8);
        }
        if (!this.isUserEditting) {
            result['ValidFrom'] = Uti.parseToRightDate(value.validFrom);
            result['ValidTo'] = Uti.parseToRightDate(value.validTo);
        }
        if (this.formEditMode || this.isUserEditting) {
            result['IdPerson'] = this.userId;
        }
        return {
            UserProfile: result,
            UserRoles: userRoles
        };
    }

    public onPasswordFocus(control) {
        setTimeout(() => {
            let ctr = $(control.target);
            ctr.attr('type', 'password');
        }, 500);
    }

    public onCompleteUploadItem(event) {
        if (!event || !event.response) return;
        this.loginPicture = event.response.fileName;
    }

    public passwordKeyPess() {
        this.formGroup.updateValueAndValidity();
        let formValue = this.formGroup.value;
        let path = this.consts.passwordPath;
        if (!formValue.cipher || !formValue.reCipher) {
            this.passwordIsCorrect = true;
        }
        else {
            this.passwordIsCorrect = path.test(formValue.cipher) && path.test(formValue.reCipher);
        }
        this.passwordIsMatched = !formValue.cipher || !formValue.reCipher || (formValue.cipher == formValue.reCipher);
        this.hasPasswordUpdate = (formValue.currentCipher || formValue.cipher || formValue.reCipher);
        this.oldPasswordIsWrong = false;
        this.updatePasswordFormField();
    }

    public avataLoaded(event) {
        this.imageLoaded = true;
    }

    /**
     * PRIVATE METHODS
     */

    private subcribeRequestSaveState() {
        this.dispatcherSubscription = this.dispatcher.pipe(
            filter((action: CustomAction) => {
                return action.type === ProcessDataActions.REQUEST_SAVE && action.module.idSettingsGUI == this.ofModule.idSettingsGUI;
            })
        ).subscribe(() => {
            this.appErrorHandler.executeAction(() => {
                this.submit();
            });
        });
    }

    private createForm() {
        if (this.formEditMode || this.isUserEditting) {
            // Init form when edit mode
            this.getUserProfile();
        } else {
            // Init form when new mode
            this.initForm(this.createNewFormGroup(), true);
            this.formGroup.controls['cipher'].disable();
            this.formGroup.controls['reCipher'].disable();
            this.isRenderForm = true;
            this.registerAvataChangeEvent();
        }
    }

    private createNewFormGroup(): any {
        return {
            loginWithName: ['', CustomValidators.required, this.validateLoginWithName.bind(this)],
            nickName: '',
            firstName: ['', CustomValidators.required],
            lastName: ['', CustomValidators.required],
            fullName: ['', CustomValidators.required],
            dateOfBirth: '',
            email: ['', Validators.compose([Validators.required, Validators.email])],
            validFrom: '',
            validTo: '',
            cipher: '',
            reCipher: '',
            idRepLanguage: ['', Validators.required]
        };
    }

    private validateLoginWithName(control: FormControl): any {
        if (this.userCached.IdLogin && control.value === this.userCached.LoginWithName) {
            return of(null);
        }
        this.isSearchingUserName = true;
        return this.userProfileService.checkExistUserByField('LoginWithName', control.value)
            .pipe(
                finalize(() => {
                    this.isSearchingUserName = false;
                })
            );
    }

    private noRequiredRole() {
        if (!this.roleDatasource.data.length) {
            return true;
        }

        let normalUserRole = this.roleDatasource.data.find(x => x.RoleName === 'Normal User');
        if (!normalUserRole || !normalUserRole.selectAll) {
            return true;
        }

        return false;
    }

    private getUserProfile() {
        this.userProfileService.getUserById(this.userId)
            .subscribe(
                data => this.getUserProfileSuccess(data.item),
                error => this.serviceError(error));
    }

    private getUserProfileSuccess(response: any) {
        if (!response || !response.data || !response.data.length || response.data.length < 2) return;
        let formData = this.buildFormDataFromWidgetData(response.data[1]);
        this.userCached = formData;
        if (!formData || !formData.LoginName) return;
        this.initForm(this.createEditForm(formData), true);
        this.isRenderForm = true;
        this.registerAvataChangeEvent();
        this.ref.detectChanges();
        this.loaded.emit();
    }

    private createEditForm(formData: any): any {
        let dateOfBirth: any = Uti.parseDateFromDB(formData.DateOfBirth);
        let validFrom: any = Uti.parseDateFromDB(formData.ValidFrom);
        let validTo: any = Uti.parseDateFromDB(formData.ValidTo);
        // Init form when edit mode
        let formGroup = {
            loginWithName: [formData.LoginName, CustomValidators.required, this.validateLoginWithName.bind(this)],
            nickName: formData.NickName,
            firstName: [formData.FirstName, CustomValidators.required],
            lastName: [formData.LastName, CustomValidators.required],
            fullName: [formData.FullName, CustomValidators.required],
            dateOfBirth: dateOfBirth || '',
            email: [formData.Email, Validators.compose([Validators.required, Validators.email])],
            validFrom: validFrom || '',
            validTo: validTo || '',
            cipher: '',
            reCipher: '',
            idRepLanguage: [formData.IdRepLanguage, Validators.required]
            // idRepLanguage: [this.currentUser.preferredLang, Validators.required]
        };

        let loginPicture = formData.LoginPicture;
        //if mode edit and there is no picture, will get from cache userLogin
        if (formData.IdLogin && !loginPicture) {
            let userInfo = this.uti.getUserInfo();
            //user edit = user login
            if (formData.IdLogin == userInfo.id && userInfo.loginPicture)
                loginPicture = userInfo.loginPicture;
        }
        this.loginPictureUrl = Uti.getFileUrl(loginPicture, UploadFileMode.Profile);

        if (this.isUserEditting) {
            formGroup['currentCipher'] = '';
        }
        return formGroup;
    }

    private buildFormDataFromWidgetData(widgetData: any): any {
        if (!widgetData.length) return {};
        let result = {};
        for (let item of widgetData) {
            result[item.ColumnName] = item.Value
        }
        return result;
    }

    private subscription() {
        this.formEditModeStateSubscription = this.formEditModeState.subscribe((formEditModeState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.formEditMode = formEditModeState;
            });
        });

        this.rowsDataStateSubscription = this.rowsDataState.subscribe((rowsData: any) => {
            this.appErrorHandler.executeAction(() => {
                if (this.isUserEditting || !this.formEditMode) return;

                let rowData = this.uti.getTableRowByWidgetId(rowsData, 104);

                if (!rowData)
                    return;

                if (!Uti.checkKeynameExistInArray(rowData, 'key', 'IdLogin'))
                    return;

                this.userId = Uti.getValueFromArrayByKey(rowData, 'IdLogin');
            });
        });
        this.subcribeRequestSaveState();
    }

    private updateUserProfile() {
        if (this.hasPasswordUpdate && this.isUserEditting) {
            this.authenticationService.changePassword(this.formGroup.value.currentCipher, this.formGroup.value.cipher)
                .subscribe(
                    data => this.changePasswordSuccess(data.item),
                    error => this.serviceError(error));
        } else {
            this.udpateUserProfileAfterCheck();
        }
    }

    private changePasswordSuccess(response: any) {
        this.appErrorHandler.executeAction(() => {
            switch (response.result) {
                case UpdatePasswordResultMessageEnum.INVALID: {
                    this.oldPasswordIsWrong = true;
                    break;
                }
                case UpdatePasswordResultMessageEnum.FAILED: {
                    this.setFormOutputData(true);
                    break;
                }
                case UpdatePasswordResultMessageEnum.SUCCESS: {
                    this.udpateUserProfileAfterCheck();
                    break;
                }
                default: break;
            }
        });
    }

    private udpateUserProfileAfterCheck() {
        if (this.fileData && this.fileData.name) {
            this.uploadAvata(this.udpateUserProfileAfterUpload);
            return;
        }
        this.udpateUserProfileAfterUpload();
    }

    private udpateUserProfileAfterUpload() {
        let data = this.prepareSubmitData();
        if (data.UserProfile && data.UserProfile.IdRepLanguage) {
            if (data.UserProfile.IdPerson == this.currentUser.id && data.UserProfile.IdRepLanguage != this.currentUser.preferredLang) {
                this.isChangeLanguage = true;
            }
        }
        this.userProfileService.saveUserProfile(data)
            .subscribe(
                data => this.updateUserProfileSuccess(data.item),
                error => this.serviceError(error));
    }

    private updateUserProfileSuccess(response: any) {
        this.appErrorHandler.executeAction(() => {
            this.setFormOutputData(true, response.returnID);

            let keepValueControls: string[] = [];
            if (this.useInDropdown) {
                keepValueControls = Object.keys(this.formGroup.controls);
            }

            Uti.resetValueForForm(this.formGroup, keepValueControls);
            this.loginByUserId();
            if (this.roleDirty) {
                this.updateRoles(response.returnID);
            }
        });
    }

    private updateRoles(userId) {
        this.userProfileService.saveRolesForUser(this.buildRoleDataForSaving(this.roleDatasource.data, this.userId || userId))
            .subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    const userLogin = this.uti.getUserInfo();
                    if (userLogin.id == userId) {
                        location.reload();
                    }
                    this.roleDirty = false;
                });
            });
    }

    private buildRoleDataForSaving(roles: any[], userId) {
        let result = [];
        for (let item of roles) {
            if (!item[ColHeaderKey.SelectAll]) {
                if (this.isOldItem(item)) {
                    result.push({
                        IdLoginRoles: item.IdLoginRoles,
                        IdLoginRolesLoginGw: this.getIdLoginRolesLoginGw(item),
                        IsDeleted: 1,
                        IdLogin: userId
                    });
                }
                continue;
            }
            if (this.isOldItem(item)) {
                continue;
            }
            result.push({
                IdLoginRoles: item.IdLoginRoles,
                IdLoginRolesLoginGw: this.getIdLoginRolesLoginGw(item),
                IdLogin: userId
            });
        }
        return result;
    }

    private isOldItem(item: any): boolean {
        let currentItem = this.userRoleCached.find(x => x.IdLoginRoles == item.IdLoginRoles);
        return (currentItem && currentItem.IdLoginRoles);
    }

    private getIdLoginRolesLoginGw(item: any) {
        let currentItem = this.userRoleCached.find(x => x.IdLoginRoles == item.IdLoginRoles);
        if (currentItem) {
            return currentItem.IdLoginRolesLoginGw
        }
        return null;
    }

    private loginByUserId() {
        const userLogin = this.uti.getUserInfo();
        this.authenticationService.loginByUserId(userLogin.id)
            .subscribe(
                data => this.loginByUserIdSuccess(data.item),
                error => {
                    console.log(error);
                });
    }

    private loginByUserIdSuccess(userAuthentication: any) {
        if (userAuthentication && userAuthentication.access_token && userAuthentication.expires_in) {
            this.uti.storeUserAuthentication(userAuthentication);

            var userInfo = this.uti.getUserInfo();
            this.userService.setCurrentUser(userInfo);
            if (this.isChangeLanguage) {
                this.changeLanguage();
            }
        }
    }

    /**
     * changeLanguage
     * @param language
     */
    public changeLanguage() {
        LocalStorageHelper.toInstance(SessionStorageProvider).setItem(LocalSettingKey.SET_LANGUAGE_MODE, { isMain: true });
        this.modalService.confirmMessageHtmlContent(new MessageModel({
            headerText: 'Change Language ',
            messageType: MessageModal.MessageType.error,
            message: [ { key: '<p>' }, { key: 'Modal_Message___ChangeLanguageWillReload' }, { key: '?</p>' }],
            buttonType1: MessageModal.ButtonType.danger,
            callBack1: () => {
                LocalStorageHelper.toInstance(SessionStorageProvider).setItem(LocalSettingKey.LANGUAGE, '');
                location.reload();
            },
            callBack2: () => { },
            callBackCloseButton: () => { }
        }));
    }

    private serviceError(data) {
        this.setFormOutputData(true);
        console.log(data);
    }

    private resetForm() {
        this.loginPicture = '';
        this.uploadMessage = '';
        Uti.resetValueForForm(this.formGroup);
    }

    private updatePasswordFormField() {
        this.formGroup.updateValueAndValidity();
        if (this.hasPasswordUpdate) {
            this.setControlRequireWhenPasswordUpdate();
        } else {
            this.setControlRequireWhenDontPasswordUpdate();
        }
        this.formGroup.updateValueAndValidity();
        this.reInitControlMessage();
        this.ref.detectChanges();
    }

    private setControlRequireWhenPasswordUpdate() {
        Uti.setRequireForFormControl(this.formGroup, 'cipher');
        Uti.setRequireForFormControl(this.formGroup, 'reCipher');
        Uti.setRequireForFormControl(this.formGroup, 'currentCipher');
    }

    private setControlRequireWhenDontPasswordUpdate() {
        Uti.clearRequireForFormControl(this.formGroup, 'cipher');
        Uti.clearRequireForFormControl(this.formGroup, 'reCipher');
        Uti.clearRequireForFormControl(this.formGroup, 'currentCipher');
    }

    private reInitControlMessage() {
        if (!this.controlMessagePasswords || !this.controlMessagePasswords.length) return;
        this.controlMessagePasswords.forEach((controlMessagePassword: ControlMessagesComponent) => {
            controlMessagePassword.ngOnInit();
        });
    }

    private buildDataForRole() {
        this.userProfileService.getAllUserRole()
            .subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.data || !response.item.data[0] || !response.item.data[0].length) {
                        return;
                    }

                    this.roleDatasource = {
                        data: response.item.data[0],
                        columns: this.createGridColumns()
                    };

                    setTimeout(() => {
                        if (this.userId) {
                            this.userProfileService.listUserRoleByUserId(this.userId)
                                .subscribe((response: ApiResultResponse) => {
                                    this.appErrorHandler.executeAction(() => {
                                        if (!Uti.isResquestSuccess(response) || !response.item.data || !response.item.data[0] || !response.item.data[0].length) {
                                            return;
                                        }

                                        this.userRoleCached = response.item.data[0];

                                        this.userRoleCached.forEach(checkedRole => {
                                            let found = this.roleDatasource.data.find(role => role.IdLoginRoles == checkedRole.IdLoginRoles);
                                            if (found) {
                                                found[ColHeaderKey.SelectAll] = true;

                                                if (this.xnAgGridComponent)
                                                    this.xnAgGridComponent.updateRowData([found]);
                                            }
                                        });
                                    });
                                });
                        }
                        else {
                            let found = this.roleDatasource.data.find(role => role.IdLoginRoles == this.normalUserRoleID);
                            if (found) {
                                found[ColHeaderKey.SelectAll] = true;
                                this.roleDirty = true;

                                if (this.xnAgGridComponent)
                                    this.xnAgGridComponent.updateRowData([found]);
                            }
                        }
                    }, 200);
                });
            });
    }

    private registerAvataChangeEvent() {
        setTimeout(() => {
            let that: UserProfileFormComponent = this;
            let userAvataUpload = $('#userAvataUpload');
            if (!userAvataUpload.length) return;
            userAvataUpload.change(function () {
                if ((<any>this).files.length <= 0) return;
                var reader = new FileReader();
                reader.onload = function (e) {
                    if (e.target['result'])
                        $('#userAvata').attr('src', e.target.result as string);
                }
                reader.readAsDataURL((<any>this).files[0]);
                that.fileData = ((<any>this).files[0]);
                that.setValueForOutputModel(new FormOutputModel({
                    submitResult: null,
                    formValue: that.formGroup.value,
                    isValid: that.isValid(),
                    isDirty: true,
                    returnID: null
                }));
                that.uploadMessage = '';
                that.pictureDirty = true;
            });
        }, 700);
    }

    private uploadAvata(successFunc?: Function, failFunc?: Function): any {
        const xhr = new XMLHttpRequest();
        let sendable: any;
        if (typeof this.fileData.size !== 'number') {
            throw new TypeError('The file specified is no longer valid');
        }
        sendable = new FormData();
        sendable.append('file', this.fileData, this.fileData.name);
        sendable.append('mode', UploadFileMode.Profile);

        xhr.onload = () => {
            if (!this._isSuccessCode(xhr.status)) {
                this.loginPicture = '';
                this.uploadMessage = 'Can not upload file';
                if (failFunc) {
                    failFunc();
                }

            }
            const response = JSON.parse(xhr.response);
            this.loginPicture = response.fileName;
            if (successFunc) {
                successFunc();
            }
        };
        xhr.onerror = () => {
            if (failFunc) {
                failFunc();
            }
            this.loginPicture = '';
            this.uploadMessage = 'Can not upload file';
        };
        xhr.onabort = () => {
            if (failFunc) {
                failFunc();
            }
            this.loginPicture = '';
            this.uploadMessage = 'This file is aborted';
        };
        xhr.open('Post', '/api/FileManager/UploadFile', true);
        xhr.withCredentials = true;
        xhr.send(sendable);
    }

    private _isSuccessCode(status: number): boolean {
        return (status >= 200 && status < 300) || status === 304;
    }

    private createGridColumns(): any {
        return [
            {
                'title': 'IdLoginRoles',
                'data': 'IdLoginRoles',
                'visible': false,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1',
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'IsBlocked',
                'data': 'IsBlocked',
                'visible': false,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1',
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'IsDeleted',
                'data': 'IsDeleted',
                'visible': false,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1',
                                Hidden: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'RoleName',
                'data': 'RoleName',
                'visible': true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'Description',
                'data': 'Description',
                'visible': true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1'
                            }
                        }
                    ]
                }
            },
            {
                'title': 'CreateDate',
                'data': 'CreateDate',
                'visible': true,
                setting: {
                    Setting: [
                        {
                            DisplayField: {
                                ReadOnly: '1',
                                Hidden: '1'
                            }
                        }
                    ]
                }
            }
        ];
    }

}
