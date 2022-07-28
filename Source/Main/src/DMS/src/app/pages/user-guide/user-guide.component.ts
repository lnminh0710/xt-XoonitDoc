import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { ApiResultResponse, WidgetPropertyModel, TabSummaryModel, ModuleSettingModel, GlobalSettingModel } from '@app/models';
import { BaseComponent, ModuleList } from '../private/base';
import { ToasterConfig, ToasterService } from 'angular2-toaster';
import { Router } from '@angular/router';
import { AppErrorHandler, LoadingService, PropertyPanelService, GlobalSettingService, CommonService, ModuleSettingService } from '@app/services';
import { GlobalSettingConstant, MenuModuleId, ModuleType } from '@app/app.constants';
import { ModuleSettingActions, XnCommonActions, TabButtonActions, PropertyPanelActions, AdditionalInformationActions } from '@app/state-management/store/actions';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { String, Uti } from '@app/utilities';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import { Observable, Subscription, zip } from 'rxjs';
import { isEmpty, isEqual, cloneDeep } from 'lodash-es';

@Component({
    selector: 'user-guide',
    templateUrl: './user-guide.component.html',
    styleUrls: ['./user-guide.component.scss']
})
export class UserGuideComponent extends BaseComponent implements OnInit, AfterViewInit {

    private moduleSettingState: Observable<ModuleSettingModel[]>;
    private moduleSettingStateSubscription: Subscription;

    public toastrConfig: ToasterConfig;
    public xnLoading: any = {};
    public isExpand = false;
    public isGlobal = false;
    public propertiesParentData: any;
    public properties: WidgetPropertyModel[] = [];

    public editLayout = false;

    public headerData: TabSummaryModel[] = [];
    public newTabConfig: any = {};
    public subTabSetting: any;

    public tab: TabSummaryModel;
    public splitterConfig = {
        leftHorizontal: 20,
        rightHorizontal: 80,
    };
    public moduleSetting: any;
    public tabSetting: any;
    public config: any = { left: 68, right: 32 };
    public configWidth: any = { left: 0, right: 0, spliter: 0 };
    public userGuideContainerStyle: any = {};

    @ViewChild('horizontalSplit') horizontalSplit: any;

