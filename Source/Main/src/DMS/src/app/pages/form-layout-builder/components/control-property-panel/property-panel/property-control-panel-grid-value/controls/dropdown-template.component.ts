import { Component, Input, Output, OnInit, OnDestroy, ViewChild, EventEmitter, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as wjInput from 'wijmo/wijmo.angular2.input';
import { FormLayoutBuilderSelectors } from '../../../../../form-layout-builder.statemanagement/form-layout-builder.selectors';
import { takeUntil, filter } from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs';
import { DropdownControlProperty } from '../../../../../models/control-property';
import { IDragItem } from '../../../../../models/drag-item.interface';
import { CommonService, AppErrorHandler } from '../../../../../../../services';
import { ApiResultResponse } from '../../../../../../../models';
import { Uti } from '../../../../../../../utilities';
import { ReducerManagerDispatcher, Action } from '@ngrx/store';
import { CustomAction } from '../../../../../../../state-management/store/actions';
import { FormLayoutBuilderActionNames } from '../../../../../form-layout-builder.statemanagement/form-layout-builder.actions';

@Component({
    selector: 'dropdown-template',
    styleUrls: ['./dropdown-template.component.scss'],
    templateUrl: './dropdown-template.component.html'
})

export class DropdownTemplateComponent implements OnInit, OnDestroy, AfterViewInit {

    private curentLayoutControls: Array<IDragItem> = [];
    private _unsubscribedNotifer$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    private _item: DropdownControlProperty
    @Input() set item(data: DropdownControlProperty) {
        this._item = data;
        this.initData();
    }

    get item() {
        return this._item;
    }

    @Output() onPropertiesChange = new EventEmitter<any>();
    @Output() onPropertiesApply = new EventEmitter<any>();
    @Output() onSelectedIndexChanged = new EventEmitter<any>();

    @ViewChild(wjInput.WjComboBox) wjCombobox: wjInput.WjComboBox;
    

    constructor(
        private formLayoutSelectors: FormLayoutBuilderSelectors,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        private reducerMgrDispatcher: ReducerManagerDispatcher) {
        this.onComboboxChanged = this.onComboboxChanged.bind(this);
        this.itemFormatterFunc = this.itemFormatterFunc.bind(this);
    }

    public initData() {
        if (this.item.keyFromComboApi) {
            this.commonService.getListComboBox(this.item.keyFromComboApi).subscribe((response: ApiResultResponse) => {
                this.appErrorHandler.executeAction(() => {
                    if (!Uti.isResquestSuccess(response) || !response.item.comboBoxType) {
                        return;
                    }
                    let arr: Array<any> = response.item.comboBoxType;
                    this.item.options = [];
                    arr.forEach(item => {
                        this.item.options.push({
                            key: item.textValue,
                            value: item.textValue
                        });
                    });
                });
            });
        }
    }



    public ngAfterViewInit() {
        if (this.wjCombobox) {
            this.wjCombobox.selectedIndexChanged.removeHandler(this.onComboboxChanged);
            this.wjCombobox.selectedIndexChanged.addHandler(this.onComboboxChanged);
        }
    }

    public ngOnInit() {
        this.subscribe();       
    }

    public subscribe() {
        this.formLayoutSelectors.layoutControls$.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((data) => {
            this.curentLayoutControls = data;
            if (this.item.dropdownFieldDepend) {
                const rs = this.curentLayoutControls.filter(p => p.dragItemType == this.item.dropdownFieldDepend);
                let options = [];
                rs.forEach(item => {
                    options.push({
                        key: item.key,
                        value: item.key
                    })
                });
                this.item.options = options;
            }
        });

        this.reducerMgrDispatcher
            .pipe(
                filter((action: Action) => action.type === FormLayoutBuilderActionNames.UPDATE_VALUE_CONTROL_SETTING),
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((action: CustomAction) => {
                if (action) {
                    let dropdownControlProperty: DropdownControlProperty = action.payload;
                    if (dropdownControlProperty && this.item.loadDataFromField == dropdownControlProperty.name) {
                        this.commonService.getListComboBox(dropdownControlProperty.value).subscribe((response: ApiResultResponse) => {
                            this.appErrorHandler.executeAction(() => {
                                this.item.options = [];
                                if (!Uti.isResquestSuccess(response) || !response.item[dropdownControlProperty.value]) {
                                    return;
                                }
                                let arr: Array<any> = response.item[dropdownControlProperty.value];
                                arr.forEach(item => {
                                    this.item.options.push({
                                        key: item.idValue,
                                        value: item.textValue
                                    });
                                });
                            });
                        });
                    }
                }
            });
    }

    public ngOnDestroy() {
        this.unsubscribeFromNotifier();
    }

    private getUnsubscriberNotifier(): Observable<any> {
        return this._unsubscribedNotifer$.asObservable();
    }

    private unsubscribeFromNotifier() {
        this._unsubscribedNotifer$.next(true);
        this._unsubscribedNotifer$.complete();
    }

    public onComboboxChanged(event) {
        this.item.value = event.selectedValue;
        this.item.dirty = true;
        $(this.wjCombobox.inputElement).addClass('prop-dirty');
        this.onSelectedIndexChanged.emit(event);
    }

    public itemFormatterFunc(index, content) {
        if (this.item.options && this.item.options[index] && this.item.options[index].isHeader) {
            return `<span class="option-header" style="pointer-events:none;display:block;margin-left:-5px;font-size:10pt;font-weight:bold">${content}</span>`;
        }
        return content;
    }

    public onPropComboFocused($event) {
        setTimeout(() => {
            $('.option-header').closest('.wj-listbox-item').css('pointer-events', 'none');
        });
    }
}
