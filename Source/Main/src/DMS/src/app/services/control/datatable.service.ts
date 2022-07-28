import { Injectable } from '@angular/core';
import isEmpty from 'lodash-es/isEmpty';
import upperCase from 'lodash-es/upperCase';
import camelCase from 'lodash-es/camelCase';
import isNil from 'lodash-es/isNil';
import isObject from 'lodash-es/isObject';
import isString from 'lodash-es/isString';
import isNaN from 'lodash-es/isNaN';
import {
    TextFieldModel,
    SelectFieldModel,
    HiddenFieldModel,
    ReadonlyFieldModel,
    DatetimeFieldModel,
    CheckboxFieldModel,
    EsSearchResult,
} from '@app/models';
import { ComboBoxTypeConstant, FilterModeEnum } from '@app/app.constants';
import { GuidHelper } from '@app/utilities/guild.helper';
import { FieldFilter } from '@app/models';
import { Uti } from '@app/utilities/uti';
import { parse, format } from 'date-fns/esm';
import { isNullOrUndefined } from 'util';
import { FormTableSettingColumnName, TableColumnDef } from '@app/models/common/form-table-definition.model';

const BUTTON_COLUMNS = {
    mediaCodeButton: 'mediaCodeButton',
    download: 'download',
    InvoicePDF: 'InvoicePDF',
    PDF: 'PDF',
    Tracking: 'Tracking',
    Return: 'Return',
    SendLetter: 'SendLetter',
    Unblock: 'Unblock',
    Delete: 'Delete',
    EditRow: 'EditRow',
    FilterExtended: 'FilterExtended',
    Edit: 'Edit',
    rowColCheckAll: 'rowColCheckAll',
};

const CHECKBOX_COLUMNS = {
    deleted: 'deleted',
    selectAll: 'selectAll',
    noExport: 'noExport',
};

@Injectable()
export class DatatableService {
    constructor() {}

    public buildEditableDataSourceV2(data: any[], settingColumnName: FormTableSettingColumnName[], title: string): any {
        let result = this.formatDataTableFromRawDataV2(data, settingColumnName, title);
        result = this.buildDataSource(result);
        result = this.appendRowId(result);
        return result;
    }

    /**
     * formatDataTableFromRawData
     * Format data table structure from raw data service.
     */
    public formatDataTableFromRawDataV2(data: any[], settingColumnName: FormTableSettingColumnName[], title: string) {
        if (!data || !settingColumnName || !settingColumnName.length) return;

        const formatColumnSetting: { [key: string]: any } = {};
        const setting = settingColumnName[0];

        if (!setting.ColumnSetting || !setting.ColumnSetting.ColumnsName || !setting.ColumnSetting.ColumnsName.length) {
            return;
        }

        const columns: Array<any> = setting.ColumnSetting.ColumnsName;
        columns.forEach((col: TableColumnDef) => {
            formatColumnSetting[col.ColumnName] = col;
        });

        return {
            collectionData: data,
            columnSettings: formatColumnSetting,
            widgetTitle: title,
        };
    }

    public buildEditableDataSource(data): any {
        let result = this.formatDataTableFromRawData(data);
        result = this.buildDataSource(result);
        result = this.appendRowId(result);
        return result;
    }

    /**
     * formatDataTableFromRawData
     * Format data table structure from raw data service.
     */
    public formatDataTableFromRawData(data: any) {
        if (!data) return;

        const settingIndex = 0;
        const dataIndex = 1;

        const collectionData: Array<any> = data[dataIndex];
        const settingData: any = data[settingIndex][0];

        const formatColumnSetting: { [key: string]: any } = {};
        let widgetTitle = '';
        if (settingData && settingData.SettingColumnName) {
            const columnSetting: Array<any> = JSON.parse(settingData.SettingColumnName);
            if (columnSetting && columnSetting.length) {
                widgetTitle = columnSetting[0].WidgetTitle;
                if (columnSetting[1]) {
                    const columns: Array<any> = columnSetting[1].ColumnsName;
                    columns.forEach((col) => {
                        formatColumnSetting[col.ColumnName] = col;
                    });
                }
            }
        }
        return {
            collectionData: collectionData,
            columnSettings: formatColumnSetting,
            widgetTitle: widgetTitle,
        };
    }

    public buildDataSource(contentDetail) {
        let dataSource: any;
        dataSource = this.buildTableDataFromCollection(contentDetail);

        if (!dataSource.columns.length) return dataSource;

        // Build column setting
        dataSource = this.buildColumnSetting(dataSource, contentDetail);

        // Append rowId
        dataSource = this.appendRowId(dataSource);

        // Set column visible
        dataSource = this.setColumnVisible(dataSource);

        // Set render function
        dataSource = this.setColumnRender(dataSource);

        return dataSource;
    }

    buildTableDataFromCollection(object: any) {
        if (!object || !object.columnSettings) {
            return {
                data: [],
                columns: [],
            };
        }

        const columns: Array<any> = [];

        Object.keys(object.columnSettings).forEach((key) => {
            columns.push({
                title: object.columnSettings[key].ColumnHeader,
                data: object.columnSettings[key].ColumnName,
                visible: true,
            });
        });

        return {
            data: !object.collectionData ? [] : Object.assign([], object.collectionData),
            columns: columns,
        };
    }

    // buildTableDataFromCollection(key: string, object: any) {
    //    if (!object || !object[key])
    //        return {
    //            'data': [],
    //            'columns': []
    //        };

    //    var rs: any = object[key];
    //    var columns: any[] = [];
    //    var data: any[] = [];
    //    var column: any = {};
    //    for (let i = 0; i < rs.length; i++) {
    //        let keys = Object.keys(rs[i]);
    //        let model: any = {};
    //        for (const x in keys) {
    //            let field = keys[x];
    //            const ob = rs[i][field];
    //            if (ob) {
    //                const title = ob.displayValue;
    //                const value = ob.value;
    //                model[field] = value;
    //                column[field] = title;
    //            }
    //        }
    //        data.push(model);
    //    }

    //    // Remove row if there is only 1 row and has empty data.
    //    if (data && data.length === 1) {
    //        let isEmpty = true;
    //        for (const idxKey in data[0]) {
    //            if (data[0][idxKey]) {
    //                isEmpty = false;
    //            }
    //        }
    //        if (isEmpty) {
    //            data = [];
    //        }
    //    }

    //    let col: any = {};
    //    const colKeys = Object.keys(column);
    //    for (const i in colKeys) {
    //        col = {
    //            'title': column[colKeys[i]],
    //            'data': colKeys[i],
    //            'visible': true
    //        };
    //        columns.push(col);
    //    }