    constructor(
        protected router: Router,
        private appErrorHandler: AppErrorHandler,
        private toasterService: ToasterService,
        private loadingService: LoadingService,
        private propertyPanelService: PropertyPanelService,
        private globalSettingService: GlobalSettingService,
        private moduleSettingService: ModuleSettingService,
        private globalSettingConstant: GlobalSettingConstant,
        private moduleSettingActions: ModuleSettingActions,
        private commonService: CommonService,
        private xnCommonActions: XnCommonActions,
        private appStore: Store<AppState>,
        private tabButtonActions: TabButtonActions,
        private propertyPanelActions: PropertyPanelActions,
        private additionalInformationActions: AdditionalInformationActions,
    ) {
        super(router);

        this.toasterService = toasterService;
        this.toastrConfig = new ToasterConfig({
            newestOnTop: true,
            showCloseButton: true,
            tapToDismiss: true,
            limit: 1,
            positionClass: 'toast-bottom-right'
        });

        this.moduleSettingState = this.appStore.select(state => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).moduleSetting);
    }


    ngOnInit(): void {
        $('#page-loading').remove();
        this.xnLoading = this.loadingService.xnLoading;
        this.getModuleSetting();

        setTimeout(() => {
            this.stylingSplitGutter();
            this.loadSplitterSettings();
        }, 200);
        this.subcribeModuleSettingState();
        this.subcribeLayoutInfo();
    }

    ngAfterViewInit(): void {
        this.getModuleToPersonType();
    }

    public ngOnDestroy() {
        super.onDestroy();
        Uti.unsubscribe(this);
    }

    public handleToggleWidgetTemplate(event) {
        this.appStore.dispatch(this.tabButtonActions.toggle(!event, this.ofModule))
    }

    public onPropertyPanelClose(event) {
        this.appStore.dispatch(this.propertyPanelActions.togglePanel(this.ofModule, false));
        this.appStore.dispatch(this.additionalInformationActions.backToPreviousState(this.ofModule));
    }

    public onPropertyPanelSave(event) {
        if (!this.isGlobal) {
            this.appStore.dispatch(this.propertyPanelActions.requestSave(event, this.ofModule));
        } else {
            this.appStore.dispatch(this.propertyPanelActions.requestSaveGlobal(this.properties, ModuleList.Base));
        }

        this.isExpand = false;
    }

    public onPropertyPanelChange(event) {
        if (event && this.isGlobal) {
            this.propertyPanelService.globalProperties = event.widgetProperties;
            this.appStore.dispatch(this.propertyPanelActions.requestUpdateGlobalProperty(event.widgetProperties, ModuleList.Base));
        }
        this.appStore.dispatch(this.propertyPanelActions.updateProperties(event, this.ofModule));
    }

    public onPropertyPanelApply(event) {
        this.appStore.dispatch(this.propertyPanelActions.requestApply(event, this.ofModule));
    }

    private needToSaveCacheGlobalSetting: boolean = false;
    private getModuleSetting() {
        let isGetData = true;

        switch (this.ofModule.idSettingsGUIParent) {
            case MenuModuleId.tools:
            case MenuModuleId.statistic:
            case MenuModuleId.briefe:
            case MenuModuleId.logistic:
            case MenuModuleId.selection:
                break;
            default:
                switch (this.ofModule.idSettingsGUI) {
                    case MenuModuleId.briefe:
                    case MenuModuleId.logistic:
                        //do nothing
                        isGetData = false;
                        break;
                    default:
                        break;
                }
                break;
        }//switch

        if (!isGetData) return;
        zip(this.moduleSettingService.getModuleSetting(null, null, this.ofModule.idSettingsGUI.toString(), ModuleType.LAYOUT_SETTING),
            this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).delay(500)).subscribe(
                (response) => {
                    this.appErrorHandler.executeAction(() => {
                        const moduleSettingDefault = response[0];
                        const allModuleSettings = response[1] as any;
                        let isLoadModuleSetting = true;
                        if (allModuleSettings && allModuleSettings.length > 0) {
                            const globalSettingName = String.Format('{0}_{1}', this.globalSettingConstant.moduleLayoutSetting, String.hardTrimBlank(this.ofModule.moduleName));
                            let moduleSettingItem = allModuleSettings.find(x => x.globalName && x.idSettingsGlobal && x.globalName === globalSettingName);
                            if (moduleSettingItem && moduleSettingItem.idSettingsGlobal && moduleSettingItem.globalName) {
                                moduleSettingItem = JSON.parse(moduleSettingItem.jsonSettings);
                                if (moduleSettingItem) {
                                    isLoadModuleSetting = false;
                                    const afterMergeModule = Uti.mergeModuleSetting(moduleSettingDefault['item'], moduleSettingItem['item']);
                                    this.appStore.dispatch(this.moduleSettingActions.loadModuleSettingSuccess(afterMergeModule, this.ofModule));
                                }
                            }
                        }
                        // If load from GlobalSettings no result -> get from ModuleSettings
                        if (isLoadModuleSetting) {
                            this.needToSaveCacheGlobalSetting = true;

                            this.appStore.dispatch(this.moduleSettingActions.loadModuleSetting(
                                this.ofModule,
                                null,
                                null,
                                this.ofModule.idSettingsGUI.toString(),
                                ModuleType.LAYOUT_SETTING
                            ));
                        }
                    });
                },
                (error) => {
                    Uti.logError(error);
                }
            );
    }

    private subcribeModuleSettingState() {
        this.moduleSettingStateSubscription = this.moduleSettingState.subscribe((moduleSettingState: ModuleSettingModel[]) => {
            this.appErrorHandler.executeAction(() => {
                if (!isEmpty(moduleSettingState) && moduleSettingState.length) {
                    if (!isEqual(moduleSettingState, this.moduleSetting)) {
                        this.moduleSetting = cloneDeep(moduleSettingState);
                        const jsonSettingObj = this.moduleSettingService.getValidJsonSetting(this.moduleSetting);
                        if (jsonSettingObj) {
                            //If load from GlobalSettings no result -> get from ModuleSettings and save cache for GlobalSettings
                            this.updateCacheGlobalSetting(this.moduleSetting[0]);

                            this.tabSetting = Uti.tryParseJson(jsonSettingObj.jsonSettings);
                        }
                    }
                } else {
                    this.moduleSetting = [];
                    this.tabSetting = null;
                }
            });
        });
    }

    private updateCacheGlobalSetting(moduleSetting: any) {
        if (!this.needToSaveCacheGlobalSetting || !moduleSetting || moduleSetting.moduleType != ModuleType.LAYOUT_SETTING) return;
        this.needToSaveCacheGlobalSetting = false;

        /* moduleSetting:
            idSettingsModule: 159
            objectNr: "38"
            moduleName: "User Management Layout Setting"
            moduleType: "LayoutSetting"
            description: "User Management Layout Setting",
            jsonSettings: "..."
        */

        const globalSettingName = String.Format('{0}_{1}', this.globalSettingConstant.moduleLayoutSetting, String.hardTrimBlank(this.ofModule.moduleName));
        const globalSettingItem = new GlobalSettingModel({
            globalName: globalSettingName,
            description: 'Module Layout Setting',
            globalType: this.globalSettingConstant.moduleLayoutSetting,
            idSettingsGUI: this.ofModule.idSettingsGUI,
            isActive: true,
            objectNr: this.ofModule.idSettingsGUI.toString(),
            jsonSettings: JSON.stringify({ item: [moduleSetting] })
        });
        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, globalSettingItem);
    }

    private getModuleToPersonType() {
        this.commonService.getModuleToPersonType().subscribe((response: ApiResultResponse) => {
            this.appErrorHandler.executeAction(() => {
                if (!Uti.isResquestSuccess(response) || !response.item.length) {
                    return;
                }
                const result = {};
                for (const item of response.item) {
                    result[item.idSettingsGUI] = item.idRepPersonType;
                }
                this.appStore.dispatch(this.xnCommonActions.getModuleToPersonType(result, this.ofModule));
            });
        });
    }

    subcribeLayoutInfo() {
        //this.appStore.select(state => layoutSelector.getLayoutInfoState(state, this.ofModule.moduleNameTrim))
        //    .subscribe((layoutInfo: SubLayoutInfoState) => {
        //        this.appErrorHandler.executeAction(() => {
        //            this.userGuideContainerStyle = {
        //                //'width': `calc(100% - ${layoutInfo.rightMenuWidth}px - 5px)`
        //                'width': `100%`
        //            };
        //        });
        //    });
    }

    public dragEnd(event: any) {
        this.splitterConfig = {
            leftHorizontal: this.horizontalSplit.displayedAreas[0].size,
            rightHorizontal: this.horizontalSplit.displayedAreas[1].size,
        };

        this.saveSplitterSettings();
    }

    public dragProgress($event) {
        // clearTimeout(this.dragProgressTimer);
        // this.dragProgressTimer = setTimeout(() => {
        //     this.rotateTabHeader();
        // }, 100);
        // console.log('scanning-tool: dragProgress: ', $event);
    }

    private saveSplitterSettings() {
        this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI)
            .subscribe(getAllGlobalSettings => {
                let verticalTabSplitterSettings = getAllGlobalSettings.find(x => x.globalName == 'VerticalTabSplitter')
                if (!verticalTabSplitterSettings || !verticalTabSplitterSettings.idSettingsGlobal || !verticalTabSplitterSettings.globalName) {
                    verticalTabSplitterSettings = new GlobalSettingModel({
                        globalName: 'VerticalTabSplitter',
                        globalType: 'VerticalTabSplitter',
                        description: 'Vertical Tab Splitter',
                        isActive: true
                    });
                }
                verticalTabSplitterSettings.idSettingsGUI = this.ofModule.idSettingsGUI;
                verticalTabSplitterSettings.jsonSettings = JSON.stringify(this.splitterConfig)
                verticalTabSplitterSettings.isActive = true;

                this.globalSettingService.saveGlobalSetting(verticalTabSplitterSettings)
                    .subscribe(data => {
                        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI.toString(), verticalTabSplitterSettings, data);
                    });
            });
    }

    private stylingSplitGutter() {
        if (this.horizontalSplit) {
            this.horizontalSplit.minPercent = 2;

            const gutter = $('.as-split-gutter', this.horizontalSplit.elRef.nativeElement);
            if (gutter.length) {
                gutter.addClass('transparent-gutter');
            }

            if (this.horizontalSplit.displayedAreas && this.horizontalSplit.displayedAreas.length) {
                const areas = $('as-split-area', this.horizontalSplit.elRef.nativeElement);
                if (areas.length) {
                    $(areas.get(0)).addClass('min-width-7vw');
                }
            }
        }
    }

    private loadSplitterSettings() {
        this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI)
            .subscribe((data: any) => {
                this.appErrorHandler.executeAction(() => {
                    if (data && data.length) {
                        let verticalTabSplitterSettings = data.filter(p => p.globalName == 'VerticalTabSplitter');
                        if (verticalTabSplitterSettings && verticalTabSplitterSettings.length) {
                            verticalTabSplitterSettings.forEach(setting => {
                                this.splitterConfig = JSON.parse(setting.jsonSettings);
                                // this.horizontalSplit.updateArea(this.horizontalSplit.displayedAreas[0].component, 1, this.splitterConfig.leftHorizontal, 20);
                                // this.horizontalSplit.updateArea(this.horizontalSplit.displayedAreas[1].component, 1, this.splitterConfig.rightHorizontal, 20);
                            });
                        }
                    }
                })
            })
    }
}
