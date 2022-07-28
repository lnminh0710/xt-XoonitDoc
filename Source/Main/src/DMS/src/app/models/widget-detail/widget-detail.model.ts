import { NgGridItemConfig } from '@app/shared/components/grid-stack';
import { FilterModeEnum, WidgetLayoutSettingModeEnum, WidgetFormTypeEnum, OrderDataEntryWidgetLayoutModeEnum } from '@app/app.constants';
import { FieldFilter, ColumnLayoutSetting, WidgetKeyType } from '@app/models';
import { WidgetUtils } from '@app/shared/components/widget/utils';
import { WidgetPropertyModel } from '@app/models/property-panel';
import { RowSetting } from '../filter-mode.model';

export class WidgetDetail {
    public idSettingsWidget: number = null;
    public id: string = '';
    public idRepWidgetType: number = null;
    public idRepWidgetApp: number = null;
    public moduleName: string = '';
    public title: string = '';
    public fieldsTranslating: boolean = false;

    // Detail widget content
    public contentDetail: any = {};

    // Request string for get widget data
    public request: string = '';

    // Request string for updating data
    public updateRequest: string = '';

    // Widget Settings
    public widgetDataType: WidgetDataType = null;

    public isMainArea: boolean = false;

    public defaultProperties: string = '';

    // Custom Data (Optional)
    public extensionData: any = '';

    // Used for table widget that have the same type.
    public syncWidgetIds: Array<string> = null;

    public constructor(init?: Partial<WidgetDetail>) {
        Object.assign(this, init);
        this.widgetDataType = (init && init.widgetDataType) ? new WidgetDataType(init.widgetDataType) : null;
    }
}

/**
 * IListenKeyConfig
 */
export interface IListenKeyConfig {
    key: string;
    filterKey: string;
}

/**ListenKey
 * 
 */
export class ListenKey {
    private _main: Array<IListenKeyConfig> = null;
    set main(data: Array<IListenKeyConfig> | any) {
        if (Array.isArray(data)) {
            this._main = data;
        }
        // Fix for old values (not array)
        else if (data) {
            this._main = [data];
        }
        else {
            this._main = null;
        }
    }

    get main() {
        return this._main;
    }

    public sub: Array<IListenKeyConfig> = null;
    public key: string = null;

    public constructor(init?: Partial<ListenKey>) {
        Object.assign(this, init);
    }
}

/**
 * WidgetDataType
 */
export class WidgetDataType {
    public listenKey: ListenKey;
    public filterKey: string;
    public jsonTextUpdate: string;
    public primaryKey: string;
    public isPrimaryKeyForMain: boolean;
    public editTableSetting: EditTableSetting;
    public editFormSetting: EditFormSetting;

    // Parent Widget IDs
    public parentWidgetIds: Array<string>;

    public constructor(init?: Partial<WidgetDataType>) {
        Object.assign(this, init);
        this.listenKey = (init && init.listenKey) ? new ListenKey(init.listenKey) : null;
        this.editTableSetting = (init && init.editTableSetting) ? new EditTableSetting(init.editTableSetting) : null;
    }

