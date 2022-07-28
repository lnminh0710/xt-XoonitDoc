import { Input } from '@angular/core';
import { Router } from '@angular/router';
import {
    ModuleSettingModel,
    GlobalSettingModel,
    TabSummaryModel,
    WidgetPropertyModel,
    ApiResultResponse,
} from '@app/models';
import { Uti } from '@app/utilities';
import { Observable, zip, Subscription } from 'rxjs';
import { takeUntil, delay } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import { String } from '@app/utilities';
import { cloneDeep, isEqual, isEmpty } from 'lodash-es';
import { ToasterConfig } from 'angular2-toaster';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import { AppState } from '@app/state-management/store';
import { GlobalSettingConstant, MenuModuleId, ModuleType } from '@app/app.constants';
import {
    GlobalSettingService,
    ModuleSettingService,
    AppErrorHandler,
    LoadingService,
    PropertyPanelService,
    CommonService,
} from '@app/services';
import {
    ModuleSettingActions,
    TabButtonActions,
    PropertyPanelActions,
    AdditionalInformationActions,
    XnCommonActions,
} from '@app/state-management/store/actions';
import { BaseComponent, ModuleList } from './base-component';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';

export abstract class BaseModuleComponent extends BaseComponent {
    private _moduleSettingState$: Observable<ModuleSettingModel[]>;
    private _tabHeaderDataModel$: Observable<TabSummaryModel[]>;
    private _globalPropertiesState$: Observable<WidgetPropertyModel[]>;

    private propertiesParentDataState: Observable<any>;
    private propertiesParentDataStateSubscription: Subscription;

    private _needToSaveCacheGlobalSetting = false;
    private _moduleSetting: ModuleSettingModel[];

    public tabSetting: any;
    public headerData: TabSummaryModel[] = [];

    public toastrConfig: ToasterConfig;
    public xnLoading: any = {};

    public isExpand = false;
    public isGlobal = false;
    public propertiesParentData: any;
    public properties: WidgetPropertyModel[] = [];
    public globalProperties: WidgetPropertyModel[];

    @Input() isGetModuleToPersonType = false;

    constructor(
        protected router: Router,
        protected appStore: Store<AppState>,
        protected appErrorHandler: AppErrorHandler,
        protected globalSettingConstant: GlobalSettingConstant,

        protected loadingService: LoadingService,
        protected globalSettingService: GlobalSettingService,
        protected moduleSettingService: ModuleSettingService,
        protected propertyPanelService: PropertyPanelService,

        protected moduleSettingActions: ModuleSettingActions,
        protected tabButtonActions: TabButtonActions,
        protected propertyPanelActions: PropertyPanelActions,
        protected additionalInformationActions: AdditionalInformationActions,

        protected commonService: CommonService,
        protected xnCommonActions: XnCommonActions,
    ) {
        super(router);

        this.toastrConfig = new ToasterConfig({
            newestOnTop: true,
            showCloseButton: true,
            tapToDismiss: true,
            limit: 5,
            positionClass: 'toast-bottom-right',
        });

        this._moduleSettingState$ = appStore.select((state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).moduleSetting);
        this._tabHeaderDataModel$ = appStore.select((state) => tabSummaryReducer.getTabSummaryState(state, this.ofModule.moduleNameTrim).tabs);
        this._globalPropertiesState$ = appStore.select((state) => propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties)
        this.propertiesParentDataState = appStore.select(state => propertyPanelReducer.getPropertyPanelState(state, this.ofModule.moduleNameTrim).propertiesParentData);
    }

    protected onInit(): void {
        $('#page-loading').remove();
        this.xnLoading = this.loadingService.xnLoading;
        this.getModuleSetting();
        this.subcribeModuleSettingState();
        this.subcribeTabHeaderDataModel();
        this.subscribePropertiesParentDataState();
    }

    protected onDestroy() {
        super.onDestroy();
    }

