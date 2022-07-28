import { Injectable } from '@angular/core';
import {
    ParkedItemModel,
    WidgetTemplateSettingModel,
    PageSetting,
    RawFieldEntity,
    FieldEntity,
    DataSetting,
    WidgetDetail,
    ListenKey,
    WidgetDetailPage,
    WidgetType,
    WidgetKeyType,
    IWidgetDataTypeValues,
    IWidgetTargetRender,
    Module,
    TabSummaryModel,
    IWidgetRenderDataType,
} from '@app/models';
import { Uti } from '@app/utilities';
import { ReplaceString, MenuModuleId, RepWidgetAppIdEnum } from '@app/app.constants';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import upperFirst from 'lodash-es/upperFirst';
import toSafeInteger from 'lodash-es/toSafeInteger';
import { XnWidgetMenuStatusComponent } from '../components';
import { NgGridItemConfig } from '../../grid-stack';

@Injectable()
export class WidgetUtils {
    public static widgetDataTypeValues: IWidgetDataTypeValues = {};

    private excludeContextMenuModule = [24, '24'];

    constructor() {}

    /**
     * updateWidgetDataTypeValues
     * @param key
     * @param value
     * @param widgetKeyType
     * @param srcWidgetId -- used in Sub case to define parent widget
     */
    public updateWidgetDataTypeValues(
        moduleId: string,
        key: string,
        value: string,
        widgetKeyType?: WidgetKeyType,
        srcWWidgetDetail?: WidgetDetail,
        pageId?: string,
    ) {
        if (!widgetKeyType) {
            widgetKeyType = WidgetKeyType.Sub;
        }

        if (!WidgetUtils.widgetDataTypeValues[moduleId]) {
            WidgetUtils.widgetDataTypeValues[moduleId] = {};
        }

        // Main case
        if (widgetKeyType == WidgetKeyType.Main) {
            if (WidgetUtils.widgetDataTypeValues[moduleId][key]) {
                const obj: any = WidgetUtils.widgetDataTypeValues[moduleId][key];
                obj[WidgetKeyType[widgetKeyType]] = value;
                WidgetUtils.widgetDataTypeValues[moduleId][key] = obj;
            } else {
                const obj: any = {};
                obj[WidgetKeyType[widgetKeyType]] = value;
                WidgetUtils.widgetDataTypeValues[moduleId][key] = obj;
            }
        }
        // Sub case
        else {
            if (
                !WidgetUtils.widgetDataTypeValues[moduleId][key] ||
                (WidgetUtils.widgetDataTypeValues[moduleId][key] &&
                    !WidgetUtils.widgetDataTypeValues[moduleId][key][WidgetKeyType[widgetKeyType]])
            ) {
                const obj: any = {};
                const subArr = [
                    {
                        value: value,
                        srcWidgetId: srcWWidgetDetail.id,
                        title: srcWWidgetDetail.title,
                        pageId: pageId,
                        item: this.getWidgetDataContentDetailItem(srcWWidgetDetail, key, value),
                    },
                ];
                obj[WidgetKeyType[widgetKeyType]] = subArr;

                if (!WidgetUtils.widgetDataTypeValues[moduleId][key]) {
                    WidgetUtils.widgetDataTypeValues[moduleId][key] = obj;
                } else {
                    WidgetUtils.widgetDataTypeValues[moduleId][key][WidgetKeyType[widgetKeyType]] = subArr;
                }
            } else {
                let subKeyArray: Array<any> =
                    WidgetUtils.widgetDataTypeValues[moduleId][key][WidgetKeyType[widgetKeyType]];
                let iRet = false;
                subKeyArray.forEach((subKey) => {
                    if (subKey.srcWidgetId == srcWWidgetDetail.id) {
                        subKey.value = value;
                        iRet = true;
                        subKey.item = this.getWidgetDataContentDetailItem(srcWWidgetDetail, key, value);
                    }
                });
                if (!iRet) {
                    subKeyArray.push({
                        value: value,
                        srcWidgetId: srcWWidgetDetail.id,
                        title: srcWWidgetDetail.title,
                        pageId: pageId,
                        item: this.getWidgetDataContentDetailItem(srcWWidgetDetail, key, value),
                    });
                }
            }
        }
    }

    private getWidgetDataContentDetailItem(srcWidgetDetail: WidgetDetail, key: string, value: string) {
        if (
            srcWidgetDetail &&
            srcWidgetDetail.contentDetail &&
            srcWidgetDetail.contentDetail.collectionData &&
            srcWidgetDetail.contentDetail.collectionData.length &&
            key &&
            value
        ) {
            const array: Array<any> = srcWidgetDetail.contentDetail.collectionData;
            return array.find((item) => item[key] == value);
        }

        return null;
    }

    /**
     * updateWidgetTitleDataTypeValues
     * @param srcWWidgetDetail
     */
    public updateWidgetTitleDataTypeValues(moduleId: string, srcWWidgetDetail: WidgetDetail) {
        Object.keys(WidgetUtils.widgetDataTypeValues[moduleId]).forEach((listenKey) => {
            if (
                WidgetUtils.widgetDataTypeValues[moduleId][listenKey] &&
                WidgetUtils.widgetDataTypeValues[moduleId][listenKey]['Sub'] &&
                WidgetUtils.widgetDataTypeValues[moduleId][listenKey]['Sub'].length
            ) {
                let subs: Array<any> = WidgetUtils.widgetDataTypeValues[moduleId][listenKey]['Sub'];
                subs.forEach((sub) => {
                    if (sub.srcWidgetId == srcWWidgetDetail.id) {
                        sub.title = srcWWidgetDetail.title;
                    }
                });
            }
        });
    }

    /**
     * Clear All
     * clearWidgetDataTypeValues
     */
    public clearWidgetDataTypeValues() {
        WidgetUtils.widgetDataTypeValues = {};
    }

    /**
     * Clear by Page Id
     * clearWidgetDataTypeValuesByPageId
     */
    public clearWidgetDataTypeValuesByPageId(moduleId: string, pageId: string) {
        if (WidgetUtils.widgetDataTypeValues && WidgetUtils.widgetDataTypeValues[moduleId]) {
            Object.keys(WidgetUtils.widgetDataTypeValues[moduleId]).forEach((key) => {
                if (WidgetUtils.widgetDataTypeValues[moduleId][key]) {
                    let subArr: Array<any> =
                        WidgetUtils.widgetDataTypeValues[moduleId][key][WidgetKeyType[WidgetKeyType.Sub]];
                    if (subArr && subArr.length) {
                        subArr = subArr.filter((p) => p.pageId != pageId);
                        WidgetUtils.widgetDataTypeValues[moduleId][key][WidgetKeyType[WidgetKeyType.Sub]] = subArr;
                    }
                }
            });
        }
    }

