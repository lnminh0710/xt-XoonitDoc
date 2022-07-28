
export class WidgetTemplateSettingModel {
    public idRepWidgetApp: number = null;
    public idRepWidgetType: number = null;
    public defaultValue: string = '';
    public description: string = '';
    public iconName: string = '';
    public jsonString: string = '';
    public minRowOfColumns: number = null;
    public widgetDataType: string = '';
    public updateJsonString: string = '';
    public isMainArea: boolean = false;
    public defaultProperties: string = '';
    public idSettingsGUI: number;

    public constructor(init?: Partial<WidgetTemplateSettingModel>) {
        Object.assign(this, init);
    }
}
