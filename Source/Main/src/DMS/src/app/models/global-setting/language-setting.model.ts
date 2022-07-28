export class LanguageSettingModel {
    public flag: string = '';
    public name: string = '';
    public active: boolean = false;
    public idRepLanguage: string;
    public translateModuleType: string;
    public languageCode?: string;

    public constructor(init?: Partial<LanguageSettingModel>) {
        Object.assign(this, init);
    }
}
