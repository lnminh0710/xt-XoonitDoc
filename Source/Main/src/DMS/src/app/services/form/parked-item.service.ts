import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { Observable } from 'rxjs';
import isEmpty from 'lodash-es/isEmpty';
import camelCase from 'lodash-es/camelCase';
import cloneDeep from 'lodash-es/cloneDeep';
import { ParkedItemMenuModel, ParkedItemModel, Module } from '@app/models';
import { Uti } from '@app/utilities';
import { BaseService } from '../base.service';
import { format } from 'date-fns/esm';
import { map } from 'rxjs/operators';

export class ParkedItemListResult {
    public collectionParkedtems: ParkedItemModel[] = [];
    public idSettingsModule: string = null;
    public keyName: string = null;
    public module: Module = null;

    public constructor(init?: Partial<ParkedItemListResult>) {
        Object.assign(this, init);
    }
}

@Injectable()
export class ParkedItemService extends BaseService {
    constructor(injector: Injector, @Inject(forwardRef(() => Uti)) public uti: Uti) {
        super(injector);
    }

    getParkedItemMenu(currentModule: Module): Observable<any> {
        const moduleId = currentModule.idSettingsGUI.toString();
        return this.get<any>(this.serUrl.serviceGetParkedItemMenuUrl, { module_name: moduleId }, null, null).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    getListParkedItemByModule(currentModule: Module): Observable<any> {
        const moduleId = currentModule.idSettingsGUI.toString();
        return this.get<any>(
            this.serUrl.serviceGetListParkedItemByModuleUrl,
            { module_name: moduleId },
            null,
            null,
        ).pipe(
            map((rs: any) => {
                const result: ParkedItemListResult = new ParkedItemListResult();
                result.module = currentModule;

                if (isEmpty(rs.item)) return result;

                result.collectionParkedtems = [];
                if (rs.item.collectionParkedtems) {
                    for (const item of rs.item.collectionParkedtems) {
                        const parkedItem = new ParkedItemModel(item);
                        parkedItem.id = parkedItem[camelCase(rs.item.keyName)];

                        const sysCreatedate = parkedItem.sysCreatedate || parkedItem.sysCreatedate;
                        if (sysCreatedate && sysCreatedate.value) {
                            //const dateString = sysCreatedate.value[sysCreatedate.value.length - 1] === 'Z' ? sysCreatedate.value.substring(0, sysCreatedate.value.length - 1) : sysCreatedate.value;
                            //parkedItem.createDateValue = new Date(dateString);
                            parkedItem.createDateValue = Uti.parseISODateToDate(sysCreatedate.value);
                        }

                        result.collectionParkedtems.push(parkedItem);
                    }
                }
                result.idSettingsModule = rs.item.idSettingsModule;
                result.keyName = rs.item.keyName;
                return result;
            }),
        );
    }

    getParkedItemById(currentModule: Module, parkedItemId) {
        const moduleId = currentModule.idSettingsGUI.toString();
        const param = {
            module_name: moduleId,
            id: parkedItemId,
        };

        return this.get<any>(this.serUrl.serviceGetParkedItemByIdUrl, param, null, null).pipe(
            map((rs) => {
                if (isEmpty(rs.item)) {
                    return rs.item;
                }

                const result: any = {};
                result.collectionParkedtems = [];
                if (rs.item.collectionParkedtems) {
                    for (const item of rs.item.collectionParkedtems) {
                        const parkedItem = new ParkedItemModel(item);
                        parkedItem.id = parkedItem[camelCase(rs.item.keyName)];
                        result.collectionParkedtems.push(parkedItem);
                    }
                }
                result.idSettingsModule = rs.item.idSettingsModule;
                result.keyName = rs.item.keyName;
                return result;
            }),
        );
    }

    saveParkedMenuItem(parkedItemMenuList: ParkedItemMenuModel[], currentModule: Module): Observable<boolean> {
        const moduleName = 'Parked ' + currentModule.moduleName;
        return this.post<boolean>(this.serUrl.serviceSaveParkedMenuItemUrl, JSON.stringify(parkedItemMenuList), {
            module_name: moduleName,
        }).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    saveParkedItemByModule(parkedItemObj): Observable<any> {
        return this.post<any>(this.serUrl.serviceSaveParkedItemByModuleUrl, JSON.stringify(parkedItemObj)).pipe(
            map((result: any) => {
                return result.item;
            }),
        );
    }

    public buildFieldConfig(menuItems: ParkedItemMenuModel[]) {
        const result = [];
        for (let i = 0; i < menuItems.length; i++) {
            if (menuItems[i].fieldName === 'IdPerson') {
                menuItems[i].isChecked = true;
            }

            if (menuItems[i].isChecked) {
                result.push({
                    fieldName: menuItems[i].fieldName,
                    icon: menuItems[i].icon,
                });
            }
        }

        return result;
    }

    public findItemIndexInArray(item, array, fieldName) {
        for (let i = 0; i < array.length; i++) {
            if (array[i][fieldName].value === item[fieldName]) {
                return i;
            }
        }

        return -1;
    }

    public checkItemExist(item, keyName, array) {
        for (let i = 0; i < array.length; i++) {
            if (!array[i][keyName].value) continue;

            if (item[keyName] == array[i][keyName].value) {
                return true;
            }
        }

        return false;
    }

    buildParkedItemId(parkedItems: ParkedItemModel[]) {
        let result = '';

        // remove new item
        parkedItems = parkedItems.filter((item) => {
            return item.isNew !== true;
        });

        if (parkedItems.length === 1) {
            result = '(' + parkedItems[0].id.value + ')';
        } else {
            for (let i = 0; i < parkedItems.length; i++) {
                if (i === 0) {
                    result = result + '(' + parkedItems[i].id.value;
                } else if (i === parkedItems.length - 1) {
                    result = result + ',' + parkedItems[i].id.value + ')';
                } else {
                    result = result + ',' + parkedItems[i].id.value;
                }
            }
        }

        return result;
    }

    public buildActiveMenuItemListForSave(menuItems) {
        return menuItems.filter((item) => {
            return item.isChecked === true;
        });
    }

    public setFieldActive(fieldName, data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].fieldName === fieldName) {
                data[i].isChecked = true;
            }
        }

