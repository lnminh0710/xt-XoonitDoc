import { ColumnDefinition } from '../common/column-definition.model';

export class ControlGridModel {
    public data: Array<any> = [];
    public columns: ControlGridColumnModel[] = [];
    public totalResults?: number; // Used for paging , this value is total rows

    public constructor(init?: Partial<ControlGridModel>) {
        Object.assign(this, init);
    }
}

export class ControlGridColumnModel {
    public title: any = null;
    public data: any = null;
    public visible: boolean = true;
    public readOnly: boolean = true;
    public dataType?: string;
    public setting: any = null;
    public controlType?: string;
    public minWidth?: any = null;
    public headerClass = '';

    public constructor(init?: Partial<ControlGridColumnModel>) {
        Object.assign(this, init);
    }
}

export class CommunicationColumnHeader {
    private static generateControl(title: string, data: string): ControlGridColumnModel {
        return {
            title: title,
            data: data,
            visible: true,
            readOnly: true,
            setting: null,
            controlType: '',
            minWidth: null,
        } as ControlGridColumnModel;
    }
}

export interface AgGridViewModel<T> {
    data: T[];
    columns: ColumnDefinition[];
    totalResults: number;
}
