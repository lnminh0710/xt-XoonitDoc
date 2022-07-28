export class GlobalSearchFilterModel {
    fieldsName?: string[];
    fieldsValue?: string[];
    fieldsJson?: string;

    constructor(params?: Partial<GlobalSearchFilterModel>) {
        Object.assign(this, params);

        this.fieldsName = this.fieldsName || null;
        this.fieldsValue = this.fieldsValue || null;
        this.fieldsJson = this.fieldsJson || null;
    }
}