    /**
     * removeListenKeyFromWidgetDataTypeValues
     * @param srcWidgetId
     */
    public removeListenKeyFromWidgetDataTypeValues(moduleId: string, srcWidgetId: string) {
        if (WidgetUtils.widgetDataTypeValues && WidgetUtils.widgetDataTypeValues[moduleId]) {
            Object.keys(WidgetUtils.widgetDataTypeValues[moduleId]).forEach((listenKey) => {
                if (
                    WidgetUtils.widgetDataTypeValues[moduleId][listenKey] &&
                    WidgetUtils.widgetDataTypeValues[moduleId][listenKey]['Sub'] &&
                    WidgetUtils.widgetDataTypeValues[moduleId][listenKey]['Sub'].length
                ) {
                    let subs: Array<any> = WidgetUtils.widgetDataTypeValues[moduleId][listenKey]['Sub'];
                    WidgetUtils.widgetDataTypeValues[moduleId][listenKey]['Sub'] = subs.filter(
                        (p) => p.srcWidgetId != srcWidgetId,
                    );
                }
            });
            if (
                WidgetUtils.widgetDataTypeValues[moduleId].renderFor &&
                WidgetUtils.widgetDataTypeValues[moduleId].renderFor.length
            ) {
                WidgetUtils.widgetDataTypeValues[moduleId].renderFor = WidgetUtils.widgetDataTypeValues[
                    moduleId
                ].renderFor.filter((p) => p.srcWidgetId != srcWidgetId);
            }
        }
    }

    /**
     * getWidgetStateKey
     * @param entityObj
     * @param keyArray
     */
    public getWidgetStateKey(entityObj, keyArrayString) {
        if (!keyArrayString) return;

        let stateKey = '';
        const rs = keyArrayString.split(',');
        if (rs.length > 0) {
            const entityObjKeys: Array<string> = Object.keys(entityObj);
            for (const key of rs) {
                const entityObjKey = entityObjKeys.filter((p) => p.toLowerCase() === key.toLowerCase());
                if (entityObjKey.length > 0) {
                    let value = null;
                    if (entityObj[entityObjKey[0]]) {
                        value = entityObj[entityObjKey[0]];
                        stateKey += '_' + value;
                    }
                }
            }
        }
        return keyArrayString + stateKey;
    }

    /**
     * updateWidgetDataTypeValuesFromSelectedParkItem
     * @param parkedItem
     */
    public updateWidgetDataTypeValuesFromSelectedEntity(moduleId: string, entityObj, keyArray) {
        if (!keyArray) return;
        const rs = keyArray.split(',');
        if (rs.length > 0) {
            const entityObjKeys: Array<string> = Object.keys(entityObj);
            for (const key of rs) {
                const entityObjKey = entityObjKeys.filter((p) => p.toLowerCase() === key.toLowerCase());
                if (entityObjKey.length > 0) {
                    let value = null;
                    if (entityObj[entityObjKey[0]]) {
                        value = entityObj[entityObjKey[0]];
                    }
                    this.updateWidgetDataTypeValues(moduleId, upperFirst(key), value, WidgetKeyType.Main);
                }
            }
        }

        WidgetUtils.widgetDataTypeValues[moduleId].renderFor = null;
    }

    /**
     * getWidgetKeyTypeFromWidgetDetail
     * @param widgetDetail
     */
    public getWidgetKeyTypeFromWidgetDetail(widgetDetail: WidgetDetail): WidgetKeyType {
        if (widgetDetail.isMainArea) {
            return WidgetKeyType.Main;
        }
        return WidgetKeyType.Sub;
    }