    //    return {
    //        'data': data,
    //        'columns': columns
    //    };
    // }

    appendRowId(dataSource) {
        if (!dataSource.data) return dataSource;
        for (let i = 0; i < dataSource.data.length; i++) {
            dataSource.data[i]['DT_RowId'] = 'row_' + GuidHelper.generateGUID();
        }

        return dataSource;
    }

    appendRowIdForGridData(data) {
        if (!data) return;
        for (let i = 0; i < data.length; i++) {
            data[i]['DT_RowId'] = 'row_' + GuidHelper.generateGUID();
        }

        return data;
    }

    buildColumnSetting(dataSourceTable, contentDetail) {
        if (
            isEmpty(dataSourceTable) ||
            isEmpty(dataSourceTable.columns) ||
            isEmpty(contentDetail) ||
            isEmpty(contentDetail.columnSettings)
        ) {
            return dataSourceTable;
        }

        for (let i = 0; i < dataSourceTable.columns.length; i++) {
            for (const settingField in contentDetail.columnSettings) {
                if (dataSourceTable.columns[i].data === settingField) {
                    dataSourceTable.columns[i].setting = contentDetail.columnSettings[settingField];
                }
            }
        }

        return dataSourceTable;
    }

    setColumnVisible(dataSource) {
        for (const col of dataSource.columns) {
            if (this.hasDisplayField(col, 'Hidden')) {
                col.visible = this.getDisplayFieldValue(col, 'Hidden') !== '1';
            }
            if (this.hasDisplayField(col, 'IsGrouped')) {
                col.isGrouped = this.getDisplayFieldValue(col, 'IsGrouped') === '1';
                const groupDisplayColumn = this.getDisplayFieldValue(col, 'GroupDisplayColumn');
                const rs = dataSource.columns.filter((p) => p.setting.OriginalColumnName === groupDisplayColumn);
                if (rs.length > 0) {
                    col.groupDisplayColumn = rs[0].data;
                }
                col.visible = !col.isGrouped;
            }
        }
        return dataSource;
    }

    setColumnRender(dataSource) {
        for (const column of dataSource.columns) {
            if (this.hasControlType(column)) {
                switch (this.getControlTypeName(column).toLowerCase()) {
                    // case 'combobox':
                    //    column.render = function (data, type, row) {
                    //        return self.getDropdownLabel(column.options, data);
                    //    };
                    //    break;

                    case 'creditcard':
                        column.render = function (data, type, row) {
                            if (!data) {
                                return '';
                            }

                            const ccList = data.split(',');
                            let result = '';
                            if (ccList.length) {
                                for (const cc of ccList) {
                                    result +=
                                        '<img src="public/assets/img/blank.gif" class="credit credit-' +
                                        cc +
                                        '" alt="' +
                                        upperCase(cc) +
                                        '">';
                                }
                            }

                            return result;
                        };
                        break;

                    default:
                        break;
                }
            }
        }

        return dataSource;
    }

    getDropdownLabel(options, id) {
        for (const opt of options) {
            if (opt.value === id) {
                return opt.label;
            }
        }

        return null;
    }

    buildEditorFields(columns) {
        if (isEmpty(columns)) {
            return columns;
        }

        const editorFields = [];
        for (const col of columns) {
            editorFields.push(this.buildColumnControl(col));
        }

        return editorFields;
    }

    buildColumnControl(column) {
        if (this.hasControlType(column)) {
            switch (this.getControlTypeName(column).toLowerCase()) {
                case 'textbox':
                    return new TextFieldModel({
                        name: column.data,
                    });
                case 'combobox':
                    return new SelectFieldModel({
                        name: column.data,
                        options: column.options,
                    });
                case 'datetimepicker':
                    return new DatetimeFieldModel({
                        name: column.data,
                        def: function () {
                            return new Date();
                        },
                        format: 'DD.MM.YYYY',
                    });
                case 'checkbox':
                    return new CheckboxFieldModel({
                        name: column.data,
                        separator: '|',
                        options: [{ label: '', value: 'True' }],
                        unselectedValue: 'False',
                    });
            }
        } else if (this.hasDisplayField(column, 'Hidden')) {
            if (this.getDisplayFieldValue(column, 'Hidden') === '1') {
                return new HiddenFieldModel({
                    name: column.data,
                });
            }
        } else if (this.hasDisplayField(column, 'Readonly')) {
            if (this.getDisplayFieldValue(column, 'Readonly') === '1') {
                return new ReadonlyFieldModel({
                    name: column.data,
                });
            }
        }

        return new TextFieldModel({
            name: column.data,
        });
    }

    getComboboxColumnList(dataSource) {
        const comboboxList = [];

        if (isEmpty(dataSource) || isEmpty(dataSource.columns)) {
            return comboboxList;
        }

        for (const column of dataSource.columns) {
            if (this.hasControlType(column, 'combobox')) {
                comboboxList.push(column);
            }
        }

        return comboboxList;
    }

    buildComboboxData(dataSource, comboboxData, comboboxTypeList) {
        for (const column of dataSource.columns) {
            if (this.hasControlType(column, 'combobox')) {
                const columnOptions = [];

                for (const comboboxType of comboboxTypeList) {
                    if (
                        this.getControlTypeValue(column).toString().toLowerCase() ===
                        comboboxType.value.toString().toLowerCase()
                    ) {
                        for (const data of comboboxData[comboboxType.name]) {
                            columnOptions.push({
                                label: data.textValue,
                                value: data.idValue,
                            });
                        }
                    }
                }

                column.options = columnOptions;
            }
        }

        return dataSource;
    }

    buildComboboxTypeList(comboboxColumnList) {
        const result = [];
        for (const comboboxColumn of comboboxColumnList) {
            for (const typeName in ComboBoxTypeConstant) {
                if (ComboBoxTypeConstant.hasOwnProperty(typeName)) {
                    const typeValue = this.getControlTypeValue(comboboxColumn).trim();
                    if (!isNaN(typeValue) && parseInt(typeValue, 10) === ComboBoxTypeConstant[typeName]) {
                        result.push({
                            name: typeName,
                            value: ComboBoxTypeConstant[typeName],
                        });
                    }
                }
            }
        }

        // Add item that does not exist in Constant to result
        for (const comboboxColumn of comboboxColumnList) {
            const comboboxColumnValue = this.getControlTypeValue(comboboxColumn).trim();
            if (isNaN(comboboxColumnValue) && comboboxColumnValue.length > 0) {
                const existingResult = result.find((rs) => rs.value === camelCase(comboboxColumnValue));

                if (!existingResult) {
                    result.push({
                        name: camelCase(comboboxColumnValue),
                        value: camelCase(comboboxColumnValue),
                    });
                }
            }
        }

        return result;
    }

