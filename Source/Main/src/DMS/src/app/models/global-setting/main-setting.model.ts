export class MainSettingModel {
    public color: string = '';
    public language: string = '';
    
    public constructor(init?: Partial<MainSettingModel>) {
        Object.assign(this, init);
    }
}
