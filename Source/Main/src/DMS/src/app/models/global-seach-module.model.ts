export class GlobalSearchModuleModel {
    public idSettingsGUI: number = null;
    public idSettingsGUIParent: number = null;
    public moduleName: string = '';
    public moduleNameTrim?: string = '';
    public children: GlobalSearchModuleModel[] = null;
    public iconName: string = '';
    public isCanNew: boolean = false;
    public isCanSearch: boolean = false;
    public iconNameOver: string = '';

    public parentName: string = '';
    public mainClassName: string = '';
    public controlClassName: string = '';
    public textClassName: string = '';
    public searchResult: number = null;
    public isSearchEmpty: boolean = false;
    public isClicked: boolean = false;
    public isLoading: boolean = false;
    public searchIndexKey: string = '';
    public gridId: string = '';
    public accessRight: any = null;

    public searchResultChildren?: number[] = [];
    public idDocumentTree?: any;

    public constructor(init?: Partial<GlobalSearchModuleModel>) {
        Object.assign(this, init);
    }
}

export class IndexSearchSummary {
    public key: string = '';
    public count: number = null;

    public constructor(init?: Partial<IndexSearchSummary>) {
        Object.assign(this, init);
    }
}
