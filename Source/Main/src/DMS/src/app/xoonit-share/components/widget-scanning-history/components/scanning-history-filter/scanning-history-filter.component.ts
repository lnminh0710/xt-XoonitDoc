import {
    Component,
    OnInit,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    ChangeDetectorRef,
    ElementRef,
    ChangeDetectionStrategy,
    EventEmitter,
    Output,
    Input,
} from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Observer, Subject } from 'rxjs';
import * as moment from 'moment';
import { switchMap, takeUntil } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { BaseComponent } from '@app/pages/private/base';
import { ScanningHistoryFilter } from '@app/pages/history/history.statemanagement/model/payload/scanning-history-filter.payload.model';
import { HistoryUser } from '@app/pages/history/history.statemanagement/model/payload/history-user.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { ColumnDefinition, DropdownSetting, AutocompleteSetting } from '@app/models/common/column-definition.model';
import { AppState } from '@app/state-management/store';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { HistorySelectors } from '@app/pages/history/history.statemanagement/history.selectors';
import { GetHistoryUser } from '@app/pages/history/history.statemanagement/history.actions';
import { TypeaheadDefinition } from '@app/models/common/control/typeahead-definition.model';
import { XnBsDatepickerComponent } from '@app/xoonit-share/components/xn-bs-datepicker/xn-bs-datepicker.component';

@Component({
    selector: 'scanning-history-filter',
    templateUrl: './scanning-history-filter.component.html',
    styleUrls: ['./scanning-history-filter.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScanningHistoryFilterComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    private _filter: ScanningHistoryFilter;
    private _fromDate: Date;
    private _toDate: Date;
    private _userId: number;
    private _filterUsername: string;
    private _subjectDataSourceUsers = new Subject<HistoryUser[]>();
    private _observableDataSource$: Observable<HistoryUser[]>;
    private _typeaheadValue: string;

    public dataSourceUsers$: Observable<HistoryUser[]>;
    public noResults: boolean;
    public hasFiltered: boolean;
    public selectedDocType: DocumentTreeModel;
    public bsConfig: Partial<BsDatepickerConfig>;

    public set typeaheadValue(val: string) {
        this._typeaheadValue = val;
    }

    public get typeaheadValue() {
        return this._typeaheadValue;
    }

    @Input() controlsFilter: ColumnDefinition[];

    @ViewChild('dpFrom') dpFrom: XnBsDatepickerComponent;
    @ViewChild('dpTo') dpTo: XnBsDatepickerComponent;

    @Output() onFilterChanged = new EventEmitter<any>();
    @Output() onTypeaheadChanged = new EventEmitter<any>();

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private appStore: Store<AppState>,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private historySelectors: HistorySelectors,
    ) {
        super(router);
    }

    public ngOnInit(): void {
        this.registerSubscriptions();
        this.bsConfig = new BsDatepickerConfig();
        this.bsConfig.containerClass = 'theme-default';
        this.bsConfig.showWeekNumbers = false;
        this.bsConfig.dateInputFormat = 'DD.MM.YYYY';
    }

    public ngOnDestroy(): void {
        super.onDestroy();
    }

    public ngAfterViewInit(): void {
        // this.dpTo.disabled = true;
    }

    private registerSubscriptions() {}

    public loadDataToAutocompleteByValue(ctrl: TypeaheadDefinition<any>, value: string) {
        if (!value) {
            return of([]);
        }

        this.appStore.dispatch(new GetHistoryUser(value));
        return this._observableDataSource$;
    }

    public clearFilter($event) {
        this.dpFrom.date = null;
        this.dpTo.date = null;
        this.typeaheadValue = '';
        this.selectedDocType = null;

        const data = this.getDataFilter();
        this.onFilterChanged.emit(data);
    }

    public selectItemDropdown(item: any, control: ColumnDefinition) {
        if (!item) return;

        const setting = control.setting.ControlType as DropdownSetting;
        control.value = item[setting.valueMember];
    }

    public selectDataAutocomplete($event: any, control: ColumnDefinition) {
        const setting = control.setting.ControlType as AutocompleteSetting;
        control.value = $event[setting.valueMember];
    }

    public selectDatepicker($event: Date, control: ColumnDefinition) {
        control.value = $event;
    }

    public onEmptyTypeaheadValue(control: ColumnDefinition) {
        control.value = null;
    }

    private getDataFilter() {
        const data = {};
        for (let i = 0; i < this.controlsFilter.length; i++) {
            const control = this.controlsFilter[i];
            switch (control.setting.ControlType.Type) {
                case 'dropdown':
                    data[control.columnName] = this.getValueDropdown(control);
                    break;

                case 'datepicker':
                    data[control.columnName] = this.getValueDatepicker(control);
                    break;

                case 'autocomplete':
                    data[control.columnName] = this.getValueAutoComplete(control);
                    break;
            }
        }
    }

    private getValueDatepicker(ctrl: ColumnDefinition) {
        return ctrl.value;
    }

    private getValueDropdown(ctrl: ColumnDefinition) {
        return ctrl.value;
    }

    private getValueAutoComplete(ctrl: ColumnDefinition) {
        return ctrl.value;
    }
}