    getComboboxType(comboboxColumn) {
        for (const typeName in ComboBoxTypeConstant) {
            if (ComboBoxTypeConstant.hasOwnProperty(typeName)) {
                const typeValue = this.getControlTypeValue(comboboxColumn).trim();
                if (!isNaN(typeValue) && parseInt(typeValue, 10) === ComboBoxTypeConstant[typeName]) {
                    return {
                        name: typeName,
                        value: ComboBoxTypeConstant[typeName],
                    };
                }
            }
        }

        // Add item that does not exist in Constant to result
        const comboboxColumnValue = this.getControlTypeValue(comboboxColumn).trim();
        if (!isNil(comboboxColumnValue) && comboboxColumnValue.length > 0) {
            return {
                name: camelCase(comboboxColumnValue),
                value: camelCase(comboboxColumnValue),
            };
        }

        return null;
    }

    buildComboboxTypeNameList(comboboxTypeList) {
        const result = [];
        for (const comboboxType of comboboxTypeList) {
            result.push(comboboxType.name);
        }

        return result;
    }

    buildComboboxTypeIdList(comboboxTypeList) {
        const result = [];
        for (const comboboxType of comboboxTypeList) {
            result.push(comboboxType.value);
        }

        return result;
    }

    hasSetting(column) {
        return column && column.setting && !isNullOrUndefined(column.setting.Setting) && column.setting.Setting.length;
    }

    hasControlType(column, controlName?) {
        let result = false;
        if (this.hasSetting(column)) {
            const settingContainsControlType = this.getSettingContainsControlType(column.setting.Setting);

            if (settingContainsControlType) {
                result = true;

                if (!isEmpty(controlName)) {
                    result =
                        result &&
                        settingContainsControlType.ControlType.Type.toLowerCase() === controlName.toLowerCase();
                }
            }
        }

        return result;
    }

    getSettingContainsControlType(settingArray) {
        for (let i = 0; i < settingArray.length; i++) {
            if (
                !isNullOrUndefined(settingArray[i].ControlType) &&
                !isNullOrUndefined(settingArray[i].ControlType.Type)
            ) {
                return settingArray[i];
            }
        }

        return null;
    }

    getSettingContainsControlTypeNotBelongType(settingArray) {
        for (let i = 0; i < settingArray.length; i++) {
            if (settingArray[i].ControlType) return settingArray[i];
        }

        return null;
    }

    getValueUpdate1ForAll(settingArray) {
        return this.getSettingContainsControlType(settingArray)?.ControlType?.Update1ToAll;
    }

    hasDisplayField(column, fieldName?) {
        let result = false;
        if (this.hasSetting(column)) {
            const settingContainsDisplayField = this.getSettingContainsDisplayField(column.setting.Setting);

            if (settingContainsDisplayField) {
                result = true;

                if (!isEmpty(fieldName)) {
                    const displayFieldKeys = Object.keys(settingContainsDisplayField.DisplayField);
                    const filteredKeys = displayFieldKeys.filter((key) => {
                        return key.toLowerCase() === fieldName.toLowerCase();
                    });

                    result = result && filteredKeys.length > 0;
                }
            }
        }

        return result;
    }

    hasCustomStyle(column) {
        if (this.hasSetting(column)) {
            const settingContainsCustomStyle = this.getSettingContainsCustomStyle(column.setting.Setting);

            if (settingContainsCustomStyle) {
                return true;
            }
        }

        return false;
    }

    /**
     * Used for disabled row but can edit in some column
     * @param column
     */
    getDisableRowByValue(column) {
        if (this.hasSetting(column)) {
            const settingArray = column.setting.Setting;
            let disableRowByValue = null;
            for (let i = 0; i < settingArray.length; i++) {
                if (!isNullOrUndefined(settingArray[i].DisableRowByValue)) {
                    disableRowByValue = settingArray[i];
                }
            }
            if (disableRowByValue) {
                return disableRowByValue.DisableRowByValue;
            }
        }
        return null;
    }

    getSettingContainsDisplayField(settingArray) {
        for (let i = 0; i < settingArray.length; i++) {
            if (!isNullOrUndefined(settingArray[i].DisplayField)) {
                return settingArray[i];
            }
        }

        return null;
    }

    getSettingContainsCustomStyle(settingArray) {
        for (let i = 0; i < settingArray.length; i++) {
            if (!isNullOrUndefined(settingArray[i].CustomStyle)) {
                return settingArray[i];
            }
        }

        return null;
    }

    getHeaderClass(settingArray) {
        for (let i = 0; i < settingArray.length; i++) {
            if (settingArray[i]?.headerClass) {
                return settingArray[i]?.headerClass;
            }
        }

        return null;
    }

    hasValidation(column, validationName?) {
        let result = false;
        if (this.hasSetting(column)) {
            const settingContainsValidation = this.getSettingContainsValidation(column.setting.Setting);

            if (
                settingContainsValidation &&
                (settingContainsValidation.Validation || settingContainsValidation.Validators)
            ) {
                result = true;

                if (!isEmpty(validationName)) {
                    let displayFieldKeys;
                    if (settingContainsValidation.Validation)
                        displayFieldKeys = Object.keys(settingContainsValidation.Validation);
                    if (settingContainsValidation.Validators)
                        displayFieldKeys = Object.keys(settingContainsValidation.Validators);

                    const filteredKeys = displayFieldKeys.filter((key) => {
                        return key.toLowerCase() === validationName.toLowerCase();
                    });

                    result = result && filteredKeys.length > 0;
                }
            }
        }

        return result;
    }

    getSettingContainsValidation(settingArray) {
        for (let i = 0; i < settingArray.length; i++) {
            if (settingArray[i].Validation || settingArray[i].Validators) {
                return settingArray[i];
            }
        }

        return null;
    }

    getControlTypeName(column) {
        if (this.hasSetting(column)) {
            const settingContainsControlType = this.getSettingContainsControlType(column.setting.Setting);

            if (settingContainsControlType) {
                return settingContainsControlType.ControlType.Type;
            }
        }

        return '';
    }

    getControlTypeNameFromColumnDefine(column) {
        if (column.setting && column.setting.DataType) {
            switch (column.setting.DataType) {
                case 'datetime':
                    return 'DatetimePicker';
                case 'int':
                case 'smallint':
                case 'bigint':
                    return 'Integer';
                case 'bit':
                    return 'Checkbox';
                default:
                    return '';
            }
        }

        return '';
    }

