import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
    GlobalSettingService,
    ModuleService,
    CommonService,
    GlobalSearchService,
    ModuleSettingService,
    ParkedItemService,
    WidgetTemplateSettingService,
} from '@app/services';
import { Configuration } from '@app/app.constants';
import { Uti } from '@app/utilities/uti';

import {
    Module
} from '@app/models';

@Component({
    selector: 'request-tracking',
    templateUrl: './request-tracking.component.html',
    styleUrls: ['./request-tracking.component.scss']
})
export class RequestTrackingComponent implements OnInit {
    public requestItems = '';
    public requestItemList = [];
    public successItems = [];
    public loadFunction = '0';

    constructor(
        private route: ActivatedRoute,

        private router: Router,
        private commonService: CommonService,

        private consts: Configuration,
        private uti: Uti) { }

    ngOnInit() {
        if (!this.uti.checkLogin()) {
            this.router.navigate([this.consts.loginUrl]);
            return;
        }
    }

    public go() {
        if (!this.successItems || !this.successItems.length) return;
        this.successItems.filter(x => x.success = false);
        for (let item of this.successItems) {
            this.executeService(item)
        }
    }

    public onLoadFunctionChanged(loadFunction) {
        this.requestItems = '';
        switch(loadFunction) {
            case 1: {
                this.setValueForFirstLoad();
                break;
            }
            case 2: {
                this.setValueForClickParkedItem();
                break;
            }
        }
        this.onRequestItemChanged();
    }

    public onRequestItemChanged() {
        if (!this.requestItems) {
            this.successItems = [];
            return;
        }
        this.requestItemList = this.requestItems.split('\n');
        if (!this.requestItemList || !this.requestItemList.length) return;
        this.successItems = [];
        for (let item of this.requestItemList) {
            if (!item) continue;
            this.successItems.push({
                url: item,
                success: false
            })
        }
    }

    private setValueForFirstLoad() {
        this.requestItems += '/api/common/GetPublicSetting\n';
        this.requestItems += '/api/GlobalSetting/GetAllGlobalSettings\n';
        this.requestItems += '/api/common/getModules\n';
        this.requestItems += '/api/GlobalSetting/GetAllGlobalSettings\n';
        this.requestItems += '/api/common/GetModuleToPersonType\n';
        this.requestItems += '/api/common/GetAllSearchModules\n';
        this.requestItems += '/api/GlobalSetting/GetAllGlobalSettings\n';
        this.requestItems += '/api/common/GetSettingModules?objectParam=&idSettingsModule=&objectNr=2&moduleType=LayoutSetting\n';
        this.requestItems += '/api/parkeditem/GetParkedItemMenu?module_name=2\n';
        this.requestItems += '/api/common/getdetailsubmodule?moduleId=2\n';
        this.requestItems += '/api/widget/GetAllWidgetTemplateByModuleId?moduleId=2&objectValue=\n';
        this.requestItems += '/api/parkeditem/GetListParkedItemByModule?module_name=2\n';
        this.requestItems += '/api/common/GetSettingModules?objectParam=&idSettingsModule=&objectNr=2&moduleType=WidgetToolbar\n';
    }

