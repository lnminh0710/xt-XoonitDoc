import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
    ErrorMessageTypeEnum,
    FilterOptionsUserEnum,
    MessageModal,
    UpdationUserTab,
    UserRoles,
    UserRolesDisplayName,
    UserStatusConstant,
} from '@app/app.constants';
import { ObjectSelection, User, UserDataUpdation, UserSignUp } from '@app/models';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { BaseComponent } from '@app/pages/private/base';
import { UserManagementSelectors } from '@app/pages/user-management/user-management.statemanagement/user-management.selectors';
import { UserProfileService, UserService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { Store } from '@ngrx/store';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@xn-control/light-material-ui/autocomplete';
import { ToasterService } from 'angular2-toaster';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { includes, flatten, find, filter, get, map, omit, unionBy, values } from 'lodash-es';
import { CustomAction } from '@app/state-management/store/actions';
import { PopupRef } from '@app/xoonit-share/components/global-popup/popup-ref';
import { ItemOfList } from '@app/xoonit-share/components/management-list/model';
import { RoleGroupResponse, RoleResponse } from '@app/xoonit-share/components/widget-role-group/models';
import { SelectedItemModel } from '@app/xoonit-share/components/xn-checkbox-tree/checkbox-tree.model';
import { UserV2ActionNames, UserV2Actions } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.actions';
import { UserV2Selectors } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.selectors';
import { XnCheckboxTreeComponent } from '@app/xoonit-share/components/xn-checkbox-tree/xn-checkbox-tree.component';
import { WidgetMemberPermissionConfigComponent } from '@app/xoonit-share/components/widget-member-permission-config/widget-member-permission-config.component';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { IconHeader } from '@app/xoonit-share/components/global-popup/models/popup-header.interface';
import { IconNames } from '@app/app-icon-registry.service';
import { TreeTypeEnum } from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';

@Component({
    selector: 'widget-user-updation',
    templateUrl: './widget-user-updation-v2.component.html',
    styleUrls: ['./widget-user-updation-v2.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetUserUpdationV2Component extends BaseComponent implements OnDestroy {
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
    @ViewChild('treePermission') treePermission: XnCheckboxTreeComponent;

    public readonly USER_STATUS_ENUM = UserStatusConstant;
    public readonly ERROR_MESSAGE_TYPE_ENUM = ErrorMessageTypeEnum;
    public readonly FILTER_OPTION_USER_ENUM = FilterOptionsUserEnum;
    public readonly UPDATION_USER_TAB = UpdationUserTab;

    public selectedTab: UpdationUserTab = this.UPDATION_USER_TAB.UserInfo;

    public formGroup: FormGroup;
    public dataFields = {
        COMPANY_NAME: <ControlData>{ controlName: 'companyName', displayName: 'Company Name', order: 1 },
        EMAIL: <ControlData>{ controlName: 'email', displayName: 'Email', order: 2 },
        FIRSTNAME: <ControlData>{ controlName: 'firstName', displayName: 'First Name', order: 3 },
        LASTNAME: <ControlData>{ controlName: 'lastName', displayName: 'Last Name', order: 4 },
        INITIALS: <ControlData>{ controlName: 'initials', displayName: 'Initials', order: 6 },
        IS_ACTIVE: <ControlData>{ controlName: 'isActive', displayName: 'Activate', order: 7 },
    };
    public controlDataList: ControlData[] = [
        this.dataFields.COMPANY_NAME,
        this.dataFields.EMAIL,
        this.dataFields.FIRSTNAME,
        this.dataFields.LASTNAME,
        this.dataFields.INITIALS,
        this.dataFields.IS_ACTIVE,
    ];

    public filterOptionsParam = {
        company: {
            dataSource: [],
            acOpionsForSubmit: [],
        },
    };

    userRoleMasterAdmin = { key: UserRoles.MasterAdministration, value: UserRolesDisplayName.MasterAdministration };
    userRolesDefault = [
        { key: UserRoles.CustomerAdministration, value: UserRolesDisplayName.CustomerAdministration },
        { key: UserRoles.User, value: UserRolesDisplayName.User },
    ];
    userRoleList = [];

    public isFocus = {
        [this.dataFields.COMPANY_NAME.displayName]: false,
        [this.dataFields.EMAIL.displayName]: false,
        [this.dataFields.FIRSTNAME.displayName]: false,
        [this.dataFields.LASTNAME.displayName]: false,
        [this.dataFields.INITIALS.displayName]: false,
    };
    public isHover = {
        [this.dataFields.COMPANY_NAME.displayName]: false,
        [this.dataFields.EMAIL.displayName]: false,
        [this.dataFields.FIRSTNAME.displayName]: false,
        [this.dataFields.LASTNAME.displayName]: false,
        [this.dataFields.INITIALS.displayName]: false,
    };

    public isError = false;
    public errMes = '';
    public isLoading = false;

    public idLogin: string;
    public userLogin: User;
    public originalEditUser: UserDataUpdation;

    /** */
    public roleGroupList: ItemOfList[] = [];
    public roleList: ItemOfList[] = [];
    public permissionList: ItemOfList[] = [];
    private _originalPermission: any;
    private _originalRoleList: any;
    private _originalRoleGroup: any;
    private _userPermission: any[];
    private _userRole: any[];
    private _userGroupRoles: any[];
    private _rolePermissionDetail: any = {};
    private _userRoleSelected: any = {};

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        private fb: FormBuilder,
        private toastrService: ToasterService,
        private userService: UserService,
        private userProfileService: UserProfileService,
        protected store: Store<AppState>,
        protected userManagementActions: UserV2Actions,
        protected userManagementSelectors: UserV2Selectors,
        public popupRef: PopupRef,
        protected popupService: PopupService,
    ) {
        super(router);
        this.onSubscribeAction();

        this.idLogin = popupRef.params.data?.idLogin || null;
        if (this.idLogin) {
            this.isLoading = true;
            this.store.dispatch(this.userManagementActions.getUserByIdLoginAction({ UserIdLogin: this.idLogin }));
        } else {
            this.getFilterOptions();
        }
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    private onSubscribeAction() {
        this.userService.currentUser.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((user: User) => {
            if (!user) return;

            this.userLogin = user;
        });

        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserV2ActionNames.USER_UPDATE_PERMISSION_ASSIGN)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    const data = action.payload;
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                    if (!data?.item || data.item.returnID == -1) {
                        this.toastrService.pop(MessageModal.MessageType.error, 'System', `Add new user fail!`);
                        return;
                    }

                    if (data.statusCode !== 1) {
                        this.isError = true;
                        this.errMes = data.resultDescription;
                        this.cdRef.detectChanges();
                        return;
                    }

                    this.toastrService.pop(MessageModal.MessageType.success, 'System', data.resultDescription);
                    this.closeDialog(true);
                    this.cdRef.detectChanges();
                },
                (error) => {
                    this.isLoading = false;
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', `Add new user fail!`);
                    this.closeDialog();
                    this.cdRef.detectChanges();
                },
            );

        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserV2ActionNames.USER_NEW_ACCOUNT)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                    if (!action || (action && !action.payload) || (action && action.payload && !action.payload.item)) {
                        this.toastrService.pop(MessageModal.MessageType.error, 'System', `Add new user fail!`);
                        return;
                    }

                    const data = action.payload.item;
                    if (data.statusCode !== 1) {
                        this.isError = true;
                        this.errMes = data.resultDescription;
                        this.cdRef.detectChanges();
                        return;
                    }

                    this.toastrService.pop(MessageModal.MessageType.success, 'System', data.resultDescription);
                    this.closeDialog(true);
                    this.cdRef.detectChanges();
                },
                (error) => {
                    this.isLoading = false;
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', `Add new user fail!`);
                    this.closeDialog();
                    this.cdRef.detectChanges();
                },
            );

        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserV2ActionNames.USER_UPDATE_INFO)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    if (!action && !action.payload) {
                        this.isLoading = false;
                        this.cdRef.detectChanges();
                        return;
                    }
                    if (get(action, 'payload.item.isSuccess')) {
                        this.toastrService.pop(MessageModal.MessageType.success, 'System', `Update successfully!`);
                        this.closeDialog(true);
                        this.idLogin = null;
                        this.originalEditUser = null;
                        return;
                    } else if (get(action, 'payload.item.userErrorMessage')) {
                        this.isLoading = false;
                        this.cdRef.detectChanges();

                        this.toastrService.pop(
                            MessageModal.MessageType.error,
                            'Fail',
                            get(action, 'payload.item.userErrorMessage'),
                        );
                    }
                },
                (error) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', `System Error!`);
                },
            );

        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserV2ActionNames.USER_GET_BY_IDLOGIN)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();

                    let item = get(action, ['payload', 'item', 0, 0, 'UserInfo']);
                    if (!item) {
                        this.toastrService.pop(MessageModal.MessageType.error, 'System', `Load user fail!`);
                        return;
                    }

                    this.mappingDataRoleGroup(
                        JSON.parse(get(action, ['payload', 'item', 0, 0, 'UserGroupRole'], '[]')),
                    );
                    this.transformDataRoles(JSON.parse(get(action, ['payload', 'item', 0, 0, 'UserRole'], '[]')));
                    this.mappingPermission(JSON.parse(get(action, ['payload', 'item', 0, 0, 'UserPermission'], '[]')));
                    if (!!this.originalEditUser) return;
                    item = JSON.parse(item)[0];
                    const userData = <UserDataUpdation>{
                        idLogin: item.IdLogin,
                        idApplicationOwner: item.IdApplicationOwner,
                        firstName: item.FirstName,
                        lastName: item.LastName,
                        initials: item.Initials,
                        email: item.Email,
                        idRole: item.Encrypted,
                        isDisableRole: false,
                        isActive: !item.IsBlocked,
                        idPerson: item.IdPerson,
                        company: item.Company,
                    };
                    this.originalEditUser = userData;

                    // TamTV comment for fix bug company is re-init when firsttime select
                    this.getFilterOptions();
                },
                (error) => {
                    this.isLoading = false;
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', `Load user fail!`);
                    this.closeDialog();
                    this.cdRef.detectChanges();
                },
            );
    }

    private getFilterOptions() {
        this.userProfileService
            .getFilterOptionsUser()
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (res) => {
                    if (!res) return;

                    this.filterOptionsParam.company.dataSource = res.companyList || [];
                    this.filterOptionsParam.company.acOpionsForSubmit = res.companyList || [];

                    if (this.idLogin) {
                        this.onInitFormUser(this.originalEditUser);
                    } else {
                        this.initFormNewUser();
                    }
                },
                (err) => {
                    if (this.idLogin) {
                        this.onInitFormUser(this.originalEditUser);
                    } else {
                        this.initFormNewUser();
                    }
                },
            );
    }

    private initFormNewUser() {
        const userData = <UserDataUpdation>{
            firstName: '',
            lastName: '',
            initials: '',
            email: '',
            idRole: '',
            isDisableRole: true,
            isActive: true,
        };
        this.originalEditUser = userData;
        this.onInitFormUser(userData);
    }
    private onInitFormUser(userData: UserDataUpdation) {
        let company;
        if (userData?.idPerson && userData.company) {
            const selectedCompany = this.filterOptionsParam.company.dataSource?.find(
                (x) => x.IdValue == userData?.idPerson,
            );
            company = selectedCompany ? selectedCompany : '';
        } else {
            company = '';
        }

        const formgroup = this.fb.group({
            [this.dataFields.COMPANY_NAME.controlName]: [company, [Validators.required]],
            [this.dataFields.FIRSTNAME.controlName]: [userData.firstName || '', [Validators.required]],
            [this.dataFields.LASTNAME.controlName]: [userData.lastName || '', [Validators.required]],
            [this.dataFields.INITIALS.controlName]: [userData.initials || '', [Validators.required]],
            [this.dataFields.EMAIL.controlName]: [
                userData.email || '',
                [Validators.required, Validators.pattern(ValidatorPattern.EMAIL)],
            ],
            [this.dataFields.IS_ACTIVE.controlName]: [userData.isActive, [Validators.required]],
        });
        this.formGroup = formgroup;
        // disable company when: edit mode or current user role login is customer admin
        if (this.idLogin) {
            this.formGroup.controls[this.dataFields.COMPANY_NAME.controlName].disable();
        }

        this.cdRef.detectChanges();
    }

    private filter(val: string, list: any): string[] {
        return list.filter((option) => option.TextValue.toLowerCase().includes(val.trim().toLocaleLowerCase()));
    }
    public displayFn(object: object): string {
        return object ? object['TextValue'] : object;
    }

    public listenOnSelectedCompanyOption($event: MatAutocompleteSelectedEvent) {
        this._onCompanyNameChanged($event.option.value);
    }

    private _onCompanyNameChanged(
        companyNameVal: string | { IdValue: string; TextValue: string; IsMainAdmin: number },
    ) {
        let text = companyNameVal;
        if (typeof companyNameVal === 'object' && 'IdValue' in companyNameVal) {
            text = companyNameVal.TextValue;
        } else {
            const companySelected = this.filterOptionsParam.company.dataSource?.find(
                (x) => x.TextValue.trim().toLowerCase() === (text as string).trim().toLowerCase(),
            );

            if (companySelected) {
                text = companySelected.TextValue.trim();
            } else {
                text = companyNameVal;
            }
        }
        if (typeof companyNameVal === 'object' && companyNameVal.IdValue)
            this.store.dispatch(
                this.userManagementActions.getUserByIdLoginAction({
                    IdSharingCompany: companyNameVal.IdValue,
                }),
            );

        this.filterOptionsParam.company.acOpionsForSubmit = text
            ? this.filter(text as string, this.filterOptionsParam.company.dataSource)
            : this.filterOptionsParam.company.dataSource;
    }

    public numberOnly(event): boolean {
        return Uti.pressKeyNumberOnly(event);
    }

    public changeValueHover(controlName: string, value: boolean) {
        if (!controlName) return;

        this.isHover[controlName] = value;
    }

    public filterStates(data: any, type: FilterOptionsUserEnum) {
        const text = data && data['TextValue'] ? data['TextValue'] : data;
        switch (type) {
            case FilterOptionsUserEnum.EmailSubmitForm:
                if (!this.idLogin) return;

                if (this.formGroup.controls[this.dataFields.EMAIL.controlName].value !== this.originalEditUser.email) {
                    this.formGroup.controls[this.dataFields.IS_ACTIVE.controlName].disable();
                } else {
                    this.formGroup.controls[this.dataFields.IS_ACTIVE.controlName].enable();
                }
                break;
            case FilterOptionsUserEnum.CompanySubmitForm:
                this.formGroup.controls[this.dataFields.COMPANY_NAME.controlName].valueChanges
                    .pipe(debounceTime(350), take(1))
                    .subscribe((val: string) => {
                        this._onCompanyNameChanged(val);
                    });
                break;
            default:
                break;
        }
        this.cdRef.detectChanges();
    }

    public changeValueFocus(controlName: string, value: boolean) {
        if (!controlName) return;

        this.isFocus[controlName] = value;
    }

    public clearText(controlName: string) {
        if (!controlName) return;

        this.formGroup.controls[controlName].setValue('');
        if ((controlName = this.dataFields.COMPANY_NAME.controlName)) {
            this.filterOptionsParam.company.acOpionsForSubmit = [...this.filterOptionsParam.company.dataSource];
        }
    }

    private clearErrMessage() {
        this.isError = false;
        this.errMes = '';
        this.cdRef.detectChanges();
    }

    public submit() {
        if (!this.formGroup.valid) return;

        const model = this.formGroup.getRawValue();
        let companyName = '';
        let companyId = '';
        const checkCompany =
            model[this.dataFields.COMPANY_NAME.controlName] && model[this.dataFields.COMPANY_NAME.controlName].IdValue;

        companyName = checkCompany
            ? model[this.dataFields.COMPANY_NAME.controlName].TextValue
            : model[this.dataFields.COMPANY_NAME.controlName]?.trim() || '';
        const companySelected = this.filterOptionsParam.company.dataSource?.find(
            (x) => x.TextValue.trim().toLowerCase() === companyName.trim().toLowerCase(),
        );

        companyId = checkCompany
            ? model[this.dataFields.COMPANY_NAME.controlName].IdValue
            : companySelected
            ? companySelected.IdValue
            : null;
        companyName = companySelected ? companySelected.TextValue.trim() : companyName;

        if (!companyId) return;

        this.isLoading = true;
        this.cdRef.detectChanges();
        this.clearErrMessage();

        const isActive = model[this.dataFields.IS_ACTIVE.controlName];

        const request: any = {
            JSONLoginAccount: {
                LoginAccount: {
                    Email: model[this.dataFields.EMAIL.controlName],
                    LastName: model[this.dataFields.LASTNAME.controlName],
                    FirstName: model[this.dataFields.FIRSTNAME.controlName],
                    Initials: model[this.dataFields.INITIALS.controlName],
                    IsBlocked: !isActive,
                    IsDeleted: 0,
                    IdLogin: this.idLogin,

                    IdRepLanguage: null,
                    Password: null,
                    PhoneNr: null,
                    DateOfBirth: null,
                    IsLoginActived: null,
                    IdPerson: companyId,
                    // IdAppUser: this.originalEditUser?.idApplicationOwner || null,
                    IdAppUser: null,
                    CurrentDateTime: null,
                    // IdApplicationOwner: '298',
                    Company: companyName,
                },
            },
        };
        if (Array.isArray(this._userGroupRoles) && !!this._userGroupRoles.length) {
            request.JSONGroupRole = {
                GroupRoles: this._userGroupRoles,
            };
        }
        const originalSelected = filter(this._originalRoleList, (_r) => !!_r.IsSelected).map((_r) =>
            omit(
                {
                    ..._r,
                    IdLogin: this.idLogin,
                    IsActive: '1',
                },
                ['IsSelected', 'IsReadOnly'],
            ),
        );
        let userRole = this._userRole;
        if (!this.idLogin) userRole = unionBy(userRole, originalSelected, 'IdLoginRoles');

        if (Array.isArray(userRole) && !!userRole.length) {
            request.JSONRole = {
                Roles: userRole,
            };
        } else if (!this.idLogin) {
            if (Array.isArray(originalSelected) && !!originalSelected.length)
                request.JSONRole = {
                    Roles: originalSelected,
                };
        }
        if (Array.isArray(this._userPermission) && !!this._userPermission.length) {
            request.JSONPermission = {
                Permissions: this._userPermission,
            };
        }
        this.store.dispatch(this.userManagementActions.updateUserPermissionAssignAction(request));
    }

    public closeDialog(isSuccess: boolean = false) {
        this.popupRef.close({ isSuccess });
        this.initFormNewUser();
        this.clearErrMessage();
        this.isLoading = false;
        if (this.userLogin.isSuperAdmin && this.filterOptionsParam?.company?.acOpionsForSubmit) {
            this.filterOptionsParam.company.acOpionsForSubmit = [...this.filterOptionsParam.company.dataSource];
        }
        this.cdRef.detectChanges();
    }

    public onClickRoleGroupCheckbox(event: SelectedItemModel) {
        this._userGroupRoles = this.getChangedData(this._originalRoleGroup, event, 'IdLoginGroupRole');
    }

    public onClickRoleCheckbox(event: any) {
        if (this._rolePermissionDetail[event?.node?.id]) {
            if (!event.isSelected)
                this._userRoleSelected[event?.node?.id] = this._rolePermissionDetail[event?.node?.id];
            else delete this._userRoleSelected[event?.node?.id];
            this.updatePermissionActivate(this._rolePermissionDetail[event?.node?.id], !event.isSelected);
        } else {
            this.userProfileService.getRoleById(event?.node?.id).subscribe((items) => {
                this._rolePermissionDetail[event?.node?.id] = filter(
                    get(items, ['item', 0], []),
                    (_d) => !!_d.IsSelected,
                );
                if (!event.isSelected)
                    this._userRoleSelected[event?.node?.id] = this._rolePermissionDetail[event?.node?.id];
                else delete this._userRoleSelected[event?.node?.id];
                this.updatePermissionActivate(this._rolePermissionDetail[event?.node?.id], !event.isSelected);
            });
        }
        // this._userRole = this.getChangedData(this._originalRoleList, event, 'IdLoginRoles');
    }

    public onClickPermissionCheckbox(event: any) {
        let nodes = [event.node];
        let indeterminate = false;
        if (includes(event.node.id, 'parent')) {
            indeterminate =
                this.treePermission.descendantsPartiallySelected(event.node) ||
                this.treePermission.descendantsAllSelected(event.node);
            nodes = this.treePermission.treeControl.getDescendants(event.node);
        }
        const request = [];
        for (const key in nodes) {
            if (Object.prototype.hasOwnProperty.call(nodes, key)) {
                const element = nodes[key];
                const currentItem = find(this._originalPermission, ['IdPermission', element.id]);
                if (!event.isSelected || indeterminate)
                    request.push(
                        omit(
                            {
                                ...currentItem,
                                IdLogin: this.idLogin,
                                IsActive: '0',
                                IsDeleted: '1',
                            },
                            ['IsSelected', 'IsDeleted', 'IsReadOnly'],
                        ),
                    );
                else
                    request.push(
                        omit(
                            {
                                ...currentItem,
                                IdLogin: this.idLogin,
                                IsActive: '1',
                            },
                            ['IsSelected', 'IsDeleted', 'IsReadOnly'],
                        ),
                    );
            }
        }
        this._userPermission = unionBy(this._userPermission, request, 'IdPermission');
    }

    public onChangeSelectedRoleCheckbox(event: SelectedItemModel[]) {
        this._userRole = this.getChangedData(this._originalRoleList, event, 'IdLoginRoles');
    }

    private getChangedData(original, data, keyword) {
        const request = [];
        const omitArg =
            keyword === 'IdPermission' ? ['IsSelected', 'IsDeleted', 'IsReadOnly'] : ['IsSelected', 'IsReadOnly'];
        for (const key in original) {
            if (Object.prototype.hasOwnProperty.call(original, key)) {
                const element = original[key];
                const currentItem = find(data, ['id', element[keyword]]);
                if ((!element.IsSelected || element.IsSelected == '0') && !!currentItem) {
                    request.push(
                        omit(
                            {
                                ...element,
                                IdLogin: this.idLogin,
                                IsActive: '1',
                            },
                            omitArg,
                        ),
                    );
                } else if (element.IsSelected == 1 && !currentItem) {
                    request.push(
                        omit(
                            {
                                ...element,
                                IdLogin: this.idLogin,
                                IsActive: '0',
                                IsDeleted: '1',
                            },
                            omitArg,
                        ),
                    );
                }
            }
        }
        return request;
    }

    private mappingDataRoleGroup(data: any) {
        this._originalRoleGroup = data;
        this.roleGroupList =
            data.map?.((roleGroup: any) => {
                return new ItemOfList({
                    id: roleGroup.IdLoginGroupRole,
                    name: roleGroup.GroupRoleName,
                    isActive: roleGroup.IsSelected == 1,
                });
            }) || [];
    }

    private transformDataRoles(data: any): ItemOfList[] {
        if (!data) return;
        this._originalRoleList = data;
        this.roleList =
            data?.map?.((role: any) => {
                return new ItemOfList({
                    id: role.IdLoginRoles,
                    name: role.RoleName,
                    isActive: role.IsSelected == 1,
                });
            }) || [];

        this.userProfileService.getPermissionByListRole(map(data, 'IdLoginRoles')).subscribe((res) => {
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const element = data[key];
                    const item = filter(
                        find(res.item, (_r) => get(_r, [0, 'IdLoginRoles']) == element.IdLoginRoles),
                        (_d) => !!_d.IsSelected,
                    );
                    if (element.IsSelected == 1) this._userRoleSelected[element?.IdLoginRoles] = item;
                    this._rolePermissionDetail[element?.IdLoginRoles] = item;
                }
            }
        });
    }

    mappingPermission(data: any) {
        const permission = [];
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const item = data[key];
                const permissionItem = find(permission, ['name', item.PermissionType]);
                if (permissionItem) {
                    if (!item.IsSelected || item.IsSelected == 0) permissionItem.isActive = false;
                    permissionItem.children.push({
                        id: item.IdPermission,
                        name: item.PermissionName,
                        editable: true,
                        isActive: item.IsSelected == 1,
                    });
                } else {
                    permission.push({
                        id: item.PermissionType + '_parent',
                        editable: true,
                        name: item.PermissionType,
                        isActive: true,
                        children: [
                            {
                                id: item.IdPermission,
                                name: item.PermissionName,
                                editable: true,
                                isActive: item.IsSelected == 1,
                            },
                        ],
                    });
                }
            }
        }
        this._originalPermission = data;
        this.permissionList = permission;
    }

    private updatePermissionActivate(permission, isActive) {
        let nodes = filter(this.treePermission?.treeControl?.dataNodes, (_n) =>
            find(permission, ['IdPermission', _n.id]),
        );

        if (isActive) {
            this.treePermission?.checklistSelection?.select(...nodes);
        } else {
            nodes = filter(nodes, (_n) => !find(flatten(values(this._userRoleSelected)), ['IdPermission', _n.id]));
            this.treePermission?.checklistSelection?.deselect(...nodes);
        }
        nodes.forEach((node) => this.treePermission?.checkAllParentsSelection(node));
        this.treePermission?.getSelectedList?.emit(this.treePermission?.checklistSelection?.selected);
    }

    public onShowSettingPermission(event) {
        let treeType;
        switch (event?.name) {
            case 'Indexing':
                treeType = TreeTypeEnum.INDEXING;
                break;
            case 'Email':
                treeType = TreeTypeEnum.EMAIL;
                break;
            default:
                break;
        }
        this.popupService.open({
            content: WidgetMemberPermissionConfigComponent,
            hasBackdrop: true,
            header: {
                title: `${this.originalEditUser.lastName} ${this.originalEditUser.firstName}'s Permission`,
                iconClose: true,
                icon: <IconHeader>{
                    type: 'resource',
                    content: IconNames.MEMBER_PERMISSION,
                },
            },
            disableCloseOutside: true,
            minWidth: 750,
            minHeight: 600,
            defaultHeight: '600px',
            data: {
                data: {
                    IdLogin: this.userLogin.id,
                    IdMember: this.originalEditUser.idLogin,
                    IsLoginGroup: 0,
                },
                treeType: treeType,
            },
            optionResize: true,
            optionDrapDrop: true,
        });
    }
}
