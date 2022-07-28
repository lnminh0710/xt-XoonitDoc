import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { AccessRightsService } from '@app/services';
import { TabSummaryModel, Module, SimpleTabModel, ApiResultResponse } from '@app/models';

import toSafeInteger from 'lodash-es/toSafeInteger';
import isNil from 'lodash-es/isNil';
import isEmpty from 'lodash-es/isEmpty';
import { Uti } from '@app/utilities';
import { DocumentProcessingTypeEnum, DocumentFormNameEnum } from '@app/app.constants';
import { FormState } from '@app/state-management/store/models/administration-document/state/document-forms.state.model';
import { isBoolean } from 'lodash-es';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { ItemModel } from '@app/pages/private/modules/file-manager/models';
import { dataTypeFormControl } from '@app/shared/components/widget/components/widget-document-form/control-model/document.enum';
import { map } from 'rxjs/operators';

@Injectable()
export class TabService extends BaseService {
    constructor(
        injector: Injector,
        @Inject(forwardRef(() => AccessRightsService)) private accessRightsService: AccessRightsService,
    ) {
        super(injector);
    }

    public getTabSummaryInfor(param: any): Observable<ApiResultResponse> {
        let getParam = {
            moduleName: param.module.idSettingsGUI,
            idObject: param.idObject,
        };
        return this.get<ApiResultResponse>(this.serUrl.getTabSummaryInfor, getParam, null, null).pipe(
            map((result: any) => {
                //Set accessRight for tab summary
                this.accessRightsService.SetAccessRightsForTabSummary(param.module, result.item);

                return result;
            }),
        );
    }

    public getTabByDocumentType(param: any): Observable<ApiResultResponse> {
        const getParam = {
            idRepDocumentType: param.idRepDocumentType,
            documentType: param.documentType,
            idObject: param.idObject,
        };
        return this.get<ApiResultResponse>(this.serUrl.getTabByDocumentType, getParam, null, null).pipe(
            map((result: any) => {
                //Set accessRight for tab summary
                this.accessRightsService.SetAccessRightsForTabSummary(param.module, result.item);

                return result;
            }),
        );
    }

    /**
     * getMainTabHeader
     * Find main tab in tab list.
     * Case 1: If any, then set visible = true
     * Case 2: If not, create empty TabSummaryModel object and set visible = false.
     * @param tabs
     */
    getMainTabHeader(tabs: TabSummaryModel[]) {
        let mainTab = tabs.find((t) => t.tabSummaryInfor.isMainTab);
        if (mainTab) {
            mainTab.visible = true;
        } else {
            mainTab = new TabSummaryModel({ visible: false });
        }
        return mainTab;
    }

    setLogoForMainTabHeader(mainTabHeader: TabSummaryModel) {
        if (mainTabHeader && mainTabHeader.tabSummaryData && mainTabHeader.tabSummaryData.length) {
            mainTabHeader.tabSummaryData[0].logoUrl = Uti.getCustomerLogoUrl(
                mainTabHeader.tabSummaryData[0].logo,
                '100',
            );
        }
    }

    /**
     * getOtherTabsHeader
     * @param tabs
     */
    getOtherTabsHeader(tabs: TabSummaryModel[]) {
        return tabs.filter((t) => !t.tabSummaryInfor.isMainTab) || [];
    }

    /**
     * getMainTabContent
     * @param tabs
     * @param tabSummaries
     */
    getMainTabContent(tabs: Array<any>, tabSummaries: TabSummaryModel[]) {
        let mainTabContent: any = { visible: false };
        const mainTabHeader = tabSummaries.filter((t) => t.tabSummaryInfor.isMainTab);
        if (mainTabHeader.length) {
            tabs.forEach((tab) => {
                const rs = mainTabHeader.find((p) => p.tabSummaryInfor.tabID == tab.TabID);
                if (rs) {
                    mainTabContent = tab;
                    mainTabContent.visible = true;
                    mainTabContent.accessRight = rs.accessRight;
                    mainTabContent.keepContentState = !!toSafeInteger(tab.KeepContentState);
                }
            });
        }
        return mainTabContent;
    }

    getMainTabContentFixed(tabs: Array<any>) {
        let mainTabContent: any = { visible: true };
        if (tabs.length) {
            const tab = tabs[0];
            mainTabContent = tab;
            mainTabContent.visible = true;
            mainTabContent.accessRight = { read: true };
            mainTabContent.active = true;
            mainTabContent.loaded = true;
            mainTabContent.keepContentState = !!toSafeInteger(tab.KeepContentState);
        }
        return mainTabContent;
    }

