import { DataColumn } from '@app/models';

export class DoubletCheckMainFake {
    public createFakedColumnsForCountryGrid() {
        const columns = [];
        columns.push(this.makeColumn('Id', 'IdRepIsoCountryCode', false, '35', 'nvarchar', 'textbox', 'Id', false));
        columns.push(this.makeColumn('', 'select', true, '35', 'Boolean', 'checkbox', 'select', false, null, null, 50));
        columns.push(this.makeColumn('Country', 'Country', true, '255', 'nvarchar', 'countryflag', 'Country', true));
        return columns;
    }

    public createFakedColumnsForColumnsGrid() {
        const columns = [];
        columns.push(this.makeColumn('Id', 'Id', false, '35', 'nvarchar', 'textbox', 'Id', true));
        columns.push(this.makeColumn('', 'select', true, '35', 'Boolean', 'checkbox', 'select', false, null, null, 50));
        columns.push(this.makeColumn('Column name', 'ColumnName', true, '35', 'nvarchar', 'textbox', 'ColumnName', true));
        const levelValidation = {
            ValidationFrom: "select",
            ValidationExpression: [
                { 'Value': '1', 'Regex': '^[1-9][0-9]*$', 'ErrorMessage': 'Incorrect input data' }
            ]
        };
        columns.push(this.makeColumn('Level', 'Level', true, '35', 'nvarchar', 'numeric', 'Level', false, levelValidation, null, 50));
        return columns;
    }

    public createFakedColumnsForEventColumnsData() {
        const columns = [];
        columns.push(this.makeColumn('Group Id', 'GroupId', false, '255', 'nvarchar', '', 'GroupId', true));
        columns.push(this.makeColumn('Group name', 'GroupName', true, '255', 'nvarchar', 'textbox', 'GroupName', true));
        columns.push(this.makeColumn('Last matching', 'LastMatching', true, '255', 'nvarchar', 'Date', 'LastMatching', true));
        columns.push(this.makeColumn('Status', 'MatchingStatus', true, '1', '', '', '', true, null, null, 50));
        columns.push(this.makeColumn('Active', 'IsActive', true, '35', 'Boolean', 'checkbox', 'IsActive', false, null, null, 80, true));
        return columns;
    }

    public makeColumn(
        title: any,
        columnName: string,
        visible: boolean,
        dataLength: string,
        dataType: string,
        controlType: string,
        originalColumnName: string,
        readOnly?: boolean,
        validator?: any,
        className?: string,
        width?: number,
        disableFilter?: boolean): any {
        return {
            title: title,
            data: columnName,
            visible: visible,
            minWidth: 70,
            setting: {
                DataLength: dataLength,
                DataType: dataType,
                OriginalColumnName: originalColumnName,
                Setting: [
                    {
                        ControlType: {
                            Type: controlType
                        },
                        DisplayField: {
                            ReadOnly: readOnly ? '1' : '0',
                            Hidden: visible ? '0' : '1',
                            Width: width || null,
                            DisableFilter: disableFilter || false
                        },
                        Validation: validator
                    }
                ]
            },
            className: className
        };
    }
}
