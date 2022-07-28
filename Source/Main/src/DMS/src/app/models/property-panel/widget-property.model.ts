export class WidgetPropertyModel {
    public id: string = '';
    public name: string = '';
    public value: any = null;
    public translatedValue: any = null;
    public disabled: boolean = false;
    public dataType: string = '';
    public options: any[] = [];
    public children: any[] = [];
    public dirty: boolean = false;
    public visible: boolean = false;

    public constructor(init?: Partial<WidgetPropertyModel>) {
        Object.assign(this, init);
    }
}

export class WidgetPropertiesStateModel {
    public widgetData: any = null;
    public widgetProperties: any = {};

    public constructor(init?: Partial<WidgetPropertiesStateModel>) {
        Object.assign(this, init);
    }
}

export class VersionPropertiesModel {
    public version: string = '';
    public properties: Array<WidgetPropertyModel> = [];

    public constructor(init?: Partial<VersionPropertiesModel>) {
        Object.assign(this, init);
    }
}
