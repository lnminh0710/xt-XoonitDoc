import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModal } from '@app/app.constants';
import { ControlGridModel, SearchResultItemModel, WidgetApp } from '@app/models';
import {
    InvoiceApprovalActionNames,
    InvoiceApprovalActions,
} from '@app/pages/invoice-approval/invoice-approval.statemanagement/invoice-approval.actions';
import { InvoiceApprovalSelectors } from '@app/pages/invoice-approval/invoice-approval.statemanagement/invoice-approval.selectors';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { DatatableService } from '@app/services';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    CustomAction,
} from '@app/state-management/store/actions';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { ToasterService } from 'angular2-toaster';
import { filter, takeUntil } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';
import { GuidHelper } from '@app/utilities/guild.helper';
import {
    InvoiceApprovalProcessingActionNames,
    InvoiceApprovalProcessingActions,
} from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.actions';
import { InvoiceApprovalProcessingSelectors } from '@app/pages/invoice-approval-processing/invoice-approval-processing.statemanagement/invoice-approval-processing.selectors';
import {
    FormStatus,
    IWidgetIsAbleToSave,
} from '@app/state-management/store/models/app-global/widget-is-able-to-save.payload.model';
import { AppInjectWigetInstanceIsAbleToSaveAction } from '@app/state-management/store/actions/app-global/app-global.actions';
import { Observable } from 'rxjs/Rx';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { XnAgGridComponent } from '@xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';