    getControlTypeValue(column) {
        if (this.hasSetting(column)) {
            const settingContainsControlType = this.getSettingContainsControlType(column.setting.Setting);

            if (settingContainsControlType) {
                return settingContainsControlType.ControlType.Value;
            }
        }

        return '';
    }

    getControlTypeFilterBy(column) {
        if (this.hasSetting(column)) {
            const settingContainsControlType = this.getSettingContainsControlType(column.setting.Setting);

            if (settingContainsControlType) {
                return settingContainsControlType.ControlType.FilterBy;
            }
        }

        return '';
    }

    getDisplayFieldValue(column, fieldName) {
        if (this.hasSetting(column)) {
            const settingContainsDisplayField = this.getSettingContainsDisplayField(column.setting.Setting);

            if (settingContainsDisplayField) {
                if (!isEmpty(fieldName)) {
                    const displayFieldKeys = Object.keys(settingContainsDisplayField.DisplayField);
                    const filteredKeys = displayFieldKeys.filter((key) => {
                        return key.toLowerCase() === fieldName.toLowerCase();
                    });

                    if (filteredKeys.length) {
                        return settingContainsDisplayField.DisplayField[filteredKeys[0]];
                    }
                }
            }
        }

        return '';
    }

    getCustomStyleValue(column) {
        if (this.hasSetting(column)) {
            const settingContainsCustomStyle = this.getSettingContainsCustomStyle(column.setting.Setting);

            if (settingContainsCustomStyle) {
                return settingContainsCustomStyle.CustomStyle;
            }
        }

        return '';
    }

    getHeaderClassValue(column) {
        if (this.hasSetting(column)) {
            const headerClass = this.getHeaderClass(column.setting.Setting);

            return headerClass;
        }

        return '';
    }

    getColumnByName(columns, name) {
        for (const col of columns) {
            if (col.data === name) {
                return col;
            }
        }

        return null;
    }

    /**
     * Create new empty row.
     * @param rows
     * @param columns
     */
    createNewRow(rows, columns) {
        const firstRow = rows.data()[0];
        const newRow = {};

        for (const fieldName in firstRow) {
            if (fieldName === 'DT_RowId') {
                newRow[fieldName] = 'row_' + GuidHelper.generateGUID();
            } else {
                const columnOfThisField = this.getColumnByName(columns, fieldName);

                if (columnOfThisField && this.hasControlType(columnOfThisField, 'combobox')) {
                    newRow[fieldName] = !isEmpty(columnOfThisField.options) ? columnOfThisField.options[0].value : '';
                } else {
                    newRow[fieldName] = '';
                }
            }
        }
        newRow['isNewRow'] = true;

        return newRow;
    }

    /**
     * Create new empty row.
     * @param columns
     */
    createNewRowForEmptyData(columns) {
        const newRow = {};
        for (let i = 0; i < columns.length; i++) {
            if (this.hasControlType(columns[i], 'combobox')) {
                newRow[columns[i].data] = !isEmpty(columns[i].options) ? columns[i].options[0].value : '';
            } else {
                newRow[columns[i].data] = '';
            }
        }
        newRow['DT_RowId'] = 'row_' + GuidHelper.generateGUID();
        newRow['isNewRow'] = true;
        return newRow;
    }

    isRowExisted(dataSource, rowId) {
        for (const data of dataSource) {
            if (data.DT_RowId === rowId) {
                return true;
            }
        }

        return false;
    }

    updateDataSourceTable(dataSource, editedRowData, isDeleted?: boolean) {
        if (isEmpty(dataSource) || isNil(dataSource.data) || isEmpty(editedRowData) || isEmpty(editedRowData.data)) {
            return dataSource;
        }

        let willPush = true;
        (dataSource.data as Array<any>).forEach((dsData, index) => {
            if (dsData.DT_RowId === editedRowData.data[0].DT_RowId) {
                willPush = false;
                if (isDeleted) {
                    if (dsData.isNewRow || dsData.isNew) {
                        delete dataSource.data[index];
                    } else {
                        dataSource.data[index] = editedRowData.data[0];
                        dataSource.data[index]['IsDeleted'] = true;
                    }
                    return;
                }
                dataSource.data[index] = editedRowData.data[0];
                dataSource.data[index]['isEdited'] = true;
                return;
            }
        });

        if (willPush && !isDeleted) {
            if (!isNullOrUndefined(editedRowData.data[0]['isNewRow'])) {
                delete editedRowData.data[0]['isNewRow'];
            }
            const newRow = editedRowData.data[0];
            newRow['isEdited'] = true;
            dataSource.data.push(newRow);
        }

        return dataSource;
    }

    updateTableColumnSettings(
        selectedFilter: FilterModeEnum,
        fieldFilters: Array<FieldFilter>,
        settings: any,
        data: any,
    ) {
        if (
            selectedFilter === FilterModeEnum.ShowAllWithoutFilter ||
            isNil(fieldFilters) ||
            isNil(!selectedFilter) ||
            !data ||
            !settings
        )
            return settings;
        const keys = Object.keys(settings);
        keys.forEach((key) => {
            const columnSetting = settings[key];
            if (!columnSetting.Setting) {
                columnSetting['Setting'] = [];
            } else if (typeof columnSetting['Setting'] === 'string') {
                const settingJson = Uti.tryParseJson(columnSetting['Setting']);
                columnSetting['Setting'] = isEmpty(settingJson) ? [] : settingJson;
            }
            const filterItem = fieldFilters.find((item) => item.fieldName === columnSetting.OriginalColumnName);
            if (filterItem) {
                let displaySetting = columnSetting.Setting.find((item) => item.DisplayField);
                if (!displaySetting) {
                    displaySetting = { DisplayField: {} };
                    columnSetting.Setting.push(displaySetting);
                }
                let isShowedColumnByDisplayMode = true;
                switch (selectedFilter) {
                    case FilterModeEnum.HasData:
                        isShowedColumnByDisplayMode =
                            data.length > 0 &&
                            !isNil(
                                data.find(
                                    (item) =>
                                        (!isNil(item[key]) && !isObject(item[key]) && !isString(item[key])) ||
                                        (isString(item[key]) && item[key].length > 0) ||
                                        (isObject(item[key]) && !isEmpty(item[key])),
                                ),
                            );
                        break;
                    case FilterModeEnum.EmptyData:
                        isShowedColumnByDisplayMode =
                            data.length <= 0 ||
                            isNil(
                                data.find(
                                    (item) =>
                                        (!isNil(item[key]) && !isObject(item[key]) && !isString(item[key])) ||
                                        (isString(item[key]) && item[key].length > 0) ||
                                        (isObject(item[key]) && !isEmpty(item[key])),
                                ),
                            );
                        break;
                }
                if (
                    (isNil(displaySetting.DisplayField['Hidden']) ||
                        isNil(displaySetting.DisplayField['Hidden']) == 0) &&
                    (!filterItem.selected || (!isShowedColumnByDisplayMode && filterItem.isEditable))
                )
                    displaySetting.DisplayField['Hidden'] = '1';
                else if (!filterItem.isHidden && filterItem.selected && displaySetting.DisplayField['Hidden'] == 1) {
                    displaySetting.DisplayField['Hidden'] = '0';
                }
            }
        });
        return settings;
    }