    private setValueForClickParkedItem() {
        this.requestItems += '/api/common/GetTabSummaryInfor?moduleName=2&idObject=2\n';
        this.requestItems += '/api/widget/GetWidgetSetting?sqlFieldName=ObjectNr&sqlFieldValue=96B47F54-E66D-4785-B2E2-7D7C5082C525\n';
        this.requestItems += '/api/widget/GetWidgetSetting?sqlFieldName=ObjectNr&sqlFieldValue=B318B06D-EC8F-4240-8780-11BF34C764CF\n';
        this.requestItems += '/api/GlobalSetting/GetTranslateLabelText?originalText=Widget%20Title...&widgetMainID=73&widgetCloneID=2c7a82da-9054-a807-7efb-d84f833a925b&idRepTranslateModuleType=2\n';
        this.requestItems += '/api/widget/GetWidgetDetailByRequestString?idRepWidgetType=1&idRepWidgetApp=2&widgetGuid=e9ec1f8a-436f-dbc8-614a-2fc27aba84b1&moduleName=Customer&filterParam=%5C%22IdPerson%5C%22%3A%5C%222121883%5C%22\n';
        this.requestItems += '/api/widget/GetWidgetDetailByRequestString?idRepWidgetType=3&idRepWidgetApp=10&widgetGuid=9c7bc525-d885-1e56-b38e-7824a257565e&moduleName=Customer&filterParam=%5C%22IdPersonInterface%5C%22%3A%5C%222121880%5C%22\n';
        this.requestItems += '/api/widget/GetWidgetDetailByRequestString?idRepWidgetType=2&idRepWidgetApp=55&widgetGuid=82790fa9-cdcf-2ad1-d8d8-d3f284915a12&moduleName=Customer&filterParam=%5C%22IdPerson%5C%22%3A%5C%222121883%5C%22\n';
        this.requestItems += '/api/widget/GetWidgetDetailByRequestString?idRepWidgetType=2&idRepWidgetApp=87&widgetGuid=5dd47e46-3ff6-53fe-ca8f-73a92ac57570&moduleName=Customer&filterParam=%5C%22IdSalesOrder%5C%22%3A%5C%22%5C%22\n';
        this.requestItems += '/api/widget/GetWidgetDetailByRequestString?idRepWidgetType=17&idRepWidgetApp=69&widgetGuid=ddcc39f1-70a8-c5d8-40b0-313730b8b281&moduleName=Customer&filterParam=%5C%22IdArticle%5C%22%3A%5C%22%5C%22\n';
        this.requestItems += '/api/common/GetComboBoxInfo?comboBoxList=identifierCode\n';
        this.requestItems += '/api/common/GetComboBoxInfo?comboBoxList=identifierCode\n';
        this.requestItems += '/api/common/GetComboBoxInfo?comboBoxList=identifierCode\n';
        this.requestItems += '/api/common/GetComboBoxInfo?comboBoxList=identifierCode\n';
        this.requestItems += '/api/common/GetComboBoxInfo?comboBoxList=identifierCode\n';
        this.requestItems += '/api/common/GetComboBoxInfo?comboBoxList=identifierCode\n';
        this.requestItems += '/api/person/GetCustomerHistory?idPerson=2121883&pageIndex=0&pageSize=4\n';
        this.requestItems += '/api/GlobalSetting/GetTranslateLabelText?originalText=Translate%20Widget&widgetMainID=69&widgetCloneID=ddcc39f1-70a8-c5d8-40b0-313730b8b281&idRepTranslateModuleType=2\n';
        this.requestItems += '/api/GlobalSetting/GetTranslateLabelText?originalText=Communition%20List&widgetMainID=10&widgetCloneID=9c7bc525-d885-1e56-b38e-7824a257565e&idRepTranslateModuleType=2\n';
        this.requestItems += '/api/GlobalSetting/GetTranslateLabelText?originalText=Order%20Detail&widgetMainID=87&widgetCloneID=5dd47e46-3ff6-53fe-ca8f-73a92ac57570&idRepTranslateModuleType=2\n';
        this.requestItems += '/api/GlobalSetting/GetTranslateLabelText?originalText=Customer%20Order&widgetMainID=55&widgetCloneID=82790fa9-cdcf-2ad1-d8d8-d3f284915a12&idRepTranslateModuleType=2\n';
        this.requestItems += '/api/GlobalSetting/GetTranslateLabelText?originalText=Customer%20Detail&widgetMainID=2&widgetCloneID=e9ec1f8a-436f-dbc8-614a-2fc27aba84b1&idRepTranslateModuleType=2\n';
        this.requestItems += '/api/common/GetComboBoxInfo?comboBoxList=language,countryCode,title,titleOfCourtesy,customerStatus\n';
        this.requestItems += '/api/common/GetComboBoxInfo?comboBoxList=language,countryCode,title,titleOfCourtesy,customerStatus\n';
        this.requestItems += '/api/GlobalSetting/GetTranslateLabelText?originalText=Widget%20Title...&widgetMainID=73&widgetCloneID=2c7a82da-9054-a807-7efb-d84f833a925b&idRepTranslateModuleType=2\n';
    }

    private executeService(item) {
        let replaceURL = document.location.protocol +'//'+ document.location.hostname;
        if (item.url.indexOf('localhost') > -1) {
            replaceURL += ":4200"
        }
        this.commonService.getTracking(item.url.replace(replaceURL, '')).subscribe(result => {
            item.success = true;
        });
    }
}
