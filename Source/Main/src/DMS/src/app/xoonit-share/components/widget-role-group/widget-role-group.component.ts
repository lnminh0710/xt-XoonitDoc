import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    Injector,
    Input,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { FieldFilter, WidgetPropertyModel } from '@app/models';
import { PropertyPanelService, UserProfileService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { UserSelectionPopupActions } from '@app/state-management/store/actions';
import { Uti } from '@app/utilities';
import { Store } from '@ngrx/store';
import { BaseWidgetCommonAction } from '@widget/components/base-widget-common-action';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { PopupRef } from '../global-popup/popup-ref';
import { PopupService } from '../global-popup/services/popup.service';
import { ManagementListComponent } from '../management-list/management-list.component';
import { ItemOfList, TypeOfList } from '../management-list/model';
import { RoleGroupTab, RoleGroupResponse, RoleResponse, UserResponse } from './models';
import { find, get } from 'lodash-es';

@Component({
    selector: 'widget-role-group',
    templateUrl: 'widget-role-group.component.html',
    styleUrls: ['./widget-role-group.component.scss'],
})
export class WidgetRoleGroupComponent extends BaseWidgetCommonAction implements OnInit, AfterViewInit {
    private _originalRole: any;
    userInRole: any;
    resetWidget() {
        this.initData();
        this.selectedTab = RoleGroupTab.ROLE;
        this.selectedRoleGroupItem = null;
    }
    filterDisplayFields(displayFields: FieldFilter[]) {
        throw new Error('Method not implemented.');
    }
    public readonly TypeOfList = TypeOfList;
    public readonly RoleGroupTab = RoleGroupTab;

    @Input() globalProperties: any;
    @Input() widgetProperties: WidgetPropertyModel[];

    roleGroups: ItemOfList[] = [];
    roles: ItemOfList[] = [];
    members: ItemOfList[] = [];

    loading: boolean;
    selectedTab: RoleGroupTab = RoleGroupTab.ROLE;
    selectedRoleGroupItem: ItemOfList;
    editingRoleGroupItem: ItemOfList;

    optionShowPopup: string;

    private popup: PopupRef<any>;
    private guid: string = Uti.guid();

    @ViewChild('addEditPopup') addEditPopup: TemplateRef<any>;
    @ViewChild('groupRole') groupRoleComponent: ManagementListComponent;
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
        private popupService: PopupService,
        private store: Store<AppState>,
        private userSelectionPopupActions: UserSelectionPopupActions,
        private userProfileService: UserProfileService,
    ) {
        super(injector, containerRef, router);

        this.componentFactoryResolver = injector.get(ComponentFactoryResolver);
        this.propertyPanelService = injector.get(PropertyPanelService);
    }

    ngOnInit() {
        this.initData();
    }

    ngAfterViewInit() {
        this.groupRoleComponent.onRowClickItem
            .pipe(
                distinctUntilChanged(),
                debounceTime(100),
                switchMap((item: ItemOfList) => {
                    this.selectedRoleGroupItem = item;
                    this.loading = true;
                    this.roles = [];
                    this._originalRole = [];
                    this.userInRole = [];
                    return this.userProfileService.getRoleGroupDetail(item.id);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((res) => {
                this.loading = false;
                this._originalRole = get(res, ['item', 0], []);
                this.userInRole = get(res, ['item', 1], []);
                this.roles = get(res, ['item', 0], []).map((role: any) => ({
                    editable: true,
                    id: role.IdLoginRoles,
                    name: role.RoleName,
                    isActive: role.IsSelected,
                }));
                this.members = get(res, ['item', 1], []).map((user: any) => {
                    return new ItemOfList({
                        fontawesomeIconName: user.MemberType === 'group' ? 'icon fal fa-users' : 'icon fal fa-user',
                        id: user.IdMemberGw,
                        name: user.DisplayName,
                    });
                });
            });
    }

    initData() {
        this.userProfileService.getAllRoleGroups().subscribe((res) => {
            this.roleGroups = get(res, ['item', 0], []).map?.((roleGroup: RoleGroupResponse) => {
                return new ItemOfList({
                    id: roleGroup.IdLoginGroupRole,
                    name: roleGroup.GroupRoleName,
                });
            });
        });

        // this.userProfileService.getAllRoles().subscribe((res) => {
        //     this.roles =
        //         res.item?.[0]?.map?.((role: RoleResponse) => {
        //             return new ItemOfList({
        //                 id: role.IdLoginRoles,
        //                 name: role.RoleName,
        //                 isActive: role.IsSelected,
        //             });
        //         }) || [];
        // });
    }

    addRoleGroupItem() {
        this.openAddEditPopup();
    }

    editRoleGroupItem(item: ItemOfList) {
        this.openAddEditPopup(item);
    }

    deleteRoleGroupItem(item: ItemOfList) {
        const index = this.roleGroups.findIndex((i) => i.id === item.id);
        this.roleGroups.splice(index, 1);
        this.userProfileService
            .updateRoleGroup({
                JSONGroupRole: {
                    GroupRoles: [
                        {
                            IdLoginGroupRole: item.id,
                            GroupRoleName: item.name,
                            IsActive: 0,
                            IsDeleted: 1,
                        },
                    ],
                },
            })
            .subscribe((res) => {
                this.initData();
            });
        if (this.selectedRoleGroupItem === item) {
            this.selectedRoleGroupItem = null;
            this.roles = [];
            this._originalRole = [];
        }
    }

    addMember() {
        this.store.dispatch(
            this.userSelectionPopupActions.openUserSelectionPopup({
                widgetId: this.guid,
                userSelected: this.userInRole,
                excludeSelected: true,
                callback: this.addMemberCallback.bind(this),
            }),
        );
    }

    deleteMember(item: ItemOfList) {
        const currentItem = this.userInRole.find((i) => i.IdMemberGw === item.id);
        if (currentItem)
            this.userProfileService
                .updateRoleGroup({
                    JSONMember: {
                        Members: [
                            {
                                ...currentItem,
                                IsActive: 0,
                                IsDeleted: 1,
                            },
                        ],
                    },
                })
                .subscribe((res) => {
                    this._callAPIDetail();
                });
    }

    changeStatus(data: any) {
        const request = [];
        for (const key in this._originalRole) {
            if (Object.prototype.hasOwnProperty.call(this._originalRole, key)) {
                const element = this._originalRole[key];
                const currentItem = find(data, ['id', element.IdLoginRoles]);
                if (!element.IsSelected && !!currentItem) {
                    delete element.IsSelected;
                    request.push({
                        ...element,
                        IdLoginGroupRole: this.selectedRoleGroupItem?.id,
                        IsActive: 1,
                        IsDeleted: 0,
                    });
                } else if (element.IsSelected && !currentItem) {
                    delete element.IsSelected;
                    request.push({
                        ...element,
                        IdLoginGroupRole: this.selectedRoleGroupItem?.id,
                        IsActive: 0,
                        IsDeleted: 0,
                    });
                }
            }
        }
        this.userProfileService
            .updateRoleGroup({
                JSONRole: { Roles: request },
            })
            .subscribe((res) => {
                this.roles = [];
                this._callAPIDetail();
            });
    }

    addSuccess(event: any) {
        this.userProfileService
            .updateRoleGroup({
                JSONGroupRole: {
                    GroupRoles: [
                        {
                            IdLoginGroupRole: this.editingRoleGroupItem?.id || null,
                            GroupRoleName: event,
                            IsActive: 1,
                            IsDeleted: 0,
                        },
                    ],
                },
            })
            .subscribe((res) => {
                this.initData();
            });
    }

    private addMemberCallback({ userSelected }) {
        this.userProfileService
            .updateRoleGroup({
                JSONMember: {
                    Members: userSelected.map((_u) => ({
                        IdMemberGw: null,
                        IdMember: _u.IdMember,
                        MemberType: _u.MemberType,
                        IdLoginGroupRole: this.selectedRoleGroupItem?.id,
                        IsActive: 1,
                        IsDeleted: 0,
                    })),
                },
            })
            .subscribe((res) => {
                this._callAPIDetail();
            });
    }

    private openAddEditPopup(item?: ItemOfList) {
        const title = item ? 'Edit Group' : 'Add Group';
        this.optionShowPopup = item ? 'edit' : 'add';
        this.editingRoleGroupItem = item;
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
                this.editingRoleGroupItem = null;
            }).bind(this),
        );
    }

    private _callAPIDetail() {
        this.userProfileService.getRoleGroupDetail(this.selectedRoleGroupItem?.id).subscribe((res) => {
            const role = get(res, ['item', 0], []);
            const users = get(res, ['item', 1], []);
            this._originalRole = role;
            this.roles = role.map((role: any) => ({
                editable: true,
                id: role.IdLoginRoles,
                name: role.RoleName,
                isActive: role.IsSelected,
            }));
            this.userInRole = users;
            this.members = users.map((user: any) => {
                return new ItemOfList({
                    fontawesomeIconName: user.MemberType === 'group' ? 'icon fal fa-users' : 'icon fal fa-user',
                    id: user.IdMemberGw,
                    name: user.DisplayName,
                });
            });
        });
    }
}