    validateFullRow(obj, editor, options) {
        const requiredFields = this.getRequiredFields(options);
        for (const requiredField of requiredFields) {
            const editingField = editor.field(requiredField.data);
            if (isEmpty(editingField) || isEmpty(editingField.val())) {
                editingField.error('Field is required');
                return false;
            }
        }

        return true;
    }

    validateOtherFields(editor, options) {
        const requiredFields = this.getRequiredFields(options);
        for (const requiredField of requiredFields) {
            const editingField = editor.field(requiredField.data);
            if (isEmpty(editingField) || isEmpty(editingField.val())) {
                return {
                    editingField: editingField,
                    editingFieldErrorMsg: 'Field is required',
                };
            }
        }

        const hasValidationFromFields = this.getHasValidationFromFields(options);
        for (const hasValidationFromField of hasValidationFromFields) {
            const editingField = editor.field(hasValidationFromField.data);
            const editingFieldData = options.columns.find((opt) => {
                return opt.data === hasValidationFromField.data;
            });
            const regexData = this.buildValidationExpression(editor, editingFieldData);
            if (regexData) {
                const regex = new RegExp(decodeURIComponent(regexData.Regex), 'g');

                if (!regex.test(editingField.val())) {
                    return {
                        editingField: editingField,
                        editingFieldErrorMsg: regexData.ErrorMessage,
                    };
                }
            }
        }

        return null;
    }

    buildValidationExpression(editor, editingFieldData) {
        let regex: any = {};

        const settingContainsValidation = this.getSettingContainsValidation(editingFieldData.setting.Setting);
        if (this.hasValidation(editingFieldData, 'ValidationFrom')) {
            const validationFromFieldName = settingContainsValidation.Validation.ValidationFrom;
            const validationFromField = editor.field(validationFromFieldName);

            regex = this.getExpression(
                settingContainsValidation.Validation.ValidationExpression,
                validationFromField.val(),
            );
        } else {
            regex = settingContainsValidation.Validation.ValidationExpression[0];
        }

        return regex;
    }

    buildWijmoGridValidationExpression(rowData, column) {
        let regex: any = {};

        const settingContainsValidation = this.getSettingContainsValidation(column.setting.Setting);
        if (this.hasValidation(column, 'ValidationFrom')) {
            const validationFromFieldName = settingContainsValidation.Validation.ValidationFrom;
            let value = rowData[validationFromFieldName].hasOwnProperty('key')
                ? rowData[validationFromFieldName].key
                : rowData[validationFromFieldName];
            regex = this.getExpression(settingContainsValidation.Validation.ValidationExpression, value);
        } else {
            if (
                (settingContainsValidation.Validation &&
                    settingContainsValidation.Validation.ValidationExpression &&
                    settingContainsValidation.Validation.ValidationExpression.length) ||
                (settingContainsValidation.Validators &&
                    settingContainsValidation.Validators.ValidationExpression &&
                    settingContainsValidation.Validators.ValidationExpression.length)
            ) {
                if (settingContainsValidation.Validation)
                    regex = settingContainsValidation.Validation.ValidationExpression[0];
                if (settingContainsValidation.Validators)
                    regex = settingContainsValidation.Validators.ValidationExpression[0];
            }
        }

        return regex;
    }

    getExpression(expressionList, value) {
        for (const expression of expressionList) {
            if (expression.Value == value) {
                return expression;
            }
        }

        return null;
    }

    getRequiredFields(dataSource) {
        const requiredFields = [];

        if (isEmpty(dataSource) || isEmpty(dataSource.columns)) {
            return requiredFields;
        }

        for (const column of dataSource.columns) {
            if (this.hasValidation(column, 'IsRequired')) {
                requiredFields.push(column);
            }
        }

        return requiredFields;
    }

    getHasValidationFromFields(dataSource) {
        const hasValidationFromFields = [];

        if (isEmpty(dataSource) || isEmpty(dataSource.columns)) {
            return hasValidationFromFields;
        }

        for (const column of dataSource.columns) {
            if (this.hasValidation(column, 'ValidationFrom')) {
                hasValidationFromFields.push(column);
            }
        }

        return hasValidationFromFields;
    }

    hasEmptyRow(rows) {
        if (isNullOrUndefined(rows) || isEmpty(rows.data())) {
            return false;
        }

        for (let i = 0; i < rows.data().length; i++) {
            if (!isNullOrUndefined(rows.data()[i]['isNewRow']) && rows.data()[i]['isNewRow'] === true) {
                return true;
            }
        }

        return false;
    }

    getEmptyRowId(rows) {
        if (isNullOrUndefined(rows) || isEmpty(rows.data())) {
            return null;
        }
        let row: any;
        for (let i = 0; i < rows.data().length; i++) {
            if (!isNullOrUndefined(rows.data()[i]['isNewRow']) && rows.data()[i]['isNewRow'] === true) {
                row = rows.data()[i]['DT_RowId'];
            }
        }

        return row;
    }

    getErrorCell(dtOptions, invalidField, nativeElement) {
        let idx = -1;

        const notHiddenColumns = dtOptions.columns.filter((col) => {
            return !this.getDisplayFieldValue(col, 'Hidden');
        });

        for (let i = 0; i < notHiddenColumns.length; i++) {
            if (notHiddenColumns[i].data === invalidField.name()) {
                idx = i;
            }
        }

        if (idx !== -1) {
            const errorCell = $('tr#' + invalidField.multiIds()[0], nativeElement)
                .children()
                .eq(idx);
            if (errorCell) {
                return errorCell;
            }
        }

        return null;
    }

    getErrorRow(dtOptions, invalidField, nativeElement) {
        const errorRow = $('tr#' + invalidField.multiIds()[0], nativeElement);
        if (errorRow) {
            return errorRow;
        }

        return null;
    }

    getNodeKeyName(columns: any[], getParentNode?: boolean) {
        for (let i = 0; i < columns.length; i++) {
            if (
                this.hasDisplayField(columns[i], getParentNode ? 'ParentNodeKeyName' : 'NodeKeyName') &&
                this.getDisplayFieldValue(columns[i], getParentNode ? 'ParentNodeKeyName' : 'NodeKeyName') == 1
            ) {
                return columns[i].data;
            }
        }

        return null;
    }

