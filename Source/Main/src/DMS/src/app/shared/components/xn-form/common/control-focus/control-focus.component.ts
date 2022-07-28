import { Component, Input, Output, OnInit, OnDestroy, AfterViewInit, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import {
    TabSummaryActions
} from '@app/state-management/store/actions';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import * as tabSummaryReducer from '@app/state-management/store/reducer/tab-summary';
import {
    AppErrorHandler
} from '@app/services';
import * as uti from '@app/utilities';
import find from 'lodash-es/find';

@Component({
    selector: 'control-focus',
    template: `<div style='display: none'></div>`
})
export class ControlFocusComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    //form id
    @Input() formName: string;
    @Input() focusControl?: string;
    @Input() controlWaitingMore?: string;
    @Input() noLoop?: boolean;
    @Input() isFocusOnFirstControl?: boolean;
    @Input() isFocusOnLast?: boolean;
    @Input() mustWaitForCheckingDataWhenLastItem?: boolean;
    @Input() isRegisterBlurEventInLastControl?: boolean;

    // Use to move to the next control of the other componnet.
    @Input() targetComponentFocus: string;//component tag name -> it is selector of component
    @Input() targetComponentIndex: number = 0;

    @Input() preventFocus: Promise<any>;

    @Output() callBackAfterEnter: EventEmitter<any> = new EventEmitter<any>();
    @Output() callBackAfterEnterWhenLastItemAction: EventEmitter<any> = new EventEmitter<any>();
    @Output() callBackWhenReachFinalField: EventEmitter<any> = new EventEmitter<any>();

    private controlList: Array<any> = [];
    private maxNumofTimesWaiting: number = 0;
    private timeoutInitControl: any;
    private timeoutFocusOnControl: any;
    private _isCalledActionInLastItem = false;

    constructor(
        private store: Store<AppState>,
        private tabSummaryActions: TabSummaryActions,
        protected router: Router,
        private appErrorHandler: AppErrorHandler,
        private controlFocus: ElementRef
    ) {
        super(router);
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
        this.unbindKeyDownEvent();
        uti.Uti.unsubscribe(this);
    }

    ngAfterViewInit() {
        this.initControl();
    }

    public initControl(noFocusFirstControl?: boolean) {
        clearTimeout(this.timeoutInitControl);
        this.timeoutInitControl = null;

        //try about 25 times -> 5 seconds
        if (this.maxNumofTimesWaiting > 25) {
            this.maxNumofTimesWaiting = 0;
            return;
        }

        this.timeoutInitControl = setTimeout(() => {
            this.unbindKeyDownEvent();

            if (this.controlWaitingMore) {
                let $controlWaitingMore = this.findControlWaitingMore();
                if (!$controlWaitingMore) {
                    console.log('initControl -> controlWaitingMore');
                    this.initControl();
                    this.maxNumofTimesWaiting++;
                    return;
                }
            }

            this.addControlList();
            this.setKeyPressForControl();

            if (noFocusFirstControl) {
                //no focus
            }
            else {
                if (this.isFocusOnFirstControl)
                    this.focusOnFirstControl();
                else if (this.focusControl)
                    this.focusControlByControlName(this.focusControl);
            }

        }, 200);
    }

    public focusControlByControlName(controlName: string) {
        if (!controlName || !this.controlList || !this.controlList.length) return;

        let searchByMultipleName = false;
        //controlName1,controlName2,controlName3
        if (controlName.indexOf(',') !== -1) {
            controlName = ',' + controlName + ',';
            searchByMultipleName = true;
        }

        let findControl: any;
        for (const control of this.controlList) {
            if (searchByMultipleName) {
                if (controlName.indexOf(',' + control.attr('name') + ',') !== -1 ||
                    controlName.indexOf(',' + control.attr('formcontrolname') + ',') !== -1) {
                    findControl = control;
                    break;
                }
            }
            else {
                // && control.is(':visible')
                if (control.attr('name') === controlName || control.attr('formcontrolname') === controlName) {
                    findControl = control;
                    break;
                }
            }

        }//for

        if (findControl)
            this.focusOnControl(findControl);
        else
            this.focusOnFirstControl();
    }

    public focusOnFirstControl() {
        if (!this.controlList || !this.controlList.length) return;

        for (const control of this.controlList) {
            if (control.is(':visible')) {
                this.focusOnControl(control);
                break;
            }
        }//for
    }

    public selectChildAndParentTab($curentTab: any) {
        if (!$curentTab || !$curentTab.length) return;

        const tabId = $curentTab.attr('id');
        if (!tabId) return;

        //select current tab
        this.selectTab($curentTab);

        //select parent tab
        const $parentTab = $curentTab.parent().closest('.tab-pane');
        if ($parentTab && $parentTab.length) {
            this.selectTab($parentTab);
        }
    }

    public executeBehaviorInLastCustomerItem() {
        setTimeout(() => {
            if (this.preventFocus) {
                this.preventFocus.then(data => {
                    if (!data) this.activeTabAndFocusFirstElement();
                });
            }
            else {
                this.activeTabAndFocusFirstElement();
            }
        });
    }

    public hasControl() {
        return this.controlList && this.controlList.length;
    }

    /********************************************************************************************/
    /********************************** PRIVATE METHODS ******************************************/
    /********************************************************************************************/
    private focusOnControl(control: any) {
        clearTimeout(this.timeoutFocusOnControl);
        this.timeoutFocusOnControl = null;

        this.timeoutFocusOnControl = setTimeout(() => {
            control.focus();
        });
    }

    private isValidControlToFocus(item) {
        const type = item.type;
        const tagName = item.tagName;
        const disabled = item.disabled;

        const $item = $(item);
        if ((
            type === 'checkbox' || type === 'radio' || type === 'text' ||

            $item.hasClass('xn-input') ||
            $item.hasClass('xn-input--no-icon') ||
            $item.hasClass('xn-select') ||
            $item.hasClass('xn-date-picker-input') ||
            $item.hasClass('xn-select--no-icon') ||

            (tagName != 'BUTTON' && $item.closest('wj-combo-box.xn-select').length) ||
            (tagName != 'BUTTON' && $item.closest('wj-auto-complete').length) ||//wj-auto-complete.xn-auto-complete
            (tagName == 'INPUT' && $item.closest('wj-input-date.xn-input').length) ||
            (tagName == 'INPUT' && $item.closest('wj-input-mask.xn-select').length) ||
            (tagName == 'INPUT' && $item.closest('wj-input-date.xn-select').length) ||

            ($item.attr('wj-part') === 'input' && $item.hasClass('wj-numeric')) ||
            ($item.attr('pinputtext') === '' && $item.attr('placeholder') === 'mm/dd/yyyy'))

            && !disabled && !$item.hasClass('focus-ignore') && !this.isIgnoreControl($item)) {
            return true;
        }
        return false;
    }

    private isIgnoreControl(control: any) {
        try {
            const type = control.attr('type');
            switch (type) {
                case 'text':
                    // retrieving the wj-auto-complete structure.
                    const $parent = control.closest('wj-auto-complete,wj-combo-box.xn-select');//.xn-auto-complete
                    return $parent.length && $parent.hasClass('focus-ignore');
                case 'checkbox':
                    // retrieving the mat-checkbox structure.
                    return control.parent().parent().parent().hasClass('focus-ignore');
            }
        } catch (ex) { }
        return false;
    }

    private findControlWaitingMore() {
        if (!this.controlWaitingMore) return null;

        let formControls: any = this.getForm();
        if (!formControls || !formControls.length) return null;

        return find(formControls, (c) => c.name === this.controlWaitingMore || c.formcontrolname === this.controlWaitingMore);
    }

    private getForm() {
        const selectorForm = '#' + this.formName;
        let formControls: any;

        //From ControlFocus -> get closest Form
        if (this.controlFocus && this.controlFocus.nativeElement)
            formControls = this.controlFocus.nativeElement.closest('form' + selectorForm);

        //if there is no closest Form -> get form by ID
        if (!formControls) {
            const $form = $(selectorForm);
            if ($form && $form.length) formControls = $form[0];
        }

        return formControls;
    }

    private addControlList() {

        let formControls: any = this.getForm();
        if (!formControls || !formControls.length) return;

        for (const item of (formControls as any)) {
            if (this.isValidControlToFocus(item)) {
                const $item = $(item);
                this.controlList.push($item);
            }
        }
    }

    private setKeyPressForControl() {
        if (!this.controlList || !this.controlList.length) return;

        for (let i = 0; i < this.controlList.length; i++) {
            const control = $(this.controlList[i]);
            control.unbind('keyup');
            control.keyup(($event) => {
                if (!($event.which === 13 || $event.keyCode === 13)) return;

                // stop move to other control when control is textArea
                if ($event.target.toString().indexOf('TextArea') > -1) return;

                if (i === this.controlList.length - 1) {
                    if (this.noLoop) {
                        this.callBackWhenReachFinalField.emit();
                        return;
                    }
                    $event.preventDefault();
                    this.callBackAfterEnter.emit($event);

                    // For search matching customer
                    this.outputActinInLastControl($event);
                    if (this.mustWaitForCheckingDataWhenLastItem) {
                        control.blur();
                        return;
                    }

                    this.executeBehaviorInLastCustomerItem();
                    return;
                }
                $event.preventDefault();
                this.callBackAfterEnter.emit($event);
                for (let j = i + 1; j < this.controlList.length; j++) {
                    const condition1 = $(this.controlList[j]).length;
                    const condition2 = $(this.controlList[j]).is(':visible');
                    if (condition1 && condition2) {
                        setTimeout(() => {
                            $(this.controlList[j]).focus();
                        });
                        return;
                    }
                }
            });
        }
    }

    private outputActinInLastControl($event: any) {
        if (this._isCalledActionInLastItem) {
            setTimeout(() => {
                this._isCalledActionInLastItem = false;
            }, 500);
            return;
        }
        this.callBackAfterEnterWhenLastItemAction.emit($event);
        this._isCalledActionInLastItem = true;
        setTimeout(() => {
            this._isCalledActionInLastItem = false;
        }, 500);
    }

    private activeTabAndFocusFirstElement() {
        if (!this.targetComponentFocus) {
            $(this.controlList[0]).focus();
            return;
        }

        let $thisPane: any;
        if (this.controlFocus && this.controlFocus.nativeElement) {
            const thisForm = this.controlFocus.nativeElement.closest('form#' + this.formName);
            if (thisForm)
                $thisPane = $(thisForm).parents('.tab-pane.active').last();
        }

        let $targetForm = $thisPane && $thisPane.length ? $thisPane.find(this.targetComponentFocus) : $(this.targetComponentFocus);
        if (!$targetForm || !$targetForm.length) {
            if (this.targetComponentFocus == 'data-entry-order-payment-type')
                this.selectChildAndParentTab($thisPane.find('app-customer-data-entry-form').closest('.tab-pane').siblings());

            return;
        }

        if (!$targetForm.is('form')) {
            const forms = $targetForm.find('form');
            if (!forms || !forms.length) return;

            //If there is more than one form -> will get form by index
            $targetForm = forms.length > 1 ? $(forms[this.targetComponentIndex]) : forms;

            if (!$targetForm.is(':visible'))
                this.selectChildAndParentTab($targetForm.closest('.tab-pane'));
        }

        let $item: any;

        //focus on the first / or last valid control
        for (const item of ($targetForm[0] as any)) {
            if (this.isValidControlToFocus(item)) {
                $item = item;

                //if isFocusOnLast = false -> will focus on first valid control
                if (!this.isFocusOnLast) break;
            }
        }//for

        if ($item)
            $($item).focus();
    }

    private selectTab($curentTab: any) {
        if (!$curentTab.length) return;

        const tabId = $curentTab.attr('id');
        if (!tabId) return;

        const $currentNav = $('li a[href$="' + tabId + '"]');
        if ($currentNav.length) {
            this.store.dispatch(this.tabSummaryActions.requestSelectSimpleTab(tabId, this.ofModule));
        }
    }

    private unbindKeyDownEvent() {
        if (!this.controlList || !this.controlList.length) return;

        try {

            for (let i = 0; i <= this.controlList.length; i++) {
                $(this.controlList[i]).unbind('keyup');
            }

            this.controlList = [];
        } catch (ex) { console.log('unbindKeyDownEvent', ex); }
    }
}
