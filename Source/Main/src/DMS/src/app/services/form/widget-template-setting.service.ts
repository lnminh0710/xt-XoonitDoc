import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { WidgetDetail, ListenKey } from '@app/models';
import { BaseService } from '../base.service';
import { Module, WidgetSettingModel, WidgetType } from '@app/models';
import { WidgetUtils } from '@app/shared/components/widget/utils';
import { DatatableService } from '@app/services';
import isString from 'lodash-es/isString';
import cloneDeep from 'lodash-es/cloneDeep';
import { Configuration } from '@app/app.constants';
import { map, catchError } from 'rxjs/operators';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class WidgetTemplateSettingService extends BaseService {
    private _const = new Configuration();

    constructor(
        injector: Injector,
        @Inject(forwardRef(() => DatatableService)) public datatableService: DatatableService,
    ) {
        super(injector);
    }

    /**
     * createWidgetSetting
     * @param widgetSettingModel
     */
    public createWidgetSetting(widgetSettingModel: WidgetSettingModel): Observable<any> {
        return this.post<any>(this.serUrl.createWidgetSetting, JSON.stringify(widgetSettingModel)).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    /**
     * updateWidgetSetting
     * @param widgetSettingModel
     */
    public updateWidgetSetting(widgetSettingModel: WidgetSettingModel): Observable<any> {
        return this.post<any>(this.serUrl.updateWidgetSetting, JSON.stringify(widgetSettingModel)).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    /**
     * deleteWidgetSetting
     * @param widgetSettingModel
     */
    public deleteWidgetSetting(widgetSettingModel: WidgetSettingModel): Observable<any> {
        return this.post<any>(this.serUrl.deleteWidgetSetting, JSON.stringify(widgetSettingModel)).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    /**
     * getWidgetSetting
     * @param sqlFieldName
     * @param sqlFieldValue
     */
    public getWidgetSetting(sqlFieldName: string, sqlFieldValue: string): Observable<any> {
        return this.get<any>(this.serUrl.getWidgetSetting, {
            sqlFieldName: sqlFieldName,
            sqlFieldValue: sqlFieldValue,
        }).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public getAllWidgetTemplateByModuleId(moduleId: string, objectValue?: string): Observable<any> {
        return this.get<any>(this.serUrl.getAllWidgetTemplateByModuleId, {
            xenapr_moduleId: moduleId,
            objectValue: objectValue || '',
        }).pipe(
            map((rs) => {
                if (rs && rs.item)
                    rs.item.forEach((item) => {
                        if (!item.widgetDataType) return;
                        const widgetDataTypeObj = JSON.parse(item.widgetDataType);
                        if (isString(widgetDataTypeObj.listenKey)) {
                            widgetDataTypeObj.listenKey = new ListenKey({
                                main: null,
                                sub: null,
                                key: widgetDataTypeObj.listenKey,
                            });
                            item.widgetDataType = JSON.stringify(widgetDataTypeObj);
                        }
                    });
                return rs.item;
            }),
        );
    }

    public getWidgetToolbar(
        objectParam?: string,
        idSettingsModule?: string,
        objectNr?: any,
        moduleType?: string,
    ): Observable<any> {
        const param = {
            objectParam: objectParam,
            idSettingsModule: idSettingsModule,
            objectNr: objectNr,
            moduleType: moduleType,
        };
        // Get direct from database
        //return this.get<any>(this.serUrl.getSettingModule, param, null, null);

        // Get from cached
        return BaseService.cacheService.get(
            'getWidgetToolbar:' + (objectNr || '-1'),
            this.get<any>(this.serUrl.getSettingModule, param, null, null),
        );
    }

    public buildWidgetToolbar(widgetToolbar, mainWidgetTemplateSettings) {
        for (const wt of widgetToolbar) {
            for (let w of wt.Widgets) {
                for (const s of mainWidgetTemplateSettings) {
                    // tslint:disable-next-line:triple-equals
                    if (w.IdRepWidgetApp == s.idRepWidgetApp) {
                        w = Object.assign(w, s);
                    }
                }
            }
        }

        return widgetToolbar;
    }

    public hasVisibleWidgets(widgetToolbar) {
        for (const wt of widgetToolbar) {
            const hiddenWidgets = wt.Widgets.filter((x) => x.accessRight && !x.accessRight.read);
            if (wt.Widgets.length === hiddenWidgets.length) {
                wt.hidden = true;
            }
        }

        return widgetToolbar;
    }

    /**
     * getWidgetDetailByRequestString
     * @param widgetDetail
     * @param filterParam
     */
    public getWidgetDetailByRequestString(
        widgetDetail: WidgetDetail,
        filterParam: any,
        isGetDataForTranslate?: boolean,
        isGetDataForOrderBy?: boolean,
    ): Observable<WidgetDetail> {
        if (!widgetDetail.request) {
            // console.log('widgetDetail.request cannot empty', widgetDetail, filterParam);
            return of(widgetDetail);
        }

        const options = {
            headers: new HttpHeaders({
                request: encodeURIComponent(widgetDetail.request),
            }),
        };

        let s = '';
        if (filterParam) {
            delete filterParam['item'];
            for (let item in filterParam) {
                if (filterParam[item] === this._const.widgetDotNotAddThisFilter) {
                    delete filterParam[item];
                }
            }
            Object.keys(filterParam).forEach((key, index, list) => {
                if (key != 'item') {
                    if (filterParam[key] == null) {
                        s += '\\"' + key + '\\"' + ':' + null;
                    } else {
                        s += '\\"' + key + '\\"' + ':' + '\\"' + filterParam[key] + '\\"';
                    }

                    if (index !== Object.keys(list).length - 1) {
                        s += ',';
                    }
                }
            });
        }
        const requestString: any = {
            idRepWidgetType: widgetDetail.idRepWidgetType,
            idRepWidgetApp: widgetDetail.idRepWidgetApp,
            widgetGuid: widgetDetail.id,
            moduleName: widgetDetail.moduleName,
            filterParam: encodeURIComponent(s),
            widgetTitle: widgetDetail.title,
        };
        if (isGetDataForTranslate) {
            requestString.idLanguage = -1;
        }

        if (isGetDataForOrderBy) {
            requestString.setOrderBy = 1;
        }

        return this.get<string>(this.serUrl.getWidgetDetailByRequestString, requestString, null, options).pipe(
            map((result: any) => {
                const widgetUtils: WidgetUtils = new WidgetUtils();
                if (widgetUtils.isTableWidgetDataType(widgetDetail)) {
                    if (widgetDetail.idRepWidgetType === WidgetType.Combination) {
                        if (!result.item.data[2] || !result.item.data[3]) {
                            return;
                        }
                        const settingIndex = 0;
                        const dataIndex = 1;
                        const data = [];
                        data[settingIndex] = result.item.data[2];
                        data[dataIndex] = result.item.data[3];
                        const resultTbl = this.datatableService.formatDataTableFromRawData(data);
                        const tmp = [];
                        tmp[0] = result.item.data[0];
                        tmp[1] = result.item.data[1];
                        tmp[2] = [resultTbl];
                        result.item = {
                            data: tmp,
                        };
                    } else {
                        result.item = this.datatableService.formatDataTableFromRawData(result.item.data);
                    }
                } else if (
                    widgetDetail.idRepWidgetType === WidgetType.CustomerSummary ||
                    widgetDetail.idRepWidgetType === WidgetType.CustomerLogo
                ) {
                    result.item.data = [
                        [{ WidgetTitle: widgetDetail.title, IsGroup: true }],
                        this.datatableService.buildGroupWidgetDetailFromRawData(result.item.data),
                    ];
                }
                widgetDetail.contentDetail = result.item;
                return widgetDetail;
            }),
            catchError((err) => {
                return of(widgetDetail);
            }),
        );
    }

    /**
     * getDetailByRequestString
     * @param request
     */
    public getDetailByRequestString(request: string): Observable<any> {
        const options = {
            headers: new HttpHeaders({
                request: encodeURIComponent(request),
            }),
        };
        return this.get<any>(this.serUrl.getWidgetDetailByRequestString, null, null, options).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public updateWidgetInfo(
        data: any,
        requestUpdate: string,
        module: Module,
        updateKey: string,
        customData?: any,
        jsonTextUpdate?: string,
        mode?: string,
    ): Observable<any> {
        let localData = cloneDeep(data);
        if (jsonTextUpdate == '1') {
            localData = this.removeTableNameOfPropertyName(localData);
        }
        const dataUpdate: any = {
            data: JSON.stringify(localData),
            request: requestUpdate,
            module: module,
            updateKey: updateKey,
        };

        if (mode) {
            dataUpdate.mode = mode;
        }

        dataUpdate.UsingReplaceString = false;

        if (dataUpdate.UsingReplaceString) {
            //#region Old Code - use 'replace string'
            // For update with JSONText for widget table
            if (customData) {
                dataUpdate.data = customData(dataUpdate.data);
            }
            // For update with JSONText customize for widget detail
            if (jsonTextUpdate == '1') {
                dataUpdate.data = ('[' + dataUpdate.data + ']').replace(/"/g, '\\\\"');
            }
            dataUpdate.data = dataUpdate.data.replace(/\\n/g, '\\\\\\\\\\\\\\n').replace(/\\s/g, '\\\\\\\\\\\\\\s');
            //#endregion
        } else {
            //#region New Code - don't use 'replace string'
            if (jsonTextUpdate == '1') {
                dataUpdate.data = '[' + dataUpdate.data + ']';
            }
            // Modify to convert/Stringify string object to key value string
            // EX: "{"IdPersonInterface":"12097","IdRepCommunicationType":"3"}" ==> ""IdPersonInterface":"12097","IdRepCommunicationType":"3""
            if (dataUpdate.data[0] == '{' && dataUpdate.data[dataUpdate.data.length - 1] == '}') {
                dataUpdate.data = JSON.stringify(dataUpdate.data);
                dataUpdate.data = dataUpdate.data.substring(2, dataUpdate.data.length - 2);
            }
            // Stringify for array string object
            // EX: "[{"IdPersonInterface":"12097","Notes":"/dasd qweqw eqw/eqee//23^^*^*---\\\\\\"}]"
            // =>  ""\"[{\\\"IdPersonInterface\\\":\\\"12097\\\",\\\"Notes\\\":\\\"/dasd qweqw eqw/eqee//23^^*^*---\\\\\\\\\\\\\\\\\\\\\\\\\\\"}]\"""
            else {
                dataUpdate.data = JSON.stringify(JSON.stringify(dataUpdate.data));
                dataUpdate.data = dataUpdate.data.substring(3, dataUpdate.data.length - 3);
            }
            //#endregion
        }

        return this.post<any>(this.serUrl.updateWidgetInfo, JSON.stringify(dataUpdate)).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    private removeTableNameOfPropertyName(obj: any): any {
        if (!obj) return obj;
        let result = {};
        Object.keys(obj).forEach((prop) => {
            const newPropName = prop.substring(prop.indexOf('_') + 1, prop.length);
            result[newPropName] = obj[prop];
        });
        return result;
    }

    public getWidgetOrderBy(widgetApp: any, widgetGuid: any): Observable<any> {
        return this.get<any>(this.serUrl.getWidgetOrderBy, {
            widgetApp: widgetApp,
            widgetGuid: widgetGuid,
        }).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public saveWidgetOrderBy(widgetOrderBys: any): Observable<any> {
        return this.post<any>(this.serUrl.saveWidgetOrderBy, JSON.stringify(widgetOrderBys)).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public getCountryLanguage(filterParam: any): Observable<any> {
        this.addHeader(
            'request',
            '%7B%0D%0A%09%09%22Request%22%3A%0D%0A%09%09%7B%20%20%20%20%0D%0A%09%09%09%22ModuleName%22%09%3A%20%22GlobalModule%22%2C%0D%0A%09%09%09%22ServiceName%22%09%3A%20%22GlobalService%22%2C%0D%0A%09%09%09%22Data%22%3A%0D%0A%09%09%09%22%7B%0D%0A%09%09%09%09%5C%22MethodName%5C%22%09%3A%20%5C%22SpAppWg001Campaign%5C%22%2C%0D%0A%0D%0A%09%09%09%09%5C%22CrudType%5C%22%09%09%3A%20null%2C%0D%0A%09%09%09%09%5C%22Object%5C%22%20%3A%20%5C%22MediaCodeMain%5C%22%2C%0D%0A%09%09%09%09%5C%22Mode%5C%22%20%3A%20null%2C%0D%0A%09%09%09%09%0D%0A%09%09%09%09%0D%0A%09%09%09%09%5C%22WidgetTitle%5C%22%20%3A%20%5C%22MediaCode%20Main%5C%22%2C%0D%0A%09%09%09%09%5C%22IsDisplayHiddenFieldWithMsg%5C%22%20%3A%20%5C%221%5C%22%2C%0D%0A%09%09%09%09%3C%3CLoginInformation%3E%3E%2C%0D%0A%09%09%09%09%3C%3CInputParameter%3E%3E%0D%0A%09%09%09%7D%22%0D%0A%09%09%7D%0D%0A%09%7D',
        );
        let s = '';
        if (filterParam) {
            Object.keys(filterParam).forEach((key, index, list) => {
                if (index === Object.keys(list).length - 1) {
                    s += '\\"' + key + '\\"' + ':' + '\\"' + filterParam[key] + '\\"';
                } else {
                    s += '\\"' + key + '\\"' + ':' + '\\"' + filterParam[key] + '\\"' + ',';
                }
            });
        }
        const requestString: any = {
            filterParam: encodeURIComponent(s),
        };
        return this.get<string>(this.serUrl.getWidgetDetailByRequestString, requestString).pipe(
            map((result: any) => {
                if (result.item.data[1]) {
                    return result.item.data[1];
                } else {
                    return [];
                }
            }),
        );
    }

    public createFakeWidgetProperties() {
        return [
            {
                id: 'WidgetCommunication',
                name: 'WidgetCommunication',
                value: null,
                disabled: false,
                collapsed: true,
                dataType: null,
                options: null,
                children: [
                    {
                        id: 'WithParkedItem',
                        name: 'WithParkedItem',
                        value: false,
                        disabled: true,
                        collapsed: true,
                        dataType: 'Boolean',
                        options: null,
                        children: [],
                    },
                    {
                        id: 'WithWidget',
                        name: 'WithWidget',
                        value: true,
                        disabled: true,
                        collapsed: true,
                        dataType: 'Boolean',
                        options: null,
                        children: [
                            {
                                id: 'WidgetName',
                                name: 'WidgetName',
                                value: 'ContactList',
                                disabled: true,
                                collapsed: true,
                                dataType: 'String',
                                options: null,
                                children: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'Appearance',
                name: 'Appearance',
                value: null,
                disabled: false,
                collapsed: true,
                dataType: null,
                options: null,
                children: [
                    {
                        id: 'WidgetTitle',
                        name: 'WidgetTitle',
                        value: null,
                        disabled: false,
                        collapsed: true,
                        dataType: 'String',
                        options: null,
                        children: [
                            {
                                id: 'IsDisplay',
                                name: 'IsDisplay',
                                value: true,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Boolean',
                                options: null,
                                children: [],
                            },
                            {
                                id: 'TitleText',
                                name: 'TitleText',
                                value: 'CustomerDetail',
                                disabled: false,
                                collapsed: true,
                                dataType: 'String',
                                options: null,
                                children: [],
                            },
                            {
                                id: 'TextAlign',
                                name: 'TextAlign',
                                value: 1,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Object',
                                options: [
                                    {
                                        key: 1,
                                        value: 'Left',
                                    },
                                    {
                                        key: 2,
                                        value: 'Center',
                                    },
                                    {
                                        key: 3,
                                        value: 'Right',
                                    },
                                ],
                                children: [],
                            },
                        ],
                    },
                    {
                        id: 'LabelStyle',
                        name: 'LabelStyle',
                        value: null,
                        disabled: false,
                        collapsed: true,
                        dataType: 'String',
                        options: null,
                        children: [
                            {
                                id: 'Color',
                                name: 'Color',
                                value: 'Black',
                                disabled: false,
                                collapsed: true,
                                dataType: 'Color',
                                options: null,
                                children: [],
                            },
                            {
                                id: 'FontName',
                                name: 'FontName',
                                value: 1,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Object',
                                options: [
                                    {
                                        key: 1,
                                        value: 'Arial',
                                    },
                                    {
                                        key: 2,
                                        value: 'Calibri',
                                    },
                                    {
                                        key: 3,
                                        value: 'Tahoma',
                                    },
                                ],
                                children: [],
                            },
                            {
                                id: 'FontSize',
                                name: 'FontSize',
                                value: 5,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Object',
                                options: [
                                    {
                                        key: 1,
                                        value: '8',
                                    },
                                    {
                                        key: 2,
                                        value: '9',
                                    },
                                    {
                                        key: 3,
                                        value: '10',
                                    },
                                    {
                                        key: 4,
                                        value: '11',
                                    },
                                    {
                                        key: 5,
                                        value: '12',
                                    },
                                    {
                                        key: 6,
                                        value: '13',
                                    },
                                ],
                                children: [],
                            },
                            {
                                id: 'Bold',
                                name: 'Bold',
                                value: false,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Boolean',
                                options: null,
                                children: [],
                            },
                            {
                                id: 'Italic',
                                name: 'Italic',
                                value: false,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Boolean',
                                options: null,
                                children: [],
                            },
                            {
                                id: 'Underline',
                                name: 'Underline',
                                value: false,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Boolean',
                                options: null,
                                children: [],
                            },
                        ],
                    },
                    {
                        id: 'DataStyle',
                        name: 'DataStyle',
                        value: null,
                        disabled: false,
                        collapsed: true,
                        dataType: 'String',
                        options: null,
                        children: [
                            {
                                id: 'Color',
                                name: 'Color',
                                value: 'Black',
                                disabled: true,
                                collapsed: true,
                                dataType: 'Color',
                                options: null,
                                children: [],
                            },
                            {
                                id: 'FontName',
                                name: 'FontName',
                                value: 3,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Object',
                                options: [
                                    {
                                        key: 1,
                                        value: 'Arial',
                                    },
                                    {
                                        key: 2,
                                        value: 'Calibri',
                                    },
                                    {
                                        key: 3,
                                        value: 'Tahoma',
                                    },
                                ],
                                children: [],
                            },
                            {
                                id: 'FontSize',
                                name: 'FontSize',
                                value: 5,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Object',
                                options: [
                                    {
                                        key: 1,
                                        value: '8',
                                    },
                                    {
                                        key: 2,
                                        value: '9',
                                    },
                                    {
                                        key: 3,
                                        value: '10',
                                    },
                                    {
                                        key: 4,
                                        value: '11',
                                    },
                                    {
                                        key: 5,
                                        value: '12',
                                    },
                                    {
                                        key: 6,
                                        value: '13',
                                    },
                                ],
                                children: [],
                            },
                            {
                                id: 'Bold',
                                name: 'Bold',
                                value: false,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Boolean',
                                options: null,
                                children: [],
                            },
                            {
                                id: 'Italic',
                                name: 'Italic',
                                value: false,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Boolean',
                                options: null,
                                children: [],
                            },
                            {
                                id: 'Underline',
                                name: 'Underline',
                                value: false,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Boolean',
                                options: null,
                                children: [],
                            },
                        ],
                    },
                ],
            },
            {
                id: 'Behavior',
                name: 'Behavior',
                value: null,
                disabled: false,
                collapsed: true,
                dataType: null,
                options: null,
                children: [
                    {
                        id: 'DisplayField',
                        name: 'DisplayField',
                        value: null,
                        disabled: false,
                        collapsed: true,
                        dataType: 'String',
                        options: null,
                        children: [
                            {
                                id: 'ShowData',
                                name: 'ShowData',
                                value: 1,
                                disabled: false,
                                collapsed: true,
                                dataType: 'Object',
                                options: [
                                    {
                                        key: 1,
                                        value: 'Show All',
                                    },
                                    {
                                        key: 2,
                                        value: 'Only has data',
                                    },
                                    {
                                        key: 3,
                                        value: 'Only empty data',
                                    },
                                ],
                                children: [],
                            },
                        ],
                    },
                    {
                        id: 'LayoutSetting',
                        name: 'LayoutSetting',
                        value: 3,
                        disabled: false,
                        collapsed: true,
                        dataType: 'Object',
                        options: [
                            {
                                key: 0,
                                value: 'Full Width',
                            },
                            {
                                key: 1,
                                value: 'Full Height',
                            },
                            {
                                key: 2,
                                value: 'Full Page',
                            },
                            {
                                key: 3,
                                value: 'Resizable',
                            },
                        ],
                        children: [],
                    },
                ],
            },
        ];
    }
}
