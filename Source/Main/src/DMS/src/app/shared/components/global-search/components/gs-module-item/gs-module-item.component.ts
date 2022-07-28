import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { GlobalSearchModuleModel, Module } from '@app/models';
import { AppState } from '@app/state-management/store';
import { Observable, Subscription, of } from 'rxjs';
import { PropertyPanelService, AppErrorHandler, BaseService } from '@app/services';
import { Store } from '@ngrx/store';
import { Uti } from '@app/utilities/uti';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { MenuModuleId } from '@app/app.constants';
import { HttpClient } from '@angular/common/http';
import { switchMap, take } from 'rxjs/operators';
import { MatIconRegistry } from '@xn-control/light-material-ui/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-gs-module-item',
    styleUrls: ['./gs-module-item.component.scss'],
    templateUrl: './gs-module-item.component.html',
})
export class GlobalSeachModuleItemComponent implements OnInit, OnDestroy {
    public moduleItem: GlobalSearchModuleModel;
    public resultValue: number;
    public globalNumberFormat = '';
    public folderIcon$?: Observable<any>;

    private globalPropertiesStateSubscription: Subscription;
    private globalPropertiesState: Observable<any>;

    private _prefixResourceCache = 'RESOURCE_CACHE';

    @Input()
    set moduleItemConfig(moduleItemConfig: GlobalSearchModuleModel) {
        this.moduleItem = moduleItemConfig;
    }

    @Output() onItemClick: EventEmitter<any> = new EventEmitter();
    @Output() onItemDoubleClick: EventEmitter<any> = new EventEmitter();

    constructor(
        private propertyPanelService: PropertyPanelService,
        private appErrorHandler: AppErrorHandler,
        private store: Store<AppState>,
        private httpClient: HttpClient,
        private matIconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
    ) {
        this.globalPropertiesState = store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
        );
    }

    public ngOnInit() {
        this.subscribeGlobalProperties();
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    public globalItemClicked() {
        this.onItemClick.emit(this.moduleItem);
    }

    public globalItemDoubleClicked() {
        if (!this.moduleItem.searchResult) {
            return;
        }

        if (
            (this.moduleItem.idSettingsGUI == MenuModuleId.selectionCampaign ||
                this.moduleItem.idSettingsGUI == MenuModuleId.selectionBroker ||
                this.moduleItem.idSettingsGUI == MenuModuleId.selectionCollect) &&
            this.moduleItem.children &&
            this.moduleItem.children.length
        ) {
            return;
        }

        if (!this.moduleItem.searchResult && this.moduleItem.isSearchEmpty && !this.moduleItem.parentName) {
            this.onItemDoubleClick.emit(this.moduleItem);
            return;
        }
        if (this.moduleItem.searchResult && !this.moduleItem.isSearchEmpty) {
            this.onItemDoubleClick.emit(this.moduleItem);
            return;
        }
    }

    public goToGlobalChildren(key) {
        const childModule = this.moduleItem.children.find((item) => item.searchIndexKey === key);
        if (childModule) {
            this.onItemDoubleClick.emit(childModule);
        }
    }

    private subscribeGlobalProperties() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    this.globalNumberFormat =
                        this.propertyPanelService.buildGlobalNumberFormatFromProperties(globalProperties);
                }
            });
        });
    }
}
