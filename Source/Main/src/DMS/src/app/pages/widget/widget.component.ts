import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleActions, ParkedItemActions, ModuleSettingActions, WidgetTemplateActions, ProcessDataActions, WidgetDetailActions, PropertyPanelActions} from '@app/state-management/store/actions';
import { Observable, Subscription } from 'rxjs/Rx';
import { LocalStorageKey } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { BaseComponent } from '@app/pages/private/base';
import { WidgetTemplateSettingModel, Module } from '@app/models';
import { AppErrorHandler } from '@app/services';
import * as widgetTemplateReducer from '@app/state-management/store/reducer/widget-template';
import { ToasterConfig } from 'angular2-toaster';

@Component({
    selector: 'app-root',
    templateUrl: './widget.component.html',
    styleUrls: ['./widget.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class WidgetComponent extends BaseComponent implements OnInit, OnDestroy {
    private syncStateSubscription: Subscription;
    private paramSubscription: Subscription;
    private widgetTemplateSettingSubscription: Subscription;
    private widgetTemplateSettingModelState: Observable<WidgetTemplateSettingModel[]>;
    private browserTabId: string = Uti.defineBrowserTabId();
    public mainWidgetTemplateSettings: WidgetTemplateSettingModel[];

    public pageId : string;
    public moduleId: number;
    public widgetId: string;
    public currentModule: Module;
    public filterWidgetIds: Array<string>;
    public toastrConfig: ToasterConfig;

    constructor(
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        private widgetTemplateActions: WidgetTemplateActions,
        private parkedItemActions: ParkedItemActions,
        private processDataActions: ProcessDataActions,
        private moduleSettingActions: ModuleSettingActions,
        private widgetDetailActions: WidgetDetailActions,
        private propertyPanelActions: PropertyPanelActions,
        private activatedRoute: ActivatedRoute,
        private appErrorHandler: AppErrorHandler,
        protected router: Router,
    ) {
        super(router);
        this.toastrConfig = new ToasterConfig({
            newestOnTop: true,
            showCloseButton: true,
            tapToDismiss: true,
            limit: 1,
            positionClass: 'toast-bottom-right'
        });
    }

    public ngOnInit() {
        $('#page-loading').remove();
        this.paramSubscription = this.activatedRoute.queryParams.subscribe(params => {
            this.initAllParam(params);
        });
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private initAllParam(params) {
        this.pageId = params['pageId'];
        this.moduleId = params['moduleId'];
        this.widgetId = params['widgetId'];
        if (this.widgetId) {
            this.filterWidgetIds = [this.widgetId];
        }
        const data = localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSModuleKey, this.browserTabId));
        const currentModule = JSON.parse(data);
        if (currentModule) {
            if (currentModule.activeSubModule && currentModule.activeSubModule.idSettingsGUI) {
                this.currentModule = currentModule.activeSubModule;
            } else if (currentModule.activeModule && currentModule.activeModule.idSettingsGUI) {
                this.currentModule = currentModule.activeModule;
            }
        }
        // this.currentModule = currentModule && currentModule.activeSubModule && currentModule.activeModule;
        if (this.currentModule) {
            this.widgetTemplateSettingModelState = this.store.select(state => widgetTemplateReducer.getWidgetTemplateState(state, this.currentModule.moduleNameTrim).mainWidgetTemplateSettings);
            this.store.dispatch(this.widgetTemplateActions.loadWidgetTemplateSetting(this.moduleId, this.currentModule));
            this.updateState();
            this.subscribeWidgetTemplateSetting();
        }
    }

    public updateState() {
        this.restoreModule();
        this.restoreParkedItems();
        this.restoreProcessData();
        this.restoreModuleSetting();
        this.restoreWidgetDetailContent();
        this.restoreWidgetProperty();
        this.subscribeSyncState();
    }

    /**
     * subscribeWidgetTemplateSetting
     */
    private subscribeWidgetTemplateSetting() {
        if (this.widgetTemplateSettingSubscription) {
            this.widgetTemplateSettingSubscription.unsubscribe();
        }
        this.widgetTemplateSettingSubscription = this.widgetTemplateSettingModelState.subscribe((mainWidgetTemplateSettings: WidgetTemplateSettingModel[]) => {
            this.appErrorHandler.executeAction(() => {
                this.mainWidgetTemplateSettings = mainWidgetTemplateSettings;
            });
        });
    }

    /**
     * subscribeSyncState
     * */
    public subscribeSyncState() {

        const LocalStorageGSModuleKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSModuleKey, this.browserTabId);
        const LocalStorageGSParkedItemsKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSParkedItemsKey, this.browserTabId);
        const LocalStorageGSModuleSettingKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSModuleSettingKey, this.browserTabId);
        const LocalStorageGSProcessDataKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSProcessDataKey, this.browserTabId);
        const LocalStorageWidgetContentDetailKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageWidgetContentDetailKey, this.browserTabId);
        const LocalStorageWidgetPropertyKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageWidgetPropertyKey, this.browserTabId);
        const LocalStorageWidgetTempPropertyKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageWidgetTempPropertyKey, this.browserTabId);
        const LocalStorageWidgetOriginalPropertyKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageWidgetTempPropertyKey, this.browserTabId);

        this.syncStateSubscription = Observable.fromEvent<StorageEvent>(window, 'storage').filter((evt) => {
            return (
                    evt.key == LocalStorageGSModuleKey
                    || evt.key == LocalStorageGSParkedItemsKey
                    || evt.key == LocalStorageGSModuleSettingKey
                    || evt.key == LocalStorageGSProcessDataKey
                    || evt.key == LocalStorageWidgetContentDetailKey
                    || evt.key == LocalStorageWidgetPropertyKey
                    || evt.key == LocalStorageWidgetTempPropertyKey
                    || evt.key == LocalStorageWidgetOriginalPropertyKey
                )
                && evt.newValue !== null && evt.newValue != 'undefined';
        }).subscribe(evt => {
            if (evt.newValue) {
                const newState = JSON.parse(evt.newValue);
                if (newState) {

                    if (newState.browserTabId && newState.browserTabId != this.browserTabId) return;

                    switch (evt.key) {
                        case LocalStorageGSModuleKey:
                            this.store.dispatch(this.moduleActions.updateModuleStateFromLocalStorage(newState));
                            break;
                        case LocalStorageGSModuleSettingKey:
                            this.store.dispatch(this.moduleSettingActions.restoreAllState(newState));
                            break;
                        case LocalStorageGSParkedItemsKey:
                            this.store.dispatch(this.parkedItemActions.restoreAllState(newState));
                            break;
                        case LocalStorageGSProcessDataKey:
                            //this.store.dispatch(this.processDataActions.restoreAllState(newState));
                            break;
                        case LocalStorageWidgetContentDetailKey:
                            //this.store.dispatch(this.widgetDetailActions.restoreAllState(newState));
                            break;
                        case LocalStorageWidgetPropertyKey:
                            // this.store.dispatch(this.propertyPanelActions.restoreAllState(newState));
                            const requestUpdateProperties = newState.features[this.currentModule.moduleNameTrim].requestUpdateProperties;
                            this.store.dispatch(this.propertyPanelActions.updateProperties(requestUpdateProperties, this.currentModule));
                            break;
                        case LocalStorageWidgetTempPropertyKey:
                            const tempProperty = newState.features[this.currentModule.moduleNameTrim].tempProperties;
                            //this.store.dispatch(this.propertyPanelActions.updateTempProperties(tempProperty, this.currentModule));
                            break;
                        case LocalStorageWidgetOriginalPropertyKey:
                            //this.store.dispatch(this.propertyPanelActions.updateOriginalProperties(this.currentModule));
                            break;
                    }
                }
            }
            // console.log('updateState:' + evt);
        });
    }


    /**
     * restoreModule
     **/
    public restoreModule() {
        const data = localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSModuleKey, this.browserTabId));
        if (data) {
            const newState = JSON.parse(data);
            if (newState) {
                if (data['browserTabId'] && data['browserTabId'] != this.browserTabId) return;
                this.store.dispatch(this.moduleActions.updateModuleStateFromLocalStorage(newState));
            }
        }
    }

    /**
    * restoreParkedItems
    **/
    public restoreParkedItems() {
        const data = localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSParkedItemsKey, this.browserTabId));
        if (data) {
            const newState = JSON.parse(data);
            if (newState) {
                if (data['browserTabId'] && data['browserTabId'] != this.browserTabId) return;
                this.store.dispatch(this.parkedItemActions.restoreAllState(newState));//loadParkedItemsSuccess
            }
        }
    }

    /**
    * restoreProcessData
    **/
    public restoreProcessData() {
        const data = localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSProcessDataKey, this.browserTabId));
        if (data) {
            const newState = JSON.parse(data);
            if (newState) {
                if (data['browserTabId'] && data['browserTabId'] != this.browserTabId) return;
                // this.store.dispatch(this.processDataActions.restoreAllState(newState));
            }
        }
    }

    public restoreModuleSetting() {
        const data = localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSModuleSettingKey, this.browserTabId));
        if (data) {
            const newState = JSON.parse(data);
            if (newState) {
                if (data['browserTabId'] && data['browserTabId'] != this.browserTabId) return;
                this.store.dispatch(this.moduleSettingActions.restoreAllState(newState));
            }
        }
    }

    public restoreWidgetDetailContent() {
        const data = localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageWidgetContentDetailKey, this.browserTabId));
        if (data) {
            const newState = JSON.parse(data);
            if (newState) {
                if (data['browserTabId'] && data['browserTabId'] != this.browserTabId) return;
                //this.store.dispatch(this.widgetDetailActions.restoreAllState(newState));
            }
        }
    }

    public restoreWidgetProperty() {
        const data = localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageWidgetPropertyKey, this.browserTabId));
        if (data) {
            const newState = JSON.parse(data);
            if (newState) {
                if (data['browserTabId'] && data['browserTabId'] != this.browserTabId) return;
                //this.store.dispatch(this.propertyPanelActions.restoreAllState(newState));
            }
        }
    }

}
