import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    OnDestroy,
    ChangeDetectorRef,
    Input,
    ViewChild,
    TemplateRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { Store } from '@ngrx/store';
import { BaseComponent } from '@app/pages/private/base';
import { ControlGridColumnModel, ControlGridModel, User, UserFilterModel, UserInfo, UserStatus } from '@app/models';
import { FilterOptionsUserEnum, MessageModal, UserRoles, UserStatusConstant } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { UserProfileService, UserService, WidgetTemplateSettingService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { CustomAction } from '@app/state-management/store/actions';
import { IPageEvent } from '../xn-pagination-grid/models/page-event.model';
import { UserManagementSelectors } from '@app/pages/user-management/user-management.statemanagement/user-management.selectors';
import {
    UserManagementActionNames,
    UserManagementActions,
} from '@app/pages/user-management/user-management.statemanagement/user-management.actions';
import { get } from 'lodash-es';
import { take, takeUntil } from 'rxjs/operators';
import { PopupService } from '../global-popup/services/popup.service';
import { PopupCloseEvent } from '../global-popup/popup-ref';
import { WidgetUserUpdationComponent } from './components/widget-user-updation/widget-user-updation.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'widget-user-management',
    templateUrl: './widget-user-management.component.html',
    styleUrls: ['./widget-user-management.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetUserManagementComponent extends BaseComponent implements OnInit, OnDestroy {
    public USER_ROLES_ENUM = UserRoles;

    public isShowDialogConfirmStatus = false;
    public dialogConfirmStatusClass = 'amd-dialog-confirm';
    public dialogConfirmStatusWidth = '315';

    public userStatus: UserStatus;

    public userFilterModel: UserFilterModel = {
        pageIndex: 1,
        pageSize: 20,
        totalPages: 0,
        companyId: '',
        email: '',
        fullNameId: '',
    };
    public filterOptionsParam = {
        company: {
            dataSource: [],
            acOptions: [],
            selected: {},
            isFocus: false,
            isHover: false,
        },
        email: {
            dataSource: [],
            acOptions: [],
            selected: {},
            isFocus: false,
            isHover: false,
        },
        name: {
            dataSource: [],
            acOptions: [],
            selected: {},
            isFocus: false,
            isHover: false,
        },
    };
    public placeholder: {[key: string]: string} = { company: '', name: '', email: '' };
    public dataSource = <ControlGridModel>{
        columns: [],
        data: [],
        totalResults: 0,
    };

    FilterOptionsUserEnumData = FilterOptionsUserEnum;

    public userLogin: User;
    private isLoadFocus = true;

    public isShowDialogConfirmDelete = false;
    public userDelete: UserStatus;

    @Input() globalProperties: any;

    public isLoading = false;

    @ViewChild('changeUserStatusConfirmPopup') changeUserStatusConfirmPopup: TemplateRef<any>;
    constructor(
        protected router: Router,
        protected cdRef: ChangeDetectorRef,
        protected toastrService: ToasterService,
        protected userService: UserService,
        protected userProfileService: UserProfileService,
        protected store: Store<AppState>,
        protected userManagementActions: UserManagementActions,
        protected userManagementSelectors: UserManagementSelectors,
        protected widgetTemplateSettingService: WidgetTemplateSettingService,
        protected translateService: TranslateService,
        public popupService: PopupService,
    ) {
        super(router);
        this.onSubscribeAction();
    }

    ngOnInit(): void {
        this.getFilterOptions();
        this.getUsersWithFilter();
        this.setPlaceholder();
    }

    ngAfterViewInit() {
        this.translateService.onLangChange
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe(() => {
                this.setPlaceholder();
            });
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    private setPlaceholder() {
        this.placeholder = {
            company: this.translateService.instant('WIDGET_USER_MANAGEMENT_ChooseCompany'),
            name: this.translateService.instant('WIDGET_USER_MANAGEMENT_ChooseName'),
            email: this.translateService.instant('WIDGET_USER_MANAGEMENT_Email')
        }
    }

    private getFilterOptions() {
        this.userProfileService
            .getFilterOptionsUser()
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((res) => {
                if (!res) return;

                this.filterOptionsParam.name.dataSource = res.fullNameList || [];
                this.filterOptionsParam.name.acOptions = res.fullNameList || [];
                this.filterOptionsParam.email.dataSource = res.emailList || [];
                this.filterOptionsParam.email.acOptions = res.emailList || [];
                this.filterOptionsParam.company.dataSource = res.companyList || [];
                this.filterOptionsParam.company.acOptions = res.companyList || [];
            });
    }

    private onSubscribeAction() {
        this.userService.currentUser.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((user: User) => {
            if (!user) return;

            this.userLogin = user;
        });

        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserManagementActionNames.USER_RESENT_EMAIL_CONFIRM)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();
                    if (!action && !action.payload) return;

                    const data = action.payload;
                    if (!data) {
                        this.toastrService.pop(
                            MessageModal.MessageType.error,
                            'System',
                            `System Error, send email fail!`,
                        );
                        return;
                    }

                    this.toastrService.pop(
                        MessageModal.MessageType.success,
                        'System',
                        `Sent activate email successfully!`,
                    );
                },
                (error) => {
                    this.isLoading = false;
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', `System Error`);
                    this.cdRef.detectChanges();
                },
            );

        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserManagementActionNames.USER_GET_LIST)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();

                    if (!action && !action.payload) return;

                    const data = action.payload;
                    if (!data) {
                        this.toastrService.pop(
                            MessageModal.MessageType.error,
                            'System',
                            `System Error, get list user fail!`,
                        );

                        return;
                    }

                    const ctrlGridModel = new ControlGridModel();

                    if (!data.columnSetting || data.columnSetting.length < 0) {
                        ctrlGridModel.columns = (this.dataSource && this.dataSource.columns) || null;
                    } else {
                        ctrlGridModel.columns = data.columnSetting.map((col) => {
                            return new ControlGridColumnModel({
                                title: col.columnHeader,
                                data: col.columnName,
                                dataType: col.dataType,
                                readOnly: true,
                                visible: true,
                                setting: {
                                    Setting:
                                        (col.setting &&
                                            Object.keys(col.setting).map((key) => {
                                                const obj = {};
                                                obj[key] = col.setting[key];
                                                return obj;
                                            })) ||
                                        [],
                                },
                            });
                        });
                    }

                    ctrlGridModel.data = data.data || [];
                    ctrlGridModel.totalResults = data.totalRecord;
                    this.dataSource = ctrlGridModel;

                    this.caculatePagnationNumber(data.totalRecord);
                    this.cdRef.detectChanges();
                },
                (error) => {
                    this.isLoading = false;
                    this.toastrService.pop(
                        MessageModal.MessageType.error,
                        'System',
                        `System Error, cannot load users!`,
                    );
                    this.cdRef.detectChanges();
                },
            );

        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserManagementActionNames.USER_CHANGE_STATUS)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    this.isLoading = false;
                    this.cdRef.detectChanges();

                    if (!action && !action.payload) return;

                    const data = action.payload as UserInfo;
                    if (!data) {
                        this.toastrService.pop(MessageModal.MessageType.error, 'System', `Update fail!`);
                        this.closeDialogConfirmStatus();
                        return;
                    }

                    this.getUsersWithFilter();
                    this.toastrService.pop(MessageModal.MessageType.success, 'System', `Update successfully!`);
                    this.closeDialogConfirmStatus();
                },
                (error) => {
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', `System Error!`);
                    this.closeDialogConfirmStatus();
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
                    if (!this.isShowDialogConfirmDelete) return;

                    if (get(action, 'payload.item.isSuccess')) {
                        this.toastrService.pop(MessageModal.MessageType.success, 'System', `Delete successfully!`);
                        this.isShowDialogConfirmDelete = false;
                        this.userDelete = null;
                        this.getFilterOptions();
                        this.getUsersWithFilter();

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
    }

    public resendEmailConfirm(data: any) {
        if (!data || (data && !data.IdLogin)) {
            this.toastrService.pop(MessageModal.MessageType.error, 'System', `System Error, send email fail!`);
            return;
        }

        const idLogin = data.IdLogin;
        this.isLoading = true;
        this.cdRef.detectChanges();
        this.store.dispatch(this.userManagementActions.resentEmailConfirmToUserAction(idLogin));
    }

    private getUsersWithFilter() {
        this.isLoading = true;
        this.cdRef.detectChanges();
        this.store.dispatch(this.userManagementActions.getListUserAction(this.userFilterModel));
    }

    private caculatePagnationNumber(totalResult: number) {
        this.userFilterModel.totalPages = Math.ceil(totalResult / this.userFilterModel.pageSize);
        if (
            this.userFilterModel.totalPages === 0 ||
            (this.userFilterModel.pageIndex <= 0 && this.userFilterModel.totalPages > 0)
        ) {
            this.userFilterModel.pageIndex = 1;
        } else if (
            this.userFilterModel.totalPages > 0 &&
            this.userFilterModel.pageIndex > this.userFilterModel.totalPages
        ) {
            this.userFilterModel.pageIndex = this.userFilterModel.totalPages;
        }
    }

    public changeStatusUser() {
        if (!this.userStatus && !this.userStatus.idLogin) return null;

        this.isLoading = true;
        this.cdRef.detectChanges();
        this.store.dispatch(this.userManagementActions.changeStatusUserAction(this.userStatus));
    }

    public showModalConfirm(user: any) {
        const activeItem = Uti.parseJsonString(user.Active);
        this.userStatus = <UserStatus>{
            idLogin: user.IdLogin,
            idApplicationOwner: user.IdApplicationOwner,
            active: activeItem.isActive === '1' ? 'false' : 'true',
            statusText: activeItem.isActive === '1' ? UserStatusConstant.INACTIVE : UserStatusConstant.ACTIVE,
            firstName: user.FirstName,
            lastName: user.LastName,
            email: user.Email,
            company: user.Company,
        };

        this.isShowDialogConfirmStatus = true;
        this.cdRef.detectChanges();

        // const currentWidth = window.screen.width;
        // const popupRef = this.popupService.open({
        //     content: this.changeUserStatusConfirmPopup,
        //     hasBackdrop: true,
        //     header: {
        //         title: 'Confirm',
        //         iconClose: true,
        //         icon: <IconHeader>{
        //             type: 'resource',
        //             content: '<img class="img-warning" src="public/imgs/warning.svg" alt="close-icon">',
        //         },
        //     },
        //     disableCloseOutside: true,
        //     width: (currentWidth * 20) / 100,
        // });

        // popupRef.afterClosed$.pipe(take(1)).subscribe(({ type, data }: PopupCloseEvent<any>) => {
        //     console.log(type, data);
        // });
    }

    public closeDialogConfirmStatus() {
        this.userStatus = <UserStatus>{
            idLogin: '',
            idApplicationOwner: '',
            active: '',
            statusText: '',
        };
        this.isShowDialogConfirmStatus = false;
        this.isShowDialogConfirmDelete = false;
        this.userDelete = null;
        this.isLoading = false;
        this.cdRef.detectChanges();
    }

    public filterStates(data: any, type: FilterOptionsUserEnum) {
        const text = data && data['TextValue'] ? data['TextValue'] : data;
        switch (type) {
            case FilterOptionsUserEnum.Company:
                this.filterOptionsParam.company.acOptions = text
                    ? this.filter(text, this.filterOptionsParam.company.dataSource)
                    : this.filterOptionsParam.company.dataSource;
                break;
            case FilterOptionsUserEnum.Email:
                this.filterOptionsParam.email.acOptions = text
                    ? this.filter(text, this.filterOptionsParam.email.dataSource)
                    : this.filterOptionsParam.email.dataSource;
                break;
            case FilterOptionsUserEnum.FullName:
                this.filterOptionsParam.name.acOptions = text
                    ? this.filter(text, this.filterOptionsParam.name.dataSource)
                    : this.filterOptionsParam.name.dataSource;
                break;
            default:
                break;
        }
        this.cdRef.detectChanges();
    }

    private filter(val: string, list: any): string[] {
        return list.filter((option) => option.TextValue.toLowerCase().includes(val.trim().toLocaleLowerCase()));
    }

    public displayFn(object: object): string {
        return object ? object['TextValue'] : object;
    }

    public onPaginatorChanged($event: IPageEvent) {
        if (this.userFilterModel.pageIndex !== $event.page || this.userFilterModel.pageSize !== $event.pageSize) {
            this.userFilterModel.pageIndex = $event.page;
            this.userFilterModel.pageSize = $event.pageSize;
            this.getUsersWithFilter();
        }
    }

    public preventClose(event: MouseEvent) {
        event.stopImmediatePropagation();
    }

    private filterUser(type: FilterOptionsUserEnum) {
        switch (type) {
            case FilterOptionsUserEnum.Company:
                const valueCompany =
                    this.filterOptionsParam.company.selected && this.filterOptionsParam.company.selected['IdValue']
                        ? this.filterOptionsParam.company.selected['IdValue']
                        : '';
                if (this.userFilterModel.companyId === valueCompany) return;

                this.userFilterModel.companyId = valueCompany;
                break;
            case FilterOptionsUserEnum.FullName:
                const valueName =
                    this.filterOptionsParam.name.selected && this.filterOptionsParam.name.selected['IdValue']
                        ? this.filterOptionsParam.name.selected['IdValue']
                        : '';
                if (this.userFilterModel.fullNameId === valueName) return;

                this.userFilterModel.fullNameId = valueName;
                break;
            case FilterOptionsUserEnum.Email:
                const valueEmail =
                    this.filterOptionsParam.email.selected && this.filterOptionsParam.email.selected['TextValue']
                        ? this.filterOptionsParam.email.selected['TextValue']
                        : '';
                if (this.userFilterModel.email === valueEmail) return;

                this.userFilterModel.email = valueEmail;
                break;
            default:
                break;
        }
        this.getUsersWithFilter();
        this.isLoadFocus = true;
    }

    public clearFilter() {
        this.clearTextFilter(FilterOptionsUserEnum.Company, false);
        this.clearTextFilter(FilterOptionsUserEnum.FullName, false);
        this.clearTextFilter(FilterOptionsUserEnum.Email, false);
        this.getUsersWithFilter();
    }

    public changeValueFocusFilter(type: FilterOptionsUserEnum, value: boolean) {
        switch (type) {
            case FilterOptionsUserEnum.Company:
                this.filterOptionsParam.company.isFocus = value;
                break;
            case FilterOptionsUserEnum.FullName:
                this.filterOptionsParam.name.isFocus = value;
                break;
            case FilterOptionsUserEnum.Email:
                this.filterOptionsParam.email.isFocus = value;
                break;
            default:
                break;
        }
    }

    public changeValueHoverFilter(type: FilterOptionsUserEnum, value: boolean) {
        switch (type) {
            case FilterOptionsUserEnum.Company:
                this.filterOptionsParam.company.isHover = value;
                break;
            case FilterOptionsUserEnum.FullName:
                this.filterOptionsParam.name.isHover = value;
                break;
            case FilterOptionsUserEnum.Email:
                this.filterOptionsParam.email.isHover = value;
                break;
            default:
                break;
        }
    }

    public clearTextFilter(type: FilterOptionsUserEnum, isReloadList = true) {
        switch (type) {
            case FilterOptionsUserEnum.Company:
                this.filterOptionsParam.company.acOptions = this.filterOptionsParam.company.dataSource;
                this.filterOptionsParam.company.selected = {};
                this.userFilterModel.companyId = '';

                if (isReloadList) this.getUsersWithFilter();
                break;
            case FilterOptionsUserEnum.FullName:
                this.filterOptionsParam.name.acOptions = this.filterOptionsParam.name.dataSource;
                this.filterOptionsParam.name.selected = {};
                this.userFilterModel.fullNameId = '';

                if (isReloadList) this.getUsersWithFilter();
                break;
            case FilterOptionsUserEnum.Email:
                this.filterOptionsParam.email.acOptions = this.filterOptionsParam.email.dataSource;
                this.filterOptionsParam.email.selected = {};
                this.userFilterModel.email = '';

                if (isReloadList) this.getUsersWithFilter();
                break;
            default:
                break;
        }
    }
    private callDialogUserUpdation(title: string, idLogin: string) {
        const currentWidth = window.screen.width;
        const popupRef = this.popupService.open({
            content: WidgetUserUpdationComponent,
            hasBackdrop: true,
            header: {
                title: title,
                iconClose: true,
            },
            disableCloseOutside: true,
            width: (currentWidth * 35) / 100,
            data: {
                idLogin,
            },
        });
        popupRef.afterClosed$.pipe(take(1)).subscribe(({ type, data }: PopupCloseEvent<any>) => {
            if (type === 'close' && data?.isSuccess) {
                this.getFilterOptions();
                this.getUsersWithFilter();
            }
        });
    }
    public showDialogAddNewUser() {
        this.callDialogUserUpdation('Add User', '');
    }

    public editUser(data: any) {
        this.callDialogUserUpdation('Edit User', data.IdLogin);
    }

    public deleteUser(user: any) {
        this.userDelete = <UserStatus>{
            idLogin: user.IdLogin,
            idApplicationOwner: user.IdApplicationOwner,
            active: user.Active === 1 ? 'false' : 'true',
            statusText: 'delete',
            fullName: user.FirstName || '' + ' ' + user.LastName || '',
            email: user.Email,
            company: user.Company,
        };
        this.isShowDialogConfirmDelete = true;
    }

    public confirmDeleteUser() {
        this.store.dispatch(
            this.userManagementActions.updateUserAction({
                idLogin: this.userDelete.idLogin,
                idApplicationOwner: this.userDelete.idApplicationOwner,
                isDeleted: 1,
            }),
        );
    }

    public updateUserEdited(event: any) {
        this.isLoading = true;
        this.cdRef.detectChanges();
        this.store.dispatch(this.userManagementActions.updateUserAction(event));
    }

    public focusOut(type: FilterOptionsUserEnum) {
        this.changeValueFocusFilter(type, false);
        setTimeout(() => {
            if (this.isLoadFocus) {
                this.filterUser(type);
            }
        }, 300);
    }

    public onSelectFilter(type: FilterOptionsUserEnum) {
        this.isLoadFocus = false;
        this.filterUser(type);
    }
}
