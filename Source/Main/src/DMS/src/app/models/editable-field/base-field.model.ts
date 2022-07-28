// Ref: https://editor.datatables.net/reference/option/#Field

export class BaseFieldModel {
    public label: string = '';
    public name: string = '';
    public className: string = '';
    public data: any = null;
    public def: any = null;
    public entityDecode: boolean = false;
    public fieldInfo: string = '';
    public id: string = '';
    public labelInfo: string = '';
    public message: string = null;
    public multiEditable: boolean = false;
    public type: string = '';

    public constructor(init?: Partial<BaseFieldModel>) {
        Object.assign(this, init);
    }
}