    buildDragDropTableData(tableData) {
        const result: Array<any> = [];
        for (let i = 0; i < tableData.rows().data().length; i++) {
            result.push(tableData.rows().data()[i]);
        }

        return result;
    }

    updateDragDropTableData(tableData, newRowData) {
        for (let i = 0; i < tableData.length; i++) {
            if (tableData[i].DT_RowId === newRowData.DT_RowId && tableData[i] !== newRowData) {
                tableData[i] = newRowData;
            }
        }

        return tableData;
    }

    createReadOnlyColumnSetting() {
        return {
            DataLength: '',
            DataType: '',
            OriginalColumnName: '',
            Setting: [
                {
                    DisplayField: {
                        ReadOnly: '1',
                    },
                },
            ],
        };
    }

    createEmptyRowData(newItem, column, config, dataLength) {
        newItem['DT_RowId'] = 'newrow_' + dataLength;

        if (column.data === BUTTON_COLUMNS.mediaCodeButton && config && config.allowMediaCode) {
            newItem[BUTTON_COLUMNS.mediaCodeButton] = null;
        }

        if (column.data === BUTTON_COLUMNS.download && config && config.allowDownload) {
            newItem[BUTTON_COLUMNS.download] = null;
        }

        if (column.data === CHECKBOX_COLUMNS.selectAll && config && config.allowSelectAll) {
            newItem[CHECKBOX_COLUMNS.selectAll] = null;
        }

        if (column.data === CHECKBOX_COLUMNS.deleted && config && config.allowDelete) {
            newItem[CHECKBOX_COLUMNS.deleted] = false;
        }

        if (column.data === BUTTON_COLUMNS.InvoicePDF) {
            newItem[BUTTON_COLUMNS.InvoicePDF] = null;
        }

        if (column.data === BUTTON_COLUMNS.PDF) {
            newItem[BUTTON_COLUMNS.PDF] = null;
        }

        if (column.data === BUTTON_COLUMNS.Tracking) {
            newItem[BUTTON_COLUMNS.Tracking] = null;
        }

        if (column.data === BUTTON_COLUMNS.Return) {
            newItem[BUTTON_COLUMNS.Return] = null;
        }

        if (column.data === BUTTON_COLUMNS.SendLetter) {
            newItem[BUTTON_COLUMNS.SendLetter] = null;
        }

        if (column.data === BUTTON_COLUMNS.Unblock) {
            newItem[BUTTON_COLUMNS.Unblock] = null;
        }

        if (column.data === BUTTON_COLUMNS.Delete) {
            newItem[BUTTON_COLUMNS.Delete] = null;
        }

        if (column.data === BUTTON_COLUMNS.EditRow) {
            newItem[BUTTON_COLUMNS.EditRow] = null;
        }

        if (!BUTTON_COLUMNS[column.data]) {
            if (this.hasControlType(column)) {
                let controlTypeName = this.getControlTypeName(column);
                if (!controlTypeName) {
                    controlTypeName = this.getControlTypeNameFromColumnDefine(column);
                }

                switch (controlTypeName.toLowerCase()) {
                    case 'combobox':
                        newItem[column.data] = {
                            key: '',
                            value: '',
                            options: [],
                        };
                        break;
                    case 'numeric':
                        newItem[column.data] = 0;
                        break;
                    case 'textbox':
                        newItem[column.data] = null;
                        break;
                    case 'datetimepicker':
                        newItem[column.data] = new Date();
                        break;
                    case 'checkbox':
                    case 'disablerow':
                        newItem[column.data] = false;
                        break;
                }
            } else {
                newItem[column.data] = null;
            }
        }

        return newItem;
    }

    private getNumberSetting(column, name) {
        let number = null;
        if (this.hasDisplayField(column, name)) {
            number = this.getDisplayFieldValue(column, name);
            if (number) {
                number = parseInt(number);
            }
        }

        return number;
    }

