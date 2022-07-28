export class ParkedItemMenuModel {
    public fieldName: string = '';
    public fieldValue: string = '';
    public isDefault: boolean = false;
    public isAvailable: boolean = false;
    public isChecked: boolean = false;
    public icon: string = '';
    public idSettingsWidgetItems: number = -1

    public constructor(init?: Partial<ParkedItemMenuModel>) {
        Object.assign(this, init);
    }
}