    public listenKeyRequest(moduleId: string): { [key: string]: any } {
        let filterParam = {};
        let mainValue, subValue: string;
        let widgetUtils: WidgetUtils = new WidgetUtils();

        if (this.filterKey) {
            this.filterKey.split(',').forEach(filKey => {
                filterParam[filKey] = '';
            });
        }

        if (this.listenKey.main && this.listenKey.main.length) {
            this.listenKey.main.forEach(mainKey => {
                mainValue = widgetUtils.getValueFromWidgetDataTypeValues(moduleId, mainKey.key, true);
                const filterKey = mainKey.filterKey || mainKey.key;
                filterParam[filterKey] = (mainValue != null && mainValue != undefined) ? mainValue : null;
            });
        }

        if (this.listenKey.sub && this.listenKey.sub.length) {
            // Find valid parent
            let parentId = this.parentWidgetIds && this.parentWidgetIds.length ? this.parentWidgetIds[0] : '';
            if (WidgetUtils.widgetDataTypeValues[moduleId]) {
                if (WidgetUtils.widgetDataTypeValues[moduleId].renderFor && WidgetUtils.widgetDataTypeValues[moduleId].renderFor.length) {
                    this.parentWidgetIds.forEach(prId => {
                        WidgetUtils.widgetDataTypeValues[moduleId].renderFor.forEach(widgetTargetRender => {
                            if (prId == widgetTargetRender.srcWidgetId && widgetTargetRender.widgetKeyType == WidgetKeyType.Sub) {
                                parentId = prId;
                            }
                        });
                    });
                }
            }
            this.listenKey.sub.forEach(sub => {
                subValue = widgetUtils.getValueFromWidgetDataTypeValues(moduleId, sub.key, false, parentId);
                filterParam[sub.filterKey] = (subValue != null && subValue != undefined ) ? subValue : null;
                if (subValue && WidgetUtils.widgetDataTypeValues[moduleId] &&
                    WidgetUtils.widgetDataTypeValues[moduleId][this.filterKey] &&
                    WidgetUtils.widgetDataTypeValues[moduleId][this.filterKey].Sub && WidgetUtils.widgetDataTypeValues[moduleId][this.filterKey].Sub.length) {

                    const arraySub: Array<any> = WidgetUtils.widgetDataTypeValues[moduleId][this.filterKey].Sub;
                    const findItem = arraySub.find(item => item['value'] == subValue);
                    if (findItem)
                        filterParam['item'] = findItem.item;
                }
            });
        }
        return filterParam;
    }

    public get listenKeyCount() {
        let count: number = 0;
        if (this.listenKey.main && this.listenKey.main.length) {
            count += this.listenKey.main.length;
        }
        if (this.listenKey.sub && this.listenKey.sub.length) {
            count += this.listenKey.sub.length;
        }
        return count;
    }
}

/**
 * EditFormSetting
 **/
export class EditFormSetting {
    public swithToEdit: boolean;
    public key: string;
}

/**
 * EditTableSetting
 */
export class EditTableSetting {
    public edit: string = '0';
    public addNew: string = '0';
    public delete: string = '0';
    public mediaCode: string = '0';
    public fitColumn: string = '0';
    public colTranslate: string;
    public treeView: string = '0';
    public showFilter: string = '0';
    public masterDetail: string;
    public groupType: string;

    public get allowMasterDetail(): boolean {
        if (this.masterDetail)
            return true;
        return false;
    }

    public get allowEditRow(): boolean {
        if (this.edit == '1' || this.addNew == '1' || this.delete == '1')
            return true;
        return false;
    }

    public get allowNewRowAdd(): boolean {
        if (this.addNew == '1')
            return true;
        return false;
    }

    public get allowRowDelete(): boolean {
        if (this.delete == '1')
            return true;
        return false;
    }

    public get allowMediaCode(): boolean {
        if (this.mediaCode == '1')
            return true;
        return false;
    }

    public get allowFitColumn(): boolean {
        if (this.fitColumn == '1')
            return true;
        return false;
    }

    public get allowColTranslation(): boolean {
        if (this.colTranslate)
            return true;
        return false;
    }

    public get allowTreeView(): boolean {
        if (this.treeView == '1')
            return true;
        return false;
    }

    public get allowShowFilter(): boolean {
        if (this.showFilter == '1')
            return true;
        return false;
    }

    public constructor(init?: Partial<EditTableSetting>) {
        Object.assign(this, init);
    }
}

export class FilterData {
    public filterMode: FilterModeEnum = FilterModeEnum.ShowAll;
    public subFilterMode: FilterModeEnum = FilterModeEnum.ShowAll;
    public fieldFilters: Array<FieldFilter> = [];
    public columnLayoutsetting: ColumnLayoutSetting = null;
    public rowSetting: RowSetting = null;
    public widgetLayoutSettingMode: WidgetLayoutSettingModeEnum = WidgetLayoutSettingModeEnum.FullWidth;
    public widgetFormType: WidgetFormTypeEnum = null;
    public orderDataEntryWidgetLayoutMode: OrderDataEntryWidgetLayoutModeEnum = null;
    public orderDataEntryProperties: OrderDataEntryProperties = new OrderDataEntryProperties();