    buildWijmoDataSource(dataSource, config?) {
        if (!dataSource || !dataSource.data) return null;

        const numericColumns = [];
        const datetimepickerColumns = [];
        const comboboxColumns = [];
        const autoCompleteColumns = [];

        for (const column of dataSource.columns) {
            let isReadOnly = false;
            if (this.hasDisplayField(column, 'Readonly')) {
                isReadOnly = this.getDisplayFieldValue(column, 'Readonly') === '1';
            } else {
                isReadOnly = isNil(column.readOnly) ? false : column.readOnly;
            }
            column.readOnly = isReadOnly;

            let isVisible = false;
            if (this.hasDisplayField(column, 'Hidden')) {
                isVisible = this.getDisplayFieldValue(column, 'Hidden') != '1';
            } else {
                isVisible = isNil(column.visible) ? true : column.visible;
            }
            column.visible = isVisible;

            column.autoSize =
                this.hasDisplayField(column, 'AutoSize') && this.getDisplayFieldValue(column, 'AutoSize') === '1';
            column.required = this.hasValidation(column, 'IsRequired');

            column.width = this.getNumberSetting(column, 'Width');
            column.align = this.hasDisplayField(column, 'Align')
                ? this.getDisplayFieldValue(column, 'Align').toLowerCase()
                : null;
            column.fontWeight = this.hasDisplayField(column, 'FontWeight')
                ? this.getDisplayFieldValue(column, 'FontWeight').toLowerCase()
                : null;
            column.valueAlign = this.hasDisplayField(column, 'ValueAlign')
                ? this.getDisplayFieldValue(column, 'ValueAlign').toLowerCase()
                : null;
            column.allowResizing = this.hasDisplayField(column, 'AllowResizing')
                ? this.getDisplayFieldValue(column, 'AllowResizing')
                : true;
            column.allowSorting = this.hasDisplayField(column, 'AllowSorting')
                ? this.getDisplayFieldValue(column, 'AllowSorting')
                : true;
            column.disableFilter = this.hasDisplayField(column, 'DisableFilter')
                ? this.getDisplayFieldValue(column, 'DisableFilter')
                : false;
            column.maxWidth = this.getNumberSetting(column, 'MaxWidth');
            column.minWidth = this.getNumberSetting(column, 'MinWidth');
            column.disabledBy = this.hasDisplayField(column, 'DisabledBy')
                ? this.getDisplayFieldValue(column, 'DisabledBy')
                : null;

            column.headerClass = this.getHeaderClassValue(column);
            if (this.hasCustomStyle(column)) {
                let customStyle: any = this.getCustomStyleValue(column);
                if (typeof customStyle === 'string') {
                    customStyle = Uti.tryParseJson(customStyle);
                }
                column.customStyle = customStyle;
            }

            let controlTypeName = this.getControlTypeName(column);
            if (!controlTypeName) {
                controlTypeName = this.getControlTypeNameFromColumnDefine(column);
            }
            column.controlType = controlTypeName.toLowerCase();
            switch (column.controlType) {
                case 'textbox':
                case 'reftextbox':
                    column.dataType = 'String';
                    break;
                case 'combobox':
                    column.dataType = 'Object';
                    comboboxColumns.push(column);
                    break;
                case 'autocomplete':
                    column.dataType = 'Object';
                    autoCompleteColumns.push(column);
                    break;
                case 'datetimepicker':
                    column.dataType = 'Date';
                    column.format = 'd';
                    datetimepickerColumns.push(column);
                    break;
                case 'checkbox':
                case 'disablerow':
                    column.dataType = 'Boolean';
                    break;
                case 'integer':
                    column.dataType = 'Number';
                    column.controlType = 'numeric';
                    column.format = 'n0';
                    break;
            }

            if (
                column.setting &&
                column.setting.DataType &&
                column.setting.DataType.toLowerCase() === 'bit' &&
                config &&
                !config.hasDisableRow
            ) {
                column.dataType = 'Boolean';
            }

            if (column.data === 'DT_RowId') {
                column.visible = false;
            }

            if (config && config.hasCountryFlagColumn && column.data == 'Country') {
                if (this.hasSetting(column)) {
                    column.setting.Setting[0]['ControlType'] = { Type: 'CountryFlag' };
                }
            }

            let willPushNumericColumn = false;
            if (this.hasControlType(column)) {
                const controlType = this.getSettingContainsControlType(column.setting.Setting).ControlType.Type;
                if (controlType) {
                    column.controlType = controlType;
                    if (controlType.toLowerCase() === 'numeric') {
                        willPushNumericColumn = true;
                    }
                }
            } else if (column.setting && (column.setting.DataType == 'decimal' || column.setting.DataType == 'money')) {
                column.controlType = 'Numeric';
                willPushNumericColumn = true;
            }

            if (willPushNumericColumn) {
                if (this.hasControlType(column)) {
                    const controlType = this.getSettingContainsControlType(column.setting.Setting).ControlType;
                    column.allowNumberSeparator = isNil(controlType.AllowNumberSeparator)
                        ? true
                        : controlType.AllowNumberSeparator;
                }
                numericColumns.push(column);
            }

            if (BUTTON_COLUMNS[column.data]) {
                column.controlType = 'Button';
            }

            if (CHECKBOX_COLUMNS[column.data]) {
                column.controlType = 'Checkbox';
            }
        }

        for (const dt of dataSource.data) {
            for (const prop in dt) {
                if (isString(dt[prop]) && dt[prop] === '') {
                    dt[prop] = null;
                } else if (typeof dt[prop] === 'object' && isEmpty(dt[prop])) {
                    let columnDef = dataSource.columns.find((x) => x.data === prop);
                    if (!columnDef) {
                        continue;
                    }
                    switch (columnDef.dataType) {
                        case 'Boolean':
                            dt[prop] = false;
                            break;
                        default:
                            dt[prop] = null;
                            break;
                    }
                }
            }

            if (config) {
                if (config.allowMediaCode) {
                    dt.mediaCodeButton = null;
                }

                if (config.allowDownload) {
                    dt.download = null;
                }

                if (config.allowSelectAll && isNil(dt.selectAll)) {
                    dt.selectAll = null;
                }

                if (config.allowDelete) {
                    dt.deleted = !dt.deleted ? false : dt.deleted;
                }

                if (config.hasNoExport) {
                    dt.noExport = !dt.noExport ? false : dt.noExport;
                }

                if (
                    config &&
                    config.hasCountryFlagColumn &&
                    dt.hasOwnProperty('Country') &&
                    dt.hasOwnProperty('IsoCode')
                ) {
                    dt['Country'] = dt['IsoCode'] + ',' + dt['Country'];
                }
            }

            for (const col of numericColumns) {
                if (dt[col.data]) {
                    dt[col.data] = parseFloat(dt[col.data]);
                }
            }

            for (const col of datetimepickerColumns) {
                if (!isEmpty(dt[col.data])) {
                    if (dt[col.data].indexOf('/') === -1) {
                        let dateObj = parse(dt[col.data], 'dd.MM.yyyy', new Date());
                        if (isNaN(dateObj.getTime())) dateObj = new Date(dt[col.data]);
                        dt[col.data] = format(dateObj, 'MM/dd/yyyy');
                    }
                } else {
                    dt[col.data] = null;
                }
            }

            for (const col of comboboxColumns) {
                this.setDataForComboboxColumn(dt, col);
                dt[col.data].options = [];
            }

            for (const col of autoCompleteColumns) {
                this.setDataForComboboxColumn(dt, col);
            }
        }

        if (config) {
            if (config.allowMediaCode) {
                dataSource.columns.push({
                    data: BUTTON_COLUMNS.mediaCodeButton,
                    readOnly: true,
                    required: false,
                    title: 'Mediacode price',
                    visible: true,
                    setting: {},
                });
            }

            if (config.allowDownload) {
                dataSource.columns.push({
                    data: BUTTON_COLUMNS.download,
                    readOnly: true,
                    required: false,
                    title: 'Download',
                    visible: false,
                    setting: {},
                });
            }

            if (config.allowSelectAll) {
                dataSource.columns.push({
                    data: CHECKBOX_COLUMNS.selectAll,
                    readOnly: false,
                    required: false,
                    title: 'Select all',
                    visible: false,
                    controlType: 'Checkbox',
                    setting: {},
                });
            }

            if (config.allowDelete && !this.hasCustomColumn(dataSource.columns, 'deleted')) {
                dataSource.columns.push({
                    data: CHECKBOX_COLUMNS.deleted,
                    readOnly: true,
                    required: false,
                    title: 'Delete',
                    visible: true,
                    controlType: 'Checkbox',
                    setting: {},
                });
            }

            if (config.hasNoExport) {
                dataSource.columns.push({
                    data: CHECKBOX_COLUMNS.noExport,
                    readonly: false,
                    required: false,
                    title: 'No export',
                    visible: true,
                    controlType: 'Checkbox',
                    setting: {},
                });
            }
        }

        return {
            data: dataSource.data,
            columns: dataSource.columns,
        };
    }

