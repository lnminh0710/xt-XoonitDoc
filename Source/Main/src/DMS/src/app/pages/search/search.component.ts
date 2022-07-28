import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { ModuleActions, ParkedItemActions, ModuleSettingActions } from '@app/state-management/store/actions';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { LocalStorageKey } from '@app/app.constants';
import { filter } from 'rxjs/operators';
import { Uti } from '../../utilities';

@Component({
    selector: 'app-root',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    host: {
        '(window:resize)': 'resizeEventHandler($event)',
    },
})
export class SearchComponent implements OnInit, OnDestroy {
    public tabs;
    private updateModuleStateSubscription: Subscription;
    private browserTabId: string = Uti.defineBrowserTabId();

    constructor(
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        private parkedItemActions: ParkedItemActions,
        private moduleSettingActions: ModuleSettingActions,
    ) {}

    public ngOnInit() {
        const gsMainAppRoot = document.querySelector("#main > div > app-root > main > div > gs-main");
        gsMainAppRoot.parentElement.removeChild(gsMainAppRoot);
        this.store.dispatch(this.moduleActions.loadMainModules());
        $('#page-loading').remove();
        this.updateState();
        $('body').addClass('skin-light');
        $('.main-header').remove();
        $('.faked-heading').remove();
    }

    public ngOnDestroy() {
        if (this.updateModuleStateSubscription) {
            this.updateModuleStateSubscription.unsubscribe();
        }
    }

    public resizeEventHandler(e: any): void {}

    public updateState() {
        this.restoreTab();
        this.restoreModule();
        this.restoreModuleSetting();
        this.restoreParkedItems();
        this.subscribeModuleState();
    }

    /**
     * subscribeModuleState
     * */
    public subscribeModuleState() {
        const LocalStorageGSModuleKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSModuleKey, this.browserTabId);
        const LocalStorageGSParkedItemsKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSParkedItemsKey, this.browserTabId);
        const LocalStorageGSModuleSettingKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSModuleSettingKey, this.browserTabId);
        const LocalStorageGSCaptureSearchModuleKey = LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSCaptureSearchModule, this.browserTabId);

        this.updateModuleStateSubscription = fromEvent<StorageEvent>(window, 'storage')
            .pipe(
              filter((evt) => {
                return (
                    (evt.key == LocalStorageGSModuleKey ||
                        evt.key == LocalStorageGSParkedItemsKey ||
                        evt.key == LocalStorageGSModuleSettingKey ||
                        evt.key == LocalStorageGSCaptureSearchModuleKey) &&
                    evt.newValue !== null &&
                    evt.newValue != 'undefined'
                );
              })
            )
            .subscribe((evt) => {
                const data = evt.newValue;
                if (data) {
                    const newState = JSON.parse(evt.newValue);
                    if (newState) {
                        if (newState.browserTabId && newState.browserTabId != this.browserTabId) return;
                        switch (evt.key) {
                            case LocalStorageKey.LocalStorageGSModuleKey:
                                this.store.dispatch(this.moduleActions.updateModuleStateFromLocalStorage(newState));
                                break;
                            case LocalStorageKey.LocalStorageGSModuleSettingKey:
                                this.store.dispatch(this.moduleSettingActions.restoreAllState(newState));
                                break;
                            case LocalStorageKey.LocalStorageGSParkedItemsKey:
                                this.store.dispatch(this.parkedItemActions.restoreAllState(newState)); //loadParkedItemsSuccess
                                break;
                            case LocalStorageGSCaptureSearchModuleKey:
                                this.store.dispatch(this.moduleActions.searchKeywordModule(newState)); //loadParkedItemsSuccess
                                break;
                        }
                    }
                }
                // console.log('updateState:' + evt);
            });
    }

    /**
     * restoreTab
     **/
    public restoreTab() {
        const data = localStorage.getItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSTabKey, this.browserTabId));

        if (data) {
            if (data['browserTabId'] && data['browserTabId'] != this.browserTabId) return;
            this.tabs = JSON.parse(data).tabs;
        }
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
                this.store.dispatch(this.parkedItemActions.restoreAllState(newState)); //loadParkedItemsSuccess
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
}
