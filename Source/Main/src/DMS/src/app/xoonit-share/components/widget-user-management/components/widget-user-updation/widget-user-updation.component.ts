import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
    ErrorMessageTypeEnum,
    FilterOptionsUserEnum,
    MessageModal,
    UserRoles,
    UserRolesDisplayName,
    UserStatusConstant,
} from '@app/app.constants';
import { ControlGridModel, ObjectSelection, User, UserDataUpdation, UserSignUp } from '@app/models';
import { ControlData, ValidatorPattern } from '@app/models/control-model/control-data';
import { BaseComponent } from '@app/pages/private/base';
import {
    UserManagementActionNames,
    UserManagementActions,
} from '@app/pages/user-management/user-management.statemanagement/user-management.actions';
import { UserManagementSelectors } from '@app/pages/user-management/user-management.statemanagement/user-management.selectors';
import { UserProfileService, UserService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { Store } from '@ngrx/store';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@xn-control/light-material-ui/autocomplete';
import { ToasterService } from 'angular2-toaster';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import cloneDeep from 'lodash-es/cloneDeep';
import { has, get } from 'lodash-es';
import { CustomAction } from '@app/state-management/store/actions';
import { PopupRef } from '@app/xoonit-share/components/global-popup/popup-ref';

@Component({
    selector: 'widget-user-updation',
    templateUrl: './widget-user-updation.component.html',
    styleUrls: ['./widget-user-updation.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetUserUpdationComponent extends BaseComponent implements OnDestroy {
    @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;

    public USER_STATUS_ENUM = UserStatusConstant;
    public errorMessageTypeEnum = ErrorMessageTypeEnum;
    public FilterOptionsUserEnumData = FilterOptionsUserEnum;
    public USER_ROLES_ENUM = UserRoles;

    public formGroup: FormGroup;
    public dataFields = {
        COMPANY_NAME: <ControlData>{ controlName: 'companyName', displayName: 'Company Name', order: 1 },
        EMAIL: <ControlData>{ controlName: 'email', displayName: 'Email', order: 2 },
        FIRSTNAME: <ControlData>{ controlName: 'firstName', displayName: 'First Name', order: 3 },
        LASTNAME: <ControlData>{ controlName: 'lastName', displayName: 'Last Name', order: 4 },
        USER_ROLE: <ControlData>{ controlName: 'userRole', displayName: 'User Role', order: 5 },
        INITIALS: <ControlData>{ controlName: 'initials', displayName: 'Initials', order: 6 },
        IS_ACTIVE: <ControlData>{ controlName: 'isActive', displayName: 'Activate', order: 7 },
    };
    public controlDataList: ControlData[] = [
        this.dataFields.COMPANY_NAME,
        this.dataFields.EMAIL,
        this.dataFields.FIRSTNAME,
        this.dataFields.LASTNAME,
        this.dataFields.USER_ROLE,
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

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        private fb: FormBuilder,
        private toastrService: ToasterService,
        private userService: UserService,
        private userProfileService: UserProfileService,
        protected store: Store<AppState>,
        protected userManagementActions: UserManagementActions,
        protected userManagementSelectors: UserManagementSelectors,
        public popupRef: PopupRef,
    ) {
        super(router);
        this.onSubscribeAction();

        this.idLogin = popupRef.params.data?.idLogin;
        if (this.idLogin) {
            this.isLoading = true;
            this.store.dispatch(this.userManagementActions.getUserByIdLoginAction(this.idLogin));
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
            .actionSuccessOfSubtype$(UserManagementActionNames.USER_NEW_ACCOUNT)
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
            .actionSuccessOfSubtype$(UserManagementActionNames.USER_UPDATE_INFO)
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
            .actionSuccessOfSubtype$(UserManagementActionNames.USER_GET_BY_IDLOGIN)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();

                    const item = action?.payload?.item;
                    if (!item) {
                        this.toastrService.pop(MessageModal.MessageType.error, 'System', `Load user fail!`);
                        return;
                    }

                    const userData = <UserDataUpdation>{
                        idLogin: item.idLogin,
                        idApplicationOwner: item.idApplicationOwner,
                        firstName: item.firstName,
                        lastName: item.lastName,
                        initials: item.initials,
                        email: item.email,
                        idRole: item.encrypted,
                        isDisableRole: false,
                        isActive: !item.isBlocked,
                        idPerson: item.idPerson,
                        company: item.company,
                    };
                    this.originalEditUser = userData;
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
            .subscribe((res) => {
                if (!res) return;

                this.filterOptionsParam.company.dataSource = res.companyList || [];
                this.filterOptionsParam.company.acOpionsForSubmit = res.companyList || [];

                if (this.idLogin) {
                    this.onInitFormUser(this.originalEditUser);
                } else {
                    this.initFormNewUser();
                }
            });
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
        this.onInitFormUser(userData);
    }
    private onInitFormUser(userData: UserDataUpdation) {
        let company;
        if (this.userLogin.isAdmin) {
            company = <ObjectSelection>{
                IdValue: this.userLogin.idPerson,
                TextValue: this.userLogin.company,
            };
        } else if (userData.idPerson && userData.company) {
            const selectedCompany = this.filterOptionsParam.company.dataSource?.find(
                (x) => x.IdValue == userData.idPerson.trim(),
            );
            company = selectedCompany ? selectedCompany : '';
        } else {
            company = '';
        }

        this.userRoleList = [...this.userRolesDefault];
        // list role will add master admin when:
        //// current user login is master admin and ( case add new user or edit user of company has IsMainAdmin = 1 )
        if (this.userLogin.isSuperAdmin && ((company === '' && !this.idLogin) || company.IsMainAdmin === 1)) {
            this.userRoleList.unshift(this.userRoleMasterAdmin);
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
            [this.dataFields.USER_ROLE.controlName]: [
                { value: userData.idRole, disabled: userData.isDisableRole },
                [Validators.required],
            ],
            [this.dataFields.IS_ACTIVE.controlName]: [userData.isActive, [Validators.required]],
        });
        this.formGroup = formgroup;

        // disable company when: edit mode or current user role login is customer admin
        if (this.userLogin.isAdmin || this.idLogin) {
            this.formGroup.controls[this.dataFields.COMPANY_NAME.controlName].disable();
        }
        // role default will be disable if don't choose company, role customer admin always has company so will be enable role
        if (this.userLogin.isAdmin) {
            this.formGroup.controls[this.dataFields.USER_ROLE.controlName].enable();
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
        let conditionUpdateUserRole = false;
        let text = companyNameVal;
        if (typeof companyNameVal === 'object' && 'IdValue' in companyNameVal) {
            text = companyNameVal.TextValue;
            conditionUpdateUserRole = this.userLogin.isSuperAdmin && companyNameVal.IsMainAdmin === 1;
        } else {
            const companySelected = this.filterOptionsParam.company.dataSource?.find(
                (x) => x.TextValue.trim().toLowerCase() === (text as string).trim().toLowerCase(),
            );

            if (companySelected) {
                conditionUpdateUserRole = this.userLogin.isSuperAdmin && companySelected.IsMainAdmin === 1;
                text = companySelected.TextValue.trim();
            } else {
                text = companyNameVal;
            }
        }

        const valueUserRole = conditionUpdateUserRole ? this.userRoleMasterAdmin.key : '';

        const roleList = cloneDeep(this.userRolesDefault);
        if (conditionUpdateUserRole) roleList.unshift(this.userRoleMasterAdmin);
        this.userRoleList = roleList;
        this.formGroup.controls[this.dataFields.USER_ROLE.controlName].setValue(valueUserRole);

        if (!text || !this.userRoleList || !this.userRoleList.length) {
            this.toggleEnabledUserRoleDropdown(false);
        } else {
            this.toggleEnabledUserRoleDropdown(true);
        }

        this.filterOptionsParam.company.acOpionsForSubmit = text
            ? this.filter(text as string, this.filterOptionsParam.company.dataSource)
            : this.filterOptionsParam.company.dataSource;
    }

    public toggleEnabledUserRoleDropdown(isEnabled: boolean) {
        if (isEnabled) {
            this.formGroup.controls[this.dataFields.USER_ROLE.controlName].enable();
        } else {
            this.formGroup.controls[this.dataFields.USER_ROLE.controlName].disable();
        }
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
            this.toggleEnabledUserRoleDropdown(false);
        }
    }

    private clearErrMessage() {
        this.isError = false;
        this.errMes = '';
        this.cdRef.detectChanges();
    }

    public submit() {
        if (!this.formGroup.valid) return;

        this.isLoading = true;
        this.cdRef.detectChanges();
        this.clearErrMessage();

        const model = this.formGroup.value;
        let companyName = '';
        let companyId = '';
        if (this.userLogin.isAdmin) {
            companyName = this.userLogin.company;
            companyId = this.userLogin.idPerson;
        } else if (this.idLogin) {
            // for edit user
            companyId = this.originalEditUser?.idPerson;
            companyName = this.originalEditUser?.company;
        } else {
            const checkCompany =
                model[this.dataFields.COMPANY_NAME.controlName] &&
                model[this.dataFields.COMPANY_NAME.controlName].IdValue;

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
        }

        const isActive = model[this.dataFields.IS_ACTIVE.controlName];
        const user = <UserSignUp>{
            company: companyName,
            idPerson: companyId,
            firstName: model[this.dataFields.FIRSTNAME.controlName],
            lastName: model[this.dataFields.LASTNAME.controlName],
            email: model[this.dataFields.EMAIL.controlName],
            initials: model[this.dataFields.INITIALS.controlName],
            encrypted: model[this.dataFields.USER_ROLE.controlName],
            isBlocked: !isActive,
        };
        if (!this.idLogin) {
            this.store.dispatch(this.userManagementActions.createNewUserAction(user));
        } else {
            if (isActive === this.originalEditUser.isActive) {
                delete user.isBlocked;
            }
            if (user.email === this.originalEditUser.email) {
                delete user.email;
            }

            if (has(user, 'email')) {
                delete user.isBlocked;
            }

            user['idLogin'] = this.originalEditUser.idLogin;
            user['idApplicationOwner'] = this.originalEditUser.idApplicationOwner;

            this.store.dispatch(this.userManagementActions.updateUserAction(user));
        }
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
}
