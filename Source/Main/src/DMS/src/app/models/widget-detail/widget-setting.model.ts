
export class WidgetSettingModel {
    public idSettingsWidget: number = null;
    public idRepWidgetApp: number = null;
    public objectNr: string = '';
    public widgetName: string = '';
    public widgetType: string = '';
    public description: string = '';
    public jsonSettings: string = '';
    public isActive: boolean = true;
    public idSettingsGUI?: number;

    public constructor(init?: Partial<WidgetSettingModel>) {
        Object.assign(this, init);
    }
}
