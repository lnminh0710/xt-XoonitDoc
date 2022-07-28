import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from '../base.service';
import { ComboBoxTypeConstant, Configuration } from '@app/app.constants';
import { EmailModel, ApiResultResponse } from '@app/models';
import { Uti } from '@app/utilities';
import { map, share } from 'rxjs/operators';
import { FieldFormOnFocusModel } from '../../state-management/store/models/administration-document/field-form-on-focus.model.payload';
import { ColumnDefinition } from '../../models/common/column-definition.model';

@Injectable()
export class CommonService extends BaseService {
    public fieldFormOnFocus: FieldFormOnFocusModel;
    private comboBoxResultList: any = {};
    private notAllowCachedKeys: Array<string> = [
        'principal',
        'allMandant',
        'serviceProvider',
        'wareHouse',
        'campaignWizardAddress',
        ComboBoxTypeConstant.repAppSystemColumnNameTemplate,
        ComboBoxTypeConstant.orderProcessingListOrders,
        ComboBoxTypeConstant.orderProcessingListOrdersFilter,
        ComboBoxTypeConstant.widgetType.toString(),
        ComboBoxTypeConstant.moduleItems.toString(),
    ];

    constructor(injector: Injector) {
        super(injector);

        //if (!localStorage.getItem(this.config.localStorageCurrentUser)) return;
    }

    public executeURL(url: string, param?: any): Observable<any> {
        return this.get<any>(url, param, null, null, null, null, true);
    }

    private getStringKeyList(identityKeys: Array<string>) {
        let keys = Object.keys(ComboBoxTypeConstant);
        var stringKeys: Array<any> = [];
        for (var i = 0; i < identityKeys.length; i++) {
            keys.forEach((key) => {
                if (ComboBoxTypeConstant[key] == identityKeys[i]) {
                    stringKeys.push(key);
                }
            });

            if (
                !this.isExistInObject(identityKeys[i], ComboBoxTypeConstant) &&
                !stringKeys.find((str) => str == identityKeys[i])
            ) {
                stringKeys.push(identityKeys[i]);
            }
        }

        return stringKeys;
    }

    isExistInObject(name, obj) {
        let keys = Object.keys(obj);

        for (let key of keys) {
            if (obj[key] == name) {
                return true;
            }
        }

        return false;
    }

    private getRequestKeyList(stringKeys: Array<any>) {
        var requestKeys: Array<string> = [];
        for (var i = 0; i < stringKeys.length; i++) {
            var stringKey = stringKeys[i];
            if (
                !this.comboBoxResultList ||
                !this.comboBoxResultList[stringKey] ||
                (this.comboBoxResultList[stringKey] && this.comboBoxResultList[stringKey].length == 0)
            ) {
                requestKeys.push(stringKey);
            }
        }
        return requestKeys;
    }

    private getRequestKeyListFromCache(stringKeys: Array<any>) {
        var requestKeys: Array<string> = [];
        for (var i = 0; i < stringKeys.length; i++) {
            var stringKey = stringKeys[i];
            if (!BaseService.cacheService.has(stringKey.toLowerCase())) {
                requestKeys.push(stringKey);
            }
        }
        return requestKeys;
    }

    private buildListComboboxFromCache(stringKeys: Array<any>) {
        let result: any = {};
        for (var i = 0; i < stringKeys.length; i++) {
            result[stringKeys[i]] = BaseService.cacheService.getValue(stringKeys[i].toLowerCase());
        }

        return result;
    }

    public getListComboBox(comboBoxList: string, extraData?: string, noCache?: boolean): Observable<any> {
        let identityKeys: Array<string> = comboBoxList.split(',');
        let stringKeys: Array<any> = this.getStringKeyList(identityKeys);
        let requestKeys: Array<string> = this.getRequestKeyListFromCache(stringKeys);

        // if `data` is available just return it as `Observable`
        if (requestKeys.length == 0 && !noCache) {
            return of(
                new ApiResultResponse({
                    item: this.buildListComboboxFromCache(stringKeys),
                    statusCode: 1,
                }),
            );
        } else {
            let paramKeys = requestKeys.join(',');

            let obj: any = {};

            if (extraData) {
                obj['strObject'] = paramKeys;
                obj['mode'] = extraData;
            } else {
                obj['comboBoxList'] = paramKeys;
            }

            let observable = this.get<any>(this.serUrl.getComboxBoxList, obj).pipe(
                map((response: ApiResultResponse) => {
                    let res = response.item;
                    if (res) {
                        var resKeys = Object.keys(res);
                        resKeys.forEach((resKey) => {
                            // Check if this key don't allow cached.
                            const notAllowCachedKey = this.notAllowCachedKeys.find(
                                (p) => Uti.toLowerCase(p) == Uti.toLowerCase(resKey),
                            );
                            // Allow cache case
                            if (!notAllowCachedKey && !noCache) {
                                //check array or object must has data
                                //const isArray = Array.isArray(res[resKey]);
                                //if ((isArray && res[resKey].length) || (!isArray && res[resKey]))
                                BaseService.cacheService.set(resKey.toLowerCase(), res[resKey]);
                            }
                        });
                    }

                    // Allow cache case
                    if (!noCache) {
                        response.item = Object.assign(this.buildListComboboxFromCache(stringKeys), response.item);
                    }

                    return response;
                }),
                share(),
            );

            return observable;
        }
    }

