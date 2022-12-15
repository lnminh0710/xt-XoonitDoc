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
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { MatIconRegistry } from '@xn-control/light-material-ui/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { UserV2Selectors } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.selectors';
import { UserV2ActionNames } from '@app/pages/user-v2/user-v2.statemanagement/user-v2.actions';
import { CustomAction } from '@app/state-management/store/actions';

@Component({
    selector: 'app-gs-module-item',
    styleUrls: ['./gs-module-item.component.scss'],
    templateUrl: './gs-module-item.component.html',
})
export class GlobalSeachModuleItemComponent extends BaseComponent implements OnInit, OnDestroy {
    public moduleItem: GlobalSearchModuleModel;
    public resultValue: number;
    public globalNumberFormat = '';
    public folderIcon$?: Observable<any>;

    private globalPropertiesStateSubscription: Subscription;
    private globalPropertiesState: Observable<any>;

    private _prefixResourceCache = 'RESOURCE_CACHE';
    hasPermission: boolean;

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
        protected router: Router,
        protected userManagementSelectors: UserV2Selectors,
    ) {
        super(router);
        this.globalPropertiesState = store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
        );
    }

    public ngOnInit() {
        this.subscribeGlobalProperties();

        this.userManagementSelectors
            .actionSuccessOfSubtype$(UserV2ActionNames.USER_GET_BY_IDLOGIN)
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe(
                (action: CustomAction) => {
                    const res = action.payload?.item;
                    if (
                        !res?.length ||
                        !this.moduleItem?.accessRight?.read ||
                        (this.moduleItem.moduleName !== 'Indexing' && this.moduleItem.moduleName !== 'Preisschild ')
                    ) {
                        this.hasPermission = true;
                        return;
                    }
                    const permissionsString = res[0]?.[0]?.UserPermission;
                    if (!permissionsString) {
                        return;
                    }
                    const permissions = JSON.parse(permissionsString);

                    const validPermission = permissions.find(
                        (x) => x.PermissionName === this.moduleItem.moduleName && x.PermissionType === 'Module',
                    );

                    this.hasPermission = validPermission?.IsSelected == 1;
                },
                (error) => {
                    this.hasPermission = false;
                },
            );
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
