import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ApiResultResponse } from '@app/models';
import { AppErrorHandler, CommonService, DatatableService } from '@app/services';
import { Uti } from '@app/utilities';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@xn-control/light-material-ui/autocomplete';
import { BaseAgGridCellComponent } from '@xn-control/xn-ag-grid/shared/base-ag-grid-cell-component';
import { ICellEditorAngularComp, ICellRendererAngularComp } from 'ag-grid-angular';
import { IAfterGuiAttachedParams } from 'ag-grid-community';
import { Observable } from 'rxjs/Observable';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Subject } from 'rxjs/Rx';

@Component({
    selector: 'autocomplete-cell-renderer',
    templateUrl: './autocomplete-cell-renderer.component.html',
    styleUrls: ['./autocomplete-cell-renderer.component.scss'],
})
export class AutoCompleteCellRenderer
    extends BaseAgGridCellComponent<any>
    implements ICellRendererAngularComp, ICellEditorAngularComp {
    @ViewChild('autocompleteInput', { read: MatAutocompleteTrigger }) autocompleteTrigger: MatAutocompleteTrigger;
    public options: Observable<any[]>;
    public filterOptions: Observable<any[]>;

    public key: string;
    public displayValue: string;
    public searchText: string;
    public searchTextChanged: Subject<string> = new Subject<string>();

    /**
     * DEFAULT function
     */
    getValue(): any {
        return {
            key: this.key,
            value: this.displayValue,
            options: [],
        };
    }
    refresh(params: any): boolean {
        return false;
    }

    constructor(
        private appErrorHandler: AppErrorHandler,
        private commonService: CommonService,
        private datatableService: DatatableService,
        private cdr: ChangeDetectorRef,
    ) {
        super();
        this.onSubscribeAction();
    }

    private onSubscribeAction() {
        this.searchTextChanged.pipe(debounceTime(300), distinctUntilChanged()).subscribe((data: any) => {
            if (!data) {
                this.filterOptions = this.options;
                this.cdr.detectChanges();
                return;
            }

            let valLowerCase = '';
            if (typeof data === 'string') {
                valLowerCase = data.toLowerCase();
            } else {
                valLowerCase = data['label'].toLowerCase();
            }

            this.filterOptions = this.options.pipe(
                map((_options: any[]) => {
                    return _options.filter((opt) => {
                        const optionValue = opt['label'].toLowerCase();
                        return optionValue.includes(valLowerCase) === true;
                    });
                }),
            );
            this.cdr.detectChanges();
        });
    }

    // called on init
    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;
        this.cellStartedEdit = this.params.cellStartedEdit;
        // Edit mode
        if (this.cellStartedEdit) {
            this.buildComboboxData();
        }
        if (this.value) {
            this.key = this.value.key;
            this.displayValue = this.value.value;
            this.searchText = this.value.value;
        }
    }

    // default type return: boolean
    isCancelBeforeStart?(): any {
        if (this.cellStartedEdit) {
            this.autocompleteTrigger.setFocus();
            this.autocompleteTrigger._handleFocus();
        }
    }
    isCancelAfterEnd?(): any {
        this.update1ForAll();
    }
    update1ForAll() {
        const data = this.datatableService.buildObjUpdate1ForAll(
            this.params.column.colDef.refData?.setting?.Setting,
            this.value,
            this.key,
            this.displayValue,
            this.params?.column?.colId,
        );
        if (!data) return;

        this.componentParent.update1ForAll.emit(data);
    }
    /**
     * buildComboboxData
     **/
    public buildComboboxData() {
        const settingCol = this.params.column.colDef.refData;

        if (this.datatableService.hasControlType(settingCol, 'autocomplete')) {
            const comboboxType = this.datatableService.getComboboxType(settingCol);
            let filterByValue = this.datatableService.getControlTypeFilterBy(settingCol);

            if (filterByValue) {
                const selectedRowData: any = this.params.node.data;
                let filterByFrom: string;
                if (selectedRowData[filterByValue]) {
                    filterByFrom =
                        typeof selectedRowData[filterByValue] === 'object'
                            ? selectedRowData[filterByValue]['key']
                            : selectedRowData[filterByValue];
                } else {
                    let ofModule = this.params.context.componentParent.currentModule;
                    filterByFrom = this.params.context.componentParent.parentInstance.data.widgetDataType.listenKeyRequest(
                        ofModule.moduleNameTrim,
                    )[filterByValue];
                }

                this.commonService
                    .getComboBoxDataByFilter(comboboxType.value.toString(), filterByFrom)
                    .subscribe((response: ApiResultResponse) => {
                        this.appErrorHandler.executeAction(() => {
                            this.onGetComboboxDataSuccess(response.item, comboboxType, filterByFrom);
                        });
                    });
            } else {
                this.commonService
                    .getListComboBox(comboboxType.value.toString())
                    .subscribe((response: ApiResultResponse) => {
                        this.appErrorHandler.executeAction(() => {
                            if (!Uti.isResquestSuccess(response)) {
                                return;
                            }
                            this.onGetComboboxDataSuccess(response.item, comboboxType);
                        });
                    });
            }
        }
    }
    /**
     * onGetComboboxDataSuccess
     * @param comboboxData
     * @param comboboxType
     * @param column
     * @param filterByValue
     */
    private onGetComboboxDataSuccess(comboboxData, comboboxType, filterByValue?) {
        let comboboxTypeName = comboboxType.name;
        if (filterByValue) {
            comboboxTypeName += '_' + filterByValue;
        }
        let options: any[] = comboboxData[comboboxTypeName];

        if (!options) {
            this.key = '';
            this.displayValue = '';
            this.options = Observable.of([]);
        } else {
            options = options.map((opt) => {
                return {
                    label: opt.textValue,
                    value: opt.idValue,
                };
            });
            this.options = Observable.of(options);
            this.filterOptions = this.options;
        }
    }

    private onKeydown(evt) {
        if (evt.key !== 'Enter' && evt.key !== 'Tab') {
            evt.stopPropagation();
        }
    }

    public selectOption($event: MatAutocompleteSelectedEvent) {
        this.key = $event.option.value.value;
        this.displayValue = $event.option.value.label;
        this.searchText = $event.option.value.label;
    }

    public displayFn(value: any): string {
        if (!value) return '';
        if (typeof value === 'string') return value;

        return value[this.displayValue];
    }

    public valuechange(event) {
        this.searchTextChanged.next(event);
    }
    /**
     * function unused
     *
     */
    focusIn?(): void {
        // console.log('Method not implemented.');
    }
    focusOut?(): void {
        // console.log('Method not implemented.');
    }
    afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
        // console.log('Method not implemented.');
    }
    /**
     * function unused
     */
}
