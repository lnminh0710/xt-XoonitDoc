import {
    Component,
    ComponentFactoryResolver,
    Injector,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { FieldFilter } from '@app/models';
import { UserV2ActionNames, UserV2Actions } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.actions';
import { UserV2Selectors } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.selectors';
import { PropertyPanelService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { CustomAction, UserSelectionPopupActions } from '@app/state-management/store/actions';
import { Uti } from '@app/utilities/uti';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { BaseWidgetCommonAction } from '@widget/components/base-widget-common-action';
import { filter, takeUntil } from 'rxjs/operators';
import { PopupRef } from '../global-popup/popup-ref';
import { PopupService } from '../global-popup/services/popup.service';
import { ManagementListComponent } from '../management-list/management-list.component';
import { ItemOfList } from '../management-list/model';
import { get } from 'lodash-es';
@Component({
    selector: 'widget-user-group',
    templateUrl: 'widget-user-group.component.html',
    styleUrls: ['./widget-user-group.component.scss'],
})
export class WidgetUserGroupComponent extends BaseWidgetCommonAction implements OnInit {
    userInGroup: any;
    resetWidget() {
        this.store.dispatch(this.userV2Actions.getAllUserGroupAction());
        this.singleUserList = [];
        this.selectedUserGroupItem = null;
    }
    filterDisplayFields(displayFields: FieldFilter[]) {
        throw new Error('Method not implemented.');
    }

    @ViewChild('addEditPopup') addEditPopup: TemplateRef<any>;
    @ViewChild('userGroup') userGroupComponent: ManagementListComponent;
    userGroups: ItemOfList[] = [];
    singleUserList: ItemOfList[] = [];
    typeShowPopup: string;
    userGroupItem: ItemOfList;
    selectedUserGroupItem: ItemOfList;
    loading: boolean;
    private popup: PopupRef<any>;
    private guid: string = Uti.guid();
    public splitterConfig = {
        leftHorizontal: 50,
        rightHorizontal: 50,
        subRightLeftHorizontal: 50,
        subRightRightHorizontal: 50,
    };
    protected componentFactoryResolver: ComponentFactoryResolver;
    protected propertyPanelService: PropertyPanelService;
    constructor(
        protected router: Router,
        protected injector: Injector,
        protected containerRef: ViewContainerRef,
        protected store: Store<AppState>,
        private dispatcher: ReducerManagerDispatcher,
        private popupService: PopupService,
        private userSelectionAction: UserSelectionPopupActions,
        private userV2Actions: UserV2Actions,
        private userV2Selectors: UserV2Selectors,
    ) {
        super(injector, containerRef, router);

        this.componentFactoryResolver = injector.get(ComponentFactoryResolver);
        this.propertyPanelService = injector.get(PropertyPanelService);
        this.subscribeAction();
    }

    ngOnInit() {
        this.store.dispatch(this.userV2Actions.getAllUserGroupAction());
    }

    openPopupToEdit(item?: ItemOfList) {
        const title = item ? 'Edit Group' : 'Add Group';
        this.typeShowPopup = item ? 'edit' : 'add';
        this.userGroupItem = item;
        this.popup = this.popupService.open({
            content: this.addEditPopup,
            hasBackdrop: true,
            header: {
                title: title,
                iconClose: true,
            },
            disableCloseOutside: true,
            optionDrapDrop: true,
        });
        this.popup.afterClosed$.subscribe(
            (() => {
                delete this.userGroupItem;
            }).bind(this),
        );
    }

    addSingleUser() {
        this.store.dispatch(
            this.userSelectionAction.openUserSelectionPopup({
                widgetId: this.guid,
                userSelected: this.userInGroup,
                excludeSelected: true,
                userOnly: true,
                callback: ({ userSelected }) => {
                    this.store.dispatch(this.userSelectionAction.refreshUserPopup());
                    this.store.dispatch(
                        this.userV2Actions.updateUserGroupByIdAction({
                            JSONAssignUser: {
                                AssignUser: userSelected.map((_u) => ({
                                    IdLoginGroupLoginGw: null,
                                    IdLogin: _u.IdMember,
                                    IdLoginGroup: this.selectedUserGroupItem?.id,
                                    IsActive: 1,
                                    IsDeleted: 0,
                                })),
                            },
                        }),
                    );
                },
            }),
        );
    }

    deleteUserGroup(item: ItemOfList) {
        this.store.dispatch(
            this.userV2Actions.updateUserGroupByIdAction({
                JSONUserGroup: {
                    UserGroups: [
                        {
                            IdLoginGroup: item?.id || null,
                            GroupName: item?.name,
                            IsActive: 0,
                            IsDeleted: 1,
                        },
                    ],
                },
            }),
        );
        if (item?.id === this.selectedUserGroupItem?.id) {
            this.selectedUserGroupItem = null;
            this.userInGroup = [];
        }
    }

    deleteUser(item: ItemOfList) {
        const currentItem = this.userInGroup.find((i) => i.IdLogin === item.id);
        if (currentItem)
            this.store.dispatch(
                this.userV2Actions.updateUserGroupByIdAction({
                    JSONAssignUser: {
                        AssignUser: [
                            {
                                IdLoginGroupLoginGw: currentItem.IdLoginGroupLoginGw,
                                IdLogin: currentItem.IdLogin,
                                IsActive: 0,
                                IsDeleted: 1,
                            },
                        ],
                    },
                }),
            );
    }

    rowClickItem(item: ItemOfList) {
        this.selectedUserGroupItem = item;
        if (item) {
            this.loading = true;
            this.store.dispatch(this.userV2Actions.getUserGroupByIdAction(item.id));
        }
    }

    changeStatus(item: ItemOfList) {
        console.log('change', item);
    }

    addSuccess(data) {
        this.store.dispatch(
            this.userV2Actions.updateUserGroupByIdAction({
                JSONUserGroup: {
                    UserGroups: [
                        { IdLoginGroup: this.userGroupItem?.id || null, GroupName: data, IsActive: 1, IsDeleted: 0 },
                    ],
                },
            }),
        );
    }

    private subscribeAction() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === UserSelectionPopupActions.CLOSE_USER_SELECTION_POPUP;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                if (!action?.payload?.userSelected) return;
                this.mapDataToModel(action.payload.userSelected, this.singleUserList, {
                    id: 'IdLogin',
                    name: 'FullName',
                });
            });

        this.userV2Selectors
            .actionSuccessOfSubtype$(UserV2ActionNames.USER_GROUP_GET_LIST)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    this.userGroups = [];
                    if (!get(action, ['payload', 'item', 0])) return;
                    this.mapDataToModel(get(action, ['payload', 'item', 0]), this.userGroups, {
                        id: 'IdLoginGroup',
                        name: 'GroupName',
                    });
                },
                (error) => {
                    console.log('Can not get All User Group List', error);
                },
            );

        this.userV2Selectors
            .actionSuccessOfSubtype$(UserV2ActionNames.USER_GROUP_DETAIL_GET_BY_ID)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    this.singleUserList = [];
                    this.userInGroup = get(action, ['payload', 'item', 0], []).map((_u) => ({
                        ..._u,
                        IdMember: _u.IdLogin,
                    }));
                    this.mapDataToModel(this.userInGroup, this.singleUserList, {
                        id: 'IdLogin',
                        name: 'DisplayName',
                    });
                    this.loading = false;
                },
                (error) => {
                    this.loading = false;
                    console.log('Can not get User Group Detail By Id', error);
                },
            );

        this.userV2Selectors
            .actionSuccessOfSubtype$(UserV2ActionNames.USER_GROUP_UPDATE_BY_ID)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    if (this.selectedUserGroupItem)
                        this.store.dispatch(this.userV2Actions.getUserGroupByIdAction(this.selectedUserGroupItem?.id));
                    this.store.dispatch(this.userV2Actions.getAllUserGroupAction());
                    this.store.dispatch(this.userSelectionAction.refreshUserPopup());
                },
                (error) => {
                    this.loading = false;
                    console.log('Can not update user Group', error);
                },
            );
    }

    private mapDataToModel(data: any, dataDest: ItemOfList[], keyMapObj: any) {
        data.map((item) => {
            dataDest.push(
                new ItemOfList({
                    id: item[keyMapObj.id],
                    name: item[keyMapObj.name],
                }),
            );
        });
    }
}
