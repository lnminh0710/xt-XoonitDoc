import {
    Component,
    OnInit,
    Output,
    OnDestroy,
    ViewChild,
    ChangeDetectorRef,
    EventEmitter,
    ElementRef,
} from '@angular/core';
import {
    UserService,
    AuthenticationService,
    AppErrorHandler,
    PropertyPanelService,
    ModalService,
    CommonService,
    UserProfileService,
} from '@app/services';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import { Uti } from '@app/utilities';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { FormOutputModel, MessageModel, User, ApiResultResponse, Module } from '@app/models';
import { UserProfileFormComponent } from '@app/shared/components/xn-form';
import { MessageModal, Configuration, ComboBoxTypeConstant } from '@app/app.constants';
import isBoolean from 'lodash-es/isBoolean';
import { formatDistance, format } from 'date-fns/esm';
import { CustomAction, ModuleActions } from '@app/state-management/store/actions';
import { UnsavedModuleCanDeactivate } from '@app/services';
import * as widgetContentReducer from '@app/state-management/store/reducer/widget-content-detail';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { DialogUserProfileComponent } from '../dialog-user-profile';
import { MatDialog } from '@xn-control/light-material-ui/dialog';
import { filter } from 'rxjs/operators';
import { AppActionNames } from '@app/state-management/store/actions/app/app.actions';
@Component({
    /* tslint:disable */
    selector: '.userBox',
    /* tslint:enable */
    styleUrls: ['./user-box.component.scss'],
    templateUrl: './user-box.component.html',
})
export class UserBoxComponent extends UnsavedModuleCanDeactivate implements OnInit, OnDestroy {
    public currentUser: User = new User();
    public lastUpdated: Date;
    public showForm: boolean = false;
    public formLoaded: boolean = false;
    public globalProperties: any;
    public globalDateFormat = '';
    public profileImageUrl: string = '';
    public userLanguage: string = null;
    public roles: any[] = [];
    public selectedRole: any = null;
    public selectedRoleOrigin: any = null;
    public isLoading = false;
    public versionSupplier: {
        version: string;
        supplier: string;
    };
    private languages: any[] = [];
    private isRoleFocused: boolean = false;
    private dirtyModules: Module[] = [];
    private activeModule: Module;
    private editingWidgets: any[] = [];
    private formDirty = false;

    private isUserProfileDirty: boolean = false;
    private globalPropertiesStateSubscription: Subscription;
    private dirtyModulesStateSubscription: Subscription;
    private activeModuleStateSubscription: Subscription;
    private editingWidgetsStateSubscription: Subscription;
    private formDirtyStateSubscription: Subscription;
    private userProfileSubscription: Subscription;
    private globalPropertiesState: Observable<any>;
    private dirtyModulesState: Observable<Module[]>;
    private activeModuleState: Observable<Module>;
    private editingWidgetsState: Observable<any[]>;
    private formDirtyState: Observable<boolean>;
    @ViewChild('userProfileForm') private userProfileForm: UserProfileFormComponent;
    @ViewChild('uploadAvatar') inputUploadAvatar: ElementRef;

    @Output() updateAutoClose: EventEmitter<boolean> = new EventEmitter();

    constructor(
        private store: Store<AppState>,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelService: PropertyPanelService,
        private userServ: UserService,
        private authenticationService: AuthenticationService,
        private modalService: ModalService,
        private toasterService: ToasterService,
        private ref: ChangeDetectorRef,
        protected router: Router,
        private consts: Configuration,
        private commonService: CommonService,
        private userProfileService: UserProfileService,
        private moduleActions: ModuleActions,
        private uti: Uti,
        public dialog: MatDialog,
        private reducerMgrDispatcher: ReducerManagerDispatcher,
    ) {
        super();

        this.globalPropertiesState = store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
        );
        this.dirtyModulesState = store.select((state) => state.mainModule.dirtyModules);
        this.activeModuleState = store.select((state) => state.mainModule.activeModule);

        this.lastUpdated = new Date();