    /**
     * isValidWidgetForRender
     */
    public isValidWidgetForRender(iWidgetTargetRender: IWidgetTargetRender, widgetDetail: WidgetDetail) {
        let isValid = false;
        if (!widgetDetail.widgetDataType) {
            return isValid;
        }
        const listenKey = widgetDetail.widgetDataType.listenKey;
        if (iWidgetTargetRender.widgetKeyType === WidgetKeyType.Sub) {
            if (listenKey.sub) {
                listenKey.sub.forEach((item) => {
                    if (item.key === iWidgetTargetRender.key) {
                        if (widgetDetail.widgetDataType.parentWidgetIds) {
                            // Check if the same srcWidgetId
                            const rs = widgetDetail.widgetDataType.parentWidgetIds.filter(
                                (p) => p == iWidgetTargetRender.srcWidgetId,
                            );
                            if (rs.length) {
                                isValid = true;
                            }
                            // If not the same srcWidgetId , then check in sync widget ids
                            else {
                                if (iWidgetTargetRender.syncWidgetIds && iWidgetTargetRender.syncWidgetIds.length) {
                                    widgetDetail.widgetDataType.parentWidgetIds.forEach((parentWidgetId) => {
                                        const ret = iWidgetTargetRender.syncWidgetIds.filter(
                                            (p) => p == parentWidgetId,
                                        );
                                        if (ret.length) {
                                            isValid = true;
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
            }
        } else if (iWidgetTargetRender.widgetKeyType === WidgetKeyType.Main) {
            if (listenKey.main && listenKey.main.length) {
                let item = listenKey.main.find((p) => p.key == iWidgetTargetRender.key);
                if (item) {
                    isValid = true;
                }
            }
        }
        return isValid;
    }

    /**
     * mapWidgetDetailFromWidgetTemplateSetting
     * @param widgetTemplateSettingModel
     */
    public mapWidgetDetailFromWidgetTemplateSetting(
        widgetTemplateSettingModel: WidgetTemplateSettingModel,
    ): WidgetDetail {
        let widgetDetail = new WidgetDetail({
            idRepWidgetType: widgetTemplateSettingModel.idRepWidgetType,
            idRepWidgetApp: widgetTemplateSettingModel.idRepWidgetApp,
            request: widgetTemplateSettingModel.jsonString,
            updateRequest: widgetTemplateSettingModel.updateJsonString,
            widgetDataType: widgetTemplateSettingModel.widgetDataType
                ? JSON.parse(widgetTemplateSettingModel.widgetDataType)
                : null,
            isMainArea: widgetTemplateSettingModel.isMainArea,
        });
        return widgetDetail;
    }

    /**
     * getValueFromWidgetDataTypeValues
     * @param key
     * @param isMainArea
     */
    public getValueFromWidgetDataTypeValues(moduleId: string, key: string, isMainArea: boolean, srcWidgetId?: string) {
        let value = '';
        if (WidgetUtils.widgetDataTypeValues[moduleId] && WidgetUtils.widgetDataTypeValues[moduleId][key]) {
            if (isMainArea) {
                value = WidgetUtils.widgetDataTypeValues[moduleId][key][WidgetKeyType[WidgetKeyType.Main]];
            } else {
                const subArray: Array<any> =
                    WidgetUtils.widgetDataTypeValues[moduleId][key][WidgetKeyType[WidgetKeyType.Sub]];
                if (subArray && subArray.length) {
                    subArray.forEach((subObj) => {
                        if (subObj.srcWidgetId == srcWidgetId) {
                            value = subObj.value;
                        }
                    });
                }
            }
        }
        return value;
    }

    public getWidgetTitle(widgetDetail: WidgetDetail) {
        if (widgetDetail && widgetDetail.contentDetail) {
            if (widgetDetail.idRepWidgetType === WidgetType.FieldSet) {
                if (widgetDetail.contentDetail.data.length > 0) {
                    const widgetInfo = widgetDetail.contentDetail.data;
                    return widgetInfo[0][0].WidgetTitle;
                }
            } else {
                return widgetDetail.contentDetail.widgetTitle;
            }
        }
    }

    public getKeyValueListFromFieldSetWidget(widgetDetail: WidgetDetail) {
        const keyValue = {};
        if (widgetDetail && widgetDetail.contentDetail) {
            if (widgetDetail.contentDetail.data.length > 0) {
                const widgetInfo = widgetDetail.contentDetail.data;
                const contentList: Array<any> = widgetInfo[1];
                contentList.forEach((content) => {
                    keyValue[content.OriginalColumnName] = content.Value;
                });
            }
        }
        return keyValue;
    }

    public updateFieldSetWidgetDetail(keyValueObj: any, widgetDetail: WidgetDetail) {
        const relatedWidgetDetail: WidgetDetail = widgetDetail;
        if (relatedWidgetDetail && relatedWidgetDetail.contentDetail && relatedWidgetDetail.contentDetail.data) {
            if (relatedWidgetDetail.contentDetail.data.length > 0) {
                const widgetInfo = relatedWidgetDetail.contentDetail.data;
                const contentList: Array<any> = widgetInfo[1];
                const keys = Object.keys(keyValueObj);

                keys.forEach((key) => {
                    const rs = contentList.filter((c) => c.OriginalColumnName === key);
                    // If find out, then update its value.
                    if (rs.length > 0) {
                        rs[0].Value = keyValueObj[key];
                    }
                });
            }
        }
    }

    public findRowIndexDataGridWidgetDetail(widgetDetail: WidgetDetail, listenKeyRequest: { [key: string]: any }) {
        const relatedWidgetDetail: WidgetDetail = widgetDetail;
        let rowIndex = -1;
        if (relatedWidgetDetail && relatedWidgetDetail.contentDetail) {
            const collectionData = this.getCollectionData(relatedWidgetDetail);

            if (collectionData && collectionData.length) {
                const dataRowList: Array<any> = collectionData;
                for (let i = 0; i < dataRowList.length; i++) {
                    const dataRow = dataRowList[i];
                    const objTemp = JSON.parse(JSON.stringify(dataRow).toLowerCase());
                    if (listenKeyRequest) {
                        let count = 0;
                        Object.keys(listenKeyRequest).forEach((key, index) => {
                            if (objTemp[key.toLowerCase()] && objTemp[key.toLowerCase()] === listenKeyRequest[key]) {
                                count += 1;
                            }
                        });
                        if (count === Object.keys(listenKeyRequest).length) {
                            rowIndex = i;
                            break;
                        }
                    }
                }
            }
        }
        return rowIndex;
    }

    getCollectionData(relatedWidgetDetail: WidgetDetail) {
        let collectionData: WidgetDetail[] = [];
        if (relatedWidgetDetail.idRepWidgetType === WidgetType.Combination) {
            for (let i = 0; i < relatedWidgetDetail.contentDetail.data.length; i++) {
                for (let j = 0; j < relatedWidgetDetail.contentDetail.data[i].length; j++) {
                    if (
                        Object.keys(relatedWidgetDetail.contentDetail.data[i][j]).findIndex((key) => {
                            return key === 'collectionData';
                        }) !== -1
                    ) {
                        collectionData = relatedWidgetDetail.contentDetail.data[i][j].collectionData;
                    }
                }
            }
        } else {
            collectionData = relatedWidgetDetail.contentDetail.collectionData;
        }

        return collectionData;
    }

    /**
     * Check if table widget
     * @param widgetDetail
     */
    public isTableWidgetDataType(widgetDetail: WidgetDetail) {
        let isTableWidget: boolean;
        switch (widgetDetail.idRepWidgetType) {
            case WidgetType.DataGrid:
            case WidgetType.EditableGrid:
            case WidgetType.EditableTable:
            case WidgetType.GroupTable:
            case WidgetType.Combination:
            case WidgetType.EditableRoleTreeGrid:
                isTableWidget = true;
                break;
            case WidgetType.ReturnRefund:
                if (widgetDetail.idRepWidgetApp == 81) {
                    isTableWidget = true;
                    break;
                }
        }
        return isTableWidget;
    }

    /**
     * isFieldsetWidget
     * @param widgetDetail
     */
    public isFieldsetWidget(widgetDetail: WidgetDetail) {
        let isFieldsetWidget: boolean;
        switch (widgetDetail.idRepWidgetType) {
            case WidgetType.FieldSet:
            case WidgetType.FieldSetReadonly:
                isFieldsetWidget = true;
                break;
        }
        return isFieldsetWidget;
    }

    public updateCustomData(data: string, replaceData: any, isDataChanged: boolean) {
        const replaceOriginalString = Uti.subStringFromToByString(data, ReplaceString.JsonText);
        if (!isDataChanged) {
            return data.replace(replaceOriginalString, '');
        }
        let replaceDataStr = JSON.stringify(replaceData);
        replaceDataStr = replaceDataStr.replace(/"/g, '\\\\\\"');
        let replaceString = Uti.removeAllString(replaceOriginalString, ReplaceString.JsonText);
        replaceString = replaceString.replace(ReplaceString.SubInputParameter, replaceDataStr);
        return data.replace(replaceOriginalString, replaceString);
    }

    public checkHasSubCollectionData(data: any) {
        try {
            // try to add fake property to object check object existing
            // data.contentDetail.data[2][0].collectionData.isCheckHasData = true;
            return data.contentDetail.data[3] && data.contentDetail.data[3].length;
        } catch (ex) {
            return false;
        }
    }

    public getNumberValueFormObject(object: any): any {
        try {
            if (isNaN(parseFloat(object))) {
                return '';
            }
            return parseFloat(object);
        } catch (ex) {
            return '';
        }
    }

    public contextMenuInEditMode(
        contextMenuData,
        accessRight: any,
        widgetDetail?: WidgetDetail,
        widgetMenuStatusComponent?: XnWidgetMenuStatusComponent,
        conditions?: any,
    ) {
        if (contextMenuData.length < 11) {
            return contextMenuData;
        }

        contextMenuData[0].hidden = true; // New parked Item
        contextMenuData[1].hidden = true; // Edit parked Item
        contextMenuData[2].hidden = true; // Clone parked Item
        contextMenuData[3].hidden = true; // New parked Item
        contextMenuData[4].hidden = true; // Edit widget
        contextMenuData[5].hidden =
            (conditions && !conditions.isShowSaveWidget) || !accessRight.edit || !accessRight.ToolbarButton; //Save widget
        contextMenuData[6].hidden =
            !(widgetDetail && this.isTableWidgetDataType(widgetDetail)) ||
            !accessRight.edit ||
            !accessRight.ToolbarButton; // Add Table Row
        contextMenuData[7].hidden = !(conditions && conditions.isShowUploadTemplate) || !accessRight.edit; // Upload Template
        contextMenuData[8].hidden = !(conditions && conditions.isShowDeleteTemplate) || !accessRight.edit; // Delete Template
        contextMenuData[9].hidden =
            (conditions && !conditions.isShowCancelSave) || !accessRight.edit || !accessRight.ToolbarButton; // Cancel Edit Widget
        contextMenuData[10].hidden = !accessRight.ToolbarButton || !accessRight.ToolbarButton__TranslateButton; // Translate
        contextMenuData[11].hidden =
            !(widgetDetail && widgetDetail.idRepWidgetApp == 106) ||
            !accessRight.ToolbarButton ||
            !accessRight.ToolbarButton__TranslateButton; // Translate Fields
        contextMenuData[12].hidden = !accessRight.ToolbarButton || !accessRight.ToolbarButton__PrintButton; // Print

        contextMenuData[0].disabled = false; // New parked Item
        contextMenuData[1].disabled = false; // Edit parked Item
        contextMenuData[2].disabled = false; // Clone parked Item
        contextMenuData[3].disabled = false; // New parked Item
        contextMenuData[4].disabled = false; // Edit widget
        contextMenuData[5].disabled = false; //Save widget
        contextMenuData[6].disabled = false; // Add Table Row
        contextMenuData[7].disabled = false; // Upload Template
        contextMenuData[8].disabled = false; // Delete Template
        contextMenuData[9].disabled = false; // Cancel Edit Widget
        contextMenuData[10].disabled = false; // Translate
        contextMenuData[11].disabled = false; // Translate Fields
        contextMenuData[12].disabled = false; // Print

        return contextMenuData;
    }

    public contextMenuInViewMode(
        contextMenuData: any,
        widgetType: any,
        accessRight: any,
        currentModule?: Module,
        toolbarSetting?: any,
        selectedTabHeader?: TabSummaryModel,
        activeSubModule?: Module,
        widgetToolbarSetting?: any,
        idRepWidgetApp?: any,
    ) {
        if (contextMenuData.length < 11) {
            return contextMenuData;
        }

        let contextMenuText: any = {
            name: currentModule.moduleName,
            id: currentModule.moduleName,
        };
        contextMenuText = this.getTabIDFromWidgetToolbar(contextMenuText, idRepWidgetApp, widgetToolbarSetting);

        let newEntityMenuContextTitle = 'New ' + contextMenuText.name;
        let editEntityMenuContextTitle = 'Edit ' + contextMenuText.name;
        let cloneEntityMenuContextTitle = 'Clone ' + contextMenuText.name;
        if (!isEmpty(selectedTabHeader) && !selectedTabHeader.tabSummaryInfor.isMainTab) {
            newEntityMenuContextTitle = 'New ' + selectedTabHeader.tabSummaryInfor.tabName;
            editEntityMenuContextTitle = 'Edit ' + selectedTabHeader.tabSummaryInfor.tabName;
            cloneEntityMenuContextTitle = 'Clone ' + selectedTabHeader.tabSummaryInfor.tabName;
        } else if (!isEmpty(activeSubModule) && activeSubModule.idSettingsGUIParent === MenuModuleId.processing) {
            newEntityMenuContextTitle = 'New ' + contextMenuText.name;
            editEntityMenuContextTitle = 'Edit ' + contextMenuText.name;
            cloneEntityMenuContextTitle = 'Clone ' + contextMenuText.name;
        }

        contextMenuData[0].title = newEntityMenuContextTitle;
        contextMenuData[1].title = editEntityMenuContextTitle;
        contextMenuData[2].title = cloneEntityMenuContextTitle;

        let isNewEntityHidden = false;
        let isEditEntityHidden = false;
        let isCloneEntityHidden = false;
        if (
            (currentModule && this.excludeContextMenuModule.indexOf(currentModule.idSettingsGUI) !== -1) ||
            !toolbarSetting ||
            toolbarSetting.CanNew != 1
        ) {
            isNewEntityHidden = true;
        }

        if (
            (currentModule && this.excludeContextMenuModule.indexOf(currentModule.idSettingsGUI) !== -1) ||
            !toolbarSetting ||
            toolbarSetting.CanEdit != 1
        ) {
            isEditEntityHidden = true;
        }

        if (
            (currentModule && this.excludeContextMenuModule.indexOf(currentModule.idSettingsGUI) !== -1) ||
            !toolbarSetting ||
            toolbarSetting.CanClone != 1
        ) {
            isCloneEntityHidden = true;
        }

        // In readonly table widget don't show Edit menu
        contextMenuData[0].hidden = isNewEntityHidden || !accessRight.ParkedItem_New; // New parked Item
        contextMenuData[1].hidden = isEditEntityHidden || !accessRight.ParkedItem_Edit; // Edit parked Item
        contextMenuData[2].hidden = isCloneEntityHidden; // Clone parked Item
        contextMenuData[3].hidden = (isEditEntityHidden && isNewEntityHidden) || !accessRight.ParkedItem_New; // New parked Item
        contextMenuData[4].hidden = widgetType === 2 || !accessRight.edit || !accessRight.ToolbarButton; // Edit widget
        contextMenuData[5].hidden = true; // Save widget
        contextMenuData[6].hidden = true; // Add Table Row
        contextMenuData[7].hidden = true; // Upload Template
        contextMenuData[8].hidden = true; // Delete Template
        contextMenuData[9].hidden = true; // Cancel Edit Widget
        contextMenuData[10].hidden = !accessRight.ToolbarButton || !accessRight.ToolbarButton__TranslateButton; // Translate
        contextMenuData[11].hidden =
            !(idRepWidgetApp == 106) || !accessRight.ToolbarButton || !accessRight.ToolbarButton__TranslateButton; // Translate Fields
        contextMenuData[12].hidden = !accessRight.ToolbarButton || !accessRight.ToolbarButton__PrintButton; // Print

        contextMenuData[0].disabled = false; // New parked Item
        contextMenuData[1].disabled = false; // Edit parked Item
        contextMenuData[2].disabled = false; // Clone parked Item
        contextMenuData[3].disabled = false; // New parked Item
        contextMenuData[4].disabled = false; // Edit widget
        contextMenuData[5].disabled = true; // Save widget
        contextMenuData[6].disabled = true; // Add Table Row
        contextMenuData[7].disabled = true; // Upload Template
        contextMenuData[8].disabled = true; // Delete Template
        contextMenuData[9].disabled = true; // Cancel Edit Widget
        contextMenuData[10].disabled = false; // Translate
        contextMenuData[11].disabled = false; // Translate Fields
        contextMenuData[12].disabled = false; // Print

        return contextMenuData;
    }

    public contextMenuInTranslateMode(contextMenuData, widgetType: any, accessRight: any, idRepWidgetApp?: any) {
        if (contextMenuData.length < 11) {
            return contextMenuData;
        }

        // In readonly table widget don't show Edit menu
        contextMenuData[0].hidden = true; // New parked Item
        contextMenuData[1].hidden = true; // Edit parked Item
        contextMenuData[2].hidden = true; // Clone parked Item
        contextMenuData[3].hidden = true; // New parked Item
        contextMenuData[4].hidden = widgetType === 2 || !accessRight.edit || !accessRight.ToolbarButton; // Edit widget
        contextMenuData[5].hidden = !accessRight.edit || !accessRight.ToolbarButton; // Save widget
        contextMenuData[6].hidden = true; // Add Table Row
        contextMenuData[7].hidden = true; // Upload Template
        contextMenuData[8].hidden = true; // Delete Template
        contextMenuData[9].hidden = !accessRight.edit || !accessRight.ToolbarButton; // Cancel Edit Widget
        contextMenuData[10].hidden = true; // Translate
        contextMenuData[11].hidden =
            !(idRepWidgetApp == 106) || !accessRight.ToolbarButton || !accessRight.ToolbarButton__TranslateButton; // Translate Fields
        contextMenuData[12].hidden = !accessRight.ToolbarButton || !accessRight.ToolbarButton__PrintButton; // Print

        contextMenuData[0].disabled = false; // New parked Item
        contextMenuData[1].disabled = false; // Edit parked Item
        contextMenuData[2].disabled = false; // Clone parked Item
        contextMenuData[3].disabled = false; // New parked Item
        contextMenuData[4].disabled = true; // Edit widget
        contextMenuData[5].disabled = false; //Save widget
        contextMenuData[6].disabled = false; // Add Table Row
        contextMenuData[7].disabled = true; // Upload Template
        contextMenuData[8].disabled = true; // Delete Template
        contextMenuData[9].disabled = false; // Cancel Edit Widget
        contextMenuData[10].disabled = false; // Translate
        contextMenuData[11].disabled = false; // Translate Fields
        contextMenuData[12].disabled = false; // Print

        return contextMenuData;
    }

    public buildNewEditEntityTooltip(
        currentModule: Module,
        toolbarSetting: any,
        selectedTabHeader?: TabSummaryModel,
        activeSubModule?: Module,
    ) {
        let newEntityTooltip = 'New ' + currentModule.moduleName;
        let editEntityTooltip = 'Edit ' + currentModule.moduleName;
        if (!isEmpty(selectedTabHeader) && !selectedTabHeader.tabSummaryInfor.isMainTab) {
            newEntityTooltip = 'New ' + selectedTabHeader.tabSummaryInfor.tabName;
            editEntityTooltip = 'Edit ' + selectedTabHeader.tabSummaryInfor.tabName;
        } else if (!isEmpty(activeSubModule) && activeSubModule.idSettingsGUIParent === MenuModuleId.processing) {
            newEntityTooltip = 'New ' + activeSubModule.moduleName;
            editEntityTooltip = 'Edit ' + activeSubModule.moduleName;
        }

        let isNewEntityHidden = false;
        let isEditEntityHidden = false;
        if (
            (currentModule && this.excludeContextMenuModule.indexOf(currentModule.idSettingsGUI) !== -1) ||
            !toolbarSetting ||
            toolbarSetting.CanNew != 1
        ) {
            isNewEntityHidden = true;
        }
        if (
            (currentModule && this.excludeContextMenuModule.indexOf(currentModule.idSettingsGUI) !== -1) ||
            !toolbarSetting ||
            toolbarSetting.CanEdit != 1
        ) {
            isEditEntityHidden = true;
        }

        return {
            newTooltip: newEntityTooltip,
            editTooltip: editEntityTooltip,
            showNew: !isNewEntityHidden,
            showEdit: !isEditEntityHidden,
        };
    }

    public replaceEditModeForTreeView(data: any) {
        if (data.idRepWidgetType === WidgetType.TreeView) {
            data.request = data.request.replace('<<ModeParameter>>', '\\"Mode\\" : \\"\\"');
        }
    }

    /**
     * sortWidgetDetails
     * @param widgetDetailPages
     */
    public sortWidgetDetails(widgetDetailPages: Array<WidgetDetailPage>): Array<WidgetDetailPage> {
        // Filter to remove duplicate widget Id.
        widgetDetailPages = widgetDetailPages.filter((obj, pos, arr) => {
            return arr.map((mapObj) => mapObj['widgetDetail']['id']).indexOf(obj['widgetDetail']['id']) === pos;
        });

        const sort_by = function (fields) {
            const n_fields = fields.length;

            return function (A, B) {
                let a, b, field, key, reverse, result;
                for (let i = 0, l = n_fields; i < l; i++) {
                    result = 0;
                    field = fields[i];

                    key = typeof field === 'string' ? field : field.name;

                    a = A.config[key];
                    b = B.config[key];

                    if (typeof field.primer !== 'undefined') {
                        a = field.primer(a);
                        b = field.primer(b);
                    }

                    reverse = field.reverse ? -1 : 1;

                    if (a < b) result = reverse * -1;
                    if (a > b) result = reverse * 1;
                    if (result !== 0) break;
                }
                return result;
            };
        };

        widgetDetailPages.forEach((item) => {
            delete item['sortStatus'];
        });

        widgetDetailPages = widgetDetailPages.sort(
            sort_by([
                {
                    name: 'col',
                    primer: parseInt,
                    reverse: false,
                },
                {
                    name: 'row',
                    primer: parseInt,
                    reverse: false,
                },
            ]),
        );
        let rs = [];
        widgetDetailPages.forEach((widgetDetailPage) => {
            let item = this.getNextValidWidgetBox(widgetDetailPages);
            if (item) {
                rs.push(item);
            }
        });

        return rs;
    }

    public getNextValidWidgetBox(items: Array<{ config: NgGridItemConfig }>) {
        let target;
        for (let i = 0; i < items.length; i++) {
            if (!items[i]['sortStatus']) {
                let itemSrc = items[i];
                let isValid = true;
                for (let j = 0; j < items.length; j++) {
                    if (i == j) {
                        continue;
                    }
                    let itemCpr = items[j];

                    let itemCprRowStart = itemCpr.config.row;
                    let itemCprColStart = itemCpr.config.col;
                    let itemCprRowEnd = itemCprRowStart + itemCpr.config.sizey;
                    let itemCprColEnd = itemCpr.config.col + itemCpr.config.sizex;

                    let itemSrcRowStart = itemSrc.config.row;
                    let itemSrcColStart = itemSrc.config.col;
                    let itemSrcColEnd = itemSrc.config.col + itemSrc.config.sizex;

                    // Check if upper widget has intersect
                    if (
                        itemCprRowEnd == itemSrcRowStart &&
                        ((itemSrcColStart <= itemCprColStart && itemSrcColEnd >= itemCprColStart) ||
                            (itemSrcColStart >= itemCprColStart && itemSrcColStart <= itemCprColEnd))
                    ) {
                        if (!itemCpr['sortStatus']) {
                            isValid = false;
                        }
                        break;
                    }
                }
                if (isValid) {
                    itemSrc['sortStatus'] = true;
                    target = itemSrc;
                    break;
                }
            }
        }
        return target;
    }

    /**
     * buildPageSettingData
     * @param rawData
     */
    public buildPageSettingData(rawData: Array<any>): PageSetting {
        let pageSetting: PageSetting;
        const pageSettingIndex = 0;
        const widgetSettingIndex = 1;

        if (!rawData) {
            return;
        }

        // Page Setting Data only has 1 item, so get first item.
        const pageSettingData = rawData[pageSettingIndex][0];

        // Widgets have the list of config
        const widgetSettingDataArray: Array<any> = rawData[widgetSettingIndex];

        pageSetting = new PageSetting({
            idSettingsPage: pageSettingData.IdSettingsPage,
            objectNr: pageSettingData.ObjectNr,
            jsonSettings: pageSettingData.JsonSettings,
            widgets: [],
        });

        const widgets: Array<WidgetDetailPage> = [];

        widgetSettingDataArray.forEach((widgetSettingData) => {
            const idRepWidgetApp = toSafeInteger(widgetSettingData.IdRepWidgetApp);
            const widgetType = toSafeInteger(widgetSettingData.WidgetType);
            if (idRepWidgetApp && widgetType) {
                const widgetConfig = JSON.parse(widgetSettingData.JsonSettings);
                const widgetDetailPage: WidgetDetailPage = new WidgetDetailPage({
                    widgetDetail: widgetConfig.widgetDetail,
                    defaultValue: widgetConfig.defaultValue,
                    description: widgetConfig.description,
                    filterData: widgetConfig.filterData,
                    properties: widgetConfig.properties,
                    columnsLayoutSettings: widgetConfig.columnsLayoutSettings || { settings: '' },
                    config: widgetConfig.config,
                });

                widgetDetailPage.widgetDetail = Object.assign(widgetDetailPage.widgetDetail, {
                    idSettingsWidget: widgetSettingData.IdSettingsWidget,
                    idRepWidgetApp: idRepWidgetApp,
                    idRepWidgetType: widgetType,
                    title: widgetSettingData.WidgetName,
                });

                widgets.push(widgetDetailPage);
            }
        });
        pageSetting.widgets = widgets;
        return pageSetting;
    }

    /**
     * buildListenKeyConfigForWidgetDetail
     * @param srcWidgetDetail
     * @param isMain
     */
    public buildListenKeyConfigForWidgetDetail(srcWidgetDetail: WidgetDetail, isMain: boolean) {
        if (isMain) {
            srcWidgetDetail.widgetDataType.listenKey.sub = null;
            let keys = srcWidgetDetail.widgetDataType.listenKey.key.split(',');
            let filterKeyArr = srcWidgetDetail.widgetDataType.filterKey
                ? srcWidgetDetail.widgetDataType.filterKey.split(',')
                : [''];
            if (keys && keys.length) {
                srcWidgetDetail.widgetDataType.listenKey.main = [];
                keys.forEach((key, index) => {
                    srcWidgetDetail.widgetDataType.listenKey.main.push({
                        key: key,
                        filterKey: filterKeyArr[index] || key,
                    });
                });
            }
        } else {
            srcWidgetDetail.widgetDataType.listenKey.main = null;
            srcWidgetDetail.widgetDataType.listenKey.sub = [];
            const listenKey = srcWidgetDetail.widgetDataType.listenKey.key;
            const listenKeyArr = listenKey.split(',');
            const filterKey = srcWidgetDetail.widgetDataType.filterKey;
            const filterKeyArr = filterKey.split(',');
            listenKeyArr.forEach((lsKey: string, index: number) => {
                // If there is not any filterKey in config, then we get listenKey as default filter Key.
                const filterKeyVal = filterKeyArr[index] ? filterKeyArr[index] : lsKey;
                srcWidgetDetail.widgetDataType.listenKey.sub.push({
                    key: lsKey,
                    filterKey: filterKeyVal,
                });
            });
        }
    }

    /**
     * getWidgetDetailKeyForObservable
     * @param widgetDetail
     * @param moduleName
     */
    public getWidgetDetailKeyForObservable(widgetDetail: WidgetDetail, moduleName: string) {
        let key = '';
        try {
            let filterParam = widgetDetail.widgetDataType.listenKeyRequest(moduleName);
            key = widgetDetail.idRepWidgetApp + '_' + widgetDetail.idRepWidgetType + '_' + JSON.stringify(filterParam);
        } catch {}
        return key;
    }

    /**
     * isReloadForParentAfterUpdating
     * @param widgetDetail
     */
    public isReloadForParentAfterUpdating(widgetDetail: WidgetDetail) {
        let isReload = false;
        switch (widgetDetail.idRepWidgetType) {
            case WidgetType.Combination:
                isReload = true;
                break;
            case WidgetType.FieldSet:
                isReload = true;
                break;
            case WidgetType.EditableGrid:
                if (widgetDetail.idRepWidgetApp == RepWidgetAppIdEnum.CountryCustomerDoublette) {
                    isReload = true;
                }
                break;
        }
        return isReload;
    }

    /**
     *isSupportWidgetSetting
     * */
    public isSupportWidgetSetting(widgetDetail: WidgetDetail) {
        let isShowWidgetSetting = true;
        switch (widgetDetail.idRepWidgetType) {
            case WidgetType.CustomerHistory:
            case WidgetType.OrderDataEntry:
            case WidgetType.FileExplorer:
            case WidgetType.ToolFileTemplate:
            case WidgetType.FileExplorerWithLabel:
                isShowWidgetSetting = false;
                break;
        }
        return isShowWidgetSetting;
    }

    public isShowToogleButton(widgetDetail: WidgetDetail) {
        switch (widgetDetail.idRepWidgetType) {
            case WidgetType.FileExplorer:
            case WidgetType.ToolFileTemplate:
            case WidgetType.FileExplorerWithLabel:
            case WidgetType.FileTemplate:
                return true;
        }
        return false;
    }

    /**
     * isSupportPrint
     */
    public isSupportPrint(widgetDetail: WidgetDetail) {
        let supportPrint = false;
        switch (widgetDetail.idRepWidgetType) {
            case WidgetType.FieldSet:
            case WidgetType.FieldSetReadonly:
            case WidgetType.EditableGrid:
            case WidgetType.EditableRoleTreeGrid:
            case WidgetType.DataGrid:
            case WidgetType.Combination:
            case WidgetType.CombinationCreditCard:
            case WidgetType.Country:
            case WidgetType.TreeView:
            case WidgetType.TableWithFilter:
            case WidgetType.Chart:
                supportPrint = true;
                break;
        }
        return supportPrint;
    }

    /**
     * isSupportLinkWidget
     * @param widgetDetail
     */
    public isSupportLinkWidget(widgetDetail: WidgetDetail) {
        let supportLink = true;
        switch (widgetDetail.idRepWidgetType) {
            case WidgetType.Translation:
                supportLink = false;
                break;
        }
        return supportLink;
    }

    /**
     * isSameTypeWidgetCanSync
     * Check if widget with the same type can be synced.
     */
    public isSameTypeWidgetCanSync(widgetType) {
        let allowSync: boolean;
        switch (widgetType) {
            case WidgetType.DataGrid:
            case WidgetType.EditableGrid:
            case WidgetType.EditableTable:
            case WidgetType.TableWithFilter:
                allowSync = true;
                break;
        }
        return allowSync;
    }

    /**
     * isGroupTable
     * @param widgetDetail
     */
    public isGroupTable(widgetDetail: WidgetDetail) {
        let isGroup = false;
        if (widgetDetail && widgetDetail.contentDetail) {
            const data = widgetDetail.contentDetail;
            if (data.columnSettings && Object.keys(data.columnSettings).length) {
                const ret = Object.keys(data.columnSettings).filter((key) => {
                    const columnSetting = data.columnSettings[key];
                    if (
                        columnSetting['Setting'] &&
                        columnSetting['Setting'] instanceof Array &&
                        columnSetting['Setting'].length
                    ) {
                        const settingArr: Array<any> = columnSetting['Setting'] as Array<any>;
                        const rs = settingArr.filter((s) => {
                            return s['DisplayField'] && s['DisplayField']['IsGrouped'] == '1';
                        });
                        return rs.length;
                    }
                    return false;
                });
                isGroup = ret.length ? true : false;
            }
        }
        return isGroup;
    }

    /**
     * getTranslatedTitle
     * @param widgetDetail
     */
    public getTranslatedTitle(widgetDetail: WidgetDetail) {
        let title = '';
        if (widgetDetail && widgetDetail.idRepWidgetType) {
            if (this.isFieldsetWidget(widgetDetail)) {
                const item = widgetDetail.contentDetail;
                if (item && item.data && item.data[0]) {
                    title = item.data[0][0].WidgetTitle;
                }
            } else {
                // Do Later
            }
        }
        return title;
    }

    public getTabIDFromWidgetToolbar(currentName: any, idRepWidgetApp, widgetToolbar: any[]) {
        if (!widgetToolbar || !widgetToolbar.length) {
            return currentName;
        }

        for (let i = 0; i < widgetToolbar.length; i++) {
            for (let j = 0; j < widgetToolbar[i]['Widgets'].length; j++) {
                if (
                    widgetToolbar[i]['Widgets'][j].IdRepWidgetApp == idRepWidgetApp &&
                    !isNil(widgetToolbar[i]['Widgets'][j].TabInfo)
                ) {
                    currentName.name = widgetToolbar[i]['Widgets'][j].TabInfo.TabName;
                    currentName.id = widgetToolbar[i]['Widgets'][j].TabInfo.TabID;
                    return currentName;
                }
            }
        }

        return currentName;
    }

    /**
     * isValidWidgetToConnectOfChild
     * From child widget then find parent widgets that can be communicated
     * @param childWidgetDetail
     * @param parentWidgetDetail
     */
    public isValidWidgetToConnectOfChild(childWidgetDetail: WidgetDetail, parentWidgetDetail: WidgetDetail) {
        let isValid = false;
        do {
            if (!childWidgetDetail.widgetDataType || !parentWidgetDetail.widgetDataType) {
                break;
            }
            if (!childWidgetDetail.widgetDataType.listenKey) {
                break;
            }
            if (
                childWidgetDetail.idRepWidgetApp == parentWidgetDetail.idRepWidgetApp &&
                childWidgetDetail.idRepWidgetType == parentWidgetDetail.idRepWidgetType
            ) {
                break;
            }
            const key = childWidgetDetail.widgetDataType.listenKey.key;

            if (!parentWidgetDetail.widgetDataType.primaryKey) {
                break;
            }

            const keyArr = key.split(',');
            const primaryKeys = parentWidgetDetail.widgetDataType.primaryKey.split(',');

            let count = 0;

            keyArr.forEach((key: string) => {
                for (let primaryKey of primaryKeys) {
                    if (key == primaryKey) {
                        count += 1;
                    }
                }
            });

            if (count == keyArr.length) {
                isValid = true;
            }

            break;
        } while (true);
        return isValid;
    }

    /**
     * isValidWidgetToConnectOfParent
     * From parent widget then find children widgets that can be communicated
     * @param parentWidgetDetail : parent widget
     * @param childWidgetDetail : child widget
     **/
    public isValidWidgetToConnectOfParent(parentWidgetDetail: WidgetDetail, childWidgetDetail: WidgetDetail) {
        let isValid = false;
        do {
            if (!parentWidgetDetail.widgetDataType || !childWidgetDetail.widgetDataType) {
                break;
            }
            if (!parentWidgetDetail.widgetDataType.primaryKey) {
                break;
            }
            if (!childWidgetDetail.widgetDataType.listenKey) {
                break;
            }
            if (
                parentWidgetDetail.idRepWidgetType == childWidgetDetail.idRepWidgetType &&
                parentWidgetDetail.idRepWidgetApp == childWidgetDetail.idRepWidgetApp
            ) {
                break;
            }

            const key = childWidgetDetail.widgetDataType.listenKey.key;
            const keyArr = key.split(',');
            const primaryKeys = parentWidgetDetail.widgetDataType.primaryKey.split(',');

            let count = 0;

            keyArr.forEach((key: string) => {
                for (let primaryKey of primaryKeys) {
                    if (key == primaryKey) {
                        count += 1;
                    }
                }
            });

            if (count == keyArr.length) {
                isValid = true;
            }

            break;
        } while (true);
        return isValid;
    }

    /**
     * isValidChartWidgetToConnectTable
     * @param srcWidgetDetail
     * @param value
     */
    public isValidChartWidgetToConnectTable(srcWidgetDetail: WidgetDetail, value: WidgetDetail) {
        let isValid = false;
        do {
            if (srcWidgetDetail.idRepWidgetType == WidgetType.Chart) {
                if (
                    value.idRepWidgetType === WidgetType.DataGrid ||
                    value.idRepWidgetType === WidgetType.EditableGrid
                ) {
                    isValid = true;
                }
            }
            break;
        } while (true);
        return isValid;
    }

    /**
     * isValidTableWidgetToConnect
     * Check if the same table and same type widget to connect
     * @param srcWidgetDetail
     * @param data
     */
    public isValidTableWidgetToConnect(srcWidgetDetail: WidgetDetail, data: WidgetDetail) {
        let isValid = false;
        do {
            if (srcWidgetDetail.id == data.id) {
                break;
            }
            const allowSrcSync = this.isSameTypeWidgetCanSync(srcWidgetDetail.idRepWidgetType);
            if (!allowSrcSync) {
                break;
            }

            const allowDestSync = this.isSameTypeWidgetCanSync(data.idRepWidgetType);
            if (!allowDestSync) {
                break;
            }

            if (srcWidgetDetail.idRepWidgetApp == data.idRepWidgetApp) {
                isValid = true;
            }
            break;
        } while (true);
        return isValid;
    }

    /**
     * isValidWidgetToConnect
     * @param srcWidgetDetail
     * @param targetWidgetDetail
     */
    public isValidWidgetToConnect(srcWidgetDetail: WidgetDetail, targetWidgetDetail: WidgetDetail) {
        let connected: boolean;
        let mode = 'child->parent';
        let isValid = this.isValidWidgetToConnectOfChild(srcWidgetDetail, targetWidgetDetail);
        if (!isValid) {
            mode = 'parent->child';
            isValid = this.isValidWidgetToConnectOfParent(srcWidgetDetail, targetWidgetDetail);
        }
        if (!isValid) {
            mode = 'same-widget';
            isValid = this.isValidTableWidgetToConnect(srcWidgetDetail, targetWidgetDetail);
        }
        if (!isValid) {
            mode = 'chart-table';
            isValid = this.isValidChartWidgetToConnectTable(srcWidgetDetail, targetWidgetDetail);
        }
        let child, parent;
        switch (mode) {
            case 'child->parent':
                child = srcWidgetDetail;
                parent = targetWidgetDetail;
                if (child.widgetDataType.parentWidgetIds) {
                    const iRet = child.widgetDataType.parentWidgetIds.find((p) => p == parent.id);
                    if (iRet) {
                        connected = true;
                    }
                }
                break;
            case 'parent->child':
                parent = srcWidgetDetail;
                child = targetWidgetDetail;
                if (child.widgetDataType.parentWidgetIds) {
                    const iRet = child.widgetDataType.parentWidgetIds.find((p) => p == parent.id);
                    if (iRet) {
                        connected = true;
                    }
                }
                break;
            case 'same-widget':
                if (srcWidgetDetail.syncWidgetIds) {
                    const iRet = srcWidgetDetail.syncWidgetIds.find((p) => p == targetWidgetDetail.id);
                    if (iRet) {
                        connected = true;
                    }
                }
                break;
            case 'chart-table':
                if (srcWidgetDetail.syncWidgetIds) {
                    const iRet = srcWidgetDetail.syncWidgetIds.find((p) => p == targetWidgetDetail.id);
                    if (iRet) {
                        connected = true;
                    }
                }
                break;
        }
        return {
            isValid,
            connected,
            mode,
        };
    }

    public buildReadonlyGridFormColumns(columnSettings, columns) {
        for (let key in columnSettings) {
            let columnSettingValue = columnSettings[key];

            if (columnSettingValue['DataType'] === 'bit' && isEmpty(columnSettingValue['Setting'])) {
                columnSettingValue['Setting'] = [{ ControlType: { Type: 'Checkbox' } }];
            }

            if (typeof columnSettingValue['Setting'] !== 'string') {
                columnSettingValue['Setting'] = JSON.stringify(columnSettingValue['Setting']);
            }

            columns.push(columnSettingValue);
        }

        return columns;
    }

    public buildReadonlyGridFormColumnsValue(collectionData, columns) {
        for (let i = 0; i < columns.length; i++) {
            for (let j = 0; j < collectionData.length; j++) {
                let collectionDataColumnValue = collectionData[j][columns[i]['ColumnName']];
                if (!isNil(collectionDataColumnValue)) {
                    if (typeof collectionDataColumnValue === 'object' && isEmpty(collectionDataColumnValue)) {
                        collectionDataColumnValue = '';
                    } else if (typeof collectionDataColumnValue === 'string') {
                        let jsonData = Uti.tryParseJson(collectionDataColumnValue);
                        if (typeof jsonData === 'object' && !isEmpty(jsonData)) {
                            collectionDataColumnValue = jsonData['value'];
                        }
                    }

                    columns[i]['Value'] = collectionDataColumnValue;
                }
            }
        }

        return columns;
    }

    /**
     * Check if Template widget
     * @param widgetDetail
     */
    public isTemplateWidget(widgetDetail: WidgetDetail) {
        let isTemplate: boolean = false;
        switch (widgetDetail.idRepWidgetApp) {
            case RepWidgetAppIdEnum.MailingParameters:
            case RepWidgetAppIdEnum.ProductParameter:
            case RepWidgetAppIdEnum.GlobalParameter:
            case RepWidgetAppIdEnum.PostShippingCosts:
            case RepWidgetAppIdEnum.PrinterControl:
                isTemplate = true;
                break;
        }
        return isTemplate;
    }

    /**
     * isSwitchToEditModeWidget
     * @param widgetDetail
     */
    public isSwitchToEditModeWidget(widgetDetail: WidgetDetail) {
        let editMode;
        if (
            widgetDetail.widgetDataType &&
            widgetDetail.widgetDataType.editFormSetting &&
            widgetDetail.widgetDataType.editFormSetting.swithToEdit
        ) {
            editMode = true;
        }
        return editMode;
    }

    public ignoreDirtyCheck(widgetDetail: WidgetDetail) {
        let status = false;
        switch (widgetDetail.idRepWidgetApp) {
            case RepWidgetAppIdEnum.ArticleOrderDetail:
                status = true;
                break;
        }
        return status;
    }
}