    /**
     * getOtherTabsContent
     * @param tabs
     * @param tabSummaries
     */
    getOtherTabsContent(tabs: Array<any>, tabSummaries: TabSummaryModel[]) {
        let otherTabsContent: Array<any> = [];
        const othersTabHeader = tabSummaries.filter((t) => !t.tabSummaryInfor.isMainTab);
        if (othersTabHeader.length) {
            tabs.forEach((tab) => {
                const rs = othersTabHeader.find((p) => p.tabSummaryInfor.tabID == tab.TabID);
                if (rs) {
                    otherTabsContent.push(Object.assign({}, tab, { accessRight: rs.accessRight }));
                }
            });
        }
        return otherTabsContent;
    }

    unSelectTabs(tabs: TabSummaryModel[]) {
        for (let i = 0; i < tabs.length; i++) {
            tabs[i].active = false;
        }
    }

    unSelectCurentActiveTab(tabs: TabSummaryModel[]) {
        const curActiveTab = tabs.filter((tab) => {
            return tab.active === true;
        });

        if (curActiveTab.length) {
            curActiveTab[0].active = false;
        }
    }

    buildOtherTabsContent(tabs: TabSummaryModel[], configTabs: any) {
        const newTabs = [];
        for (let i = 0; i < tabs.length; i++) {
            for (let j = 0; j < configTabs.length; j++) {
                if (tabs[i].tabSummaryInfor.tabID === configTabs[j].TabID) {
                    newTabs.push(configTabs[j]);
                }
            }
        }

        return newTabs;
    }

    appendProp(tabs, prop, val) {
        for (let i = 0; i < tabs.length; i++) {
            tabs[i][prop] = val;
        }

        return tabs;
    }

    appendMainTabData(mainTab, data) {
        mainTab.tabSummaryInfor = data[0].tabSummaryInfor;
        mainTab.tabSummaryData = data[0].tabSummaryData;
        mainTab.disabled = isNil(data[0].disabled) ? false : data[0].disabled;
        mainTab.visible = isNil(data[0].visible) ? true : data[0].visible;
        return mainTab;
    }

    appendOtherTabsData(otherTabs, data) {
        const tabData = data.slice(1, data.length);

        for (let i = 0; i < tabData.length; i++) {
            for (let j = 0; j < otherTabs.length; j++) {
                if (tabData[i].tabSummaryInfor.tabID === otherTabs[j].tabSummaryInfor.tabID) {
                    otherTabs[j].tabSummaryInfor = tabData[i].tabSummaryInfor;
                    otherTabs[j].tabSummaryData = tabData[i].tabSummaryData;
                    otherTabs[j].disabled = isNil(tabData[i].disabled) ? false : tabData[i].disabled;
                    otherTabs[j].visible = isNil(tabData[i].visible) ? true : tabData[i].visible;
                }
            }
        }

        return otherTabs;
    }

