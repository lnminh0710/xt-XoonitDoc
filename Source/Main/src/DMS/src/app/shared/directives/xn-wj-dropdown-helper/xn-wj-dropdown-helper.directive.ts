import { Directive, OnInit, ViewContainerRef, AfterViewInit, OnDestroy, Input } from '@angular/core';
import { ComboBox, AutoComplete } from 'wijmo/wijmo.input';
import { Subscription, Observable } from 'rxjs';
import { ModuleList } from '../../../pages/private/base';
import { Store } from '@ngrx/store';
import { AppState } from '../../../state-management/store';
import * as propertyPanelReducer from '@app/state-management/store/reducer/property-panel';
import { AppErrorHandler, PropertyPanelService } from '../../../services';
import { Uti } from '../../../utilities';

@Directive({
    selector: '[wjDropdownHelper]'
})

export class XnWjDropdownHelperDirective implements OnInit, AfterViewInit, OnDestroy {

    private hostComponent: any;
    private autoSelectFirstIfOnlyOne = false;
    private isShowWhenFocus: boolean = false;

    private globalPropertiesStateSubscription: Subscription;
    private globalPropertiesState: Observable<any>;

    @Input() dontSelectItemIfOnlyOneWhenFocus: boolean = false;
    @Input() dontShowItemsWhenFocus: boolean = false;
    @Input() dontShowDropDownButtonWhenEmpty: boolean = false;
    @Input() selectItemWhenHasOneRowWithoutFocus: boolean = false;

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
                    let propSelectFirstIfOnlyOne = this.propertyPanelService.getItemRecursive(globalProperties, 'SelectFirstIfOnlyOne');
                    if (propSelectFirstIfOnlyOne && this.autoSelectFirstIfOnlyOne !== propSelectFirstIfOnlyOne.value) {
                        this.autoSelectFirstIfOnlyOne = propSelectFirstIfOnlyOne.value;
                    }

                    let propShowDropdownWhenFocus = this.propertyPanelService.getItemRecursive(globalProperties, 'ShowDropdownWhenFocus');
                    if (propShowDropdownWhenFocus && this.isShowWhenFocus !== propShowDropdownWhenFocus.value) {
                        this.isShowWhenFocus = propShowDropdownWhenFocus.value;
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
            if (this.dontShowDropDownButtonWhenEmpty) {
                this.hostComponent.showDropDownButton = !!(this.hostComponent.itemsSource && this.hostComponent.itemsSource.length);
            }
            
            if (this.hostComponent instanceof ComboBox)
                this.hostComponent.gotFocus.addHandler(this.comboboxItemsSourceChanged.bind(this));

            if (this.hostComponent instanceof AutoComplete)
                this.hostComponent.itemsSourceChanged.addHandler(this.autoCompleteItemsSourceChanged.bind(this));

            this.setSelectItemWhenHasOneRowWithoutFocus();
        }
    }

    private setSelectItemWhenHasOneRowWithoutFocus() {
        if (!this.selectItemWhenHasOneRowWithoutFocus) return;
        setTimeout(() => {
            if ((this.hostComponent instanceof ComboBox &&
                this.hostComponent.itemsSource &&
                this.hostComponent.itemsSource.length === 1) || 
                
                (this.hostComponent instanceof AutoComplete &&
                this.autoSelectFirstIfOnlyOne &&
                this.hostComponent.itemsSource &&
                this.hostComponent.itemsSource.items &&
                this.hostComponent.itemsSource.items.length === 1)) {

                this.hostComponent.selectedIndex = 0;
            }
        }, 300);
    }

    private comboboxItemsSourceChanged(hostComponent) {
        if (!hostComponent) return;
        if (this.autoSelectFirstIfOnlyOne && hostComponent.itemsSource && hostComponent.itemsSource.length === 1 && !this.dontSelectItemIfOnlyOneWhenFocus) {
            hostComponent.selectedIndex = 0;
        }
        if (this.dontShowDropDownButtonWhenEmpty) {
            hostComponent.showDropDownButton = !!(hostComponent.itemsSource && hostComponent.itemsSource.length);
        }
        if (this.isShowWhenFocus && !this.dontShowItemsWhenFocus) {
            hostComponent.isDroppedDown = true;
        }
    }

    private autoCompleteItemsSourceChanged(hostComponent) {
        if (!hostComponent) return;
        if (this.autoSelectFirstIfOnlyOne && hostComponent.itemsSource && hostComponent.itemsSource.items && hostComponent.itemsSource.items.length === 1 && !this.dontSelectItemIfOnlyOneWhenFocus) {
            hostComponent.selectedIndex = 0;
        }
        if (this.dontShowDropDownButtonWhenEmpty) {
            hostComponent.showDropDownButton = !!(hostComponent.itemsSource && hostComponent.itemsSource.items);
        }
        if (this.isShowWhenFocus && !this.dontShowItemsWhenFocus) {
            hostComponent.isDroppedDown = true;
        }
    }
}
