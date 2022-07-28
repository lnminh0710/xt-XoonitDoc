import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ICellRendererAngularComp, ICellEditorAngularComp } from 'ag-grid-angular';
import * as wjcInput from 'wijmo/wijmo.input';
import { DatatableService, CommonService, AppErrorHandler } from '@app/services';
import { ApiResultResponse } from '@app/models';
import { Uti } from '@app/utilities/uti';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';

@Component({
    selector: 'dropdown-cell-renderer',
    templateUrl: './dropdown-cell-renderer.html',
    styleUrls: ['./dropdown-cell-renderer.scss'],
})
export class DropdownCellRenderer
    extends BaseAgGridCellComponent<any>
    implements ICellRendererAngularComp, ICellEditorAngularComp {
    public options: Array<any> = [];
    public key: string;
    public displayValue: string;

    private cellCombo: wjcInput.ComboBox;
    @ViewChild('cellCombo') set content(content: wjcInput.ComboBox) {
        this.cellCombo = content;
    }

    constructor(
        private datatableService: DatatableService,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        private cdr: ChangeDetectorRef,
    ) {
        super();
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
        }

        if (this.isOcr()) {
            this.cellStartedEdit = true;

            const comboboxtype = this.value.comboboxType.value.toLowerCase().trim();
            this.commonService.getListComboBox(comboboxtype).subscribe((response: ApiResultResponse) => {
                if (response.statusCode !== 1 || !response.item[comboboxtype]) return;

                const data = response.item[comboboxtype];
                const item = data.find((x) => x.textValue.toLowerCase() === this.value.valueOcr.toLowerCase().trim());
                if (item) {
                    this.key = item.idValue;
                    this.displayValue = item.textValue;
                } else {
                    this.key = '';
                    this.displayValue = '';
                }
                this.setValue({
                    key: this.key,
                    value: this.displayValue,
                    options: [],
                });
                this.params.node.setDataValue(this.params.column.colId, this.value);
                this.implementWhenBlur();
            });

            return;
        }

        setTimeout(() => {
            if (this.cellCombo && this.cellCombo.hostElement) {
                this.cellCombo.hostElement.addEventListener('keydown', this.onKeydown.bind(this));
            }
        });
    }

    isCancelBeforeStart?(): any {
        if (this.cellStartedEdit) {
            this.cellCombo._setFocus = true;
        }
    }
    focusIn?(): void {
        // console.log('focusIn');
    }
    focusOut?(): void {
        console.log('focusOut');
    }
    isCancelAfterEnd?(): any {
        this.implementWhenBlur();
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

    refresh(params: any): boolean {
        return false;
    }

    /**
     * buildComboboxData
     **/
    public buildComboboxData() {
        const settingCol = this.params.column.colDef.refData;

        if (this.datatableService.hasControlType(settingCol, 'Combobox')) {
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
            this.options = [];
        } else {
            options = options.map((opt) => {
                return {
                    label: opt.textValue,
                    value: opt.idValue,
                };
            });
            this.options = options;

            setTimeout(() => {
                if (this.cellCombo) {
                    this.cellCombo.itemsSource = options;
                    if (this.cellCombo.itemsSource.length === 1) {
                        this.cellCombo.selectedIndex = 0;
                    } else {
                        this.cellCombo.isDroppedDown = true;
                    }
                }
            }, 200);
        }
    }

    /**
     * START: set out focus when select option
     */
    public onLostFocus(key) {
        this.componentParent.stopEditing();
    }
    /**
     * END: set out focus when select option
     */

    private onKeydown(evt) {
        if (evt.key !== 'Enter' && evt.key !== 'Tab') {
            evt.stopPropagation();
        }
    }

    /**
     * getValue
     * */
    getValue(): any {
        return {
            key: this.key,
            value: this.displayValue,
            options: [],
        };
    }

    private isOcr(): boolean {
        return this.value && this.value.type === 'ocr' && this.value.valueOcr && this.value.comboboxType;
    }
    private implementWhenBlur() {
        if (this.isOcr()) return;

        this.update1ForAll();
        this.datatableService.influencingField(
            this.params.column.colDef.refData?.setting?.Setting,
            this.params.node.data,
            this.params?.column?.colId,
            this.displayValue,
        );
    }
}
