import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    Injector,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { PropertyPanelService, UserProfileService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { UserSelectionPopupActions } from '@app/state-management/store/actions/user-selection-popup';
import { Uti } from '@app/utilities';
import { Store } from '@ngrx/store';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { PopupRef } from '../global-popup/popup-ref';
import { PopupService } from '../global-popup/services/popup.service';
import { ManagementListComponent } from '../management-list/management-list.component';
import { ItemOfList, TypeOfList } from '../management-list/model';
import { RolesTab } from './models/tab.model';
import get from 'lodash-es/get';
import find from 'lodash-es/find';
import cloneDeep from 'lodash-es/cloneDeep';
import { BaseWidgetCommonAction } from '@widget/components/base-widget-common-action';
import { FieldFilter } from '@app/models';
import { RoleIdsDisableEdit } from '@app/app.constants';

@Component({
    selector: 'widget-role',
    templateUrl: './widget-role.component.html',
    styleUrls: ['./widget-role.component.scss'],
})
export class WidgetRoleComponent extends BaseWidgetCommonAction implements OnInit, AfterViewInit {
    public readonly ROLE_IDS_DISABLE_EDIT_CONSTANT = RoleIdsDisableEdit;

    private _originalPermission: any;
    userInRole: any;
    public resetWidget() {
        this.getAllRoles();
        this.selectedRolesItem = null;
        this.selectedTab = RolesTab.PERMISSION;
    }
    filterDisplayFields(displayFields: FieldFilter[]) {
        throw new Error('Method not implemented.');
    }
    public readonly TypeOfList = TypeOfList;
    public readonly RolesTab = RolesTab;
    private popup: PopupRef<any>;
    private guid: string = Uti.guid();

    selectedRolesItem: ItemOfList;
    permissions: ItemOfList[] = [];
    members: ItemOfList[] = [];
    roles: ItemOfList[] = [];
    selectedTab: RolesTab = RolesTab.PERMISSION;
    optionShowPopup: string;
    editingRoleItem: ItemOfList;
    loading: boolean;
    public splitterConfig = {
        leftHorizontal: 50,
        rightHorizontal: 50,
        subRightLeftHorizontal: 50,
        subRightRightHorizontal: 50,
    };

    @ViewChild('addEditPopup') addEditPopup: TemplateRef<any>;
    @ViewChild('roleManagement') roleManagementComponent: ManagementListComponent;

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

    ngOnInit(): void {
        this.getAllRoles();
    }

    ngAfterViewInit() {
        this.roleManagementComponent.onRowClickItem
            .pipe(
                distinctUntilChanged(),
                debounceTime(100),
                switchMap((item: ItemOfList) => {
                    this.permissions = [];
                    this.selectedRolesItem = item;
                    this.loading = true;
                    return this.userProfileService.getRoleById(item.id);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((items) => {
                this.loading = false;
                const modulePermission = get(items, ['item', 0], []);
                const users = get(items, ['item', 1], []);
                this.userInRole = users;
                this.mappingPermission(modulePermission);
                this.members = users.map((user) => {
                    return new ItemOfList({
                        fontawesomeIconName: user.MemberType === 'group' ? 'icon fal fa-users' : 'icon fal fa-user',
                        id: user.IdMemberGw,
                        name: user.DisplayName,
                    });
                });
            });
    }

    getAllRoles() {
        this.userProfileService.getAllRoles().subscribe((res) => {
            this.roles = [];
            const arrayItem = res.item?.[0];
            arrayItem.map((item: any) => {
                this.roles.push(
                    new ItemOfList({
                        id: item.IdLoginRoles,
                        name: item.RoleName,
                    }),
                );
                return this.roles;
            });
        });
    }

    addRoleItem() {
        this.openAddEditPopup();
    }

    editRoleItem(item: ItemOfList) {
        this.openAddEditPopup(item);
    }

    deleteRoleItem(item: ItemOfList) {
        this.userProfileService
            .updateRole({
                JSONRole: {
                    Roles: [
                        {
                            IdLoginRoles: item.id,
                            RoleName: item.name,
                            IsActive: 0,
                            IsDeleted: 1,
                        },
                    ],
                },
            })
            .subscribe((res) => {
                this.getAllRoles();
            });
        if (this.selectedRolesItem === item) {
            this.members = [];
            this.permissions = [];
            this.selectedRolesItem = null;
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

    private addMemberCallback({ userSelected }) {
        this.userProfileService
            .updateRole({
                JSONMember: {
                    Members: userSelected.map((_u) => ({
                        IdMemberGw: null,
                        IdMember: _u.IdMember,
                        MemberType: _u.MemberType,
                        IdLoginRoles: this.selectedRolesItem?.id,
                        IsActive: 1,
                        IsDeleted: 0,
                    })),
                },
            })
            .subscribe((res) => {
                this._callAPIDetail();
            });
    }

    deleteMember(item: ItemOfList) {
        const currentItem = this.userInRole.find((i) => i.IdMemberGw === item.id);
        if (currentItem)
            this.userProfileService
                .updateRole({
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

    addSuccess(event) {
        this.userProfileService
            .updateRole({
                JSONRole: {
                    Roles: [
                        {
                            IdLoginRoles: this.editingRoleItem?.id || null,
                            RoleName: event,
                            IsActive: 1,
                            IsDeleted: 0,
                        },
                    ],
                },
            })
            .subscribe((res) => {
                this.getAllRoles();
            });
    }

    private openAddEditPopup(item?: ItemOfList) {
        const title = item ? 'Edit Role' : 'Add Role';
        this.optionShowPopup = item ? 'edit' : 'add';
        this.editingRoleItem = item;
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
                this.editingRoleItem = null;
            }).bind(this),
        );
    }

    mappingPermission(data: any) {
        const permission = [];
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const item = data[key];
                const permissionItem = find(permission, ['name', item.PermissionType]);
                if (permissionItem) {
                    if (!item.IsSelected) permissionItem.isActive = false;
                    permissionItem.children.push({
                        id: item.IdPermission,
                        name: item.PermissionName,
                        editable: true,
                        isActive: item.IsSelected,
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
                                isActive: item.IsSelected,
                            },
                        ],
                    });
                }
            }
        }
        this._originalPermission = data;
        const roleId = Number(this.selectedRolesItem?.id);
        const editable = !this.ROLE_IDS_DISABLE_EDIT_CONSTANT.includes(roleId);
        this.permissions = permission.map((_p) => {
            const id = get(_p, ['children', 0, 'id']);
            const isActive = get(_p, ['children', 0, 'isActive']);

            if (_p.children?.length <= 1) {
                delete _p.children;
                return { ..._p, id, isActive, editable };
            }
            if (_p.children.length) {
                for (let index = 0; index < _p.children.length; index++) {
                    _p.children[index].editable = editable;
                }
            }
            _p.editable = editable;
            return _p;
        });
    }

    public changeStatusRole(data: any) {
        const request = [];
        for (const key in this._originalPermission) {
            if (Object.prototype.hasOwnProperty.call(this._originalPermission, key)) {
                const element = this._originalPermission[key];
                const currentItem = find(data, ['id', element.IdPermission]);
                if (!element.IsSelected && !!currentItem) {
                    delete element.IsSelected;
                    request.push({
                        ...element,
                        IdLoginRoles: this.selectedRolesItem?.id,
                        IsActive: 1,
                    });
                } else if (element.IsSelected && !currentItem) {
                    delete element.IsSelected;
                    request.push({
                        ...element,
                        IdLoginRoles: this.selectedRolesItem?.id,
                        IsActive: 0,
                    });
                }
            }
        }
        this.userProfileService
            .updateRole({
                JSONPermission: { Permissions: request },
            })
            .subscribe((res) => {
                this._callAPIDetail();
            });
    }

    private _callAPIDetail() {
        this.userProfileService.getRoleById(this.selectedRolesItem?.id).subscribe((items) => {
            const users = get(items, ['item', 1], []);
            this.userInRole = users;
            this._originalPermission = get(items, ['item', 0], []);
            this.members = users.map((user) => {
                return new ItemOfList({
                    id: user.IdMemberGw,
                    fontawesomeIconName: user.MemberType === 'group' ? 'icon fal fa-users' : 'icon fal fa-user',
                    name: user.DisplayName,
                });
            });
        });
    }
}
