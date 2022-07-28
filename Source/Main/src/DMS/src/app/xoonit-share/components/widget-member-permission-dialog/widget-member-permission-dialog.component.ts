import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { IconNames } from '@app/app-icon-registry.service';
import { MessageModal } from '@app/app.constants';
import { ControlGridModel } from '@app/models';
import { BaseComponent } from '@app/pages/private/base';
import { DatatableService, DocumentService } from '@app/services';
import { AppState } from '@app/state-management/store';
import { UserSelectionPopupActions } from '@app/state-management/store/actions';
import { Uti } from '@app/utilities';
import { GuidHelper } from '@app/utilities/guild.helper';
import { Store } from '@ngrx/store';
import { XnAgGridComponent } from '@xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import { ToasterService } from 'angular2-toaster';
import { take, takeUntil } from 'rxjs/operators';
import { HeaderNoticeRef } from '../global-popup/components/header-popup/header-notice-ref';
import { IconHeader } from '../global-popup/models/popup-header.interface';
import { PopupCloseEvent, PopupRef } from '../global-popup/popup-ref';
import { PopupService } from '../global-popup/services/popup.service';
import { WidgetMemberPermissionConfigComponent } from '../widget-member-permission-config/widget-member-permission-config.component';
import { cloneDeep } from 'lodash-es';
import { TreeTypeEnum } from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';

