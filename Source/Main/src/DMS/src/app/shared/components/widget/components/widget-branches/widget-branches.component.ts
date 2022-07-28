import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { BranchService } from '@app/services';
import { ControlGridColumnModel, ControlGridModel, Module } from '@app/models';

import get from 'lodash-es/get';
import _filter from 'lodash-es/filter';
import upperFirst from 'lodash-es/upperFirst';

import { HeaderNoticeRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-notice-ref';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { filter, take, takeUntil } from 'rxjs/operators';
import { BranchActions, CustomAction, ModuleActions } from '@app/state-management/store/actions';
import { WidgetBranchModifyComponent } from '@app/xoonit-share/components/widget-branch-modify/widget-branch-modify.component';
import { PopupCloseEvent } from '@app/xoonit-share/components/global-popup/popup-ref';
import { AppState } from '@app/state-management/store';
import { HeaderConfirmationRef } from '@app/xoonit-share/components/global-popup/components/header-popup/header-confirmation-ref';
import { OctopusCompanyEnum } from '@app/models/octopus-document.model';

@Component({
    selector: 'widget-branches',
    templateUrl: './widget-branches.component.html',
    styleUrls: ['./widget-branches.component.scss'],
})
export class WidgetBranchesComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() globalProperties: any;

    public dataSource = <ControlGridModel>{
        columns: [],
        data: [],
        totalResults: 0,
    };
    formGroup: FormGroup;
    headquarter: any;
    isEmpty = true;
    isLoading = false;
    isShowUpload = false;
    itemDelete = null;
    that: any;
    @ViewChild('confirmDelete') confirmDelete: TemplateRef<any>;

    constructor(
        protected router: Router,
        private branchService: BranchService,
        private ref: ChangeDetectorRef,
        private popupService: PopupService,
        private formBuilder: FormBuilder,
        private dispatcher: ReducerManagerDispatcher,
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
    ) {
        super(router);
        this._buildForm();
    }

    ngOnInit() {
        this.that = this;
        this._subscribe();
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    public editBranch(item) {
        this.showDialogModifyBrand(item.ID, item);
    }

    public searchWithBranch(value) {
        const module = new Module({ idSettingsGUI: -1, searchKeyword: value, isCanSearch: true });
        this.store.dispatch(this.moduleActions.searchKeywordModule(module));
    }

    public makeContextMenu(data?: any) {
        const d = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const element = data[key];
                if (key === 'id') {
                    d['ID'] = element;
                } else {
                    d[upperFirst(key)] = element;
                }
            }
        }

        return this.makeMenuRightClick(d);
    }

    public makeMenuRightClick(data: any) {
        const result = [];
        result.push(
            {
                name: 'Edit',
                icon: `<i class="fal fa-pencil blue-color ag-context-icon"/>`,
                action: (event) => {
                    this.editBranch(data);
                },
            },
            {
                name: 'Delete',
                icon: `<i class="fal fa-trash blue-color ag-context-icon"/>`,
                action: (event) => {
                    this.deleteBranch(data);
                },
                disabled: true,
            },

            {
                name: 'Context_Menu__Search_Branch',
                icon: `<i class="fal fa-search blue-color ag-context-icon"/>`,
                action: (event) => {
                    this.searchWithBranch(data.BranchNr);
                },
            },
            'separator',
        );

        return result;
    }

    public deleteBranch(item) {
        this.itemDelete = item;
        this.popupService.open({
            content: this.confirmDelete,
            hasBackdrop: true,
            header: new HeaderNoticeRef({ iconClose: true }),
            width: 350,
            disableCloseOutside: true,
        });
    }

    public handleDelete(close) {
        this.branchService
            .updateBranch({ IdBranches: this.itemDelete?.IdBranches, B09Branches_IsDeleted: 1 })
            .subscribe((res) => {
                this.itemDelete = null;
                close();
            });
    }

    public openUploadPopup() {}

    public onCloseUploadDialog() {
        this.isShowUpload = false;
        this.ref.detectChanges();
    }

    private _getBranches(IdBranches: any) {
        this.isLoading = true;
        this.branchService.getBranchByHeadquarter(IdBranches).subscribe(
            (res) => {
                const columnSetting: any[] =
                    get(JSON.parse(get(res, ['item', 0, 0, 'SettingColumnName']) || '[]'), [1, 'ColumnsName']) || [];

                const data = get(res, ['item', 1]) || [];
                this.dataSource = new ControlGridModel({
                    columns: columnSetting.map((col) => {
                        return new ControlGridColumnModel({
                            title: col.ColumnHeader,
                            data: col.ColumnName,
                            dataType: col.DataType,
                            readOnly: true,
                            visible: get(col, ['Setting', 0, 'DisplayField', 'Hidden']) === '0',
                            setting: {
                                Setting: col.Setting || [],
                            },
                        });
                    }),
                    data,
                    totalResults: data.length,
                });
                this.isLoading = false;
            },
            (err) => {
                this.isLoading = false;
                this.ref.detectChanges();
            },
        );
    }

    private _buildForm() {
        this.formGroup = this.formBuilder.group({
            files: [null, Validators.required],
        });
    }
    private _subscribe() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === BranchActions.LOAD_BRANCHES;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                const headquarterData = action.payload;
                if (
                    !headquarterData ||
                    (this.headquarter &&
                        this.headquarter[OctopusCompanyEnum.companyId] ===
                            headquarterData[OctopusCompanyEnum.companyId])
                )
                    return;
                this.isEmpty = false;
                this.headquarter = headquarterData;
                this._getBranches(headquarterData[OctopusCompanyEnum.companyId]);
            });
    }
    public showDialogModifyBrand(idKey?: string, branchItem?: any) {
        const currentWidth = window.screen.width;
        const titleObj = <HeaderConfirmationRef>{
            title: idKey ? 'Update Branch' : 'Add new Branch',
            icon: {
                type: 'text',
                content: `Headquarter: ${this.headquarter[OctopusCompanyEnum.companyName]}`,
            },
        };
        const popupRef = this.popupService.open({
            content: WidgetBranchModifyComponent,
            hasBackdrop: true,
            header: titleObj,
            disableCloseOutside: true,
            width: (currentWidth * 50) / 100,
            data: {
                idHeadquarter: this.headquarter[OctopusCompanyEnum.companyId],
                idKey,
                branchItem,
            },
        });
        popupRef.afterClosed$.pipe(take(1)).subscribe(({ type, data }: PopupCloseEvent<any>) => {
            if (type === 'close' && data?.isSuccess) {
                this._getBranches(this.headquarter[OctopusCompanyEnum.companyId]);
            }
        });
    }
}
