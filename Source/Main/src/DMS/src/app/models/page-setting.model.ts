import { WidgetDetailPage } from '@app/models/widget-detail';

export class PageSetting {
    public idSettingsPage: number = null;
    public objectNr: string = '';
    public pageName: string = '';
    public pageType: string = '';
    public description: string = '';
    public jsonSettings: string = '';
    public isActive: string = '';
    public widgets: Array<WidgetDetailPage> = null;
    public idSettingsGUI?: number;

    public constructor(init?: Partial<PageSetting>) {
        Object.assign(this, init);
    }
}
