import { Injectable } from '@angular/core';
import isEmpty from 'lodash-es/isEmpty';

@Injectable()
export class XnFileUti {
	private static _REG_GET_FIELDS = new RegExp('(?<=select\\s*)[\\s\\S]*(?=\\s*from)', 'gi');
	private static _REG_REPLACE_FIELD = new RegExp('\\.\\s?(?![^\\(]*\\))');
	private static _REG_REPLACE_SQL = new RegExp('\\,\\s?(?![^\\(]*\\))');

	public static builDataSourceFromSqlText(sqlText: string, isOnlyFields?: boolean): Array<any> {
        if (!sqlText
            || isEmpty(sqlText)
            || !(sqlText.trim())) {
            return [];
        }
        let sqlVariables: any = '';
        if (!isOnlyFields) {
            sqlVariables = sqlText.match(this._REG_GET_FIELDS);
            sqlVariables = (sqlVariables && sqlVariables.length) ? sqlVariables[0] : '';
        } else {
            sqlVariables = sqlText;
        }
        return this.parseVariablesStringToColumns(sqlVariables);
    }
    private static parseVariablesStringToColumns(sqlVariables: string): Array<any> {
        if (!sqlVariables
            || !(sqlVariables.trim())) {
            return [];
        }
        const sqlVariableArr = sqlVariables.replace(/\n/g, "").split(this._REG_REPLACE_SQL);
        let result = [];
        for (let item of sqlVariableArr) {
            const col = this.parseSQLVariableItemToObject(item);
            if (!col) continue;
            result.push(col);
        }
        return result;
    }
    private static parseSQLVariableItemToObject(sqlVariableItem: string): any {
        if (!sqlVariableItem
            || !(sqlVariableItem.trim())) {
            return null;
        }
        const asIndex = sqlVariableItem.toLowerCase().indexOf(' as ');
        if (asIndex < 0) {
            return {
                DataFieldHidden: sqlVariableItem,
                DataField: this.getRightDataField(sqlVariableItem),
                TemplateField: ''
            };
        }
        const dataField = (sqlVariableItem.substring(0, asIndex));
        let templateField = (sqlVariableItem.substring(asIndex + 3, sqlVariableItem.length));
        if (!dataField
            || !(dataField.trim())) {
            return null;
        }
        templateField = templateField ? templateField.trim() : '';
        return {
            DataFieldHidden: dataField,
            DataField: templateField ? templateField : this.getRightDataField(dataField),
            TemplateField: templateField
        };
    }
    private static getRightDataField(dataField: string) {
        if (!dataField
            || !(dataField.trim())) {
            return '';
        }
        const dataFieldArr = dataField.trim().split(this._REG_REPLACE_FIELD);
        return dataFieldArr[dataFieldArr.length - 1];
    }
}