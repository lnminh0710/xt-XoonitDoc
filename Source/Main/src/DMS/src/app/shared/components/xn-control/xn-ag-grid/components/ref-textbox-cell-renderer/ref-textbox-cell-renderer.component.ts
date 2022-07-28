import { Component, ViewChild, ElementRef, HostListener } from "@angular/core";
import { ICellRendererAngularComp, ICellEditorAngularComp } from "ag-grid-angular";
import { DatatableService, CommonService, AppErrorHandler } from '@app/services';
import { ApiResultResponse } from '@app/models';
import { Uti } from '@app/utilities/uti';
import { BaseAgGridCellComponent } from '../../shared/base-ag-grid-cell-component';
import { setTimeout } from "core-js";

@Component({
    selector: 'ref-textbox-cell-renderer',
    templateUrl: './ref-textbox-cell-renderer.html',
    styleUrls: ['./ref-textbox-cell-renderer.scss'],
})
export class RefTextboxCellRenderer extends BaseAgGridCellComponent<any> implements ICellRendererAngularComp, ICellEditorAngularComp {

    public options: Array<any> = [];
    public displayValue: string;
    public showDropdown = false;

    @HostListener('document:click', ['$event']) onDocumentClick(event) {
        let id = 'wj-dropdown-panel-' + this.params.column.colDef.field;
        if (!this.elementRef.nativeElement.contains(event.target)
            && event.target.parentElement.id !== id
            && !event.target.classList.contains('wj-glyph-down')
            && !event.target.classList.contains('wj-btn')) {
            this.closeDropdown();
        }
    }

    constructor(
        private datatableService: DatatableService,
        private commonService: CommonService,
        private appErrorHandler: AppErrorHandler,
        private elementRef: ElementRef
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
            setTimeout(() => {
                $(this.elementRef.nativeElement).find('input').focus();
            }, 50);
        }
        if (this.value) {
            this.displayValue = this.value;
        }
    }

    refresh(params: any): boolean {
        return false;
    }

    /**
     * buildComboboxData
     **/
    public buildComboboxData() {
        const settingCol = this.params.column.colDef.refData;

        if (this.datatableService.hasControlType(settingCol, 'RefTextbox')) {
            const comboboxType = this.datatableService.getComboboxType(settingCol);
            this.commonService.getListComboBox(comboboxType.value.toString())
                .subscribe((response: ApiResultResponse) => {
                    this.appErrorHandler.executeAction(() => {
                        if (!Uti.isResquestSuccess(response)) {
                            return;
                        }

                        this.buildDropdown(response.item[comboboxType.name], this.params.column.colDef.field);
                    });
                });
        }
    }

    private buildDropdown(data: any[], field) {
        if (!data.length || document.getElementById('wj-dropdown-panel-' + this.params.column.colDef.field)) {
            return;
        }

        setTimeout(() => {
            let thisElmData = this.elementRef.nativeElement.getBoundingClientRect();

            let div = document.createElement("div");
            div.className = 'wj-dropdown-panel wj-content wj-control wj-listbox';
            div.id = 'wj-dropdown-panel-' + field;
            div.tabIndex = 0;
            div.style.minWidth = thisElmData.width + 'px';
            div.style.maxHeight = "200px";
            div.style.color = "rgb(34, 34, 34)";
            div.style.backgroundColor = "rgb(255, 255, 255)";
            div.style.fontFamily = "Tahoma";
            div.style.fontSize = "12px";
            div.style.fontWeight = "400";
            div.style.fontStyle = "normal";
            div.style.zIndex = "1500";
            div.style.position = "absolute";

            let innerHTML = '';
            for (let i = 0; i < data.length; i++) {
                innerHTML += `<div class="wj-listbox-item wj-listbox-item-` + field + `" tabindex="-1">` + data[i]['textValue'] + `</div>`;
            }

            div.innerHTML = innerHTML;

            div.style.top = thisElmData.top + 26 + 'px';
            div.style.left = thisElmData.left + 'px';

            document.body.appendChild(div);

            div.focus();

            $(div).on('keydown', this.onKeydown.bind(this, field));

            $('.wj-listbox-item-' + field).on('click', (e) => {
                this.displayValue = e.target.innerText;

                this.closeDropdown();
            });
        }, 50);
    }

    public toggleDropdown() {
        let id = 'wj-dropdown-panel-' + this.params.column.colDef.field;
        let element = document.getElementById(id);
        if (element) {
            this.closeDropdown();
        } else {
            this.buildComboboxData();
        }
    }

    private closeDropdown() {
        let id = 'wj-dropdown-panel-' + this.params.column.colDef.field;
        let element = document.getElementById(id);
        if (element) {
            element.parentNode.removeChild(element);
        }
    }

    private onKeydown(field, e) {
        //e.preventDefault();
        //e.stopPropagation();
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            let items = $('.wj-listbox-item-' + field);
            if (items.length) {
                let activeItem = items.filter('.wj-state-selected');
                let willSelectItem: any;
                if (activeItem.length) {
                    activeItem.removeClass('wj-state-selected');

                    if (e.key === 'ArrowDown') {
                        let nextItem = activeItem.next();
                        if (nextItem.length) {
                            willSelectItem = nextItem;
                        } else {
                            willSelectItem = $(items.get(0));
                        }
                    } else {
                        let nextItem = activeItem.prev();
                        if (nextItem.length) {
                            willSelectItem = nextItem;
                        } else {
                            willSelectItem = $(items.get(items.length - 1));
                        }
                    }
                } else {
                    if (e.key === 'ArrowDown') {
                        willSelectItem = $(items.get(0));
                    } else {
                        willSelectItem = $(items.get(items.length - 1));
                    }
                }

                if (willSelectItem) {
                    willSelectItem.addClass('wj-state-selected');
                    this.displayValue = willSelectItem.text();
                }
            }
        }

        if (e.key === 'Enter') {
            let items = $('.wj-listbox-item-' + field);
            if (items.length) {
                let activeItem = items.filter('.wj-state-selected');
                if (activeItem.length) {
                    activeItem.click();

                    setTimeout(() => {
                        this.params.api.stopEditing();
                        this.params.api.tabToNextCell();
                    }, 50);
                }
            }
        }
    }

    private unbindEvents() {

    }

    /**
     * getValue
     * */
    getValue(): any {
        return this.displayValue;
    }
}