    buildFields(tabs, isMainTab?) {
        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].tabSummaryRawData && tabs[i].tabSummaryRawData.length) {
                tabs[i].fields = Object.keys(tabs[i].tabSummaryRawData[0]).map((key) => {
                    return {
                        name: key,
                        value: tabs[i].tabSummaryRawData[0][key],
                        textValue: tabs[i].tabSummaryRawData[0][key],
                        columnName: '',
                    };
                });
            }
        }

        if (isMainTab) {
            return tabs[0];
        }

        return tabs;
    }

    updateFieldValueOnInit(
        tabs: TabSummaryModel[],
        formsState: { [formName: string]: FormState },
        isMainTab?: boolean,
    ) {
        for (let i = 0; i < tabs.length; i++) {
            if (!tabs[i].fields || tabs[i].initDone) {
                // console.log(`tab.service: formData of ${tabs[i].tabSummaryInfor.tabID} is initDone: ${tabs[i].initDone} OR tabs[i].fields is null`);
                continue;
            }

            let formData: FormState;
            switch (tabs[i].tabSummaryInfor.tabID) {
                case 'Kontakt':
                    formData = Uti.getFormStateByDocumentFormName(formsState, DocumentFormNameEnum.WIDGET_CONTACT);
                    break;
                case 'Bank':
                    formData = Uti.getFormStateByDocumentFormName(formsState, DocumentFormNameEnum.WIDGET_BANK);
                    break;
                case 'Rechnungsinformationen':
                    formData = Uti.getFormStateByDocumentFormName(formsState, DocumentFormNameEnum.WIDGET_INVOICE);
                    break;
                case 'NotizenTags':
                    formData = Uti.getFormStateByDocumentFormName(formsState, DocumentFormNameEnum.WIDGET_NOTES);

                    this.updateDynamicFieldValueOnTab(tabs[i], formData);

                    tabs[i].initDone = true;
                    continue; // continue the loop for special case
            }
            // console.log(`tab.service: formData of ${tabs[i].tabSummaryInfor.tabID}`);
            const completed = this.updateFieldValuesOnTab(tabs[i], formData);
            tabs[i].initDone = completed;
        }

        if (isMainTab) {
            return tabs[0];
        }
    }

    updateDynamicFieldValueOnTab(tab: TabSummaryModel, formData: FormState) {
        if (!formData || !formData.data || !formData.data.length) return;

        let field: { name: string; value: string; textValue: string; columnName: string };
        let value: any;
        for (let dataIdx = 0; dataIdx < formData.data.length; dataIdx++) {
            const data = formData.data[dataIdx];
            field = tab.fields.find((item) => item.name === data.ColumnName);
            value = data.Value;

            if (!field) {
                // console.log(`tab.service: this is new field dynamic`, field);
                field = { name: data.ColumnName, value: value, textValue: value, columnName: data.ColumnName };
                tab.fields.push(field);
            }

            // console.log(`tab.service: update value of field dynamic ${field.columnName}: ${field.value}`, field);
            field.textValue = field.value = value;
        }
    }

    updateFieldValuesOnTab(tab: TabSummaryModel, formData: FormState) {
        if (!formData) {
            // console.log(`tab.service: this formData is null`);
            return false;
        }

        if (tab.tabSummaryInfor.tabID === 'NotizenTags') {
            // console.log(`tab.service: this formData is dynamic`);
            this.updateDynamicFieldValueOnTab(tab, formData);
            return;
        }

        const dataList = formData.data;
        let data: ExtractedDataFormModel;
        let originalColumnName: string;
        let field: any;

        for (let i = 0; i < tab.fields.length; i++) {
            field = tab.fields[i];
            data = dataList.find((item) => {
                originalColumnName = item.OriginalColumnName.substring(0, item.OriginalColumnName.lastIndexOf('_'));
                if (
                    originalColumnName.toLowerCase() === field.name.toLowerCase() ||
                    item.OriginalColumnName.toLowerCase() === field.name.toLowerCase()
                ) {
                    return true;
                }
                return false;
            });

            if (!data) {
                // console.log(`tab.service: this field ${originalColumnName} is not exist`);
                continue;
            }

            field.columnName = data.ColumnName;

            if (isBoolean(data.Value)) {
                field.value = data.Value;
                if (data.Value === true) {
                    field.textValue = '✔ ' + data.ColumnName;
                } else {
                    field.textValue = '';
                }
                // console.log(`tab.service: update field boolean value ${field.columnName}: ${data.Value}`, field, data);
                continue;
            }

            if (data.DataType.toLowerCase() === dataTypeFormControl.comboBox) {
                const selectedOpt =
                    data.Data && data.Data.length ? data.Data.find((opt) => opt.key === data.Value) : null;
                if (!selectedOpt) return;

                field.textValue = selectedOpt.value;
                continue;
            }

            field.textValue = field.value = data.Value;
            // console.log(`tab.service: update field value ${field.columnName}: ${data.Value}`, field, data);
        }
        return true;
    }

    resetVisible(otherTabs) {
        for (const tab of otherTabs) {
            tab.visible = true;
        }
    }

    isTabStructureChanged(mainTab, otherTabs, data) {
        return isEmpty(mainTab) || otherTabs.length !== data.length - 1;
    }

    isMainTabSelected(selectedTab: TabSummaryModel) {
        return selectedTab && selectedTab.tabSummaryInfor.isMainTab;
    }

    disabledTab(tabs: TabSummaryModel[], selectedTab: TabSummaryModel) {
        for (const tab of tabs) {
            if (tab.tabSummaryInfor.tabID === selectedTab.tabSummaryInfor.tabID) {
                tab.disabled = false;
            } else {
                tab.disabled = true;
            }
        }

        return tabs;
    }

    createNewTabConfig(
        isMainTab: boolean,
        activeModule: Module,
        selectedTab: TabSummaryModel,
        selectedSimpleTab?: SimpleTabModel,
        tabSetting?: any,
    ) {
        let simpleTabSetting: any;
        if (selectedSimpleTab) {
            simpleTabSetting = tabSetting.Content.CustomTabs.find(
                (ct) => ct.TabID == selectedTab.tabSummaryInfor.tabID,
            );
            if (simpleTabSetting) {
                let simpleTabs: SimpleTabModel[] = [];
                if (simpleTabSetting.Split && simpleTabSetting.Split.Items) {
                    for (const item of simpleTabSetting.Split.Items) {
                        if (!isNil(item.SimpleTabs)) {
                            simpleTabs = item.SimpleTabs;
                            break;
                        }
                    }
                } else if (simpleTabSetting.SimpleTabs) {
                    simpleTabs = simpleTabSetting.SimpleTabs;
                }

                for (const simpleTab of simpleTabs) {
                    simpleTabSetting = {
                        // TODO: will fix for business later
                        // Fix javascript error
                        // [selectedSimpleTab.TabID]: activeModule.idSettingsGUI + '-' + selectedSimpleTab.TabID
                        [selectedSimpleTab.TabID]: (activeModule.idSettingsGUI || '') + '-' + selectedSimpleTab.TabID,
                    };
                }
            }
        }

        return {
            normalTab: selectedSimpleTab
                ? null
                : {
                    isMainTab: isMainTab,
                    activeModuleId: activeModule.idSettingsGUI,
                    tabID: isMainTab ? this.uti.getDefaultMainTabId(activeModule) : selectedTab.tabSummaryInfor.tabID,
                    moduleTabCombineName:
                        activeModule.idSettingsGUI +
                        '-' +
                        (isMainTab ? this.uti.getDefaultMainTabId(activeModule) : selectedTab.tabSummaryInfor.tabID),
                },
            simpleTab: !selectedSimpleTab
                ? null
                : {
                    activeModuleId: activeModule.idSettingsGUI,
                    tabID: selectedSimpleTab.TabID,
                    moduleTabCombineName: simpleTabSetting,
                },
        };
    }

    buildEditingData(editingTabData, moduleName) {
        if (!editingTabData) {
            return null;
        }

        switch (moduleName) {
            case 'Customer':
                return this.buildCustomerHeader(editingTabData);
            case 'Administration':
                return this.buildAdministrationHeader(editingTabData);

            default:
                return '';
        }
    }

    buildCustomerHeader(editingTabData) {
        let result =
            (editingTabData.title || '') +
            ' ' +
            (editingTabData.lastName || '') +
            ' ' +
            (editingTabData.firstName || '');

        if (editingTabData.address) {
            result +=
                (editingTabData.address.street || '') +
                ' ' +
                (editingTabData.address.streetNr || '') +
                ' ' +
                (editingTabData.address.place || '');
        }

        result += ' ' + (editingTabData.countryCode || '');

        return result;
    }

    buildAdministrationHeader(editingTabData) {
        let result = '';

        if (editingTabData.adMainFieldForm) {
            result =
                (editingTabData.adMainFieldForm.title || '') +
                ' ' +
                (editingTabData.adMainFieldForm.lastName || '') +
                ' ' +
                (editingTabData.adMainFieldForm.firstName || '');
        }

        if (editingTabData.address) {
            result +=
                (editingTabData.address.street || '') +
                ' ' +
                (editingTabData.address.streetNr || '') +
                ' ' +
                (editingTabData.address.place || '');
        }

        result += ' ' + (editingTabData.countryCode || '');

        return result;
    }

    buildColumnFilter(httpLink) {
        const result = {};

        const keyName = httpLink.substr(0, httpLink.indexOf('='));
        const value = httpLink.substr(httpLink.indexOf('=') + 1);

        result[keyName] = [value];

        return result;
    }

    checkKeyNameExist(obj, filterItem) {
        for (const fieldName in obj) {
            if (fieldName === Object.keys(filterItem)[0]) {
                return true;
            }
        }

        return false;
    }

    buildCoumnFilterFromList(menuItems) {
        const result = {};

        for (const item of menuItems) {
            const filterItem = this.buildColumnFilter(item.httpLink);
            if (this.checkKeyNameExist(result, filterItem)) {
                result[Object.keys(filterItem)[0]].push(filterItem[Object.keys(filterItem)[0]][0]);
            } else {
                result[Object.keys(filterItem)[0]] = [filterItem[Object.keys(filterItem)[0]][0]];
            }
        }

        return result;
    }

    getActiveMenuItems(menuItems) {
        return menuItems.filter((item) => {
            return item.isChecked === true;
        });
    }
}
