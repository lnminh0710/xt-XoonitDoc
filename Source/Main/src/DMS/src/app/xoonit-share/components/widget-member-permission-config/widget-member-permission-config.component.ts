import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { IconNames } from '@app/app-icon-registry.service';
import { IdDocumentTreeConstant, MessageModal } from '@app/app.constants';
import { ControlGridModel, User } from '@app/models';
import { BaseComponent } from '@app/pages/private/base';
import { DatatableService, DocumentService, UserService } from '@app/services';
import {
    GetDocumentTreeOptions,
    TreeTypeEnum,
} from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import { XnAgGridComponent } from '@xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { ColHeaderKey } from '@xn-control/xn-ag-grid/shared/ag-grid-constant';
import { ColDef, GetDataPath, ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { ToasterService } from 'angular2-toaster';
import { takeUntil } from 'rxjs/operators';
import { PopupRef } from '../global-popup/popup-ref';

@Component({
    selector: 'widget-member-permission-config',
    templateUrl: './widget-member-permission-config.component.html',
    styleUrls: ['./widget-member-permission-config.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetMemberPermissionConfigComponent extends BaseComponent implements OnInit, OnDestroy {
    // @Input() globalProperties: any;
    public globalProperties: any = null;
    @ViewChild(XnAgGridComponent) xnAgGrid: XnAgGridComponent;

    public dataSource = <ControlGridModel>{
        columns: [],
        data: [],
        totalResults: 0,
    };
    public autoGroupColumnDef = <ColDef>{
        lockPosition: true,
        headerName: 'Group Name',
        minWidth: 200,
        sortable: false,
        cellRendererParams: {
            suppressCount: true,
            innerRenderer: this.getFileCellRenderer(),
        },
    };
    public getDataPath: GetDataPath = function (data: any) {
        return data[ColHeaderKey.TreeViewPath];
    };

    private currentUser: User;
    private member: any;
    private treeType: TreeTypeEnum;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private _userService: UserService,
        private datatableService: DatatableService,
        protected documentService: DocumentService,
        protected popupRef: PopupRef,
        private toastrService: ToasterService,
    ) {
        super(router);
    }

    ngOnInit(): void {
        this.member = this.popupRef.params.data?.data || null;
        this.treeType = this.popupRef.params.data?.treeType || null;

        this._userService.currentUser.subscribe((user: User) => {
            this.currentUser = user;
            this.getDocTreeeAgGrid(this.member);
        });
    }
    public getDocTreeeAgGrid(param) {
        let perType = '';
        switch (this.treeType) {
            case TreeTypeEnum.INDEXING:
                perType = 'Indexing';
                break;
            default:
                perType = 'Mail';
                break;
        }
        this.documentService
            .getDocumentTreeAgGrid(<GetDocumentTreeOptions>{
                idPerson: '',
                permissionType: perType,
                idLogin: this.currentUser?.id,
                idMember: param?.IdMember,
                isLoginGroup: param?.IsLoginGroup,
            })
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((res) => {
                const aggridConfig = this.datatableService.buildEditableDataSource([res[0], res[1]]);
                if (!aggridConfig?.columns) return;

                let idDocumentTreeParent;
                switch (this.treeType) {
                    case TreeTypeEnum.INDEXING:
                        idDocumentTreeParent = IdDocumentTreeConstant.INDEXING;
                        break;
                    case TreeTypeEnum.EMAIL:
                        idDocumentTreeParent = IdDocumentTreeConstant.EMAIL;
                        break;
                    default:
                        break;
                }

                let tempData = [];
                if (aggridConfig.data?.length > 0) {
                    if (this.currentUser.isSuperAdmin) {
                        const companyArray = aggridConfig.data.groupBy(({ IdSharingCompany }) => IdSharingCompany);
                        for (const key in companyArray) {
                            if (Object.prototype.hasOwnProperty.call(companyArray, key)) {
                                const arrList = companyArray[key];
                                if (!arrList?.length) continue;

                                const firstItem = arrList[0];
                                const groupCompany = {
                                    CompanyName: firstItem.CompanyName,
                                    DisplayName: firstItem.DisplayName,
                                    GroupName: firstItem.DisplayName,
                                    IdSharingCompany: firstItem.IdSharingCompany,
                                    IdLogin: firstItem.IdLogin,
                                    IsActive: true,
                                    IsReadOnly: true,
                                    IdDocumentTreeParent: idDocumentTreeParent,
                                    IconName: IconNames.TREE_COMPANY,
                                    IsIndexingTree: true,
                                    IdRepDocumentGuiType: firstItem.IdRepDocumentGuiType,
                                    IsCompany: true,
                                    [ColHeaderKey.TreeViewPath]: [firstItem.CompanyName],
                                    IsDisabledRow: true,
                                };
                                tempData.push(groupCompany);
                                const childResult = this.buildTreeUserAgGrid(
                                    arrList,
                                    idDocumentTreeParent,
                                    groupCompany[ColHeaderKey.TreeViewPath],
                                    false,
                                );
                                tempData.push.apply(tempData, childResult);
                            }
                        }
                    } else if (this.currentUser.isAdmin) {
                        tempData = this.buildTreeUserAgGrid(aggridConfig.data, idDocumentTreeParent);
                    } else {
                        tempData = this.buildTreeAgGrid(aggridConfig.data, idDocumentTreeParent);
                    }
                    aggridConfig.data = tempData;
                }

                this.dataSource = aggridConfig;
                this.cdRef.detectChanges();
            });
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }

    private buildTreeUserAgGrid(data: any, idParrent: number, parrentPath: string[] = [], isShowIcon = true) {
        const result = [];
        const userArray = data.groupBy(({ IdLogin }) => IdLogin);
        for (const key in userArray) {
            if (Object.prototype.hasOwnProperty.call(userArray, key)) {
                const arrList = userArray[key];
                if (!arrList?.length) continue;

                const firstItem = arrList[0];

                let treePath = Object.assign([], parrentPath);
                if (treePath?.length) treePath.push(firstItem.DisplayName);
                else treePath = [firstItem.DisplayName];

                const groupUser = {
                    CompanyName: firstItem.CompanyName,
                    DisplayName: firstItem.DisplayName,
                    GroupName: firstItem.DisplayName,
                    IdSharingCompany: firstItem.IdSharingCompany,
                    IdLogin: firstItem.IdLogin,
                    IsActive: true,
                    IsReadOnly: true,
                    IdDocumentTreeParent: idParrent,
                    IconName: isShowIcon ? IconNames.TREE_USER : '',
                    IsIndexingTree: true,
                    IdRepDocumentGuiType: firstItem.IdRepDocumentGuiType,
                    IsUser: true,
                    [ColHeaderKey.TreeViewPath]: treePath,
                    IsDisabledRow: true,
                };
                result.push(groupUser);
                const childResult = this.buildTreeAgGrid(
                    arrList,
                    idParrent,
                    groupUser[ColHeaderKey.TreeViewPath],
                    false,
                );
                result.push.apply(result, childResult);
            }
        }
        return result;
    }
    private buildTreeAgGrid(data: any, idParrent: number, parrentPath: string[] = [], isShowIcon = true) {
        let result = [];
        const tempData = data.filter((x) => x.IdDocumentTreeParent === idParrent);
        if (!tempData?.length) return result;

        for (let index = 0; index < tempData.length; index++) {
            let treePath = Object.assign([], parrentPath);
            if (treePath?.length) treePath.push(tempData[index].GroupName);
            else treePath = [tempData[index].GroupName];

            tempData[index][ColHeaderKey.TreeViewPath] = treePath;
            tempData[index]['IconName'] = isShowIcon ? IconNames.TREE_FOLDER : '';
            result.push(tempData[index]);

            const childList = data.filter((x) => x.IdDocumentTreeParent === tempData[index].IdDocumentTree);
            if (!childList?.length) continue;

            const childResult = this.buildTreeAgGrid(
                data,
                tempData[index].IdDocumentTree,
                tempData[index][ColHeaderKey.TreeViewPath],
                false,
            );
            result.push.apply(result, childResult);
        }
        return result;
    }

    private getFileCellRenderer() {
        class FileCellRenderer implements ICellRendererComp {
            eGui: any;
            init(params: ICellRendererParams) {
                const groupName = [IconNames.TREE_COMPANY, IconNames.TREE_USER, IconNames.TREE_FOLDER].includes(
                    params.data.IconName,
                )
                    ? `<img src="public/imgs/icons/${params.data.IconName}.svg" style="width: 20px;"/><span> ${params.value}</span>`
                    : params.value;
                this.eGui = groupName;
            }
            getGui() {
                return this.eGui;
            }
            refresh() {
                return false;
            }
        }
        return FileCellRenderer;
    }

    private handleSavedData(event) {
        const tempData = Object.assign({}, event);
        if (!tempData) return tempData;

        delete tempData.CompanyName;
        delete tempData.GroupName;
        delete tempData.IconName;
        delete tempData.IdDocumentTreeParent;
        delete tempData.IdDocumentTreeRoot;
        delete tempData.IdLogin;
        delete tempData.IdRepDocumentGuiType;
        delete tempData.IdSharingCompany;
        delete tempData.IsReadOnly;
        delete tempData.Quantity;
        delete tempData.QuantityParent;
        delete tempData.SortingIndex;
        delete tempData.TreeViewPath;
        delete tempData.Actions;
        delete tempData.CreateDate;
        delete tempData.DT_RowId;
        delete tempData.PermissionType;
        delete tempData.UpdateDate;
        delete tempData.colDef;
        delete tempData.IdMain;

        tempData.ApplyForChild = '0';
        tempData.CanDelete = !!tempData.CanDelete ? '1' : '0';
        tempData.CanEdit = !!tempData.CanEdit ? '1' : '0';
        tempData.CanRead = !!tempData.CanRead ? '1' : '0';
        tempData.IsDeleted = !!tempData.IsDeleted ? '1' : '0';
        tempData.IsLoginGroup = this.member.IsLoginGroup?.toString() || '0';
        tempData.IdMember = this.member.IdMember;

        return tempData;
    }
    private callSerivceUpdateData(savedData: any) {
        const data = { JSONPermission: { IndexingPermission: savedData } };
        this.documentService
            .updatePermissionIndexingTree(data)
            .pipe(takeUntil(super.getUnsubscriberNotifier()))
            .subscribe((res) => {
                this.toastrService.clear();
                this.getDocTreeeAgGrid(this.member);
                if (res?.item?.returnID === '-1') {
                    this.toastrService.pop(MessageModal.MessageType.error, 'System', `Update fail!`);
                    return;
                }

                this.toastrService.pop(MessageModal.MessageType.success, 'System', `Update success!`);
                this.closeDialog(true);
            });
    }
    public save() {
        const dataSaved = [];
        for (let index = 0; index < this.dataSource.data.length; index++) {
            const element = this.dataSource.data[index];
            if (element?.IsUser || element?.IsCompany) continue;
            dataSaved.push(this.handleSavedData(element));
        }
        if (!dataSaved?.length) return;
        this.callSerivceUpdateData(dataSaved);
    }
    public closeDialog(isSuccess: boolean = false) {
        this.popupRef.close({ isSuccess });
    }
}
