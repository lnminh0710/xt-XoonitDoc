import { NgModule, ErrorHandler } from "@angular/core";
import { SearchComponent } from "./search.component";
import { CommonModule } from "@angular/common";
import { GlobalSearchModule } from "@app/shared/components/global-search/global-search.module";
import {
    AppErrorHandler, CanLoadGuard,
    CommonService, ModalService, ModuleService, AccessRightsService, ParkedItemService,
    GlobalSettingService, ModuleSettingService, TabService, WidgetTemplateSettingService,
    PersonService, ObservableShareService, DatatableService,
    ProjectService, GlobalSearchService, PropertyPanelService, SearchService, DocumentService, LoadingService
} from "@app/services";
import { SearchRoutingModule } from "./search.routes";
import { StateManagementModule } from "@app/state-management";
import { GlobalSettingConstant, GlobalSearchConstant, PageSize } from "@app/app.constants";
import { TabsetConfig } from 'ngx-bootstrap/tabs';
import { ToasterService } from "angular2-toaster";
import {
    ArticleService,
    CampaignService
} from "../../services";

@NgModule({
    bootstrap: [SearchComponent],
    declarations: [
        SearchComponent,
    ],
    imports: [
        CommonModule,
        StateManagementModule,
        SearchRoutingModule,
        GlobalSearchModule
    ],
    exports: [
        SearchComponent,
    ],
    providers: [
        CanLoadGuard,
        CommonService,
        ModalService,
        ModuleService,
        AccessRightsService,
        ParkedItemService,
        GlobalSettingService,
        ModuleSettingService,
        TabService,
        WidgetTemplateSettingService,
        PersonService,
        ObservableShareService,
        DatatableService,
        ProjectService,
        GlobalSettingConstant,
        GlobalSearchConstant,
        PageSize,
        AppErrorHandler,
        TabsetConfig,
        GlobalSearchService,
        PropertyPanelService,
        SearchService,
        ToasterService,
        ArticleService,
        CampaignService,
        DocumentService,
        LoadingService,
        { provide: ErrorHandler, useClass: AppErrorHandler },
    ]
})
export class SearchModule { }
