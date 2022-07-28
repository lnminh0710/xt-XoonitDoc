import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ToasterConfig } from 'angular2-toaster';
import { BaseComponent, ModuleList } from '../private/base';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import {
    TabButtonActions,
    ModuleSettingActions,
    XnCommonActions,
    PropertyPanelActions,
    AdditionalInformationActions,
} from '@app/state-management/store/actions';
import {
    LoadingService,
    GlobalSettingService,
    AppErrorHandler,
    CommonService,
    PropertyPanelService,
    ModuleSettingService,
} from '@app/services';
import { Uti } from '@app/utilities';
import { GlobalSettingConstant, MenuModuleId, ModuleType } from '@app/app.constants';
import { WidgetPropertyModel, ModuleSettingModel, GlobalSettingModel } from '@app/models';
import { AppState } from '@app/state-management/store';
import * as moduleSettingReducer from '@app/state-management/store/reducer/module-setting';
import { Subscription, zip, Observable } from 'rxjs';
import { String } from '@app/utilities';
import { cloneDeep, isEqual, isEmpty } from 'lodash-es';
import { delay } from 'rxjs/operators';
import { FormDesignerComponent } from './components/form-designer/form-designer.component';
import { IDragItem } from './models/drag-item.interface';
import { RowDragItem } from './models/row-drag-item.interface';
import { ColumnDragItem } from './models/column-drag-item.interface';
import { GroupPanelDragItem } from './models/group-panel-drag-item.interface';
import { TextboxDragItem } from './models/controls/textbox-drag-item';
import { AutoCompleteDragItem } from './models/controls/auto-complete-drag-item';
import { LabelDragItem } from './models/controls/label-drag-item';
import { NumericDragItem } from './models/controls/numeric-drag-item';
import { CheckboxDragItem } from './models/controls/checkbox-drag-item';
import { RadioDragItem } from './models/controls/radio-drag-item';
import { DatePickerDragItem } from './models/controls/datepicker-drag-item';
import { RangeDateDragItem } from './models/controls/range-date-drag-item';
import { DropdownDragItem } from './models/controls/dropdown-drag-item';


@Component({
    selector: 'form-layout-builder',
    templateUrl: 'form-layout-builder.component.html',
})
export class FormLayoutBuilderComponent extends BaseComponent implements OnInit, OnDestroy {
    public toastrConfig: ToasterConfig;
    public xnLoading: any = {};
    public isExpand = false;
    public isGlobal = false;
    public propertiesParentData: any;
    public properties: WidgetPropertyModel[] = [];

    private moduleSettingState: Observable<ModuleSettingModel[]>;
    private moduleSettingStateSubscription: Subscription;

    private moduleSetting: ModuleSettingModel[];
    public tabSetting: any;

    public controlTemplates: IDragItem[] = [
        new RowDragItem(),
        new ColumnDragItem(),
        new GroupPanelDragItem(),
        new TextboxDragItem(),
        new AutoCompleteDragItem(),
        new LabelDragItem(),
        new NumericDragItem(),
        new CheckboxDragItem(),
        new RadioDragItem(),
        new DatePickerDragItem(),
        new RangeDateDragItem(),
        new DropdownDragItem()
    ];

    public controlForm: IDragItem[] = [];

    @ViewChild('formDesignerDropList', { read: FormDesignerComponent }) formDesigner: FormDesignerComponent;

    constructor(
        protected router: Router,
        private appErrorHandler: AppErrorHandler,
        private loadingService: LoadingService,
        private propertyPanelService: PropertyPanelService,
        private globalSettingConstant: GlobalSettingConstant,
        private moduleSettingActions: ModuleSettingActions,
        private commonService: CommonService,
        private xnCommonActions: XnCommonActions,
        private appStore: Store<AppState>,
        private tabButtonActions: TabButtonActions,
        private propertyPanelActions: PropertyPanelActions,
        private additionalInformationActions: AdditionalInformationActions,
        private globalSettingService: GlobalSettingService,
        private moduleSettingService: ModuleSettingService,
    ) {
        super(router);

        this.toastrConfig = new ToasterConfig({
            newestOnTop: true,
            showCloseButton: true,
            tapToDismiss: true,
            limit: 5,
            positionClass: 'toast-bottom-right',
        });

        this.moduleSettingState = appStore.select(
            (state) => moduleSettingReducer.getModuleSettingState(state, this.ofModule.moduleNameTrim).moduleSetting,
        );
    }

    ngOnInit(): void {
        $('#page-loading').remove();
        this.xnLoading = this.loadingService.xnLoading;
        this.getModuleSetting();
        this.subcribeModuleSettingState();
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

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

    private needToSaveCacheGlobalSetting = false;
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
                        this.needToSaveCacheGlobalSetting = true;

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

    private subcribeModuleSettingState() {
        this.moduleSettingStateSubscription = this.moduleSettingState.subscribe(
            (moduleSettingState: ModuleSettingModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    if (!isEmpty(moduleSettingState) && moduleSettingState.length) {
                        if (!isEqual(moduleSettingState, this.moduleSetting)) {
                            this.moduleSetting = cloneDeep(moduleSettingState);
                            const jsonSettingObj = this.moduleSettingService.getValidJsonSetting(this.moduleSetting);
                            if (jsonSettingObj) {
                                // If load from GlobalSettings no result -> get from ModuleSettings and save cache for GlobalSettings
                                this.updateCacheGlobalSetting(this.moduleSetting[0]);

                                // this.tabSetting = Uti.tryParseJson(jsonSettingObj.jsonSettings);

                                // if (this.tabSetting.hasOwnProperty('AdditionalInfo') && this.tabSetting.AdditionalInfo) {
                                //    this.tabSetting.AdditionalInfo.accessRight = this.accessRightsService.getAccessRight(AccessRightTypeEnum.AdditionalInfo, {
                                //        idSettingsGUIParent: this.ofModule.idSettingsGUIParent,
                                //        idSettingsGUI: this.ofModule.idSettingsGUI
                                //    });
                                // }

                                // if (!isNil(this.tabSetting.IsHiddenParkedItem) && this.tabSetting.IsHiddenParkedItem == 1) {
                                //    this.store.dispatch(this.parkedItemActions.requestTogglePanel(false, this.ofModule));
                                //    this.store.dispatch(this.parkedItemActions.toggleDisabledPanel(true, this.ofModule));
                                // } else {
                                //    this.store.dispatch(this.parkedItemActions.toggleDisabledPanel(false, this.ofModule));
                                // }
                            }
                        }
                    } else {
                        this.moduleSetting = [];
                        this.tabSetting = null;
                    }
                });
            },
        );
    }

    private updateCacheGlobalSetting(moduleSetting: any) {
        if (
            !this.needToSaveCacheGlobalSetting ||
            !moduleSetting ||
            moduleSetting.moduleType != ModuleType.LAYOUT_SETTING
        )
            return;
        this.needToSaveCacheGlobalSetting = false;

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
}