    //#region ModuleSetting    
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
                        // do nothing
                        isGetData = false;
                        break;
                    default:
                        break;
                }
                break;
        } // switch

        if (!isGetData) return;
        zip(
            this.moduleSettingService.getModuleSetting(
                null,
                null,
                this.ofModule.idSettingsGUI.toString(),
                ModuleType.LAYOUT_SETTING,
            ),
            this.globalSettingService.getAllGlobalSettings(this.ofModule.idSettingsGUI).pipe(delay(500)),
        ).subscribe(
            (response) => {
                this.appErrorHandler.executeAction(() => {
                    const moduleSettingDefault = response[0];
                    const allModuleSettings = response[1] as any;
                    let isLoadModuleSetting = true;
                    if (allModuleSettings && allModuleSettings.length > 0) {
                        const globalSettingName = String.Format(
                            '{0}_{1}',
                            this.globalSettingConstant.moduleLayoutSetting,
                            String.hardTrimBlank(this.ofModule.moduleName),
                        );
                        let moduleSettingItem = allModuleSettings.find(
                            (x) => x.globalName && x.idSettingsGlobal && x.globalName === globalSettingName,
                        );
                        if (moduleSettingItem && moduleSettingItem.idSettingsGlobal && moduleSettingItem.globalName) {
                            moduleSettingItem = JSON.parse(moduleSettingItem.jsonSettings);
                            if (moduleSettingItem) {
                                isLoadModuleSetting = false;
                                const afterMergeModule = Uti.mergeModuleSetting(
                                    moduleSettingDefault['item'],
                                    moduleSettingItem['item'],
                                );
                                this.appStore.dispatch(
                                    this.moduleSettingActions.loadModuleSettingSuccess(afterMergeModule, this.ofModule),
                                );
                            }
                        }
                    }
                    // If load from GlobalSettings no result -> get from ModuleSettings
                    if (isLoadModuleSetting) {
                        this._needToSaveCacheGlobalSetting = true;

                        this.appStore.dispatch(
                            this.moduleSettingActions.loadModuleSetting(
                                this.ofModule,
                                null,
                                null,
                                this.ofModule.idSettingsGUI.toString(),
                                ModuleType.LAYOUT_SETTING,
                            ),
                        );
                    }
                });
            },
            (error) => {
                Uti.logError(error);
            },
        );
    }

    private subcribeTabHeaderDataModel() {
        this._tabHeaderDataModel$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((tabHeaderDataModel: TabSummaryModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    this.headerData = tabHeaderDataModel;
                });
            });
    }

    private subcribeModuleSettingState() {
        this._moduleSettingState$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((moduleSettingState: ModuleSettingModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (!isEmpty(moduleSettingState) && moduleSettingState.length) {
                        if (!isEqual(moduleSettingState, this._moduleSetting)) {
                            this._moduleSetting = cloneDeep(moduleSettingState);
                            const jsonSettingObj = this.moduleSettingService.getValidJsonSetting(this._moduleSetting);
                            if (jsonSettingObj) {
                                // If load from GlobalSettings no result -> get from ModuleSettings and save cache for GlobalSettings
                                this.updateCacheGlobalSetting(this._moduleSetting[0]);

                                this.tabSetting = Uti.tryParseJson(jsonSettingObj.jsonSettings);
                            }
                        }
                    } else {
                        this._moduleSetting = [];
                        this.tabSetting = null;
                    }
                });
            });

        this._globalPropertiesState$
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((globalPropertiesState: WidgetPropertyModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (globalPropertiesState) {
                        this.globalProperties = globalPropertiesState;
                    }
                });
            });
    }

    private updateCacheGlobalSetting(moduleSetting: any) {
        if (
            !this._needToSaveCacheGlobalSetting ||
            !moduleSetting ||
            moduleSetting.moduleType != ModuleType.LAYOUT_SETTING
        )
            return;

        this._needToSaveCacheGlobalSetting = false;

        /* moduleSetting:
            idSettingsModule: 159
            objectNr: "38"
            moduleName: "User Management Layout Setting"
            moduleType: "LayoutSetting"
            description: "User Management Layout Setting",
            jsonSettings: "..."
        */

        const globalSettingName = String.Format(
            '{0}_{1}',
            this.globalSettingConstant.moduleLayoutSetting,
            String.hardTrimBlank(this.ofModule.moduleName),
        );
        const globalSettingItem = new GlobalSettingModel({
            globalName: globalSettingName,
            description: 'Module Layout Setting',
            globalType: this.globalSettingConstant.moduleLayoutSetting,
            idSettingsGUI: this.ofModule.idSettingsGUI,
            isActive: true,
            objectNr: this.ofModule.idSettingsGUI.toString(),
            jsonSettings: JSON.stringify({ item: [moduleSetting] }),
        });
        this.globalSettingService.saveUpdateCache(this.ofModule.idSettingsGUI, globalSettingItem);
    }
    //#endregion ModuleSetting

    //#region Property Panel
    public handleToggleWidgetTemplate(event) {
        this.appStore.dispatch(this.tabButtonActions.toggle(!event, this.ofModule));
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
            this.appStore.dispatch(
                this.propertyPanelActions.requestUpdateGlobalProperty(event.widgetProperties, ModuleList.Base),
            );
        }
        this.appStore.dispatch(this.propertyPanelActions.updateProperties(event, this.ofModule));
    }

    public onPropertyPanelApply(event) {
        this.appStore.dispatch(this.propertyPanelActions.requestApply(event, this.ofModule));
    }
    //#endregion Property Panel

    private subscribePropertiesParentDataState() {
        this.propertiesParentDataStateSubscription = this.propertiesParentDataState.subscribe((propertiesParentDataState: any) => {
            this.appErrorHandler.executeAction(() => {
                this.propertiesParentData = propertiesParentDataState || {};
            });
        });
    }

    protected getModuleToPersonType() {
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
}
