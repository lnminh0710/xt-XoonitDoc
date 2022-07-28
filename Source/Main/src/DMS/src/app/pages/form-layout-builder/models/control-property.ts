export class ControlProperty {
    public id: string = '';
    public name: string = '';
    public value: any = null;
    public disabled: boolean = false;
    public controlType: string = '';
    //public options: any[] = [];
    public children: any[] = [];
    public dirty: boolean = false;
    public visible: boolean = false;
    //public dropdownFieldDepend: string;

    public constructor(init?: Partial<ControlProperty>) {
        Object.assign(this, init);
    }
}

export class DropdownControlProperty extends ControlProperty {

    public options: any[] = [];
    public keyFromComboApi: string;
    public loadDataFromField: string;
    public dropdownFieldDepend: string;

    public constructor(init?: Partial<DropdownControlProperty>) {
        super();
        Object.assign(this, init);
    }
}

export class ControlTypeConst {   
    public static readonly TEXTBOX = 'textbox';
    public static readonly NUMERIC = 'numeric';
    public static readonly DROPDOWN = 'dropdown';
    public static readonly MULTISELECT = 'multiselect';
    public static readonly CHECKBOX = 'checkbox';
    public static readonly RADIO = 'radio';
    public static readonly DATEFORMAT = 'dateformat';
    public static readonly LABEL = 'label';
    public static readonly COLOR = 'color';
    public static readonly MULTISELECTCOMBOBOX = 'multiselectcombobox';    
}