@Component({
    selector: 'widget-member-permission-dialog',
    templateUrl: './widget-member-permission-dialog.component.html',
    styleUrls: ['./widget-member-permission-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetMemberPermissionDialogComponent extends BaseComponent implements OnInit, OnDestroy {
    // @Input() globalProperties: any;
    public globalProperties: any = null;
    @ViewChild(XnAgGridComponent) xnAgGrid: XnAgGridComponent;
    @ViewChild('confirmDelete') confirmDelete: TemplateRef<any>;

    public dataSource = <ControlGridModel>{
        columns: [],
        data: [],
        totalResults: 0,
    };
    public deletedRows = [];

    private guid: string = Uti.guid();
    userInGroup: any[];

    public member: any;
    private treeType: TreeTypeEnum;
    public isApplyForChild = false;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private datatableService: DatatableService,
        protected documentService: DocumentService,
        protected popupService: PopupService,
        protected store: Store<AppState>,
        private userSelectionAction: UserSelectionPopupActions,
        protected popupRef: PopupRef,
        private toastrService: ToasterService,
    ) {
        super(router);
    }

    ngOnInit(): void {
        this.member = this.popupRef.params.data?.data || null;
        this.treeType = this.popupRef.params.data?.treeType || null;
        if (!this.member?.idDocument) return;

        this.getPermissionMemberList();
    }
    ngOnDestroy(): void {
        super.onDestroy();
    }

    private getPermissionMemberList() {
        switch (this.treeType) {
            case TreeTypeEnum.INDEXING:
                this.documentService
                    .getPermissionIndexingTree(this.member.idDocument)
                    .pipe(takeUntil(super.getUnsubscriberNotifier()))
                    .subscribe((res) => this.setDataToTable(res));
                break;

            default:
                this.documentService
                    .getPermissionMailTree(this.member.idDocument)
                    .pipe(takeUntil(super.getUnsubscriberNotifier()))
                    .subscribe((res) => this.setDataToTable(res));
                break;
        }
    }
    private setDataToTable(res: any) {
        this.userInGroup = [];
        const data = res?.item;
        if (!data?.length) return;
        this.dataSource = this.datatableService.buildEditableDataSource([data[0], data[1]]);
        this.dataSource?.data.forEach((element) => {
            const memberTypeText = element.IsLoginGroup === '1' || element.IsLoginGroup == 1 ? 'group' : 'user';
            this.userInGroup.push({
                DisplayName: element.DisplayMember,
                IdMember: element.IdMember,
                MemberType: memberTypeText,
            });
        });
        this.cdRef.detectChanges();
    }

    public addNew() {
        this.store.dispatch(
            this.userSelectionAction.openUserSelectionPopup({
                widgetId: this.guid,
                userSelected: this.userInGroup,
                excludeSelected: false,
                userOnly: false,
                idExcludeList: [{ IdMember: this.member?.idLogin, MemberType: 'user' }],
                callback: ({ userSelected }) => {
                    if (!userSelected?.length) return;

                    for (let index = 0; index < userSelected.length; index++) {
                        const element = userSelected[index];
                        const isLoginGroup = element?.MemberType === 'group' ? 1 : 0;

                        const indexItemExist = this.dataSource.data.findIndex(
                            (x) => x.IdMember === element.IdMember && x.IsLoginGroup === isLoginGroup,
                        );
                        if (indexItemExist > -1) continue;

                        let data;

                        const deletedItem = this.deletedRows.find(
                            (x) => x.IdMember === element?.IdMember && x.IsLoginGroup === isLoginGroup,
                        );
                        if (deletedItem) {
                            this.deletedRows = this.deletedRows.filter((x) => x !== deletedItem);
                            deletedItem.IsDeleted = false;
                            data = deletedItem;
                        } else {
                            data = {
                                IdTreePermissionLogin: null,
                                IdMember: element?.IdMember,
                                IsLoginGroup: isLoginGroup,
                                CanRead: false,
                                CanEdit: false,
                                CanDelete: false,
                                IsDeleted: false,
                                IdMain: this.member.idDocument,
                                DisplayMember: element?.DisplayName,
                                Actions: '{"mode":"deleteAndMoreAction"}',
                                DT_RowId: `row_${GuidHelper.generateGUID()}`,
                            };
                        }
                        this.xnAgGrid.addNewRow(data, this.dataSource.data.length);
                        this.dataSource.data.push(data);
                        this.userInGroup.push(element);
                    }

                    const tempData = cloneDeep(this.dataSource);
                    tempData.totalResults = tempData.data.length;
                    this.dataSource = tempData;
                    this.cdRef.detectChanges();

                    this.store.dispatch(
                        this.userSelectionAction.closeUserSelectionPopup({
                            userSelected: this.userInGroup,
                            widgetId: this.guid,
                        }),
                    );
                },
            }),
        );
    }

    private handleSavedData(event) {
        const tempData = Object.assign({}, event);
        if (!tempData) return tempData;

        if (tempData.Actions) delete tempData.Actions;
        if (tempData.CreateDate) delete tempData.CreateDate;
        if (tempData.DT_RowId) delete tempData.DT_RowId;
        if (tempData.PermissionType) delete tempData.PermissionType;
        if (tempData.UpdateDate) delete tempData.UpdateDate;
        if (tempData.colDef) delete tempData.colDef;
        if (tempData.IdMain) {
            tempData.IdDocumentTree = tempData.IdMain;
            delete tempData.IdMain;
        } else tempData.IdDocumentTree = this.member.idDocument;

        tempData.ApplyForChild = !!this.isApplyForChild ? '1' : '0';
        tempData.CanDelete = !!tempData.CanDelete ? '1' : '0';
        tempData.CanEdit = !!tempData.CanEdit ? '1' : '0';
        tempData.CanRead = !!tempData.CanRead ? '1' : '0';
        tempData.IsDeleted = !!tempData.IsDeleted ? '1' : '0';
        tempData.IsLoginGroup = !!tempData.IsLoginGroup ? '1' : '0';

        return tempData;
    }
    private callSerivceUpdateData(savedData: any) {
        const data = { JSONPermission: { IndexingPermission: savedData } };
        switch (this.treeType) {
            case TreeTypeEnum.INDEXING:
                this.documentService
                    .updatePermissionIndexingTree(data)
                    .pipe(takeUntil(super.getUnsubscriberNotifier()))
                    .subscribe((res) => this.handleResponseAfterSave(res));
                break;

            default:
                this.documentService
                    .updatePermissionMailTree(data)
                    .pipe(takeUntil(super.getUnsubscriberNotifier()))
                    .subscribe((res) => this.handleResponseAfterSave(res));
                break;
        }
    }
    private handleResponseAfterSave(res: any) {
        this.toastrService.clear();
        this.getPermissionMemberList();
        if (res?.item?.returnID === '-1') {
            this.toastrService.pop(MessageModal.MessageType.error, 'System', `Update fail!`);
            return;
        }

        this.deletedRows = [];
        this.toastrService.pop(MessageModal.MessageType.success, 'System', `Update success!`);
    }

    public save() {
        const dataSaved = [];
        this.dataSource.data.forEach((element) => {
            dataSaved.push(this.handleSavedData(element));
        });
        for (let index = 0; index < this.deletedRows.length; index++) {
            const element = this.deletedRows[index];
            if (!element.IdTreePermissionLogin) continue;

            dataSaved.push(this.handleSavedData(element));
        }
        if (!dataSaved?.length) return;
        this.callSerivceUpdateData(dataSaved);
    }

    public delete(closeFunc, event) {
        this.xnAgGrid.deleteRowByRowId(event?.DT_RowId);

        event.IsDeleted = true;
        this.dataSource.data = this.dataSource.data.filter(
            (x) => x.IdMember !== event?.IdMember || x.IsLoginGroup !== event?.IsLoginGroup,
        );
        const isLoginGroupName = event?.IsLoginGroup === 1 ? 'group' : 'user';
        this.userInGroup = this.userInGroup.filter(
            (x) => x.IdMember !== event?.IdMember || x.MemberType !== isLoginGroupName,
        );

        const indexItemDel = this.deletedRows.findIndex(
            (x) => x.IdMember === event?.IdMember && x.IsLoginGroup === event?.IsLoginGroup,
        );
        if (indexItemDel === -1) this.deletedRows.push(event);
        this.cdRef.detectChanges();

        closeFunc();
    }

    public showConfirmDelete(event) {
        this.popupService.open({
            content: this.confirmDelete,
            hasBackdrop: true,
            header: new HeaderNoticeRef({
                iconClose: true,
                title: 'Delete Confirm',
            }),
            data: {
                selectedRow: event,
            },
            disableCloseOutside: true,
        });
    }

    public showPermissionConfig(event) {
        const popupRef = this.popupService.open({
            content: WidgetMemberPermissionConfigComponent,
            hasBackdrop: true,
            header: {
                title: `${event.DisplayMember}'s Permission`,
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
                data: event,
                treeType: this.treeType,
            },
            optionResize: true,
            optionDrapDrop: true,
        });
        popupRef.afterClosed$.pipe(take(1)).subscribe(({ type, data }: PopupCloseEvent<any>) => {
            if (type === 'close' && data?.isSuccess) this.getPermissionMemberList();
        });
    }

    public closeDialog(isSuccess: boolean = false) {
        this.popupRef.close({ isSuccess });
    }
}
