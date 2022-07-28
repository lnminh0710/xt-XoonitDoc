import { Component, Input, Output, OnInit, OnDestroy, ViewChild, EventEmitter, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as wjInput from 'wijmo/wijmo.angular2.input';
import isNil from 'lodash-es/isNil';
import { GlobalSettingService } from '@app/services';
import { Module } from '@app/models';
import { PropertyPanelDateFormatDialogComponent } from '../property-panel-date-format-dialog';
import { PropertyPanelGridValueDialogComponent } from '../property-panel-grid-value-dialog';
import { PropertyPanelOrderFieldDialogComponent } from '../property-panel-order-field-dialog';
import { PropertyPanelGridFieldDataDialogComponent } from '../property-panel-grid-field-data-dialog';

@Component({
    selector: 'property-panel-grid-value',
    styleUrls: ['./property-panel-grid-value.component.scss'],
    templateUrl: './property-panel-grid-value.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PropertyPanelGridValueComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() item: any;
    @Input() usingModule: Module;

    @Output() onPropertiesChange = new EventEmitter<any>();
    @Output() onPropertiesApply = new EventEmitter<any>();

    @ViewChild(wjInput.WjComboBox) wjCombobox: wjInput.WjComboBox;
    @ViewChild(wjInput.WjInputColor) wjInputColor: wjInput.WjInputColor;
    @ViewChild('propertyPanelGridValueDialog') propertyPanelGridValueDialog: PropertyPanelGridValueDialogComponent;
    @ViewChild('propertyPanelOrderFieldDialog') propertyPanelOrderFieldDialog: PropertyPanelOrderFieldDialogComponent;
    @ViewChild('propertyPanelGridFieldDataDialog') propertyPanelGridFieldDataDialogComponent: PropertyPanelGridFieldDataDialogComponent;
    @ViewChild('propertyPanelDateFormatDialog') propertyPanelDateFormatDialogComponent: PropertyPanelDateFormatDialogComponent;

    private multiSelectInputValue = '';

    constructor(
        private globalSettingService: GlobalSettingService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.onComboboxChanged = this.onComboboxChanged.bind(this);
        this.onColorChanged = this.onColorChanged.bind(this);
        this.itemFormatterFunc = this.itemFormatterFunc.bind(this);
    }

    ngAfterViewInit() {
        if (this.wjCombobox) {
            this.wjCombobox.selectedIndexChanged.removeHandler(this.onComboboxChanged);
            this.wjCombobox.selectedIndexChanged.addHandler(this.onComboboxChanged);
        }

        if (this.wjInputColor) {
            this.wjInputColor.valueChanged.removeHandler(this.onColorChanged);
            this.wjInputColor.valueChanged.addHandler(this.onColorChanged);
        }

        if (this.item.dataType === 'MultiSelect') {
            this.multiSelectInputValue = this.buildMultiSelectInputValue(this.item.options);
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    onCheckboxChanged(item) {
        item.dirty = true;
        this.onPropertiesChange.emit(true);
        this.changeDetectorRef.markForCheck();
    }

    onComboboxChanged(event) {
        this.item.value = event.selectedValue;
        this.item.dirty = true;
        $(this.wjCombobox.inputElement).addClass('prop-dirty');
        this.onPropertiesChange.emit(true);
        this.changeDetectorRef.markForCheck();
    }

    onInputChanged(newValue) {
        this.item.value = newValue;
        this.item.dirty = true;
        this.onPropertiesChange.emit(true);
        this.changeDetectorRef.markForCheck();
    }

    onColorChanged(event) {
        this.item.value = event.value;
        this.item.dirty = true;
        this.onPropertiesChange.emit(true);
        this.changeDetectorRef.markForCheck();
    }

    onPropMultiSelectComboboxChanged(propMultiSelectCombobox) {
        this.item.value = propMultiSelectCombobox.checkedItems;
        this.item.dirty = true;
        this.onPropertiesChange.emit(true);
        this.changeDetectorRef.markForCheck();
    }

    showMultiSelectDialog(item) {
        this.propertyPanelGridValueDialog.open(item);
    }

    showOrderByFieldDialog() {
        this.propertyPanelOrderFieldDialog.open();
    }

    showFieldFormatDialog(item) {
        this.propertyPanelGridFieldDataDialogComponent.open(item);
    }

    showDateFormatDialog(item) {
        this.propertyPanelDateFormatDialogComponent.open(item);
    }

    onDateFormatDialogApply(dateFormat) {
        this.item.value = dateFormat;
        this.item.dirty = true;
        this.onPropertiesChange.emit(true);
        this.changeDetectorRef.markForCheck();
    }

    public onOrderNumberFieldApply(data: any) {
        this.onPropertiesChange.emit(true);
        this.onPropertiesApply.emit(true);
    }

    onMultiSelectApply(data) {
        this.item.dirty = true;

        for (const opt of this.item.options) {
            opt.selected = !((isNil(opt.isEditable) || opt.isEditable === true) && (isNil(opt.isHidden) || opt.isHidden === false));
        }

        for (const opt of this.item.options) {
            if ((isNil(opt.isEditable) || opt.isEditable === true) && (isNil(opt.isHidden) || opt.isHidden === false)) {
                for (const dt of data) {
                    if (opt.value === dt.value) {
                        opt.selected = true;
                    }
                }
            }
        }

        this.multiSelectInputValue = this.buildMultiSelectInputValue(this.item.options);

        this.onPropertiesChange.emit(true);
        this.onPropertiesApply.emit(true);

        this.changeDetectorRef.markForCheck();
    }

    /**
     * onFieldFormatApply
     * @param data
     */
    onFieldFormatApply(data) {
        this.item.value = data;
        this.onPropertiesChange.emit(true);

        this.changeDetectorRef.markForCheck();
    }

    buildMultiSelectInputValue(options) {
        if (options)
            return options.filter(i => i.selected === true && (isNil(i.isHidden) || i.isHidden === false)).length + ' items selected';
        else
            return '';
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
