import { GlobalSearchFilterModel } from './global-search-filter.model';

export class Module {
    public idSettingsGUI?: number = null;
    public idSettingsGUIParent?: number = null;
    public moduleName?: string = '';
    public moduleNameTrim?: string = '';
    public path?: string = '';
    public iconName?: string = '';
    public iconNameOver?: string = '';
    public isCanNew?: boolean = false;
    public isCanSearch?: boolean = false;
    public toDisplay?: string = '';
    public searchIndexKey?: string = '';
    public searchKeyword?: string = '';
    public filter?: GlobalSearchFilterModel = null;
    public isChecked?: boolean = false;
    public children?: Module[] = null;
    public accessRight?: any;

    public constructor(init?: Partial<Module>) {
        Object.assign(this, init);
        this.moduleNameTrim = this.path
            ? this.path.replace(/\s/g, '').replace(/\&/g, '')
            : this.moduleName
            ? this.moduleName.replace(/\s/g, '').replace(/\&/g, '')
            : '';
    }
}
