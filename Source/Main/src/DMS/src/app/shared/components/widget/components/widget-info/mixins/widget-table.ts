import { ViewChild, ViewChildren, Input, QueryList, ChangeDetectorRef } from '@angular/core';
import {
    WidgetDetail,
    WidgetType,
    Module,
    FieldFilter,
    ColumnLayoutSetting,
    WidgetPropertyModel,
    ApiResultResponse,
    WidgetState,
    RowSetting,
} from '@app/models';
import { MessageModal, MenuModuleId, RepWidgetAppIdEnum } from '@app/app.constants';
import { WidgetUtils } from '../../../utils';
import {
    WidgetTemplateSettingService,
    DatatableService,
    PropertyPanelService,
    GlobalSettingService,
    ArticleService,
    PersonService,
    ModalService,
} from '@app/services';
import { Constructor } from './constructor';
import { WidgetDetailInfo, WidgetMenu, WidgetAction } from './widget-base-mixin';
import { Uti } from '@app/utilities/uti';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import cloneDeep from 'lodash-es/cloneDeep';
import uniqBy from 'lodash-es/uniqBy';
import { XnWidgetMenuStatusComponent } from '../../xn-widget-menu-status';
import { XnFileExplorerComponent } from '../../../../xn-file';

import { FilterModeEnum } from '@app/app.constants';
//import { ArticleMediaManagerComponent, ArticleDetailUploadComponent } from '@app/shared/components/article-media-manager';
import { Observable, of } from 'rxjs';
import { WidgetRoleTreeGridComponent } from '../../widget-role-tree-grid';
//import { HistoryContainerComponent } from '@app/shared/components/customer-history';
import { XnAgGridComponent } from '@app/shared/components/xn-control/xn-ag-grid/pages/ag-grid-container/xn-ag-grid.component';
import isObject from 'lodash-es/isObject';
import groupBy from 'lodash-es/groupBy';
import { map, finalize } from 'rxjs/operators';

export interface TableServiceInjector {
    widgetTemplateSettingService: WidgetTemplateSettingService;
    datatableService: DatatableService;
    propertyPanelService: PropertyPanelService;
    globalSettingService: GlobalSettingService;
    articleService: ArticleService;
    personService: PersonService;
    modalService: ModalService;
    changeDetectorRef: ChangeDetectorRef;
    widgetUtils: WidgetUtils;
}