import { get, some } from 'lodash-es';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { DataState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { FormControl, FormGroup } from '@angular/forms';
import { MaterialControlType } from '@app/xoonit-share/processing-form/consts/material-control-type.enum';
import { AgCellOcrObject } from '@app/models/approval/ag-cell-ocr.model';
import { Uti } from '@app/utilities';
import { KostnestelleChange } from '@app/state-management/store/actions/app/app.actions';

@Component({
    selector: 'widget-position-detail',
    templateUrl: './widget-position-detail.component.html',
    styleUrls: ['./widget-position-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetPositionDetailComponent
    extends BaseComponent
    implements IWidgetIsAbleToSave, OnInit, OnDestroy, AfterViewInit {
    @Input() globalProperties: any;

    @ViewChild(XnAgGridComponent) xnAgGrid: XnAgGridComponent;

    public dataSource = <ControlGridModel>{
        columns: [],
        data: [],
        totalResults: 0,
    };
    public configSubmitData = [];
    public submitData: any;
    public submitDataDefault: any;
    public isLoading = false;
    public defaultItem = {};

    public uniqueKey = 'Guid';
    public ignoreKeys = `Actions,${this.uniqueKey},DT_RowId`;

    public isDisabled = false;

    private _selectedSearchResultState$: Observable<SearchResultItemModel>;
    constructor(
        protected router: Router,
        private route: ActivatedRoute,
        protected cdRef: ChangeDetectorRef,
        protected store: Store<AppState>,
        protected invoiceApprovalActions: InvoiceApprovalActions,
        protected invoiceApprovalSelectors: InvoiceApprovalSelectors,
        protected invoiceApprovalProcessingActions: InvoiceApprovalProcessingActions,
        protected invoiceApprovalProcessingSelectors: InvoiceApprovalProcessingSelectors,
        protected toastrService: ToasterService,
        private datatableService: DatatableService,
        private appStore: Store<AppState>,
        private dispatcher: ReducerManagerDispatcher,
        private administrationDocSelectors: AdministrationDocumentSelectors,
        private administrationActions: AdministrationDocumentActions,
    ) {
        super(router);

        this._selectedSearchResultState$ = this.appStore.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
        this.onSubscribeAction();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }
    ngOnInit(): void {
        this.store.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
        this.checkParamUrl();
    }
    ngAfterViewInit(): void {
        this.administrationDocSelectors
            .actionOfType$(AdministrationDocumentActionNames.SCAN_OCR_TEXT)
            .pipe(
                filter(
                    (action: CustomAction) => action?.payload?.OriginalColumnName === this.generateIdCurrentCellOcr(),
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action: CustomAction) => {
                const payload = action?.payload;
                if (!payload) return;

                const objectId = this.parseIdCurrentCellOcrToObject(payload.OriginalColumnName);
                const rowNode = this.xnAgGrid.api.getDisplayedRowAtIndex(objectId.rowIndex);
                let value = '';

                let currentValue =
                    (rowNode.data[objectId.colId] && typeof rowNode.data[objectId.colId] === 'object'
                        ? rowNode.data[objectId.colId]?.value
                        : rowNode.data[objectId.colId]) || '';
                if (payload.DataState === DataState.DELETE) {
                    value = currentValue.toString().trim().replace(payload.Value?.trim(), '');
                } else {
                    value = `${currentValue}${payload.Value || ''}`;
                }
                this.xnAgGrid.updateCellByOcr(objectId.colId, value, rowNode);
            });
    }

    validateBeforeSave(): boolean {
        return !this.xnAgGrid.itemsHasCellInvalid.length;
    }
    validateForm(): FormStatus {
        const isValid = !this.xnAgGrid.itemsHasCellInvalid.length;
        const formStatus = <FormStatus>{
            formTitle: 'Position Deatail',
            isValid: isValid,
            errorMessages: ['Data table has some error fields!'],
        };
        return formStatus;
    }
    getDataSave(): { [key: string]: any } {
        // get list data change
        let data = this._getDataFromGrid();

        if (!data.length) return this.submitData;
        // add data to submitData
        data.forEach((element) => {
            if (!Uti.checkItemIsNull(element, this.ignoreKeys)) {
                this.updateSubmitData(element);
            }
        });
        return this.submitData;
    }

    private _getDataFromGrid() {
        const addList = this.xnAgGrid.itemsAdded;
        const editList = this.xnAgGrid.itemsRemoved;
        const delList = this.xnAgGrid.itemsEdited;

        let data = addList.concat(editList);
        if (delList.length) {
            delList.forEach((element) => {
                const index = data.findIndex((x) => x[this.uniqueKey] === element[this.uniqueKey]);
                if (index > -1) {
                    data[index].IsDeleted = true;
                } else {
                    element.IsDeleted = true;
                    data.push(element);
                }
            });
        }
        return data;
    }

    reset() {
        if (this.isDisabled) return;

        const tempData = cloneDeep(this.dataSource);
        tempData.data = [];
        if (!this.isDisabled) {
            tempData.data.push({ ...this.defaultItem });
        }

        this.dataSource = tempData;
        this.submitData = this.submitDataDefault;

        this.cdRef.detectChanges();
    }

    private checkParamUrl() {
        this.route.queryParams.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((params) => {
            const idMainDocument = params['idDocument'] || '';

            this.isDisabled = !!idMainDocument && this.ofModule.idSettingsGUI === ModuleList.Approval.idSettingsGUI;
            if (this.ofModule.idSettingsGUI === ModuleList.Approval.idSettingsGUI) {
                this.store.dispatch(
                    this.invoiceApprovalActions.getInvoiceItemAction({ idMainDocument: idMainDocument }),
                );
            } else if (this.ofModule.idSettingsGUI === ModuleList.ApprovalProcessing.idSettingsGUI) {
                this.store.dispatch(
                    this.invoiceApprovalProcessingActions.getInvoiceItemAction({ idMainDocument: idMainDocument }),
                );
            }
            this.cdRef.detectChanges();
        });
    }
    private onSubscribeAction() {
        this.invoiceApprovalSelectors
            .actionSuccessOfSubtype$(InvoiceApprovalActionNames.GET_INVOICE_ITEM_ACTION)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                this.subscribeGetInvoiceItem(action);
            });
        this.invoiceApprovalProcessingSelectors
            .actionSuccessOfSubtype$(InvoiceApprovalProcessingActionNames.GET_INVOICE_ITEM_ACTION)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                this.subscribeGetInvoiceItem(action);
            });

        this.invoiceApprovalProcessingSelectors
            .actionOfType$(InvoiceApprovalProcessingActionNames.CLEAR_COST_CENTRE_BY_GROUP_IDS)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action: CustomAction) => {
                if (!action?.payload) return;

                const dataRow = this.xnAgGrid.getAllCurentData();
                this.callEventUpdateGroupApprovalConfirm(dataRow, true, action.payload);
            });
    }

    private subscribeGetInvoiceItem(action: CustomAction) {
        this.isLoading = false;
        this.cdRef.detectChanges();

        const response = action?.payload;
        if (!response) {
            this.toastrService.pop(MessageModal.MessageType.error, 'System', `System Error, get list fail!`);

            return;
        }

        const tableData = this.datatableService.buildEditableDataSource([response[0], response[1]]);
        if (!tableData) {
            this.toastrService.pop(
                MessageModal.MessageType.error,
                'System',
                `System Error, transform list export fail!`,
            );
            return;
        }

        // set value for group approval invite to confrm
        this.callEventUpdateGroupApprovalConfirm(tableData.data);

        // --------------- START: build Default Data Row ---------------
        tableData.columns.forEach((element) => {
            if (element.data === 'Actions') {
                const controlType = element?.setting?.Setting?.find((x) => x.ControlType).ControlType;
                this.defaultItem[element.data] = controlType?.SettingDefault;
            } else {
                this.defaultItem[element.data] = '';
            }
        });
        // add new row
        const firstInitRow = this.buildNewRow();
        if (!this.isDisabled) {
            tableData.data.push(firstInitRow);
        }
        // --------------- END: build Default Data Row ---------------

        // set data for ag-grid
        this.dataSource = tableData;
        this.cdRef.detectChanges();

        // --------------- START: build Config Submit Data ---------------
        if (!tableData.columns || !tableData.columns.length) return;

        const configSubmitData = [];
        const submitData = {};
        for (let index = 0; index < tableData.columns.length; index++) {
            const element = tableData.columns[index];
            const callConfigs = element?.setting?.Setting.find((x) => x.CallConfig && x.CallConfig.length)?.CallConfig;
            if (callConfigs && callConfigs.length) {
                const data = callConfigs[0];
                configSubmitData.push(data);

                if (submitData[data?.JsonText?.Name]) {
                    if (submitData[data?.JsonText?.Name][data?.JsonText?.Path]) continue;

                    submitData[data?.JsonText?.Name][data?.JsonText?.Path] = [];
                } else {
                    submitData[data?.JsonText?.Name] = {
                        [data?.JsonText?.Path]: [],
                    };
                }
            }
        }

        this.submitData = submitData;
        this.submitDataDefault = submitData;
        this.configSubmitData = configSubmitData;
        // --------------- END: build Config Submit Data ---------------

        // wait ag-grid finish build, after that add row to list itemsAdded
        if (!this.isDisabled) {
            this.xnAgGrid.itemsAdded.push(firstInitRow);
        }
    }

    private buildNewRow(): any {
        const item = { ...this.defaultItem };
        item[this.uniqueKey] = GuidHelper.generateGUID();
        return item;
    }
    public addRow(event: any, isInit = false) {
        let nextIndex = 0;
        if (!isInit) {
            if (!event || this.isDisabled) return;

            // check object is null, exception Actions
            const isNull = Uti.checkItemIsNull(event, this.ignoreKeys);
            if (isNull) return;

            // check validation
            const isCellInvalid = this.xnAgGrid?.itemsHasCellInvalid.indexOf(event[this.uniqueKey]) > -1;
            if (isCellInvalid) return;
            nextIndex = this.xnAgGrid?.api?.getDisplayedRowCount() || 0;
        }

        this.xnAgGrid.updateFieldsHas1ForAllWhenAddNew(nextIndex - 1);
        this.xnAgGrid.addNewRow(this.buildNewRow(), nextIndex, false);
    }
    public deleteRow(event) {
        if ((!event && !this.dataSource.data.length) || this.isDisabled) return;
        this.xnAgGrid.deleteRowByItem(event);

        const totalRow = this.xnAgGrid.api.getDisplayedRowCount();
        if (totalRow === 0) {
            this.addRow(null, true);
        }
        this._updateBookingNrProperty();

        // set value for group approval invite to confrm
        const dataRow = this.xnAgGrid.getAllCurentData();
        this.callEventUpdateGroupApprovalConfirm(dataRow);
    }
    public onCellValueChanged(event) {
        const isNull = Uti.checkItemIsNull(event, this.ignoreKeys);
        event['Actions'] = this.doUpdateValueActionField(event['Actions'], isNull ? '0' : '1');
        this.xnAgGrid.updateRowData([event], false);
        this._updateBookingNrProperty();

        if (event['CostCentre']) {
            const dataRow = this.xnAgGrid.getAllCurentData();
            this.callEventUpdateGroupApprovalConfirm(dataRow);
        }
    }
    public onFocusedCell(event) {
        const idCell = this.generateIdCurrentCellOcr();
        if (!idCell) return;

        const formFocus = {
            fieldOnFocus: idCell,
            formOnFocus: new FormGroup({ idCell: new FormControl() }),
            documentFormName: '',
            isFieldImageCrop: false,
            fieldConfig: {
                type: MaterialControlType.INPUT,
            },
        };
        this.store.dispatch(this.administrationActions.setFieldFormOnFocus(formFocus as any));
    }

    private generateIdCurrentCellOcr(): string {
        const cell = this.xnAgGrid.getFocusedCell();
        if (!cell || !cell.column) return '';

        const idCell = `${cell.column['colId']}_${cell.rowIndex}`;
        return idCell;
    }
    private parseIdCurrentCellOcrToObject(idCellString: string): AgCellOcrObject {
        if (!idCellString) return;

        const obj = idCellString.split('_');
        return <AgCellOcrObject>(<unknown>{
            colId: obj[0],
            rowIndex: obj[1],
        });
    }

    private doUpdateValueActionField(actionData: string, value: string): string {
        const data = JSON.parse(actionData);
        data['isShowDel'] = value;
        return JSON.stringify(data);
    }
    public update1ForAllAction(event) {
        this.xnAgGrid.onUpdate1ForAllWhenEdit(event, this.ignoreKeys);
    }

    private updateSubmitData(rowData: any, isDel = false) {
        if (!rowData || this.isDisabled || !rowData[this.uniqueKey]) return;
        const data = { ...rowData };
        const submitItem = cloneDeep(this.submitDataDefault);

        // set key to item if item is object type
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const element = data[key];
                if (element && typeof element === 'object') {
                    data[key] = element['key'];
                }
            }
        }

        // create data by config
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const element = data[key];

                const config = this.configSubmitData.find((x) => x.OriginalColumn === key);
                if (!config) continue;

                if (submitItem[config.JsonText.Name][config.JsonText.Path][0]) {
                    submitItem[config.JsonText.Name][config.JsonText.Path][0][config.Alias] = element;
                } else {
                    submitItem[config.JsonText.Name][config.JsonText.Path].push({ [config.Alias]: element });
                }
            }
        }
        for (const keyName in submitItem) {
            if (Object.prototype.hasOwnProperty.call(submitItem, keyName)) {
                const elementName = submitItem[keyName];
                for (const keyPath in elementName) {
                    if (Object.prototype.hasOwnProperty.call(elementName, keyPath)) {
                        const elementPath = elementName[keyPath];
                        const elementPathData = elementPath[0];

                        const indexEditItem = this.submitData[keyName][keyPath].findIndex(
                            (x) => x[this.uniqueKey] === elementPathData[this.uniqueKey],
                        );
                        if (indexEditItem === -1) {
                            this.submitData[keyName][keyPath].push(elementPathData);
                        } else {
                            this.submitData[keyName][keyPath][indexEditItem] = elementPathData;
                        }
                    }
                }
            }
        }
    }

    private _updateBookingNrProperty() {
        const dataGrid = this._getDataFromGrid();
        this.appStore.dispatch(
            this.invoiceApprovalProcessingActions.updateBookingNrProperty(
                some(dataGrid, (_d) => !!get(_d, ['ChartOfAccounts', 'key'])),
            ),
        );
    }

    private callEventUpdateGroupApprovalConfirm(rowData: any, isClear = false, idClearList = []) {
        let idList = [];
        if (rowData?.length) {
            for (let index = 0; index < rowData.length; index++) {
                const element = rowData[index];

                for (const keyObj in element) {
                    if (keyObj !== 'CostCentre') continue;
                    if (Object.prototype.hasOwnProperty.call(element, keyObj)) {
                        const elementObj = element[keyObj];

                        if (isClear) {
                            if (!elementObj || !elementObj['key'] || !idClearList.includes(elementObj['key'])) continue;

                            const rowNode = this.xnAgGrid.api.getDisplayedRowAtIndex(index);
                            this.xnAgGrid.updateCellValue(keyObj, null, rowNode);
                        } else {
                            if (!elementObj || !elementObj['key']) continue;
                            idList.push(elementObj['key']);
                        }
                        continue;
                    }
                }
            }
        }

        if (isClear) return;
        this.store.dispatch(
            new KostnestelleChange({
                kostnestelleData: {
                    type: WidgetApp.WidgetPositionDetail,
                    data: idList,
                },
            }),
        );
    }
}
