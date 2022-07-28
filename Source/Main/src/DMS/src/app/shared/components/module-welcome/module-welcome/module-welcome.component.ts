import { Component, OnInit, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import { Module } from '@app/models';
import { BaseComponent, ModuleList } from '@app/pages/private/base';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { Observable } from 'rxjs';
import * as parkedItemReducer from '@app/state-management/store/reducer/parked-item';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { Router } from '@angular/router';
import { DomHandler, ParkedItemService, AccessRightsService } from '@app/services';
import { ModuleActions, ParkedItemActions } from '@app/state-management/store/actions';
import { MenuModuleId, AccessRightTypeEnum } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { Configuration } from '@app/app.constants';

@Component({
    selector: 'module-welcome',
    styleUrls: ['./module-welcome.component.scss'],
    templateUrl: './module-welcome.component.html',
})
export class ModuleWelcomeComponent extends BaseComponent implements OnInit, OnDestroy {
    @Input() activeModule: Module;
    @Input() subModules: Module[] = [];
    @Input() showParkedItem = true;
    @Input() canSearch = true;

    public parkedItemsState: Observable<any[]>;
    public fieldConfigState: Observable<any[]>;
    public globalPropertiesState: Observable<any>;

    public fieldConfig: Array<any> = [];
    public isFocus: boolean;
    public searchText: string;
    public scanningTool: any;
    public moduleAccessRight: any;
    public tabAccessRight: any;
    public moduleParkedItemAccessRight: any;

    @ViewChild('clearSearchElm') clearSearchElm: ElementRef;
    @ViewChild('searchInputElm') searchInputElm: ElementRef;

    constructor(
        protected router: Router,
        private store: Store<AppState>,
        private moduleActions: ModuleActions,
        private domHandler: DomHandler,
        private parkedItemActions: ParkedItemActions,
        private parkedItemService: ParkedItemService,
        private accessRightService: AccessRightsService,
    ) {
        super(router);

        this.parkedItemsState = store.select(
            (state) => parkedItemReducer.getParkedItemState(state, this.ofModule.moduleNameTrim).parkedItems,
        );
        this.fieldConfigState = store.select(
            (state) => parkedItemReducer.getParkedItemState(state, this.ofModule.moduleNameTrim).fieldConfig,
        );
        this.globalPropertiesState = store.select(
            (state) =>
                propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties,
        );

        this.scanningTool = Configuration.PublicSettings.scanningTool;
    }

    ngOnInit() {
        this.moduleAccessRight = this.accessRightService.getAccessRight(AccessRightTypeEnum.Module, {
            idSettingsGUI: this.activeModule.idSettingsGUI,
        });

        this.tabAccessRight = this.accessRightService.getMainTabAccessRight(this.activeModule);

        this.moduleParkedItemAccessRight = this.accessRightService.getAccessRight(AccessRightTypeEnum.ParkedItem, {
            idSettingsGUIParent: this.activeModule.idSettingsGUIParent,
            idSettingsGUI: this.activeModule.idSettingsGUI,
        });
    }

    ngOnDestroy() {}

    focusSearchBox() {
        this.isFocus = true;
    }

    focusOutSearchBox() {
        this.isFocus = false;
    }

    search($event) {
        if (this.searchText) {
            let searchModule: Module;

            if (this.activeModule.idSettingsGUI == MenuModuleId.briefe) {
                searchModule = new Module({
                    idSettingsGUI: -1,
                });
            } else {
                searchModule = this.activeModule;
            }
            searchModule.searchKeyword = this.searchText;
            searchModule.isCanSearch = true;
            this.store.dispatch(this.moduleActions.searchKeywordModule(searchModule));
            if ($event) {
                $event.preventDefault();
            }
        }
    }

    clearSearchText() {
        this.searchText = '';
        this.searchInputElm.nativeElement.value = this.searchText;
        this.domHandler.addClass(this.clearSearchElm.nativeElement, 'hidden');
    }

    keypress($event) {
        if ($event.which === 13 || $event.keyCode === 13) {
            $event.preventDefault();
        } else {
            this.searchText = $event.target.value;
            if (this.searchText) {
                this.domHandler.removeClass(this.clearSearchElm.nativeElement, 'hidden');
            } else {
                this.domHandler.addClass(this.clearSearchElm.nativeElement, 'hidden');
            }

            $event.stopPropagation();
        }
    }

    selectParkedItem(parkedItem) {
        this.store.dispatch(this.parkedItemActions.selectParkedItem(parkedItem, this.ofModule));

        if (this.ofModule && this.ofModule.idSettingsGUI === MenuModuleId.processing) {
            this.selectActiveSubModule(parkedItem);
        }

        this.store.dispatch(this.moduleActions.moveSelectedParkedItemToTop(this.ofModule, parkedItem));
    }

    createNew() {
        this.store.dispatch(this.moduleActions.requestCreateNewModuleItem(this.ofModule));
    }

    selectSubModule(subModule) {
        this.store.dispatch(this.moduleActions.activeSubModule(subModule));

        if (this.activeModule.idSettingsGUI != MenuModuleId.processing) {
            let newRoute = this.activeModule.moduleNameTrim + '/' + subModule.moduleNameTrim;
            this.router.navigate([Uti.getPrivateUrlWithModuleName(newRoute)]);
        }
    }

    private selectActiveSubModule(parkedItem) {
        if (!parkedItem || !parkedItem.idRepPersonType) {
            return;
        }

        const activeSubModule = this.parkedItemService.getActiveSubModule(
            this.subModules,
            parkedItem.idSettingsGUI.value,
        );
        if (activeSubModule) {
            this.store.dispatch(this.moduleActions.activeSubModule(activeSubModule));
        }
    }

    public downloadScanningTool() {
        if (this.scanningTool && this.scanningTool.downloadUrl) {
            let a = document.createElement('a');
            a.href = Uti.getFileUrl(this.scanningTool.downloadUrl);
            a.click();
        }
    }
}
