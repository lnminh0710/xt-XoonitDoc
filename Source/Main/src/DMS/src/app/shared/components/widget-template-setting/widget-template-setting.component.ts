import {
    Component,
    Input,
    OnInit,
    OnDestroy,
    ChangeDetectionStrategy,
    Output,
    EventEmitter,
    ElementRef,
    ChangeDetectorRef,
    HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription } from 'rxjs';
import { WidgetTemplateActions, GridActions } from '@app/state-management/store/actions';
import { WidgetTemplateSettingService, AppErrorHandler, BaseService, AccessRightsService } from '@app/services';
import { WidgetTemplateSettingModel, ApiResultResponse } from '@app/models';
import { Module } from '@app/models/module';
import { BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { MenuModuleId, ModuleType, ServiceUrl } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { BaseComponent } from '@app/pages/private/base';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { EnableWidgetTemplateState } from '@app/models/widget-template/enable-widget-template.model';

export function getDropdownConfig(): BsDropdownConfig {
    return Object.assign(new BsDropdownConfig(), { autoClose: false });
}

@Component({
    selector: 'widget-template-setting',
    styleUrls: ['./widget-template-setting.component.scss'],
    templateUrl: './widget-template-setting.component.html',
    providers: [{ provide: BsDropdownConfig, useFactory: getDropdownConfig }],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetTemplateSettingComponent extends BaseComponent implements OnInit, OnDestroy {
    private _currentModuleId: any = null;
    private _currentWidgetTemplate: WidgetTemplateSettingModel;
    private mainWidgetTemplateSettings: WidgetTemplateSettingModel[] = [];
    private listRequestedWidgetDetail: { idRepWidgetType: number; idRepWidgetApp: number }[];
    public widgetToolbar: any[] = [];
    public disableSaveWidget: boolean;
    public enableIndicator: boolean;

    private widgetDesignMode = false;
    private updateStatusSubscription: Subscription;
    private serviceUrl: ServiceUrl;
    private widgetTemplateServiceSubscription: Subscription;
    private widgetTemplateSettingModelState: Observable<WidgetTemplateSettingModel[]>;
    private widgetTemplateSettingModelStateSubscription: Subscription;
    private enableWidgetTemplateStateSubscription: Subscription;

    private enableWidgetTemplateState: Observable<EnableWidgetTemplateState>;

    isLoading: boolean;

    @HostListener('document:click.out-zone', ['$event'])
    public onDocumentClick(event) {
        if (!this._eref.nativeElement.contains(event.target))
            // or some similar check
            this.resetWidgetList();
    }

    constructor(
        private _eref: ElementRef,
        private store: Store<AppState>,
        private widgetTemplateActions: WidgetTemplateActions,
        private gridActions: GridActions,
        private widgetTemplateService: WidgetTemplateSettingService,
        private changeDetectorRef: ChangeDetectorRef,
        private appErrorHandler: AppErrorHandler,
        protected router: Router,
        private accessRightsService: AccessRightsService,
    ) {
        super(router);

        this.serviceUrl = new ServiceUrl();
        this.widgetTemplateSettingModelState = store.select(
            (state) =>
                widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim)
                    .mainWidgetTemplateSettings,
        );
        this.enableWidgetTemplateState = store.select(
            (state) =>
                widgetTemplateReducer.getWidgetTemplateState(state, this.ofModule.moduleNameTrim).enableWidgetTemplate,
        );
    }

    onRouteChanged() {
        this.buildModuleFromRoute();
    }

    @Input()
    set activeModule(activeModule: Module) {
        if (activeModule.idSettingsGUI == -1) {
            return;
        }

        if (activeModule && activeModule.idSettingsGUI && this._currentModuleId !== activeModule.idSettingsGUI) {
            this._currentModuleId = activeModule.idSettingsGUI;
            switch (activeModule.idSettingsGUI) {
                case MenuModuleId.briefe:
                case MenuModuleId.logistic:
                    this.widgetToolbar = [];
                    break;

                default:
                    this.store.dispatch(
                        this.widgetTemplateActions.loadWidgetTemplateSetting(activeModule.idSettingsGUI, activeModule),
                    );
                    if (this.widgetDesignMode) {
                        this.onToggle.emit(true);
                    } else {
                        this.collapsed(null);
                    }
                    break;
            }
        }
    }
    @Input()
    set activeSubModule(activeSubModule: Module) {
        if (
            activeSubModule &&
            activeSubModule.idSettingsGUI &&
            this._currentModuleId !== activeSubModule.idSettingsGUI
        ) {
            this._currentModuleId = activeSubModule.idSettingsGUI;
            if (activeSubModule.idSettingsGUIParent && activeSubModule.idSettingsGUIParent != MenuModuleId.processing) {
                this.store.dispatch(
                    this.widgetTemplateActions.loadWidgetTemplateSetting(
                        activeSubModule.idSettingsGUI,
                        activeSubModule,
                    ),
                );
            }
        }
    }

    @Output() onToggle: EventEmitter<Boolean> = new EventEmitter();

    ngOnInit(): void {
        this.widgetTemplateSettingModelStateSubscription = this.widgetTemplateSettingModelState.subscribe(
            (mainWidgetTemplateSettings: WidgetTemplateSettingModel[]) => {
                this.appErrorHandler.executeAction(() => {
                    setTimeout(() => {
                        if (mainWidgetTemplateSettings.length > 0) {
                            mainWidgetTemplateSettings.forEach((data: WidgetTemplateSettingModel) => {
                                if (!this.listRequestedWidgetDetail) {
                                    this.listRequestedWidgetDetail = [
                                        { idRepWidgetType: data.idRepWidgetType, idRepWidgetApp: data.idRepWidgetApp },
                                    ];
                                } else {
                                    const filter = this.listRequestedWidgetDetail.find(
                                        (item) =>
                                            item.idRepWidgetApp === data.idRepWidgetApp &&
                                            item.idRepWidgetType === data.idRepWidgetType,
                                    );
                                    if (!filter || filter.idRepWidgetApp <= 0) {
                                        this.listRequestedWidgetDetail = [
                                            ...[
                                                {
                                                    idRepWidgetType: data.idRepWidgetType,
                                                    idRepWidgetApp: data.idRepWidgetApp,
                                                },
                                            ],
                                            ...this.listRequestedWidgetDetail,
                                        ];
                                    }
                                }
                            });

                            this.mainWidgetTemplateSettings = mainWidgetTemplateSettings;
                            this.getWidgetToolbar(this._currentModuleId);
                            return;
                        }
                        this.listRequestedWidgetDetail = [];
                    }, 500);
                });
            },
        );

        this.updateStatusSubscription = BaseService.toggleSlimLoadingBar$.subscribe((state) => {
            if (state && state.action) {
                const status = this.isUpdatingWidgetAction(state.action);
                if (status) {
                    if (state.status === 'START') {
                        this.isLoading = true;
                        this.changeDetectorRef.markForCheck();
                    }
                }

                if (state.status === 'COMPLETE') {
                    this.enableIndicator = false;
                    this.isLoading = false;
                    this.changeDetectorRef.markForCheck();
                }
            }
        });

        this.subscribeEnableWidgetTemplateState();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    /**
     * subscribeEnableWidgetTemplateState
     */
    private subscribeEnableWidgetTemplateState() {
        if (this.enableWidgetTemplateStateSubscription) {
            this.enableWidgetTemplateStateSubscription.unsubscribe();
        }
        this.enableWidgetTemplateStateSubscription = this.enableWidgetTemplateState.subscribe(
            (enableWidgetTemplate: EnableWidgetTemplateState) => {
                this.appErrorHandler.executeAction(() => {
                    setTimeout(() => {
                        this.widgetDesignMode = enableWidgetTemplate.status;
                    });
                });
            },
        );
    }

    /**
     * isUpdatingWidgetAction
     * @param action
     */
    private isUpdatingWidgetAction(action: string) {
        let index = action.indexOf(this.serviceUrl.updateWidgetSetting);
        if (index >= 0) {
            return true;
        }
        index = action.indexOf(this.serviceUrl.createWidgetSetting);
        if (index >= 0) {
            return true;
        }
        index = action.indexOf(this.serviceUrl.deleteWidgetSetting);
        if (index >= 0) {
            return true;
        }
        return false;
    }

    public collapsed(event: any): void {
        this.resetWidgetList();
        this.onToggle.emit(false);
        this.store.dispatch(this.widgetTemplateActions.updateEditModeStatus(false, this.ofModule));
        this.store.dispatch(this.gridActions.requestRefresh(this.ofModule));
        setTimeout(() => {
            $('.content-wrapper .content').css('width', 'calc(100vw)');
            $('.additional-information-collapse').removeClass('design-widget');
        });
    }

    /**
     * saveWidget
     * @param event
     */
    public saveWidget(event: any): void {
        this.enableIndicator = true;
        this.disableSaveWidget = true;
        this.store.dispatch(this.widgetTemplateActions.saveWidget(this.ofModule));
        // Prevent user multiple click
        setTimeout(() => {
            this.disableSaveWidget = false;
        }, 1000);
    }

    private getWidgetToolbar(moduleId) {
        this.widgetTemplateServiceSubscription = this.widgetTemplateService
            .getWidgetToolbar(null, null, moduleId, ModuleType.WIDGET_TOOLBAR)
            .subscribe((response: ApiResultResponse) => {
                if (!Uti.isResquestSuccess(response)) {
                    this.widgetToolbar = [];
                    this.changeDetectorRef.markForCheck();
                    return;
                }
                if (response.item.length && response.item[0].jsonSettings) {
                    let widgetToolbar = Uti.tryParseJson(response.item[0].jsonSettings);

                    // Find global widget template & merge to widget template setting
                    if (
                        this.mainWidgetTemplateSettings &&
                        this.mainWidgetTemplateSettings.length &&
                        widgetToolbar &&
                        widgetToolbar.length
                    ) {
                        let globalWidgetTemplates = this.mainWidgetTemplateSettings.filter(
                            (p) => p.idSettingsGUI == -1,
                        );
                        if (globalWidgetTemplates && globalWidgetTemplates.length) {
                            globalWidgetTemplates.forEach((globalWidgetTemplate) => {
                                let widgetToolbarItem = widgetToolbar[widgetToolbar.length - 1];
                                if (
                                    widgetToolbarItem &&
                                    widgetToolbarItem.Widgets &&
                                    widgetToolbarItem.Widgets.length
                                ) {
                                    widgetToolbarItem.Widgets.push({
                                        Icon: globalWidgetTemplate.iconName,
                                        IdRepWidgetApp: globalWidgetTemplate.idRepWidgetApp,
                                        WidgetName: globalWidgetTemplate.description,
                                        ignoreAccessRight: true,
                                    });
                                }
                            }); //for
                        }
                    }

                    widgetToolbar.forEach((widgetToolbarItem) => {
                        this.accessRightsService.SetAccessRightsForWidgetSetting(
                            this.ofModule,
                            widgetToolbarItem.Widgets,
                        );
                    });

                    this.widgetToolbar = this.widgetTemplateService.hasVisibleWidgets(widgetToolbar);
                    this.widgetToolbar = this.widgetTemplateService.buildWidgetToolbar(
                        widgetToolbar,
                        this.mainWidgetTemplateSettings,
                    );
                } else {
                    this.widgetToolbar = [];
                }

                this.changeDetectorRef.markForCheck();
            });
    }

    public clickWidgetItem(item) {
        if (item['selected'] === true) {
            item['selected'] = false;
            item['isopen'] = false;
        } else {
            this.resetWidgetList();

            item['selected'] = true;
            item['isopen'] = true;
        }
    }

    private resetWidgetList() {
        for (const wg of this.widgetToolbar) {
            wg['selected'] = false;
            wg['isopen'] = false;
        }

        this.changeDetectorRef.markForCheck();
    }

    public widgetToolbarTrackBy(index, item) {
        return item ? item.Tooltip : undefined;
    }

    public itemWidgetsTrackBy(index, item) {
        return item ? item.idRepWidgetApp : undefined;
    }
}