    public getComboBoxDataByFilter(key: any, filterBy: string, keyName?: string, noCache?: boolean): Observable<any> {
        let stringKeys: Array<any> = [];
        if (keyName) {
            stringKeys.push(keyName);
        } else {
            stringKeys = this.getStringKeyList([key.toString()]);
        }

        let s = stringKeys.map((p) => {
            return p + '_' + filterBy;
        });
        var requestKeys: Array<string> = this.getRequestKeyListFromCache(s);
        // if `data` is available just return it as `Observable`
        if (requestKeys.length == 0 && !noCache) {
            return of(
                new ApiResultResponse({
                    item: this.buildListComboboxFromCache(s),
                    statusCode: 1,
                }),
            );
        } else {
            requestKeys = requestKeys.map((p) => {
                return p.split('_')[0];
            });
            var observable = this.get<any>(this.serUrl.getComboxBoxList, {
                strObject: requestKeys[0],
                mode: filterBy,
            }).pipe(
                map((response: ApiResultResponse) => {
                    let res = response.item;
                    if (res) {
                        var resKeys = Object.keys(res);
                        resKeys.forEach((resKey) => {
                            // Cache
                            if (!noCache) {
                                BaseService.cacheService.set((resKey + '_' + filterBy).toLowerCase(), res[resKey]);
                            } else {
                                res[resKey + '_' + filterBy] = res[resKey];
                            }
                        });
                    }
                    if (!noCache) {
                        response.item = this.buildListComboboxFromCache(s);
                    }
                    return response;
                }),
                share(),
            );
            return observable;
        }
    }

    public getComboBoxDataByCondition(comboboxName: string, condition: string): Observable<any> {
        let cacheKey = this.serUrl.getComboxBoxList + ':' + comboboxName + '-' + condition;
        return BaseService.cacheService.get(
            cacheKey,
            this.get<any>(this.serUrl.getComboxBoxList, {
                strObject: comboboxName,
                mode: condition,
            }),
        );
    }

    public getModuleToPersonType() {
        // return BaseService.cacheService.get(
        //     this.serUrl.getModuleToPersonType,
        //     this.get<any>(this.serUrl.getModuleToPersonType),
        // );
        return of<ApiResultResponse>(<ApiResultResponse>{ item: [], statusCode: -1 });
    }

    public createContact(contact: any): Observable<any> {
        contact = Uti.convertDataEmptyToNull(contact);
        return this.post<any>(this.serUrl.createContact, JSON.stringify(contact));
    }

    public checkFileExisted(fileName: string): Observable<any> {
        return this.get<any>(this.serUrl.checkFileExisted, {
            fileName: fileName,
        });
    }

    public downloadTemplates(data: any): Observable<any> {
        return this.post<any>(this.serUrl.downloadTemplates, JSON.stringify(data)); //param, token, dontParseJson
    }

    //PublicSettings will be gotten before app_load, so this method will not be used.
    //Please use Configuration.PublicSettings instead
    public getPublicSetting(): Observable<any> {
        if (Configuration.PublicSettings) return of(Configuration.PublicSettings);

        return BaseService.cacheService
            .get(this.serUrl.getPublicSetting, this.get<any>(this.serUrl.getPublicSetting))
            .pipe(
                map((result: any) => {
                    Configuration.PublicSettings = result.item;

                    return result.item;
                }),
            );
    }

    public sendEmail(email: EmailModel): Observable<any> {
        return this.post<any>(this.serUrl.sendEmail, JSON.stringify(email));
    }

    public SendEmailWithImageAttached(email: EmailModel): Observable<any> {
        return this.post<any>(this.serUrl.createNotificationWithSendEmail, JSON.stringify(email));
    }

    public getMainLanguages(): Observable<any> {
        return BaseService.cacheService.get(this.serUrl.getMainLanguages, this.get<any>(this.serUrl.getMainLanguages));
    }

    public getCustomerColumnsSetting(objectName: string): Observable<any> {
        return this.get<any>(this.serUrl.getCustomerColumnsSetting, {
            objectName: objectName,
        });
    }

    public matchingCustomerData(customerModel: any): Observable<any> {
        return this.post<any>(this.serUrl.matchingCustomerData, JSON.stringify(customerModel));
    }

    public getWidgetAppById(idRepWidgetApp: string): Observable<any> {
        return this.get<any>(this.serUrl.getWidgetAppById, {
            idRepWidgetApp: idRepWidgetApp,
        });
    }

    public updateWidgetApp(model: any): Observable<any> {
        return this.post<any>(this.serUrl.updateWidgetApp, JSON.stringify(model));
    }

    public getFileByUrl(url: string): Observable<any> {
        return this.get<any>(url);
    }

    public getXMLFileByUrl(url: string): Observable<any> {
        return this.getXML<any>(url);
    }

    //#region Data - ModuleToPersonType
    public moduleToPersonType: any = {};
    public mappingDataForModuleToPersonType(data) {
        for (const item of data) {
            this.moduleToPersonType[item.idSettingsGUI] = item.idRepPersonType;
        }
    }
    //#endregion

    public createQueue(model: any): Observable<any> {
        return this.post<any>(this.serUrl.createQueue, JSON.stringify(model));
    }

    public deleteQueues(model: any): Observable<any> {
        return this.post<any>(this.serUrl.deleteQueues, JSON.stringify(model));
    }

    public getDocumentProcessingQueues(): Observable<any> {
        return this.get<any>(this.serUrl.getDocumentProcessingQueues);
    }

    public setCallConfigValueForColDef(colDef: ColumnDefinition, value: any): void {
        if (!colDef || !colDef.setting || !colDef.setting.CallConfigs || !colDef.setting.CallConfigs.length) {
            return;
        }

        const length = colDef.setting.CallConfigs.length;
        for (let index = 0; index < length; index++) {
            const callConfig = colDef.setting.CallConfigs[index];
            callConfig.Value = value;
        }
    }
}