    public constructor(init?: Partial<FilterData>) {
        Object.assign(this, init);
    }
}

/**
 * LightWidgetDetail
 * Used for saving page setting.
 */
export class LightWidgetDetail {
    public id: string = '';
    public widgetDataType: WidgetDataType = null;
    // Used for table widget that have the same type.
    public syncWidgetIds: Array<string> = null;
    // Custom Data (Optional)
    public extensionData: any = null;
    public idRepWidgetType: number = null;
    public idRepWidgetApp: number = null;

    public constructor(init?: Partial<LightWidgetDetail>) {
        // Don't use Object.assign in this case to avoid unnescessary param that causing huge memmory in store
        // Object.assign(this, init);
        this.id = init.id || '';
        this.extensionData = init.extensionData || null;
        this.syncWidgetIds = init.syncWidgetIds || null;
        this.idRepWidgetType = init.idRepWidgetType || null;
        this.idRepWidgetApp = init.idRepWidgetApp || null;
        this.widgetDataType = (init && init.widgetDataType) ? new WidgetDataType(init.widgetDataType) : null;
    }
}

/**
 * WidgetDetailPage
 */
export class WidgetDetailPage {
    public widgetDetail: WidgetDetail = null;
    public defaultValue: string = '';
    public description: string = '';
    public config: NgGridItemConfig = null;
    public columnsLayoutSettings: any;
    public filterData: FilterData = null;
    public properties: WidgetPropertyModel[] = [];

    public constructor(init?: Partial<WidgetDetailPage>) {
        Object.assign(this, init);
        let widgetDetail: WidgetDetail;
        if (init) {
            widgetDetail = Object.assign({}, init.widgetDetail);
        }
        this.widgetDetail = widgetDetail ? <WidgetDetail>(new LightWidgetDetail(widgetDetail)) : null;
    }
}

/**
*GridConfig
*/
export interface GridConfig {
    designSizeDiffPercentage?: number;
}

/**
 * WidgetDetailPageSetting
 */
export class WidgetDetailPageSetting {
    public gridConfig: GridConfig = null;
    [key: string]: any;

    public constructor(init?: Partial<WidgetDetailPageSetting>) {
        Object.assign(this, init);
    }
}

export interface WidgetItemSize {
    width: number;
    height: number;
}


export interface IDragDropCommunicationData {
    srcWidgetDetail?: WidgetDetail;
    mode?: string;
    originalText?: string;
    fieldText?: string;
    fieldColumn?: string;
    originalValue?: string;
    fieldValue?: string;
}

export class DragMode {
    static Default = 'default';
    static Translate = 'translate';
}

/**
 * LayoutPageInfoModel
 */
export class LayoutPageInfoModel {

    public id: string;
    public moduleName: string;
    public widgetboxesTitle: { id: string, title: string, widgetDetail: WidgetDetail }[];

    constructor(init?: Partial<LayoutPageInfoModel>) {
        Object.assign(this, init);
    }
}

/**
 * TableDataState
 */
export class TableDataState {
    public dataSourceTable: any;
    public isTableEdited = false;
    public isOnEditingTable = false;
    public copiedData: any;
    constructor(init?: Partial<TableDataState>) {
        Object.assign(this, init);
    }
}


/**
 * ReloadMode
 **/
export enum ReloadMode {
    ListenKey,
    UpdatingData
}


/**
 * WidgetState
 */
export class WidgetState {
    public key: string;
    public data: WidgetDetail;
    public tableData: TableDataState;
    public selected: boolean;

    constructor(init?: Partial<WidgetState>) {
        Object.assign(this, init);
        this.tableData = new TableDataState();
    }
}

export class OrderDataEntryProperties {
    public multipleRowDisplay = false;
    public autoSwitchToDetail = false;
    public groupView = false;

    constructor(init?: Partial<OrderDataEntryProperties>) {
        Object.assign(this, init);
    }
}
