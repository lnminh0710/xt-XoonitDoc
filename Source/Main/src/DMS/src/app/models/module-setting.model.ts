export class ModuleSettingModel {
    public idSettingsModule: string = '';
    public idLogin: string = '';
    public objectNr: string = '';
    public moduleName: string = '';
    public moduleType: string = '';
    public description: string = '';
    public jsonSettings: string = '';
    public isActive: boolean = false;
    public isDeleted: boolean = false;
    public createDate: string = '';

    public constructor(init?: Partial<ModuleSettingModel>) {
        Object.assign(this, init);
    }
}