import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ControlGridModel, SearchResultItemModel, SimpleTabModel, WidgetApp } from '@app/models';
import { BaseComponent } from '@app/pages/private/base';
import { AppErrorHandler, DatatableService, InvoiceAprrovalService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { XnAgGridComponent } from '@xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

import {
    cloneDeep,
    differenceBy,
    differenceWith,
    filter,
    find,
    intersectionBy,
    isEqual,
    get,
    orderBy,
    pick,
    includes,
    lowerCase,
    xor,
    map,
} from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { takeUntil, filter as filterObservable, first, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
    AdministrationDocumentActionNames,
    CustomAction,
    DocumentThumbnailActions,
    LayoutInfoActions,
} from '@app/state-management/store/actions';
import { ToasterService } from 'angular2-toaster';
import { MessageModal, SplitterDirectionMode } from '@app/app.constants';
import {
    FormStatus,
    IWidgetIsAbleToSave,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import {
    InvoiceApprovalProcessingActionNames,
    InvoiceApprovalProcessingActions,
} from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';
import { StatusApprovalEnum } from '@app/models/invoice-approval/confirm.model';
import { CdkDragDrop, CdkDragMove, moveItemInArray } from '@angular/cdk/drag-drop';
import { IconNames } from '@app/app-icon-registry.service';
import { UrgentStateAction } from '@app/state-management/store/actions/app/app.actions';
import { AppSelectors } from '@app/state-management/store/reducer/app/app.selectors';
import { KostnestelleData } from '@app/models/kostneststelle-change.model';
import { MatAutocompleteTrigger } from '@xn-control/light-material-ui/autocomplete';

import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { TranslateService } from '@ngx-translate/core';

const HEADER_HEIGHT = 46;
@Component({
    selector: 'invoice-approval-confirm-user',
    templateUrl: './widget-invoice-approval-confirm-user.component.html',
    styleUrls: ['./widget-invoice-approval-confirm-user.component.scss'],
})
export class InvoiceApprovalConfirmUserComponent
    extends BaseComponent
    implements OnInit, OnDestroy, AfterViewInit, IWidgetIsAbleToSave {
    @Input() globalProperties: any;
    @Input() tabID: any;

    public svgPrev = IconNames.GRIP;
    public groups = [];
    public _groupsFull = [];
    public users = [];
    public _userFull = [];
    public isEmpty = false;
    public numberUsersSelected = 0;

    public isSetPriority = false;
    public showErrorHighligh: boolean;

    public searchValue: string = '';
    public searchValueInDialog: string = '';
    public searchGroupValue: string = '';

    public fullChecked = false;
    public fullUnCheck = true;
    public isPassRule: boolean;
    public hasInvalidUser: boolean;

    public fullGroupChecked = false;
    public fullGroupUnCheck = true;
    public totalGroupChecked: any;

    // splitter
    public splitterMinSize = 0;

    public valueChange = true;

    // Urgent
    public isSwitchUrgent: boolean;

    // Group management
    public groupUsers = [];
    public groupSelected = null;

    // Group information
    public userAssignedGroup = [];
    public userData: ControlGridModel;
    // TABLE
    private _originalData: any;
    private _groupId: any;
    public groupName: string;
    public columnSearch = 'Username';
    public totalUserChecked: number = 0;
    public kostenstelleSelected: string;
    public kostenstelleId: string;
    public kostenstelleFiltered: Array<any> = [];
    public kostenstelleBackup: Array<any> = [];
    public isBlurKostenstelleInput: boolean = false;
    private WidgetAppView = WidgetApp;
    private kosnestelleIdFromPaymentOverview: number = null;
    private kosnestelleIdFromPositionDetail: Array<number> = [];
    private userSelectChange: BehaviorSubject<void> = new BehaviorSubject<void>(null);

    private selectedSimpleTabStateSubscription: Subscription;
    private selectedSimpleTabState: Observable<SimpleTabModel>;

    @ViewChild('groupManagementPopup') groupManagementPopup: TemplateRef<any>;
    @ViewChild('groupInformationPopup') groupInformationPopup: TemplateRef<any>;
    @ViewChild('confirmDeletePopup') confirmDeletePopup: TemplateRef<any>;
    @ViewChild('tooltipGroupManagement') titleGroupManagement: TemplateRef<any>;

    @ViewChild('xnAgGridComponent') public xnAgGridComponent: XnAgGridComponent;
    @ViewChild('searchConfirmUserBox') inputComponent: ElementRef;
    @ViewChild('userChecked') userChecked: ElementRef;
    @ViewChild('groupChecked') groupChecked: ElementRef;

    @ViewChild('autocompleteKostenstelleInput', { read: MatAutocompleteTrigger })
    autocompleteKostenstelleTrigger: MatAutocompleteTrigger;
    public ngStyleMatIcon = {
        color: 'red',
        'font-size': '18px',
        'line-height': '18px',
        top: '5px',
        position: 'relative',
    };
    disabledButtonUpdateGroup: boolean;

    private _selectedSearchResultState$: Observable<SearchResultItemModel>;
    private _approvalStatus: StatusApprovalEnum = StatusApprovalEnum.Pending;
    private _txtOriginalFileNameChanged = new Subject<string>();
    private _txtOriginalGroupNameChanged = new Subject<string>();
    private _untilDestroyed = new Subject<boolean>();

    public splitSizeGroup = {
        list: 0,
        selected: 0,
        resized: false,
    };
    public splitSizeUser = {
        list: 0,
        selected: 0,
        resized: false,
    };

    constructor(
        protected router: Router,
        private invoiceApprovalService: InvoiceAprrovalService,
        private popupService: PopupService,
        private datatableService: DatatableService,
        private dispatcher: ReducerManagerDispatcher,
        private appStore: Store<AppState>,
        private toasterService: ToasterService,
        private invoiceApprovalAction: InvoiceApprovalProcessingActions,
        private zone: NgZone,
        private element: ElementRef,
        private appSelectors: AppSelectors,
        private cdRef: ChangeDetectorRef,
        private appErrorHandler: AppErrorHandler,
    ) {
        super(router);
        this._selectedSearchResultState$ = appStore.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this.selectedSimpleTabState = appStore.select(
            (state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).selectedSimpleTab,
        );
        this._subscribe();
        this._txtOriginalFileNameChanged
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this._untilDestroyed.asObservable()))
            .subscribe((value) => {
                this._filterUser(value);
            });

        this._txtOriginalGroupNameChanged
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this._untilDestroyed.asObservable()))
            .subscribe((value) => {
                this.filterGroup(value);
            });
        this.appStore.dispatch(new UrgentStateAction(false));
    }

    private _filterUser(value: string) {
        this.searchValue = value;
        this.users.forEach((user) => {
            user.isShow = !value || includes(lowerCase(user.Username), lowerCase(value));
            return user;
        });
    }

    private filterGroup(value: string) {
        this.searchGroupValue = value;
        this.groups.forEach((group) => {
            group.isShow = !value || group.InvoiceApprovalGroup?.toLowerCase().includes(value.toLowerCase());
            return group;
        });
    }

    ngOnInit(): void {
        this._getGroup();
        this._getUsers();
        this.appStore.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
    }

    ngAfterViewInit() {
        this._recalculateMinHeight();
        combineLatest([this.userSelectChange, this.appSelectors.invoiceIncludeExchanged$])
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(([, invoiceInclExchanged]) => {
                this.hasInvalidUser = !!this.users.filter((user) => {
                    if (user.checked) {
                        user.invalid = user.MaxAmountRange && +user.MaxAmountRange <= +invoiceInclExchanged;
                    }
                    return user.invalid;
                }).length;
                if (!this.hasInvalidUser) {
                    this.isPassRule = false;
                }
                this.cdRef.detectChanges();
            });
    }

    ngOnDestroy(): void {
        super.onDestroy();
        this._untilDestroyed.next(true);
    }

    public clearSearchText() {
        this._filterUser('');
    }

    public clearSearchGroupText() {
        this.filterGroup('');
    }

    public searchUser(value: string) {
        this._txtOriginalFileNameChanged.next(value);
    }

    public searchGroup(value: string) {
        this._txtOriginalGroupNameChanged.next(value);
    }

    public searchUserInDialog(value: string, columnSearch: string) {
        this.searchValueInDialog = value;
        this.xnAgGridComponent.filterDataBySearchTxtByColumn(value, columnSearch);
    }

    public onCheckedGroup(isChecked: boolean, group: any) {
        group.checked = isChecked;
        this._filterUserByGroupSelected(group.checked, group.Users);
        this._checkGroupSelected();
    }

    public onCheckedUser(isChecked: boolean, user: any) {
        user.checked = isChecked;
        if (!isChecked) {
            this._reCheckAllGroup();
        }
        this.userSelectChange.next();
        this._checkUserSelected();
    }

    public clearAllSelected() {
        const groupCodeCentreSelected = map(filter(this.groups, ['IsKost', 1]), 'IdRepInvoiceApprovalGroup');
        this.groups = cloneDeep(this._groupsFull);
        this.users.forEach((user) => {
            user.checked = false;
            return user;
        });
        this.userSelectChange.next();
        this._checkUserSelected();
        this._checkGroupSelected();
        this._dispatchGroupIdUnCheck(groupCodeCentreSelected);
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.users, event.previousIndex, event.currentIndex);
    }

    public cdkDragMoved(event: CdkDragDrop<string[]>) {
        const element = document.getElementsByClassName('cdk-drag-preview')[0];
        if (element) {
            element['style'].height = '25px';
            element['style'].display = 'flex';
            element['style'].alignItems = 'center';
            element['style'].fontSize = '16px';
            if (element.children.length > 2) {
                element.children[0].innerHTML = '';
                element.children[1].innerHTML = `<div style="color:#d50000; margin: 0 10px;">${
                    event.currentIndex + 1
                }</div>`;
                for (let i = 3, length = element.children.length; i < length; i++) {
                    element.children[i].innerHTML = '';
                }
            }
        }
    }

    public openGroupManagement() {
        const popupGroupManagement = this.popupService.open({
            content: this.groupManagementPopup,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'TOOLTIP__Group_Management',
                icon: { content: '', type: 'resource' },
                withTranslate: true,
            }),
            optionResize: true,
            optionDrapDrop: true,
            disableCloseOutside: true,
        });

        popupGroupManagement.afterClosed$.subscribe(
            (() => {
                this.groupSelected = null;
                this.groupUsers = [];
            }).bind(this),
        );
    }

    public onSelectGroupInGroupManagement(group: any) {
        if (!group) return;
        this.groupUsers = this._getUserInGroup(group.Users);

        this.groupSelected = group;
    }

    public addNewGroup() {
        this.popupService.open({
            content: this.groupInformationPopup,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'WIDGET_Confirm_Approval__Group_Information',
                icon: { content: '', type: 'resource' },
                withTranslate: true,
            }),
            disableCloseOutside: true,
            optionResize: true,
            optionDrapDrop: true,
        });
    }

    public openPopupEditGroupInformation(isAddNew?: boolean) {
        this.clearKostenstelle();
        this.invoiceApprovalService.searchCostCentre().subscribe((res) => {
            this.kostenstelleFiltered = get(res, ['item', 1]) || [];
            this.kostenstelleBackup = cloneDeep(this.kostenstelleFiltered);
        });
        this.invoiceApprovalService
            .getAllUserApproval(isAddNew ? '' : this.groupSelected?.IdRepInvoiceApprovalGroup)
            .subscribe((response) => {
                const results = get(response, ['item', 1]) || [];
                const setting = get(response, ['item', 0]);
                this.groupName = isAddNew ? '' : this.groupSelected?.InvoiceApprovalGroup;
                this._groupId = isAddNew ? null : this.groupSelected?.IdRepInvoiceApprovalGroup;
                results.forEach((element) => {
                    element.IsSelected = !!element.IsSelected;
                    element.Priority = element.Priority;
                    element.MinAmountRange = element.MinAmountRange;
                    element.MaxAmountRange = element.MaxAmountRange;

                    return element;
                });

                const dataResult = this.datatableService.buildDataSourceFromEsSearchResult(
                    { pageIndex: 1, pageSize: results.length, total: results.length, results, setting: [setting] },
                    1,
                );
                this.userData = dataResult;
                this._originalData = results;
                this.numberUsersSelected = this.userData.data.filter((item) => item.IsSelected)?.length;
                this.searchValueInDialog = '';
                const popup = this.popupService.open({
                    content: this.groupInformationPopup,
                    hasBackdrop: true,
                    header: new HeaderNoticeRef({
                        iconClose: true,
                        title: 'WIDGET_Confirm_Approval__Group_Information',
                        icon: { content: '', type: 'resource' },
                        withTranslate: true,
                    }),
                    disableCloseOutside: true,
                    optionResize: true,
                    optionDrapDrop: true,
                });
                popup.afterClosed$.subscribe(() => {
                    this.valueChange = true;
                });
            });
    }

    public openPopupConfirmDelete() {
        if (!this.groupSelected?.IdRepInvoiceApprovalGroup) return;
        let title = '';
        this.popupService.open({
            content: this.confirmDeletePopup,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'POPUP_action__Confirm',
                withTranslate: true,
            }),
            disableCloseOutside: true,
        });
    }

    public deleteGroupSelected(close = () => undefined) {
        const params = {
            IdRepInvoiceApprovalGroup: this.groupSelected?.IdRepInvoiceApprovalGroup,
            IsDeleted: 1,
        };
        this.invoiceApprovalService.updateGroupInformation(params).subscribe((response) => {
            const item = response.item || {};
            if (item.isSuccess) {
                close();
                this._getGroup(this._reSelectData.bind(this));
            } else {
                this.toasterService.pop(
                    MessageModal.MessageType.error,
                    'System',
                    item.sqlStoredMessage || item.userErrorMessage,
                );
            }
        });
    }

    private _reSelectData() {
        const groupsSelected = filter(this.groups, ['checked', true]);

        const oldUserInGroup = this.groupSelected.Users;
        // update in confirm user
        for (const key in groupsSelected) {
            if (Object.prototype.hasOwnProperty.call(groupsSelected, key)) {
                const groupSelected = groupsSelected[key];
                const groupItem = find(this.groups, [
                    'IdRepInvoiceApprovalGroup',
                    groupSelected.IdRepInvoiceApprovalGroup,
                ]);
                if (groupItem.IdRepInvoiceApprovalGroup !== this.groupSelected.IdRepInvoiceApprovalGroup) {
                    groupItem.checked = true;
                }
            }
        }

        /// Unselect  user in confirm
        for (const key in oldUserInGroup) {
            if (Object.prototype.hasOwnProperty.call(oldUserInGroup, key)) {
                const user = oldUserInGroup[key];
                const userItem = find(this.users, ['IdLogin', user.IdLogin]);
                if (userItem && userItem.checked) {
                    userItem.checked = false;
                }
            }
        }
        this.groupSelected = null;
    }

    public updateUsersSelected(data) {
        if (data?.colDef?.headerName === 'IsSelected') {
            data.IsSelected ? this.numberUsersSelected++ : this.numberUsersSelected--;
        }
        this.valueChange = false;
    }

    public updateGroup(close = () => {}) {
        let dataEdited = differenceWith(this.userData.data, this._originalData, isEqual);

        dataEdited = filter(dataEdited, this._filterFunction.bind(this));
        dataEdited.forEach((data) => {
            data.IsActive = data.IsSelected ? 1 : 0;
            data.IsDeleted = data.IsSelected ? 0 : 1;
            data.IdRepInvoiceApprovalGroup = this._groupId;
            delete data.Username;
            delete data.IsSelected;
            delete data.colDef;
            return data;
        });
        const params = {
            IdRepInvoiceApprovalGroup: this._groupId,
            JSONInvoiceApprovalGroup: { InvoiceApprovalGroup: dataEdited },
            InvoiceApprovalGroup: this.groupName,
        };
        this.invoiceApprovalService.updateGroupInformation(params).subscribe((response) => {
            const item = response.item || {};
            if (item.isSuccess) {
                close();
                this._getGroup(
                    (() => {
                        this._reSelectData();
                        const group = find(this.groups, ['IdRepInvoiceApprovalGroup', this._groupId]);
                        if (!group) return;

                        /// select  group in group management
                        this.onSelectGroupInGroupManagement(group);
                    }).bind(this),
                );
            } else {
                this.toasterService.pop(
                    MessageModal.MessageType.error,
                    'System',
                    item.sqlStoredMessage || item.userErrorMessage,
                );
            }
        });
    }

    public onCellEditingStopped(editedData: any) {
        this.disabledButtonUpdateGroup = this.xnAgGridComponent?.hasValidationErrorLocal;
    }

    private _filterUserByGroupSelected(isSelected: boolean, userInGroup: any) {
        if (!userInGroup.length) return;
        const userChanged = this._getUserInGroup(userInGroup);

        userChanged.forEach((user) => {
            user.checked = isSelected;
        });
        let otherUser = differenceBy(this.users, userChanged, 'IdLogin') || [];
        otherUser = orderBy(otherUser, ['checked'], ['desc']);
        if (isSelected) {
            this.users = [...userChanged, ...otherUser];
        } else {
            this.users = [...otherUser, ...userChanged];
        }
        if (isSelected) {
        }
        this._checkUserSelected();
        this.userSelectChange.next();
    }

    private _getUserInGroup(userInGroup: any) {
        return intersectionBy(cloneDeep(this.users), userInGroup, 'IdLogin');
    }

    private _getUsers() {
        this.invoiceApprovalService.getAllUserApproval('').subscribe((response) => {
            let users = get(response, ['item', 1]) || [];
            users.forEach((element) => {
                element.checked = false;
                element.isShow = true;
                return element;
            });
            this.users = cloneDeep(users);
            this._userFull = cloneDeep(users);
            this.userSelectChange.next();
        });
    }
    private _getGroup(callback?: any) {
        this.invoiceApprovalService.getListGroupApproval().subscribe((response) => {
            let groups = get(response, ['item', 0]) || [];
            groups.forEach((group) => {
                const users = group.Users || '[]';
                group.Users = JSON.parse(users);
                group.isShow = true;
                return group;
            });
            groups = orderBy(groups, ['InvoiceApprovalGroup'], ['asc']);
            this.groups = cloneDeep(groups);
            this._groupsFull = cloneDeep(groups);
            if (callback) callback();
        });
    }

    private _filterFunction(data) {
        const originalData = find(this._originalData, ['IdLogin', data.IdLogin]);
        if (data.IsSelected !== originalData.IsSelected) return true;

        return (
            data.IsSelected &&
            (data.Priority !== originalData.Priority ||
                data.MinAmountRange !== originalData.MinAmountRange ||
                data.MaxAmountRange !== originalData.MaxAmountRange)
        );
    }

    public getDataSave() {
        // let userSelectedInGroup = [];
        const groupSelected = [];
        const allUserSelected = this._getUserChecked();
        if (!allUserSelected.length) return {};
        let userChecked = [];

        for (const key in allUserSelected) {
            if (Object.prototype.hasOwnProperty.call(allUserSelected, key)) {
                const user = allUserSelected[key];
                user.Priority = parseInt(key, 10) + 1;
                user.IdInvoiceApprovalPerson = null;
                user.IsDeleted = null;
                userChecked.push(pick(user, ['IdInvoiceApprovalPerson', 'IsDeleted', 'IdLogin', 'Priority']));
            }
        }

        for (const key in this.groups) {
            if (Object.prototype.hasOwnProperty.call(this.groups, key)) {
                const group = this.groups[key];
                if (group.checked) {
                    const userSelected = intersectionBy(userChecked, group.Users, 'IdLogin');
                    userChecked = differenceBy(userChecked, userSelected, 'IdLogin');
                    if (!!userSelected.length)
                        groupSelected.push({
                            IdRepInvoiceApprovalGroup: group.IdRepInvoiceApprovalGroup,
                            AssignedUsers: userSelected,
                        });
                    // userSelectedInGroup = userSelectedInGroup.concat(userSelected);
                }
            }
        }

        const obj = {
            JSONApprovalUser: {
                ApprovalUser: [
                    {
                        Groups: groupSelected,
                        AddOnUser: userChecked,
                        IsFollowPriority: this.isSetPriority ? 1 : 0,
                    },
                ],
            },
            IsUrgent: this.isSwitchUrgent ? '1' : '0',
        };
        if (this.totalUserChecked) obj['IsPriority'] = this.isSetPriority ? '1' : '0';
        if (this.hasInvalidUser) obj['IsPassRule'] = this.isPassRule ? '1' : '0';
        return obj;
    }

    public validateBeforeSave() {
        return !!this._getUserChecked().length || this._approvalStatus != StatusApprovalEnum.Pending;
    }

    public validateForm(): FormStatus {
        let formStatus: FormStatus = {
            formTitle: '',
            isValid: true,
        };
        if (!this.validateBeforeSave()) {
            this.appStore.dispatch(this.invoiceApprovalAction.showHighlightError(true));
        }
        if (
            (!this._getUserChecked().length || (!this.isPassRule && this._getUserInvalid().length)) &&
            this._approvalStatus == StatusApprovalEnum.Pending
        ) {
            formStatus = {
                isValid: false,
                formTitle: 'Confirm approval',
                errorMessages: ['Invoice approval need a confirmation or assigned user to confirm later'],
            };
        }
        return formStatus;
    }

    public reset() {
        this._resetData();
    }

    private _subscribe() {
        this.selectedSimpleTabStateSubscription = this.selectedSimpleTabState.subscribe(
            (selectedSimpleTabState: SimpleTabModel) => {
                this.appErrorHandler.executeAction(() => {
                    if (
                        selectedSimpleTabState &&
                        selectedSimpleTabState.ParentTabID === this.tabID &&
                        selectedSimpleTabState.Active
                    ) {
                        setTimeout(() => {
                            this._recalculateMinHeight();
                        });
                    }
                });
            },
        );

        this.dispatcher
            .pipe(
                filterObservable((action: CustomAction) => {
                    return action.type === InvoiceApprovalProcessingActionNames.SHOW_HIGH_LIGHT_ERROR;
                }),
            )
            .subscribe((action: CustomAction) => {
                this.showErrorHighligh = action.payload;

                if (!action.payload) return;
                setTimeout(() => {
                    this.showErrorHighligh = false;
                }, 10000);
            });

        this.dispatcher
            .pipe(
                filterObservable((action: CustomAction) => {
                    return (
                        action.type === LayoutInfoActions.RESIZE_SPLITTER &&
                        action.payload === SplitterDirectionMode.Vertical
                    );
                }),
            )
            .subscribe((action: CustomAction) => {
                setTimeout(() => {
                    this._recalculateMinHeight();
                });
            });
        this._selectedSearchResultState$
            .pipe(
                filterObservable((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedSearchResultState: SearchResultItemModel) => {
                const data = selectedSearchResultState as any;
                if (!data.idMainDocument) {
                    if (this.isEmpty) {
                        this.isEmpty = false;
                    } else {
                        this._resetData();
                    }
                }
            });

        this.dispatcher
            .pipe(
                filterObservable(
                    (action: CustomAction) => action.type === AdministrationDocumentActionNames.GET_DOCUMENT_BY_ID_SCAN,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                if (this.isEmpty) {
                    this.isEmpty = false;
                } else {
                    this._resetData();
                }
            });
        this.dispatcher
            .pipe(
                filterObservable(
                    (action: CustomAction) =>
                        action.type === InvoiceApprovalProcessingActionNames.UPDATE_CONFIRM_APPROVAL,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                this._approvalStatus = action.payload;
                if (this._approvalStatus !== StatusApprovalEnum.Pending) {
                    this._resetData();
                    this.showErrorHighligh = false;
                }
            });

        this.dispatcher
            .pipe(
                filterObservable((action: CustomAction) => {
                    return action.type === DocumentThumbnailActions.DOCUMENT_THUMBNAIL_NO_ITEM;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                this.isEmpty = true;
            });

        this.appSelectors.kostnestelleChange$
            .pipe(takeUntil(this._untilDestroyed.asObservable()))
            .subscribe((kostnestelleData: KostnestelleData) => {
                if (kostnestelleData) {
                    switch (kostnestelleData.type) {
                        case this.WidgetAppView.WidgetPaymentOverview:
                            if (
                                kostnestelleData.data != this.kosnestelleIdFromPaymentOverview &&
                                !this.kosnestelleIdFromPositionDetail.includes(this.kosnestelleIdFromPaymentOverview)
                            ) {
                                this.removeCheckKostnestelle(this.kosnestelleIdFromPaymentOverview);
                            }
                            this.processCheckedKostnestelle(
                                this.WidgetAppView.WidgetPaymentOverview,
                                kostnestelleData.data,
                            );
                            break;

                        case this.WidgetAppView.WidgetPositionDetail:
                            const differentArray = xor(kostnestelleData.data, this.kosnestelleIdFromPositionDetail); // get different unique value from 2 arrays
                            if (differentArray && differentArray.length > 0) {
                                differentArray.forEach((idRepInvoiceApprovalGroup) => {
                                    if (kostnestelleData.data.includes(idRepInvoiceApprovalGroup)) {
                                        // add check
                                        this.processCheckedKostnestelle(
                                            this.WidgetAppView.WidgetPositionDetail,
                                            idRepInvoiceApprovalGroup,
                                        );
                                    } else if (
                                        this.kosnestelleIdFromPositionDetail.includes(idRepInvoiceApprovalGroup)
                                    ) {
                                        // remove check
                                        if (idRepInvoiceApprovalGroup !== this.kosnestelleIdFromPaymentOverview) {
                                            this.removeCheckKostnestelle(idRepInvoiceApprovalGroup);
                                        }
                                        this.kosnestelleIdFromPositionDetail.splice(
                                            this.kosnestelleIdFromPositionDetail.indexOf(idRepInvoiceApprovalGroup),
                                            1,
                                        );
                                    }
                                });
                            }
                            break;

                        default:
                            break;
                    }
                    this._checkGroupSelected();
                }
            });
    }

    private processCheckedKostnestelle(type, idRepInvoiceApprovalGroup) {
        if (!idRepInvoiceApprovalGroup) {
            this.kosnestelleIdFromPaymentOverview = idRepInvoiceApprovalGroup;
            return;
        }

        const objFindToCheck = this.groups.find(
            (item) => item.IsKost == 1 && item.IdRepInvoiceApprovalGroup == idRepInvoiceApprovalGroup,
        );
        if (objFindToCheck) {
            objFindToCheck.checked = true;
            switch (type) {
                case this.WidgetAppView.WidgetPaymentOverview: // store value chosen of Payment Overview
                    this.kosnestelleIdFromPaymentOverview = objFindToCheck.IdRepInvoiceApprovalGroup;
                    break;

                case this.WidgetAppView.WidgetPositionDetail: // store value chosen of Position Detail
                    if (!this.kosnestelleIdFromPositionDetail.includes(objFindToCheck.IdRepInvoiceApprovalGroup)) {
                        this.kosnestelleIdFromPositionDetail.push(objFindToCheck.IdRepInvoiceApprovalGroup);
                    }
                    break;

                default:
                    break;
            }
        }
    }

    private removeCheckKostnestelle(idRepInvoiceApprovalGroup) {
        const objFindToUncheck = this.groups.find(
            (item) => item.IsKost == 1 && item.IdRepInvoiceApprovalGroup == idRepInvoiceApprovalGroup,
        );
        objFindToUncheck && (objFindToUncheck.checked = false);
    }

    private _resetData() {
        this.groups = cloneDeep(this._groupsFull);
        this.users = cloneDeep(this._userFull);
        this.searchValue = '';
        this.isSwitchUrgent = false;
        this.appStore.dispatch(new UrgentStateAction(this.isSwitchUrgent));
        this.isPassRule = false;
        this.isSetPriority = false;

        this._checkUserSelected();
        this._checkGroupSelected();
    }

    private _reCheckAllGroup() {
        const userSelected = this._getUserChecked();
        const groupIdsCostCentre = [];
        for (let index = 0; index < this.groups.length; index++) {
            const group = this.groups[index];
            if (!group.checked) continue;
            group.checked = !!intersectionBy(userSelected, group.Users, 'IdLogin').length;
            if (!group.checked && !!group.IsKost) {
                groupIdsCostCentre.push(group.IdRepInvoiceApprovalGroup);
            }
            this.groups[index] = group;
        }
        this._checkGroupSelected();
        this._dispatchGroupIdUnCheck(groupIdsCostCentre);
    }

    private _getUserChecked() {
        return filter(this.users, ['checked', true]);
    }

    private _getGroupsChecked() {
        return filter(this.groups, ['checked', true]);
    }

    private _getUserInvalid() {
        return filter(this.users, ['invalid', true]);
    }

    private _checkUserSelected() {
        this.users = orderBy(this.users, ['checked'], ['desc']);
        this.userSelectChange.next();
        this.totalUserChecked = this._getUserChecked().length;
        this.fullChecked = !!this.totalUserChecked && this.totalUserChecked === this.users.length;
        this.fullUnCheck = !this.totalUserChecked;
        if (this.totalUserChecked == 0) this.isSetPriority = false;

        setTimeout(() => {
            this._calculateUserSplitSize();
            this.appStore.dispatch(this.invoiceApprovalAction.updateConfirmUser(!!this.totalUserChecked));
            if (!!this.totalUserChecked) this.showErrorHighligh = false;
        });
    }

    private _checkGroupSelected() {
        this.groups = orderBy(this.groups, ['checked', 'InvoiceApprovalGroup'], ['desc', 'asc']);
        this.totalGroupChecked = this._getGroupsChecked().length;
        this.fullGroupChecked = !!this.totalGroupChecked && this.totalGroupChecked === this.groups.length;
        this.fullGroupUnCheck = !this.totalGroupChecked;

        setTimeout(() => {
            this._calculateGroupSplitSize();
        });
    }

    private _calculateUserSplitSize() {
        if (this.fullUnCheck) {
            this.splitSizeUser = {
                selected: this.splitterMinSize,
                list: 100 - this.splitterMinSize,
                resized: false,
            };
        } else if (this.fullChecked) {
            this.splitSizeUser = {
                selected: 100 - this.splitterMinSize,
                list: this.splitterMinSize,
                resized: false,
            };
        } else if (this.totalUserChecked) {
            //&& !this.splitSizeUser.resized
            const height = $(this.element.nativeElement).parent().height();
            let selectHeight = Math.min(((HEADER_HEIGHT + this.totalUserChecked * 22 + 35) * 100) / height, 50);
            if (this.splitSizeUser.resized) {
                selectHeight = Math.max(selectHeight, this.splitSizeUser.selected);
            }
            this.splitSizeUser = {
                selected: selectHeight,
                list: 100 - selectHeight,
                resized: this.splitSizeUser.resized,
            };
        }
    }

    private _calculateGroupSplitSize() {
        if (this.fullGroupUnCheck) {
            this.splitSizeGroup = {
                selected: this.splitterMinSize,
                list: 100 - this.splitterMinSize,
                resized: false,
            };
        } else if (this.fullGroupChecked) {
            this.splitSizeGroup = {
                selected: 100 - this.splitterMinSize,
                list: this.splitterMinSize,
                resized: false,
            };
        } else if (this.totalGroupChecked) {
            //&& !this.splitSizeGroup.resized
            const height = $(this.element.nativeElement).parent().height();
            let selectHeight = Math.min(((HEADER_HEIGHT + this.totalGroupChecked * 22 + 35) * 100) / height, 50);
            if (this.splitSizeUser.resized) {
                selectHeight = Math.max(selectHeight, this.splitSizeGroup.selected);
            }
            this.splitSizeGroup = {
                selected: selectHeight,
                list: 100 - selectHeight,
                resized: this.splitSizeGroup.resized,
            };
        }
    }

    private _recalculateMinHeight() {
        const height = $(this.element.nativeElement).parent().height();
        if (!height) return;
        const needToUpdateGroupSize = this.splitSizeGroup.selected === this.splitterMinSize;
        const needToUpdateUserSize = this.splitSizeUser.selected === this.splitterMinSize;

        this.splitterMinSize = (HEADER_HEIGHT * 100) / height;
        if (!this.splitSizeGroup.selected || needToUpdateGroupSize) {
            this.splitSizeGroup = {
                list: 100 - this.splitterMinSize,
                selected: this.splitterMinSize,
                resized: false,
            };
        }
        if (!this.splitSizeUser.selected || needToUpdateUserSize) {
            this.splitSizeUser = {
                list: 100 - this.splitterMinSize,
                selected: this.splitterMinSize,
                resized: false,
            };
        }
    }

    public onChangeValueGroup() {
        this.valueChange = false;
    }

    public onChangeUrgent(event) {
        this.isSwitchUrgent = event.checked;
        this.appStore.dispatch(new UrgentStateAction(event.checked));
    }

    public onChangePassRule(event) {
        this.isPassRule = !this.isPassRule;
    }

    private _dispatchGroupIdUnCheck(ids: any[]) {
        if (!!ids.length) this.appStore.dispatch(this.invoiceApprovalAction.clearCostCentreByGroupIds(ids));
    }

    public changeKostenstelleText(data) {
        this.onChangeValueGroup();
        let value;
        if (typeof data === 'object') {
            value = data.Description || '';
            this.kostenstelleId = data.CostCentre;
        } else {
            value = data || '';
            this.kostenstelleId = '';
        }

        const kostenstelleBackup = cloneDeep(this.kostenstelleBackup);
        if (!value) {
            this.kostenstelleFiltered = kostenstelleBackup;
            return;
        }

        this.kostenstelleFiltered = kostenstelleBackup.filter((item) =>
            item?.Description.toLowerCase().includes(value.toLowerCase()),
        );
    }

    public onKostenstelleBlur() {
        if (
            typeof this.kostenstelleSelected === 'string' &&
            this.kostenstelleSelected.length > 0 &&
            this.kostenstelleFiltered.length === 1
        ) {
            this.kostenstelleSelected = this.kostenstelleFiltered[0].Description;
            this.kostenstelleId = this.kostenstelleFiltered[0].CostCentre;
        }
    }

    public closeKostenstelleDropdown() {
        this.autocompleteKostenstelleTrigger?.closePanel();
    }

    public clearKostenstelle() {
        this.kostenstelleId = '';
        this.kostenstelleSelected = '';
        this.kostenstelleFiltered = cloneDeep(this.kostenstelleBackup);
        setTimeout(() => {
            this.autocompleteKostenstelleTrigger?.setFocus();
            this.autocompleteKostenstelleTrigger?.openPanel();
        }, 10);
    }

    public displayKostenstelleFn(value: any): string {
        return typeof value === 'object' ? value?.Description : value;
    }

    public dragEndGroup(splitterSize: any) {
        this.splitSizeGroup = {
            list: get(splitterSize, ['sizes', 1]),
            selected: get(splitterSize, ['sizes', 0]),
            resized: true,
        };
    }

    public dragEndUser(splitterSize: any) {
        this.splitSizeUser = {
            list: get(splitterSize, ['sizes', 1]),
            selected: get(splitterSize, ['sizes', 0]),
            resized: true,
        };
    }
}