export function MixinWidgetTable<T extends Constructor<TableServiceInjector>>(base: T) {
    abstract class AbstractWidgetTableBase extends base implements WidgetDetailInfo, WidgetMenu, WidgetAction {
        // Only effect for EDIT TABLE MODE
        // Default TRUE for Edit Mode
        public allowEditRow = false;
        public allowRowDelete = false;
        public allowNewRowAdd = false;
        public allowMediaCode = false;
        public allowFitColumn = false;
        public showTotalRow = false;
        public rowGrouping = false;
        public pivoting = false;
        public columnHeader = false;
        public allowColTranslation = false;
        public allowTreeView = false;
        public columnLayoutsetting: ColumnLayoutSetting = null;
        public rowSetting: RowSetting = null;
        public columnLayout: string = null;
        public isDeletedFiles = false;
        public isOnEditFileExplorer = false;
        protected selectedRowsData: any;
        public templateId: any;
        public isCustomerStatusWidgetEdit = false;
        public selectedNodes;
        public rowSelection = 'single';
        public groupTotal: number;
        public groupNumber: number = 1;
        public isEditAllWidgetMode = false;
        public allowMasterDetail: boolean;
        public masterDetailComponent: string;
        public allowRowDrag: boolean;
        public allowRowNumer: boolean;

        public get agGridComponent(): XnAgGridComponent {
            if (this.widgetAgGridComponent && this.widgetAgGridComponent.length) {
                const agGrid = this.widgetAgGridComponent.find((p) => p.isActivated);
                if (agGrid) {
                    return agGrid;
                }
            }
            return null;
        }

        /**
         * Get treeGridComponent
         */
        public get treeGridComponent(): WidgetRoleTreeGridComponent {
            if (this.widgetTreeGridComponent && this.widgetTreeGridComponent.length) {
                const treeGrid = this.widgetTreeGridComponent.find((p) => p.isActivated);
                if (treeGrid) {
                    return treeGrid;
                }
            }
            return null;
        }

        constructor(...args: any[]) {
            super(...args);
        }

        // Implement interface WidgetDetailInfo Widget
        abstract get widgetStatesInfo(): Array<WidgetState>;
        abstract get dataInfo(): WidgetDetail;
        abstract get moduleInfo(): Module;
        abstract get showInDialogStatus(): boolean;
        abstract get widgetEditedStatus(): boolean;
        abstract get propertiesInfo(): WidgetPropertyModel[];
        abstract get columnFilterInfo(): any;
        abstract get widgetAgGridComponent(): QueryList<XnAgGridComponent>;
        abstract get widgetTreeGridComponent(): QueryList<WidgetRoleTreeGridComponent>;
        //abstract get historyContainerGridComponent(): HistoryContainerComponent;

        abstract get xnFileExplorerComponentCtrl(): XnFileExplorerComponent;
        //abstract get articleMediaManagerComponent(): ArticleMediaManagerComponent;
        //abstract get articleDetailUploadComponent(): ArticleDetailUploadComponent;

        // Implement interface Menu Widget
        abstract get selectedFilterInfo(): FilterModeEnum;
        abstract get selectedSubFilterInfo(): FilterModeEnum;
        abstract get fieldFiltersInfo(): Array<FieldFilter>;
        abstract get widgetMenuStatusInfo(): XnWidgetMenuStatusComponent;
        abstract controlMenuStatusToolButtons(value: boolean);
        abstract editWidget(widgetType?: any);
        abstract onHiddenWidgetInfoTranslation(event?: any);
        abstract reEditWhenInPopup();

        // Implement interface Action Widget
        abstract cancelEditingWidget(data: WidgetDetail);
        abstract saveSuccessWidget(data: WidgetDetail);
        abstract editingWidget(data: WidgetDetail);
        abstract updateWidgetEditedStatus(status: boolean);
        abstract checkToShowCommandButtons(makeCommandButsHidden?: boolean);

        /**
         * getSelectedTableState
         */
        private getSelectedTableState() {
            if (this.widgetStatesInfo && this.widgetStatesInfo.length) {
                const selectedState = this.widgetStatesInfo.find((p) => p.selected);
                return selectedState.tableData;
            }
            return null;
        }

        /***** Get & Set DataSource ******/
        /**
         * Get dataSourceTable
         */
        public get dataSourceTable(): any {
            const tableData = this.getSelectedTableState();
            if (tableData) {
                return tableData.dataSourceTable;
            }
            return null;
        }

        /**
         * Set dataSourceTable
         */
        public set dataSourceTable(data) {
            const tableData = this.getSelectedTableState();
            if (tableData) {
                // In view mode, create new reference to re-render grid
                if (!this.widgetEditedStatus || !tableData.dataSourceTable) {
                    tableData.dataSourceTable = data;
                }
                // In Edit mode, keep the current reference to keep current state of grid.
                else {
                    tableData.dataSourceTable.columns = data.columns;
                    tableData.dataSourceTable.data = data.data;
                }
            }
        }

        public clearDataSourceData() {
            const tableData = this.getSelectedTableState();
            if (tableData) {
                tableData.dataSourceTable = Object.assign({ ...tableData.dataSourceTable, data: [] });
            }
        }
        /***** Get & Set DataSource *****/

        /***** Get & Set CopiedData *****/
        /**
         * Get copiedData
         */
        public get copiedData(): any {
            const tableData = this.getSelectedTableState();
            if (tableData) {
                return tableData.copiedData;
            }
            return null;
        }

        /**
         * Set copiedData
         */
        public set copiedData(data) {
            const tableData = this.getSelectedTableState();
            if (tableData) {
                tableData.copiedData = data;
            }
        }
        /***** Get & Set CopiedData *****/

        /***** Get & Set isOnEditingTable *****/
        /**
         * Get isOnEditingTable
         */
        public get isOnEditingTable(): any {
            const tableData = this.getSelectedTableState();
            if (tableData) {
                return tableData.isOnEditingTable;
            }
            return null;
        }

        /**
         * Set isOnEditingTable
         */
        public set isOnEditingTable(data) {
            const tableData = this.getSelectedTableState();
            if (tableData) {
                tableData.isOnEditingTable = data;
            }
        }
        /***** Get & Set isOnEditingTable *****/

        /***** Get & Set isTableEdited *****/
        /**
         * Get isTableEdited
         */
        public get isTableEdited(): any {
            const tableData = this.getSelectedTableState();
            if (tableData) {
                return tableData.isTableEdited;
            }
            return null;
        }

        /**
         * Set isTableEdited
         */
        public set isTableEdited(data) {
            const tableData = this.getSelectedTableState();
            if (tableData) {
                tableData.isTableEdited = data;
            }
        }
        /***** Get & Set isOnEditingTable *****/

        protected updateDataSourceFromDataTable(_dataSourceTable?: any) {
            this.copiedData = cloneDeep(this.dataInfo);
            let dataSourceTable = this.dataSourceTable;
            if (_dataSourceTable) dataSourceTable = _dataSourceTable;
            if (!dataSourceTable || !dataSourceTable.data) return;
            // update data of
            if (this.dataInfo.idRepWidgetType === WidgetType.Combination) {
                this.copiedData.contentDetail.data[2][0].collectionData = Uti.convertDataFromEditableToSource(
                    dataSourceTable.data,
                    this.dataInfo.contentDetail.data[2][0].collectionData,
                );
            } else if (
                this.dataInfo.idRepWidgetType === WidgetType.EditableTable ||
                this.dataInfo.idRepWidgetType === WidgetType.EditableGrid ||
                this.dataInfo.idRepWidgetType === WidgetType.EditableRoleTreeGrid
            ) {
                this.copiedData.contentDetail.collectionData = Uti.convertDataFromEditableToSource(
                    dataSourceTable.data,
                    this.dataInfo.contentDetail.collectionData,
                );
            }
        }

        protected rebuildComboboxData(dataSourceTable) {
            for (const dt of dataSourceTable.data) {
                for (const prop in dt) {
                    if (typeof dt[prop] === 'object' && dt[prop] && dt[prop]['key']) {
                        dt[prop] = dt[prop]['key'];
                    }
                }
            }

            return dataSourceTable;
        }

        protected manageEditableTableStatusButtonsAfterSaving() {
            if (
                this.dataInfo.idRepWidgetType !== WidgetType.Combination &&
                this.dataInfo.idRepWidgetType !== WidgetType.EditableTable &&
                this.dataInfo.idRepWidgetType !== WidgetType.EditableGrid &&
                this.dataInfo.idRepWidgetType !== WidgetType.EditableRoleTreeGrid
            ) {
                return;
            }

            if (this.widgetMenuStatusInfo) {
                this.widgetMenuStatusInfo.manageAddRowTableButtonStatus(false);
                this.widgetMenuStatusInfo.manageDeleteRowTableButtonStatus(true);
            }
            this.isOnEditingTable = false;
            this.isTableEdited = false;
            this.changeToEditModeDefault();
        }

        /**
         * saveEditableTableWidget
         */
        protected saveEditableTableWidget() {
            if (this.agGridComponent) {
                this.agGridComponent.stopEditing();
            }

            setTimeout(() => {
                if (!this.dataSourceTable || !this.dataSourceTable.data) return;

                if (this.allowColTranslation) {
                    this.saveColTranslation().then((rs) => {
                        this.updateTableWidget();
                    });
                } else {
                    this.updateTableWidget();
                }
            }, 200);
        }

        private resetWidgetToolbar() {
            if (
                this.dataInfo &&
                (this.dataInfo.idRepWidgetApp == 111 ||
                    this.dataInfo.idRepWidgetApp == 112 ||
                    this.dataInfo.idRepWidgetApp == 113 ||
                    this.dataInfo.idRepWidgetApp == 114 ||
                    this.dataInfo.idRepWidgetApp == 126)
            ) {
                this.widgetMenuStatusInfo.toggleEditTemplateMode(false);
                this.templateId = null;
            }
        }

        /**
         * getSavingDataTable
         **/
        public getSavingDataTable() {
            if (this.agGridComponent) {
                if (this.agGridComponent.hasError()) {
                    this.reEditWhenInPopup();
                    return null;
                }

                this.isTableEdited = this.agGridComponent.hasUnsavedRows();
            }

            if (!this.isTableEdited) {
                const ignoreDirtyCheck =
                    this.dataInfo.idRepWidgetApp == RepWidgetAppIdEnum.CountryCustomerDoublette ||
                    (!!this.widgetMenuStatusInfo && !!this.widgetMenuStatusInfo.selectedTemplate) ||
                    this.widgetUtils.isSwitchToEditModeWidget(this.dataInfo);
                if (!ignoreDirtyCheck) {
                    this.isOnEditingTable = false;
                    this.reEditWhenInPopup();
                    return null;
                }
            }

            let _dataSourceTable = this.dataSourceTable;
            if (this.agGridComponent) {
                const wijmoGridData = this.agGridComponent.getEditedItems();
                _dataSourceTable = Uti.mergeWijmoGridData(this.dataSourceTable, wijmoGridData);
            }

            _dataSourceTable = this.rebuildComboboxData(_dataSourceTable);

            this.updateDataSourceFromDataTable(_dataSourceTable);

            // TODO: NTH
            let key, value;
            const isCustomerDoubletteWidget = this.isDoubletteWidget();
            if (!isCustomerDoubletteWidget) {
                key = Object.keys(this.dataInfo.widgetDataType.listenKeyRequest(this.moduleInfo.moduleNameTrim))[0];
                value = this.dataInfo.widgetDataType.listenKeyRequest(this.moduleInfo.moduleNameTrim)[key];
            }

            const updateData = Uti.mapDataSourceToDataUpdateByColumnSetting(
                this.copiedData.contentDetail,
                key,
                value,
                this.widgetMenuStatusInfo ? this.widgetMenuStatusInfo.selectedTemplate : null,
                this.copiedData,
            );
            return updateData;
        }

        /**
         * updateTableWidget
         */
        private updateTableWidget() {
            const updateData = this.getSavingDataTable();
            // Custom param in JSON Request String in some special cases.
            let updateRequest = this.updateRequestInfo();
            this.widgetTemplateSettingService
                .updateWidgetInfo(
                    updateData,
                    updateRequest,
                    null,
                    null,
                    (s: string) => {
                        return s.replace(/"/g, '\\\\"');
                    },
                    null,
                )
                .subscribe((rs) => {
                    this.manageEditableTableStatusButtonsAfterSaving();
                    this.cancelEditingWidget(this.dataInfo);
                    this.saveSuccessWidget(this.dataInfo);
                    this.copiedData = null;
                    this.reEditWhenInPopup();
                });
        }

        /**
         * Update optional param in JSON Request String in some special cases.
         **/
        private updateRequestInfo() {
            let updateRequest = this.dataInfo.updateRequest;
            const isCustomerDoubletteWidget = this.isDoubletteWidget();
            if (isCustomerDoubletteWidget) {
                let matchingGroupId = '';
                const nodeItems = this.agGridComponent.getCurrentNodeItems();
                for (let i = 0; i < nodeItems.length; i++) {
                    if (nodeItems[i]['MatchingGroup']) {
                        matchingGroupId = nodeItems[i]['MatchingGroup'];
                        break;
                    }
                }
                updateRequest = this.dataInfo.updateRequest.replace('<<MatchingGroup>>', matchingGroupId);
            }
            return updateRequest;
        }

        /**
         * isDoubletteWidget
         **/
        private isDoubletteWidget() {
            return (
                this.dataInfo.idRepWidgetApp == RepWidgetAppIdEnum.CustomerDoublette ||
                this.dataInfo.idRepWidgetApp == RepWidgetAppIdEnum.CountryCustomerDoublette
            );
        }

        /**
         * onTableEditStart
         * @param eventData
         */
        protected onTableEditStart(eventData) {
            this.isOnEditingTable = true;
            this.controlMenuStatusToolButtons(true);
        }

        /**
         * onTableEditEnd
         * @param eventData
         */
        protected onTableEditEnd(eventData) {
            if (this.isEditAllWidgetMode) {
                return;
            }

            if (
                !eventData ||
                (!this.widgetMenuStatusInfo.isEditTemplateMode && eventData && eventData.cellType !== 'checkbox')
            ) {
                if (!this.isTableEdited) {
                    this.isOnEditingTable = false;
                    this.controlMenuStatusToolButtons(false);
                }
            }
            this.changeToEditModeDefault();
        }

        /**
         * updateDataTranslateAfterEdittingLanguage
         * @param itemRow
         */
        private updateDataTranslateAfterEdittingLanguage(editItemRow: any) {
            if (this.allowColTranslation) {
                editItemRow['isedited'] = true;

                const colTranslate = this.dataInfo.widgetDataType.editTableSetting.colTranslate;
                const translateValue = editItemRow[colTranslate];
                const salesPrice = editItemRow.SalesPrice;
                if (this.dataSourceTable && this.dataSourceTable.data && this.dataSourceTable.data.length) {
                    let collectionItems: Array<any> = this.dataSourceTable.data;
                    collectionItems.forEach((item) => {
                        if (item.IdRepLanguage && item.IdRepLanguage == editItemRow.IdRepLanguage) {
                            if (!item.ArticleNameShort && translateValue) {
                                item.ArticleNameShort = translateValue;
                                item['isedited'] = true;
                            }
                        }
                        if (item.CurrencyCode && item.CurrencyCode == editItemRow.CurrencyCode) {
                            if (!item.SalesPrice && salesPrice) {
                                item.SalesPrice = salesPrice;
                                item['isedited'] = true;
                            }
                        }
                    });
                }
                this.agGridComponent.refresh();
            }
        }

        /**
         * onItemsEditedTranslateData
         * @param $event
         */
        protected onItemsEditedTranslateData(items: Array<any>) {
            let isEdited: boolean;
            if (items && items.length) {
                items.forEach((editedItem) => {
                    if (this.dataSourceTable && this.dataSourceTable.data && this.dataSourceTable.data.length) {
                        let collectionItems: Array<any> = this.dataSourceTable.data;
                        collectionItems.forEach((item) => {
                            if (item.IdRepLanguage && item.IdRepLanguage == editedItem.IdRepLanguage) {
                                item.ArticleNameShort = editedItem.TranslateText;
                                item['isedited'] = true;
                                isEdited = true;
                            }
                        });
                    }
                });
            }
            if (isEdited) {
                this.agGridComponent.refresh();
                this.onTableEditStart(true);
            }
        }

        /**
         * onCloseTranslationDialog
         */
        protected onCloseTranslationDialog() {
            this.changeDetectorRef.detectChanges();
        }

        /**
         * onTableEditSuccess
         * @param eventData
         */
        protected onTableEditSuccess(eventData) {
            this.isOnEditingTable = true;
            this.isTableEdited = true;
            this.controlMenuStatusToolButtons(true);
            this.editingWidget(this.dataInfo);
            this.checkToShowFilterTableOnMenuToolbar();
            if (this.allowColTranslation) {
                this.updateDataTranslateAfterEdittingLanguage(eventData);
            }
        }

        protected checkToShowFilterTableOnMenuToolbar() {
            if (this.widgetMenuStatusInfo) {
                this.widgetMenuStatusInfo.handleShowFilterTable(true);
            }
        }

        protected deleteRowEditableTable(): void {
            if (this.widgetMenuStatusInfo) {
                this.widgetMenuStatusInfo.manageDeleteRowTableButtonStatus(true);
            }

            if (this.agGridComponent) {
                this.agGridComponent.deleteRows();
            }

            if (this.xnFileExplorerComponentCtrl) {
                this.xnFileExplorerComponentCtrl.deleteFiles();
            }
        }

        protected addRowEditableTable(): void {
            if (this.widgetMenuStatusInfo) {
                this.widgetMenuStatusInfo.manageAddRowTableButtonStatus(true);
            }

            if (this.agGridComponent) {
                this.agGridComponent.addNewRow();
            }
        }

        protected onRowMarkedAsDeleted(eventData) {
            if (!isNil(eventData)) {
                if (this.widgetMenuStatusInfo) {
                    this.widgetMenuStatusInfo.manageDeleteRowTableButtonStatus(eventData.disabledDeleteButton);

                    if (eventData.enableAddButtonCommand) {
                        this.widgetMenuStatusInfo.manageAddRowTableButtonStatus(false);
                    }
                }
                if (eventData.showCommandButtons) {
                    if (
                        this.dataInfo.idRepWidgetType === WidgetType.FileExplorer ||
                        this.dataInfo.idRepWidgetType === WidgetType.ToolFileTemplate ||
                        this.dataInfo.idRepWidgetType === WidgetType.FileExplorerWithLabel ||
                        this.dataInfo.idRepWidgetType === WidgetType.FileTemplate
                    ) {
                        const isOnEditFileExplorerOld = this.isOnEditFileExplorer;
                        this.isOnEditFileExplorer = true;
                        this.controlMenuStatusToolButtons(true);
                        if (this.widgetMenuStatusInfo && !this.isDeletedFiles) {
                            if (
                                this.dataInfo.idRepWidgetType === WidgetType.FileExplorerWithLabel ||
                                this.dataInfo.idRepWidgetType === WidgetType.FileTemplate
                            ) {
                                if (!isOnEditFileExplorerOld) {
                                    this.widgetMenuStatusInfo.manageSaveTableButtonStatus(true);
                                }
                            } else {
                                this.widgetMenuStatusInfo.manageSaveTableButtonStatus(true);
                            }
                        }
                    } else {
                        this.isOnEditingTable = true;
                        this.controlMenuStatusToolButtons(true);
                    }
                } else if (this.checkToShowCommandButtons(eventData.showCommandButtons === false)) {
                    this.isOnEditingTable = false;
                    this.controlMenuStatusToolButtons(false);
                }
            }
        }

        protected onTableDeleteRowSuccess(eventData) {
            if (eventData && eventData.length) {
                for (const itemData of eventData) {
                    this.dataSourceTable = this.datatableService.updateDataSourceTable(
                        this.dataSourceTable,
                        { data: [itemData] },
                        true,
                    );
                    if (itemData && itemData.isNew) {
                        this.widgetMenuStatusInfo.manageAddRowTableButtonStatus(false);
                    } else if (
                        isNil(this.dataSourceTable.data.find((item) => item && item.isNew)) &&
                        this.widgetMenuStatusInfo
                    ) {
                        this.widgetMenuStatusInfo.manageAddRowTableButtonStatus(false);
                    }
                }
                this.isOnEditingTable = true;

                this.isTableEdited = true;
                this.editingWidget(this.dataInfo);
                this.checkToShowFilterTableOnMenuToolbar();
            }
        }

        protected updateDataSourceCloumnSettings() {
            if (!this.copiedData || !this.copiedData.contentDetail) return;
            // update data of
            if (this.dataInfo.idRepWidgetType === WidgetType.Combination) {
                if (this.copiedData.contentDetail && this.copiedData.contentDetail.data) {
                    this.copiedData.contentDetail.data[2][0].columnSettings = this.datatableService.updateTableColumnSettings(
                        this.selectedSubFilterInfo,
                        this.fieldFiltersInfo,
                        this.copiedData.contentDetail.data[2][0].columnSettings,
                        this.copiedData.contentDetail.data[2][0].collectionData,
                    );
                }
            } else {
                this.copiedData.contentDetail.columnSettings = this.datatableService.updateTableColumnSettings(
                    this.selectedFilterInfo,
                    this.fieldFiltersInfo,
                    this.copiedData.contentDetail.columnSettings,
                    this.copiedData.contentDetail.collectionData,
                );
            }
        }

        /**
         * formatTableSetting
         */
        protected formatTableSetting() {
            if (this.dataInfo.widgetDataType && this.dataInfo.widgetDataType.editTableSetting) {
                this.allowEditRow = this.dataInfo.widgetDataType.editTableSetting.allowEditRow;
                this.allowRowDelete = this.dataInfo.widgetDataType.editTableSetting.allowRowDelete;
                this.allowNewRowAdd = this.dataInfo.widgetDataType.editTableSetting.allowNewRowAdd;
                this.allowMediaCode = this.dataInfo.widgetDataType.editTableSetting.allowMediaCode;
                this.allowColTranslation = this.dataInfo.widgetDataType.editTableSetting.allowColTranslation;
                this.allowTreeView = this.dataInfo.widgetDataType.editTableSetting.allowTreeView;
                this.allowMasterDetail = this.dataInfo.widgetDataType.editTableSetting.allowMasterDetail;
                if (this.allowMasterDetail) {
                    this.masterDetailComponent = this.dataInfo.widgetDataType.editTableSetting.masterDetail;
                }

                if (this.columnLayoutsetting) {
                    this.allowFitColumn = this.columnLayoutsetting.isFitWidthColumn;
                }

                if (this.rowSetting) this.showTotalRow = this.rowSetting.showTotalRow;
            }
            if (this.dataInfo.idRepWidgetApp == RepWidgetAppIdEnum.UserList) {
                this.rowSelection = 'multiple';
            }
            //if (this.dataInfo.idRepWidgetApp == RepWidgetAppIdEnum.DocumentAssignment) {
            //    this.allowMasterDetail = true;
            //}
        }

        /**
         * buildDatatable
         * @param contentDetail
         */
        protected buildDatatable(contentDetail) {
            const datasource = this.datatableService.buildDataSource(contentDetail);
            this.dataSourceTable = datasource;
            // Filter here
            if (this.columnFilterInfo) {
                this.dataSourceTable.data = this.filterData(this.dataSourceTable.data);
            }

            if (this.dataInfo.idRepWidgetApp == RepWidgetAppIdEnum.CountryCustomerDoublette) {
                this.groupNumber = 1;
                if (this.dataSourceTable.data && this.dataSourceTable.data.length) {
                    const groupData = groupBy(this.dataSourceTable.data, 'MatchingGroup');
                    if (groupData) {
                        let keys = Object.keys(groupData);
                        if (keys.length) {
                            this.groupTotal = keys.length;
                            this.dataSourceTable.data = groupData[keys[0]];
                        }
                    }
                }
            }
        }

        protected changeToEditModeDefault() {
            switch (this.dataInfo.idRepWidgetApp) {
                // For this widget, we always display Save Button
                case RepWidgetAppIdEnum.CountryCustomerDoublette:
                    this.onTableEditStart(true);
                    if (this.widgetMenuStatusInfo) {
                        this.widgetMenuStatusInfo.showToolButtons = true;
                        this.widgetMenuStatusInfo.isShowToolButtonsWihoutClick = true;
                    }
                    break;
            }
            let switchToEdit = this.widgetUtils.isSwitchToEditModeWidget(this.dataInfo);
            if (switchToEdit) {
                this.onTableEditStart(true);
                if (this.widgetMenuStatusInfo) {
                    this.widgetMenuStatusInfo.showToolButtons = true;
                    this.widgetMenuStatusInfo.isShowToolButtonsWihoutClick = true;
                }
            }
        }

        /**
         * filterData
         * @param dataRows
         */
        protected filterData(dataRows) {
            const filterArray: Array<any> = [];
            for (let i = 0; i < dataRows.length; i++) {
                const rowData = dataRows[i];
                let isValidRow = true;

                const objTemp = JSON.parse(JSON.stringify(rowData).toLowerCase());
                const columnFilterKeys: Array<string> = Object.keys(this.columnFilterInfo);
                columnFilterKeys.forEach((columnFilterKey) => {
                    const expectedValueArray: Array<string> = this.columnFilterInfo[columnFilterKey];
                    if (expectedValueArray.length === 1 && expectedValueArray[0] === '*') {
                        isValidRow = true;
                    } else {
                        if (objTemp[columnFilterKey.toLowerCase()]) {
                            const rs: Array<string> = expectedValueArray.filter(
                                (p) => p.toLowerCase() === (objTemp[columnFilterKey.toLowerCase()] + '').toLowerCase(),
                            );
                            if (rs.length === 0) {
                                isValidRow = false;
                            }
                        }
                    }
                });
                if (isValidRow) {
                    filterArray.push(rowData);
                }
            }
            return filterArray;
        }

        /**
         * updateRowDisplayMode
         */
        protected updateRowDisplayMode() {
            if (this.agGridComponent) {
                this._updateRowDisplayMode(this.agGridComponent);
            }
            //if (this.historyContainerGridComponent) {
            //    this._updateRowDisplayMode(this.historyContainerGridComponent);
            //}
        }

        private _updateRowDisplayMode(instance: any) {
            const multipleDisplayRowMode = this.propertyPanelService.getItemRecursive(
                this.propertiesInfo,
                'MultipleRowDisplay',
            );
            if (multipleDisplayRowMode) {
                if (multipleDisplayRowMode.value) {
                    instance.changeToMultipleRowMode();
                } else {
                    instance.changeToSingleRowMode();
                }
            }
        }

        protected onDeletedRowsHandler(eventData) {
            if (eventData) {
                this.isTableEdited = true;
                this.editingWidget(this.dataInfo);
            }
        }

        public onToolbarFilterValueChangedHandler(filterValue: string) {
            if (this.agGridComponent) {
                this.agGridComponent.filter = filterValue;
            }
        }

        // ---------------File Explorer Widget
        protected saveFileExplorerWidget() {
            if (this.xnFileExplorerComponentCtrl && this.isDeletedFiles) {
                this.xnFileExplorerComponentCtrl.saveUpdateData();
            }
        }

        protected onUpdateFilesCompleted(event) {
            if (event) {
                this.isDeletedFiles = false;
                this.isOnEditFileExplorer = false;
                if (this.widgetMenuStatusInfo) {
                    // enable delete button
                    this.widgetMenuStatusInfo.manageDeleteRowTableButtonStatus(true);
                    // disable save button
                    this.widgetMenuStatusInfo.manageSaveTableButtonStatus(false);
                }
                this.cancelEditingWidget(this.dataInfo);
            }
        }

        protected resetFileExplorer(): void {
            if (this.xnFileExplorerComponentCtrl) this.xnFileExplorerComponentCtrl.refreshData(null);
            this.isDeletedFiles = false;
            this.isOnEditFileExplorer = false;
        }

        protected onDeletedFiles(eventData) {
            this.isDeletedFiles = true;
            this.editingWidget(this.dataInfo);
            if (this.widgetMenuStatusInfo) {
                // disable delete button
                this.widgetMenuStatusInfo.manageDeleteRowTableButtonStatus(true);
                // enable save button
                this.widgetMenuStatusInfo.manageSaveTableButtonStatus(false);
            }
        }

        public onUploadFileClick($event?: any) {
            if (this.xnFileExplorerComponentCtrl) this.xnFileExplorerComponentCtrl.showFileUploadDialog(true);

            //if (this.articleMediaManagerComponent)
            //    this.articleMediaManagerComponent.showDialog = true;

            //if (this.articleDetailUploadComponent)
            //    this.articleDetailUploadComponent.showDialog = true;
        }

        public onClickDeleteFiles() {
            if (this.xnFileExplorerComponentCtrl) this.xnFileExplorerComponentCtrl.onClickDeleteFiles();
        }

        /**
         * prepareDataForColTranslateSaving
         */
        protected prepareDataForColTranslateSaving(): Observable<any> {
            const translateEditedData = this.dataSourceTable.data.filter((p) => p['isedited']);
            const result = [];
            const items: Array<any> = translateEditedData.map((p) => {
                return {
                    IdTranslateLabelText: p.IdTranslateLabelText,
                    IdArticle: p.IdArticle,
                    ArticleNameShort: p.ArticleNameShort,
                    IdRepLanguage: p.IdRepLanguage,
                    IdCountryLanguage: p.IdCountryLanguage,
                };
            });

            let editData = uniqBy(items, 'IdRepLanguage');
            if (editData && editData.length) {
                //const idArticle = editData[0].IdArticle;
                //return this.getOriginalArticleNameValue(idArticle).map(originalValue => {
                //    (editData as Array<any>).forEach((item) => {
                //        const isDeleted = isEmpty(item.ArticleNameShort);
                //        if (!(isDeleted && !item.IdTranslateLabelText)) {
                //            const isModeAll = TranslateModeEnum.All;
                //            let idTable = item.IdArticle;
                //            result.push({
                //                'IdTranslateLabelText': item.IdTranslateLabelText > 0 ? item.IdTranslateLabelText : null,
                //                'IdRepTranslateModuleType': TranslateDataTypeEnum.Data,
                //                'IdRepLanguage': item.IdRepLanguage,
                //                'IdCountryLanguage': item.IdCountryLanguage,
                //                'WidgetMainID': null,
                //                'WidgetCloneID': null,
                //                'OriginalText': originalValue,
                //                'TranslatedText': item.ArticleNameShort,
                //                'IsDeleted': isDeleted ? '1' : null,
                //                'IdTable': idTable,
                //                'FieldName': 'ArticleNameShort',
                //                'TableName': 'B00ArticleName'
                //            });
                //        }
                //    });
                //    return { 'Translations': result };
                //});
            }
            return of(null);
        }

        /**
         * saveColTranslation
         * @param callback
         */
        public saveColTranslation() {
            return new Promise<any>((resolve, reject) => {
                const translateEditedData: Array<any> = this.dataSourceTable.data.filter((p) => p['isedited']);
                if (translateEditedData && !translateEditedData.length) {
                    resolve(true);
                } else {
                    this.prepareDataForColTranslateSaving().subscribe((saveData) => {
                        if (!saveData || !saveData.Translations || !saveData.Translations.length) {
                            resolve(true);
                        }
                        this.globalSettingService
                            .saveTranslateLabelText(saveData)
                            .pipe(
                                finalize(() => {
                                    resolve(true);
                                }),
                            )
                            .subscribe((response) => {});
                    });
                }
            });
        }

        /**
         * getOriginalArticleNameValue
         */
        public getOriginalArticleNameValue(idArticle): Observable<string> {
            return this.articleService.getArticleById(idArticle, '-1').pipe(
                map((response: ApiResultResponse) => {
                    let orgValue = '';
                    if (Uti.isResquestSuccess(response)) {
                        const item = response.item;
                        if (item && item.articleNameShort) {
                            orgValue = item.articleNameShort.value;
                        }
                    }
                    return orgValue;
                }),
            );
        }

        public onAfterFlexgridRendered($event) {
            if (this.selectedRowsData && this.selectedRowsData.length) {
                for (let i = 0; i < this.selectedRowsData.length; i++) {
                    const widget = this.selectedRowsData[i];
                    if (widget.widgetDetailId === this.dataInfo.idRepWidgetApp) {
                        const rowData = widget.rowData;
                        const selectedRow = {};
                        for (let j = 0; j < rowData.length; j++) {
                            selectedRow[rowData[j].key] = rowData[j].value;
                        }
                        this.agGridComponent.setSelectedRow(selectedRow);
                    }
                }
            }
        }

        public enterMovesDown;
        public onCellDirectionChanged(isCellMoveForward) {
            this.enterMovesDown = isCellMoveForward ? false : true;
        }

        public getListenKeyRequestItem() {
            if (this.dataInfo.widgetDataType) {
                const key = Object.keys(
                    this.dataInfo.widgetDataType.listenKeyRequest(this.moduleInfo.moduleNameTrim),
                )[0];
                const dataItem = this.dataInfo.widgetDataType.listenKeyRequest(this.moduleInfo.moduleNameTrim);

                return {
                    key: key,
                    value: dataItem[key],
                    item: dataItem['item'],
                };
            }

            return null;
        }

        /**
         * onDataDrop
         * Used for handle drag event from Global Search
         **/
        public onDataDrop(event: DragEvent) {
            const isCustomerDoubletteWidget = this.dataInfo.idRepWidgetApp == RepWidgetAppIdEnum.CustomerDoublette;
            const isCustomerModule = this.moduleInfo.idSettingsGUI == MenuModuleId.contact;
            if (isCustomerModule && isCustomerDoubletteWidget) {
                const rawData = event.dataTransfer.getData('text');
                if (rawData) {
                    const data = JSON.parse(rawData);
                    const isDragFromCustomerModule = data.refData && data.refData.idSettingsGUI == MenuModuleId.contact;

                    // Do nothing if not drag from customer module of Global Search
                    if (!isDragFromCustomerModule) {
                        return;
                    }
                    this.addToDoubletWidget(data);
                }
            }
        }

        /**
         * addToDoubletWidget
         * @param data
         */
        public addToDoubletWidget(data) {
            const status = this.isExistingCurrentNode(data);
            // Do nothing if this data already existed in grid
            if (status) {
                this.modalService.warningMessage({
                    message: 'This item has already added, please select another one',
                });
                return;
            }

            const nodeItems = this.agGridComponent.getCurrentNodeItems();
            let key;
            if (this.dataInfo && this.dataInfo.widgetDataType && this.dataInfo.widgetDataType.listenKey) {
                key = this.dataInfo.widgetDataType.listenKey.main[0].key;
            }
            if (!key) {
                return;
            }

            let masterKeyValue;
            let subKeyValue = data[key];
            if (!subKeyValue) {
                Object.keys(data).forEach((k) => {
                    if (key.toLowerCase() == k.toLowerCase()) {
                        subKeyValue = data[k];
                    }
                });
            }

            masterKeyValue = this.dataInfo.widgetDataType.listenKeyRequest(this.moduleInfo.moduleNameTrim)[key];

            // Do nothing if this data is master
            if (subKeyValue == masterKeyValue) {
                this.modalService.warningMessage({
                    message: 'Not allow to add itself, please select another one',
                });
                return;
            }

            let idPersons = '';
            if (nodeItems && nodeItems.length) {
                const masterItem = nodeItems.find((p) => p['IsMaster'] == true || p['IsMaster'] == 1);
                if (masterItem) {
                    masterKeyValue = masterItem[key];
                }
            }
            idPersons = masterKeyValue + ',' + subKeyValue;

            this.personService.getPersonData(idPersons).subscribe((response) => {
                if (response && response.item && response.item.data && response.item.data[1]) {
                    const items: Array<any> = response.item.data[1];
                    if (items.length > 1) {
                        const notMatchingItem = items.find((p) => p['NotMatching'] == true || p['NotMatching'] == 1);
                        if (notMatchingItem) {
                            this.modalService.warningMessage({
                                message: 'This item was unmerged before, please select another one',
                            });
                            return;
                        }
                        const item = items.find((p) => p[key] == masterKeyValue);
                        if (item) {
                            item['IsMaster'] = true;
                            this.addDataToDoubletWidget(item);
                            const index = items.indexOf(item);
                            if (index > -1) {
                                items.splice(index, 1);
                            }
                        }
                        items.forEach((item) => {
                            if (!item['NotMatching']) {
                                this.addDataToDoubletWidget(item);
                            }
                        });
                    }
                    this.isTableEdited = true;
                    this.onTableEditStart(true);
                }
            });
        }

        /**
         * addDataToDoubletWidget
         * @param data
         */
        public addDataToDoubletWidget(data) {
            if (!this.agGridComponent) {
                return;
            }
            const status = this.isExistingCurrentNode(data);
            if (!status) {
                const cols: Array<any> = this.dataSourceTable.columns;
                let obj = {};
                cols.forEach((col) => {
                    Object.keys(data).forEach((key) => {
                        if (col.data.toLowerCase() == key.toLowerCase()) {
                            obj[col.data] = isObject(data[key]) && isEmpty(data[key]) ? '' : data[key];
                        }
                    });
                });
                this.agGridComponent.addNewRow(obj, null);
            }
        }

        /**
         * isExistingCurrentNode
         **/
        private isExistingCurrentNode(data) {
            const nodeItems = this.agGridComponent.getCurrentNodeItems();
            const key = this.dataInfo.widgetDataType.listenKey.key;
            const node = nodeItems.find((p) => {
                let existingId;
                let addNewId;
                Object.keys(p).forEach((k) => {
                    if (key.toLowerCase() == k.toLowerCase()) {
                        existingId = p[k];
                    }
                });
                Object.keys(data).forEach((k) => {
                    if (key.toLowerCase() == k.toLowerCase()) {
                        addNewId = data[k];
                    }
                });
                if (existingId && addNewId && existingId == addNewId) {
                    return true;
                }
                return false;
            });
            if (!node) {
                return false;
            }
            return true;
        }

        /**
         * checkSelectedNodes
         **/
        protected checkSelectedNodes() {
            if (this.agGridComponent) {
                const selectedNodes = this.agGridComponent.getSelectedNodes();
                if (this.dataInfo.idRepWidgetApp == RepWidgetAppIdEnum.UserList) {
                    this.selectedNodes =
                        selectedNodes && selectedNodes.length > 1 ? selectedNodes.map((p) => p.data) : null;
                }
            }
        }

        /**
         * onSuccessRoleSaved
         * @param nodes
         */
        public onSuccessRoleSaved(nodes) {
            this.agGridComponent.onSelectionChanged(null);
        }

        /**
         * onNextDoubletteGroup
         * @param number
         */
        public onNextDoubletteGroup(number) {
            if (this.isTableEdited) {
                this.modalService.confirmMessage({
                    headerText: 'Confirmation',
                    message: [{ key: 'Modal_Message__DoYouWantToSaveTheseChanges' }],
                    messageType: MessageModal.MessageType.warning,
                    buttonType1: MessageModal.ButtonType.danger,
                    callBack1: () => {
                        this.updateTableWidget();
                        this.moveToDoubletteGroup(number);
                    },
                    callBack2: () => {
                        // this.isOnEditingTable = false;
                        this.isTableEdited = false;
                        this.moveToDoubletteGroup(number);
                    },
                });
            } else {
                this.moveToDoubletteGroup(number);
            }
        }

        /**
         * moveToDoubletteGroup
         * @param number
         */
        private moveToDoubletteGroup(number) {
            const datasource = this.datatableService.buildDataSource(this.dataInfo.contentDetail);
            this.dataSourceTable = datasource;
            const groupData = groupBy(this.dataSourceTable.data, 'MatchingGroup');
            let keys = Object.keys(groupData);
            this.dataSourceTable.data = groupData[keys[number - 1]];
        }
    }
    return AbstractWidgetTableBase;
}