        return data;
    }

    public buildTooltipPlacement(fieldName) {
        if (fieldName.length >= 10) {
            return 'right';
        }

        return 'top';
    }

    public getFieldIndex(fieldName, data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].fieldName && data[i].fieldName.toLowerCase() === fieldName.toLowerCase()) {
                return i;
            }
        }
        return -1;
    }

    public buildFieldFromConfig(fieldName, parkedItem, configArray) {
        if (!configArray || !configArray.length) {
            return {
                fieldName: parkedItem[fieldName].displayValue,
                fieldValue: parkedItem[fieldName].value,
                icon: 'fa-file-o',
                tooltipPlacement: this.buildTooltipPlacement(fieldName),
            };
        }

        for (let i = 0; i < configArray.length; i++) {
            if (
                configArray[i].fieldName.toLowerCase() === fieldName.toLowerCase() &&
                fieldName.toLowerCase() !== 'idperson'
            ) {
                return {
                    fieldName: parkedItem[fieldName].displayValue,
                    fieldValue: parkedItem[fieldName].value,
                    icon: configArray[i].icon,
                    tooltipPlacement: this.buildTooltipPlacement(fieldName),
                };
            }
        }
        return null;
    }

    public moveHeaderToTop(headerFieldName, parkedItemFields) {
        const headerIndex = this.getFieldIndex(headerFieldName, parkedItemFields);
        if (headerIndex > -1) {
            const headerItem = parkedItemFields[headerIndex];
            parkedItemFields.splice(headerIndex, 1);
            parkedItemFields.splice(0, 0, headerItem);
        }
    }

    public isUpdateInfoKeyEqualCurrentParkedItem(parkedItem, widgetDataUpdatedState) {
        if (!parkedItem || !widgetDataUpdatedState) return;
        for (const keyName of Object.keys(parkedItem)) {
            const keyRequest = Object.keys(widgetDataUpdatedState.widgetDetail.widgetDataType.listenKeyRequest)[0];
            const idRequest =
                widgetDataUpdatedState.widgetDetail.widgetDataType.listenKeyRequest[
                    Object.keys(widgetDataUpdatedState.widgetDetail.widgetDataType.listenKeyRequest)[0]
                ];
            if (
                typeof parkedItem[keyName] === 'object' &&
                parkedItem[keyName] &&
                parkedItem[keyName].originalComlumnName &&
                parkedItem[keyName].originalComlumnName === keyRequest &&
                parkedItem[keyName].value === idRequest
            ) {
                return true;
            }
        }

        return false;
    }

    public mergeUpdateInfoData(parkedItem, widgetDataUpdatedState) {
        for (const updateInfoKeyName of Object.keys(widgetDataUpdatedState.updateInfo)) {
            for (const keyName of Object.keys(parkedItem)) {
                if (
                    typeof parkedItem[keyName] === 'object' &&
                    parkedItem[keyName] &&
                    parkedItem[keyName].originalComlumnName &&
                    updateInfoKeyName.substring(updateInfoKeyName.indexOf('_') + 1).toLowerCase() ===
                        parkedItem[keyName].originalComlumnName.toLowerCase()
                ) {
                    const keyRequest = Object.keys(
                        widgetDataUpdatedState.widgetDetail.widgetDataType.listenKeyRequest,
                    )[0];
                    if (parkedItem[keyName].originalComlumnName === keyRequest) {
                        continue;
                    }

                    if (this.isTypeOfDate(widgetDataUpdatedState.updateInfo[updateInfoKeyName])) {
                        parkedItem[keyName].value = this.uti.formatLocale(
                            widgetDataUpdatedState.updateInfo[updateInfoKeyName],
                            'dd.MM.yyyy',
                        );
                    } else {
                        parkedItem[keyName].value = widgetDataUpdatedState.updateInfo[updateInfoKeyName];
                    }
                }
            }
        }

        return parkedItem;
    }

    public getActiveSubModule(subModules: Module[], idSettingsGUI) {
        if (!subModules || !idSettingsGUI) {
            return null;
        }

        const subModule = subModules.find((sm) => {
            // tslint:disable-next-line:triple-equals
            return sm.idSettingsGUI == idSettingsGUI;
        });

        if (subModule) {
            return subModule;
        }

        return null;
    }

    public getDropItem(parkedItems, idFieldName) {
        if (!idFieldName) {
            return null;
        }

        let idx = -1;
        for (let i = 0; i < parkedItems.length; i++) {
            if (typeof parkedItems[i][idFieldName] !== 'object') {
                idx = i;
            }
        }

        if (idx !== -1) {
            return {
                dropItem: cloneDeep(parkedItems[idx]),
                dropItemIndex: idx,
            };
        }

        return null;
    }

    public buildParkedItemFromDropItem(dropItem, idFieldName) {
        const data = {};
        for (const fieldName in dropItem) {
            if (fieldName) {
                data[fieldName] = {};
                data[fieldName].value = dropItem[fieldName] || null;
            }
        }

        const parkedItem = new ParkedItemModel(data);
        parkedItem.id = parkedItem[idFieldName];

        return parkedItem;
    }

    private isTypeOfDate(value) {
        return typeof value === 'object' && value instanceof Date;
    }
}