    private setDataForComboboxColumn(dt, col) {
        let jsonData = [];

        if (isEmpty(dt[col.data])) {
            jsonData = [];
        } else if (typeof dt[col.data] === 'string') {
            jsonData = JSON.parse(dt[col.data]);
        } else {
            jsonData.push(dt[col.data]);
        }

        const key = jsonData && jsonData.length && jsonData[0].key ? jsonData[0].key.toString() : '';
        const value = jsonData && jsonData.length ? jsonData[0].value : '';
        dt[col.data] = {
            key: key,
            value: value,
        };
    }

    private hasCustomColumn(columns: any, customColumnName): boolean {
        if (!columns || !columns.length) return false;
        const deleteColumn = columns.find((x) => x.data === customColumnName);
        return deleteColumn && deleteColumn.visible;
    }

    findKeyByValue(options, selectedValue) {
        return options.find((opt) => opt.label == selectedValue)
            ? options.find((opt) => opt.label == selectedValue).value
            : '';
    }

    findValueByKey(options, selectedKey) {
        return options.find((opt) => opt.value == selectedKey)
            ? options.find((opt) => opt.value == selectedKey).label
            : '';
    }

    buildWijmoFilterColumns(columns, config, noFilterColumns?: string[]) {
        const result = [];
        for (const col of columns) {
            if (config.allowDelete && col.data === CHECKBOX_COLUMNS.deleted) {
                continue;
            }

            if (config.allowMediaCode && col.data === BUTTON_COLUMNS.mediaCodeButton) {
                continue;
            }

            if (config.allowDownload && col.data === BUTTON_COLUMNS.download) {
                continue;
            }

            if (config.allowSelectAll && col.data === CHECKBOX_COLUMNS.selectAll) {
                continue;
            }

            if (col.data === BUTTON_COLUMNS.InvoicePDF) {
                continue;
            }

            if (col.data === BUTTON_COLUMNS.PDF) {
                continue;
            }

            if (col.data === BUTTON_COLUMNS.Tracking) {
                continue;
            }

            if (col.data === BUTTON_COLUMNS.Return) {
                continue;
            }

            if (col.data === BUTTON_COLUMNS.SendLetter) {
                continue;
            }

            if (col.data === BUTTON_COLUMNS.Unblock) {
                continue;
            }

            if (col.data === BUTTON_COLUMNS.Delete) {
                continue;
            }

            if (col.data === BUTTON_COLUMNS.EditRow) {
                continue;
            }

            if (col.disableFilter) {
                continue;
            }

            if (noFilterColumns && noFilterColumns.indexOf(col.data) !== -1) {
                continue;
            }

            result.push(col.data);
        }

        return result;
    }

    buildDataSourceFromEsSearchResult(response: EsSearchResult, columnSettingIndex: number) {
        // Model List
        const results: Array<any> = response.results;

        // Setting handler
        const setting: any = response.setting;
        if (!setting) {
            return;
        }

        const columnSetting: Array<any> = JSON.parse(setting[0][0].SettingColumnName)[columnSettingIndex].ColumnsName;

        const columns: Array<any> = [];
        for (const displayCol of columnSetting) {
            const col = {
                title: displayCol.ColumnHeader,
                data: displayCol.ColumnName,
                setting: displayCol,
            };
            columns.push(col);
        }

        const formatResults: Array<any> = [];
        if (results)
            for (const model of results) {
                const keys = Object.keys(model);
                const formatModel: any = {};
                for (const col of columns) {
                    const rs = keys.filter((p) => p.toLowerCase() === col.data.toLowerCase());
                    if (rs.length > 0) {
                        formatModel[col.data] = model[rs[0]];
                    } else {
                        formatModel[col.data] = '';
                    }
                }
                formatResults.push(formatModel);
            }

        return {
            data: formatResults,
            columns: columns,
            totalResults: response.total,
        };
    }

    public buildGroupWidgetDetailFromRawData(data: any) {
        if (!data || !data.length) return [];

        const objData = data[0][0];
        let result: Array<any> = [];
        for (const key in objData) {
            if (objData[key]) {
                const arrayCols = JSON.parse(objData[key]);
                for (const col of arrayCols) {
                    for (const key2 in col) {
                        let col2 = col[key2][0];
                        col2['Group'] = key;
                        result.push(col2);
                    } //for
                } //for
            }
        } //for

        return result;
    }

    public influencingField(settingArray: any, dataRow: any[], currentColumn: string, currentValue: any) {
        const controlType = this.getSettingContainsControlType(settingArray)?.ControlType;
        const influenceField = controlType?.InfluenceField;
        const influenced = controlType?.Influenced;
        if (!influenceField && !influenced) return;
        dataRow[influenced] = this.calcTotalForInfluenced(influenceField, dataRow, currentColumn, currentValue);

        const influenceParentField = controlType?.InfluenceParentField;
        const influencedParent = controlType?.InfluencedParent;
        if (!influencedParent && !influenceParentField) return;
        dataRow[influencedParent] = this.calcTotalForInfluenced(
            influenceParentField,
            dataRow,
            currentColumn,
            currentValue,
        );
    }

    public affectingField(settingArray: any, dataRow: any[], curentColumn: string): any {
        let value;
        const controlType = this.getSettingContainsControlTypeNotBelongType(settingArray)?.ControlType;

        const affectToField = controlType?.AffectToField;
        const affectByField = controlType?.AffectByField;
        value = {
            colId: affectToField,
            data: dataRow[affectToField],
        };

        if (!affectToField && !affectByField) return value;

        if (dataRow[affectToField]) return value;

        value.data = affectByField.includes(curentColumn);
        return value;
    }

    private calcTotalForInfluenced(
        influences: any[],
        dataRow: any[],
        currentColumn: string,
        currentValue: any,
    ): number {
        let total = 1;
        influences.forEach((element) => {
            let value;
            if (element['Type'] === 'Combobox') {
                value = dataRow[element['Value']]?.value || 0;
            } else {
                value = dataRow[element['Value']];
            }

            if (element['Value'] === currentColumn) value = currentValue;
            if (element['IsPercent'] === '1') total = total / 100;

            const numberValue = Number(value);
            total *= numberValue;
        });
        return Number(total.toFixed(2));
    }

    public buildObjUpdate1ForAll(
        settingArray: any,
        previousSelected: any,
        currentKey: string,
        currentValue: string,
        colId: string,
    ): any {
        const update1ForAll = this.getValueUpdate1ForAll(settingArray);
        // if (previousSelected && update1ForAll === '1' && previousSelected.key !== currentKey) {
        if (update1ForAll === '1') {
            return {
                column: colId,
                data: { key: currentKey, value: currentValue },
            };
        }
        return null;
    }
}
