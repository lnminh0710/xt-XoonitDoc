import { Directive, OnInit, ViewContainerRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ComboBox, AutoComplete } from 'wijmo/wijmo.input';
import { Subscription, Observable } from 'rxjs';
import { ModuleList } from '../../../pages/private/base';
import { Store } from '@ngrx/store';
import { AppState } from '../../../state-management/store';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { AppErrorHandler, PropertyPanelService } from '../../../services';
import { Uti } from '../../../utilities';

@Directive({
    selector: '[selectFirstIfOnlyOne]'
})

export class XnSelectFirstIfOnlyOneDirective implements OnInit, AfterViewInit, OnDestroy {

    private hostComponent: any;
    private autoSelectFirstIfOnlyOne = false;

    private globalPropertiesStateSubscription: Subscription;
    private globalPropertiesState: Observable<any>;

    constructor(
        protected store: Store<AppState>,
        private _viewContainerRef: ViewContainerRef,
        private appErrorHandler: AppErrorHandler,
        private propertyPanelService: PropertyPanelService
    ) {
        this.globalPropertiesState = store.select(state => propertyPanelReducer.getPropertyPanelState(state, ModuleList.Base.moduleNameTrim).globalProperties);
    }

    ngOnInit() {
        this.globalPropertiesStateSubscription = this.globalPropertiesState.subscribe((globalProperties: any) => {
            this.appErrorHandler.executeAction(() => {
                if (globalProperties) {
                    let prop = this.propertyPanelService.getItemRecursive(globalProperties, 'SelectFirstIfOnlyOne');
                    if (prop && this.autoSelectFirstIfOnlyOne !== prop.value) {
                        this.autoSelectFirstIfOnlyOne = prop.value;
                    }
                }
            });
        });
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    ngAfterViewInit() {
        this.hostComponent = this._viewContainerRef["_data"].componentView.component;
        if (this.hostComponent) {
            if (this.hostComponent instanceof ComboBox)
                this.hostComponent.gotFocus.addHandler(this.comboboxItemsSourceChanged.bind(this));

            if (this.hostComponent instanceof AutoComplete)
                this.hostComponent.itemsSourceChanged.addHandler(this.autoCompleteItemsSourceChanged.bind(this));
        }
    }

    private comboboxItemsSourceChanged(hostComponent) {
        if (this.autoSelectFirstIfOnlyOne && hostComponent && hostComponent.itemsSource && hostComponent.itemsSource.length === 1) {
            hostComponent.selectedIndex = 0;
        }
    }

    private autoCompleteItemsSourceChanged(hostComponent) {
        if (this.autoSelectFirstIfOnlyOne && hostComponent && hostComponent.itemsSource && hostComponent.itemsSource.items && hostComponent.itemsSource.items.length === 1) {
            hostComponent.selectedIndex = 0;
        }
    }
}