        // set avatar
        this.currentUser = this.userServ.getCurrentUser();
        if (this.currentUser) this.setAvatar(this.currentUser.loginPicture);
    }

    public ngOnInit() {
        this.subscribeUserProfile();
        this.subscribeGlobalProperties();
        this.subscribeDirtyModulesState();
        this.subscribeActiveModuleState();
        this.getMainLanguages();
        this.getRoles();
        this.setVersion();
    }

    private setVersion() {
        const appVersions = Configuration?.PublicSettings?.appVersion?.split('(');
        const date = appVersions[1] ? '(' + appVersions[1] : '';
        this.versionSupplier = {
            version: 'Version: ' + `<strong>${appVersions[0]}&nbsp;</strong>${date}`,
            supplier: 'Power by <strong>Xoontec Việt Nam</strong>',
        };
    }

    private setAvatar(avatarUrl) {
        if (avatarUrl.includes('mode=Profile')) {
            this.authenticationService.checkAvatarUrlValid(avatarUrl).subscribe(
                (res: any) => {
                    if (!res) {
                        this.profileImageUrl = this.currentUser.avatarDefault;
                        this.ref.detectChanges();
                    }

                    this.profileImageUrl = avatarUrl;
                    this.ref.detectChanges();
                },
                (err: any) => {
                    this.profileImageUrl = this.currentUser.avatarDefault;
                    this.ref.detectChanges();
                },
            );
        } else {
            this.profileImageUrl = avatarUrl;
        }
    }

    private subscribeUserProfile() {
        this.userProfileSubscription = this.reducerMgrDispatcher
            .pipe(filter((action: CustomAction) => action.type === AppActionNames.APP_UPDATE_USER_PROFILE))
            .subscribe((action: CustomAction) => {
                const payload = <User>action.payload;
                this.currentUser = payload;
                this.setAvatar(payload.loginPicture);
                this.ref.detectChanges();
            });
    }

    canDeactivate(): boolean {
        return !this.formDirty && this.editingWidgets.length === 0 && this.dirtyModules.length === 0;
    }

    deactivateCancelCallback() {
        if (this.dirtyModules.length) {
            this.store.dispatch(this.moduleActions.requestChangeModule(this.dirtyModules[0]));
        }
    }

    public logout = (): void => {
        if (this.dirtyModules.length) {
            const modalOptions: any = {
                headerText: 'Saving Changes',
                message: [{ key: '<p>' }, { key: 'Modal_Message__ThereAreUnSaveModule' }, { key: '<p>' }],
                onModalSaveAndExit: () => {
                    this.store.dispatch(this.moduleActions.requestChangeModule(this.dirtyModules[0]));
                },
                onModalExit: () => {
                    this.authenticationService.logout();
                    location.href = this.consts.loginUrl;
                    location.reload();
                },
            };

            this.modalService.unsavedWarningMessage(modalOptions);
        } else {
            this.modalService.confirmMessageHtmlContent(
                new MessageModel({
                    headerText: 'Logout',
                    messageType: MessageModal.MessageType.error,
                    message: [{ key: '<p>' }, { key: 'Modal_Message__DoYouWantToLogoutSystem' }, { key: '</p>' }],
                    buttonType1: MessageModal.ButtonType.danger,
                    callBack1: () => {
                        this.authenticationService.logout();
                        location.href = this.consts.loginUrl;
                        location.reload();
                    },
                }),
            );
        }
    };

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public editProfile() {
        this.showForm = true;
    }

    public userProfileFormLoaded() {
        this.formLoaded = true;

        this.toggleAvatar(false);
    }

    public close() {
        if (this.isUserProfileDirty) {
            this.confirmWhenClose();
            return;
        }
        this.showForm = false;
        this.formLoaded = false;
        this.toggleAvatar(true);
    }

    public saveUserProfile() {
        if (!this.isUserProfileDirty) {
            this.toasterService.pop('warning', 'Validation Failed', 'No entry data for saving!');
            return;
        }
        this.userProfileForm.submit();
    }

    public userProfileOutput(data: FormOutputModel) {
        if (isBoolean(data.submitResult)) {
            if (data.submitResult) {
                if (data.returnID) {
                    this.toasterService.pop('success', 'Success', 'Save user successfully');
                    this.isUserProfileDirty = false;
                    this.updateAutoClose.emit(true);
                    return;
                } else {
                    this.toasterService.pop('error', 'Message', 'Has service error!!!');
                    this.updateAutoClose.emit(false);
                }
            } else {
                this.toasterService.pop(
                    'warning',
                    'Validation Failed',
                    'There are some fields do not pass validation!',
                );
                this.isUserProfileDirty = true;
                this.updateAutoClose.emit(false);
            }
        } else {
            this.isUserProfileDirty = data.isDirty;
            this.updateAutoClose.emit(!data.isDirty);
        }
    }

    private subscribeGlobalProperties() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.globalProperties = globalProperties;
                    this.globalDateFormat =
                        this.propertyPanelService.buildGlobalDateFormatFromProperties(globalProperties);
                }
            });
        });
    }

    private subscribeDirtyModulesState() {
        this.dirtyModulesStateSubscription = this.dirtyModulesState.subscribe((dirtyModulesState: Module[]) => {
            this.appErrorHandler.executeAction(() => {
                if (dirtyModulesState) {
                    this.dirtyModules = dirtyModulesState;
                }
            });
        });
    }

    private subscribeActiveModuleState() {
        this.activeModuleStateSubscription = this.activeModuleState.subscribe((activeModuleState: Module) => {
            this.appErrorHandler.executeAction(() => {
                this.activeModule = activeModuleState;

                if (this.activeModule && this.activeModule.moduleNameTrim) {
                    if (this.editingWidgetsStateSubscription) {
                        this.editingWidgetsStateSubscription.unsubscribe();
                    }
                    this.editingWidgetsState = this.store.select(
                        (state) =>
                            widgetContentReducer.getWidgetContentDetailState(state, this.activeModule.moduleNameTrim)
                                .editingWidgets,
                    );
                    this.subscribeWidgetDetailState();

                    if (this.formDirtyStateSubscription) {
                        this.formDirtyStateSubscription.unsubscribe();
                    }
                    this.formDirtyState = this.store.select(
                        (state) =>
                            processDataReducer.getProcessDataState(state, this.activeModule.moduleNameTrim).formDirty,
                    );
                    this.subcribeFormDirtyState();
                }
            });
        });
    }

    private subscribeWidgetDetailState() {
        this.editingWidgetsStateSubscription = this.editingWidgetsState.subscribe((editingWidgets: Array<any>) => {
            this.appErrorHandler.executeAction(() => {
                this.editingWidgets = editingWidgets;
            });
        });
    }

    private subcribeFormDirtyState() {
        this.formDirtyStateSubscription = this.formDirtyState.subscribe((formDirtyState: boolean) => {
            this.appErrorHandler.executeAction(() => {
                this.formDirty = formDirtyState;
            });
        });
    }

    private confirmWhenClose() {
        this.modalService.unsavedWarningMessageDefault({
            headerText: 'Saving Changes',
            showCloseButton: false,
            onModalSaveAndExit: () => {
                this.updateAutoClose.emit(false);
                this.saveUserProfile();
                this.ref.detectChanges();
            },
            onModalExit: () => {
                this.isUserProfileDirty = false;
                this.showForm = false;
                this.formLoaded = false;
                this.toggleAvatar(true);
                this.updateAutoClose.emit(true);
                this.ref.detectChanges();
            },
            onModalCancel: () => {
                this.updateAutoClose.emit(false);
            },
        });
    }

    private getMainLanguages() {
        this.commonService
            .getListComboBox('' + ComboBoxTypeConstant.language)
            .subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.language) {
                        return;
                    }
                    this.languages = response.item.language;

                    if (this.languages && this.languages.length && this.currentUser) {
                        let userLanguage = this.languages.find((l) => l.idValue == this.currentUser.preferredLang);
                        if (userLanguage) {
                            this.userLanguage = userLanguage.textValue;
                        }
                    }
                });
            });
    }

    private getRoles() {
        if (!this.currentUser) return;
        this.userProfileService.listUserRoleByUserId().subscribe((response: ApiResultResponse) => {
            this.appErrorHandler.executeAction(() => {
                if (
                    !Uti.isResquestSuccess(response) ||
                    !response.item.data ||
                    !response.item.data[0] ||
                    !response.item.data[0].length
                ) {
                    return;
                }

                this.roles.push({
                    RoleName: 'All',
                    IdLoginRolesLoginGw: -1,
                    IdLoginRoles: -1,
                });

                response.item.data[0].forEach((role) => {
                    this.roles.push(role);
                });

                let defaultRoles = this.roles.filter(
                    (r) => isBoolean(r.IsDefault) && r.IsDefault && r.IdLoginRoles != -1,
                );
                if (defaultRoles && defaultRoles.length) {
                    let idLoginRoles: string;

                    if (defaultRoles.length === this.roles.length - 1) {
                        this.selectedRole = this.roles[0].IdLoginRolesLoginGw;
                        this.selectedRoleOrigin = this.selectedRole;

                        idLoginRoles = this.roles[0].IdLoginRoles;
                    } else {
                        this.selectedRole = defaultRoles[0].IdLoginRolesLoginGw;
                        this.selectedRoleOrigin = this.selectedRole;

                        idLoginRoles = defaultRoles[0].IdLoginRoles;
                    }

                    //store DefaultRoleId to localStorage
                    if (idLoginRoles) this.uti.storeDefaultRole(idLoginRoles);
                }
            });
        });
    }

    private toggleAvatar(isShowed) {
        if (isShowed) {
            $('.avatar img').css({
                opacity: 1,
                '-webkit-transition': 'all 0s',
                transition: 'all 0s',
            });
        } else {
            $('.avatar img').css({
                opacity: 0,
                '-webkit-transition': 'all 0.1s',
                transition: 'all 0.1s',
            });
        }
    }

    public roleChanged() {
        if (this.isRoleFocused && this.selectedRole) {
            this.modalService.confirmMessageHtmlContent(
                new MessageModel({
                    headerText: 'Change User Role',
                    messageType: MessageModal.MessageType.error,
                    message: [
                        { key: '<p>' },
                        { key: 'Modal_Message__ThePageWillReloadToApplyNewRole' },
                        { key: '</p>' },
                    ],
                    buttonType1: MessageModal.ButtonType.danger,
                    callBack1: () => {
                        if (this.selectedRole === -1) {
                            for (let i = 1; i < this.roles.length; i++) {
                                this.roles[i].IsDefault = true;
                            }
                        } else {
                            for (let i = 1; i < this.roles.length; i++) {
                                if (this.roles[i].IdLoginRolesLoginGw !== this.selectedRole) {
                                    this.roles[i].IsDefault = false;
                                } else {
                                    this.roles[i].IsDefault = true;
                                }
                            }
                        }

                        this.selectedRoleOrigin = this.selectedRole;

                        //store DefaultRoleId to localStorage
                        let role = this.roles.find((r) => r.IdLoginRolesLoginGw == this.selectedRole);
                        if (role) this.uti.storeDefaultRole(role.IdLoginRoles);

                        const isSetDefaultRole = '1';
                        this.userProfileService
                            .saveRolesForUser(this.buildRolesData(), isSetDefaultRole)
                            .subscribe((response: ApiResultResponse) => {
                                this.appErrorHandler.executeAction(() => {
                                    if (!Uti.isResquestSuccess(response)) {
                                        this.toasterService.pop('error', 'Failed', 'Save user role is not successful.');
                                        return;
                                    }

                                    this.toasterService.pop('success', 'Success', 'Save user role successfully');

                                    location.reload();
                                });
                            });
                    },
                    callBack2: () => {
                        this.selectedRole = this.selectedRoleOrigin;
                    },
                    showCloseButton: false,
                }),
            );
        }
    }

    public roleFocus(isFocused: boolean) {
        this.isRoleFocused = isFocused;
    }

    private buildRolesData() {
        let data: any[] = [];

        for (let i = 1; i < this.roles.length; i++) {
            data.push(this.roles[i]);
        }

        return data;
    }

    public buildWorkingTime(date) {
        return formatDistance(new Date(date), new Date());
    }

    formatDate(data: any, formatPattern: string) {
        const result = !data ? '' : this.uti.formatLocale(new Date(data), formatPattern);
        return result;
    }

    private isOpenningProfileDialog = false;
    openUserProfileDialog() {
        if (this.isOpenningProfileDialog) return;

        this.isOpenningProfileDialog = true;
        const dialogRef = this.dialog.open(DialogUserProfileComponent, {
            width: '450px',
            data: {},
            panelClass: 'user-profile',
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.isOpenningProfileDialog = false;
        });
    }
}
