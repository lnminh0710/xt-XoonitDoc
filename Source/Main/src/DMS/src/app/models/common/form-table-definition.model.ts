import { AbstractFormDefinition } from './abstract-form-definition.model';
import { ColumnDefinitionSetting } from './column-definition.model';
import { DataGrid } from './data-grid.model';

export interface FormTableDefinition extends AbstractFormDefinition {
    data: any[];
    columns: FormTableColumnDefinition[];
    isHorizontal: boolean;
    dataGrids?: DataGrid[];
}

export interface FormTableColumnDefinition {
    SettingColumnName: FormTableSettingColumnName[];
}

export interface FormTableSettingColumnName {
    WidgetSetting: {
        WidgetTitle: string;
    };
    ColumnSetting: TableColumnSetting;
    TableDirectionSetting: TableDirectionSetting
}

export interface TableColumnSetting {
    ColumnsName: TableColumnDef[];
}

export interface TableDirectionSetting {
    EnterDirection: number;
}

export interface TableColumnDef {
    ColumnName: string;
    ColumnHeader: string;
    value: any;
    DataType: string;
    DataLength: number;
    OriginalColumnName: string;
    Setting: ColumnDefinitionSetting[];
}
