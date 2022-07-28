import { Component, Input, Output, OnInit, OnDestroy, ViewChild, EventEmitter, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import * as wjInput from 'wijmo/wijmo.angular2.input';
import isNil from 'lodash-es/isNil';
import { GlobalSettingService } from '@app/services';
import { Module } from '@app/models';
import { ControlProperty } from '../../../../models/control-property';

@Component({
    selector: 'property-control-panel-grid-value',
    styleUrls: ['./property-control-panel-grid-value.component.scss'],
    templateUrl: './property-control-panel-grid-value.component.html',
})

export class PropertyControlPanelGridValueComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() item: ControlProperty;
    @Input() usingModule: Module;

    @Output() onPropertiesChange = new EventEmitter<ControlProperty>();
    @Output() onPropertiesApply = new EventEmitter<any>();

    @ViewChild(wjInput.WjComboBox) wjCombobox: wjInput.WjComboBox;
    @ViewChild(wjInput.WjInputColor) wjInputColor: wjInput.WjInputColor;
    
    private multiSelectInputValue = '';

    constructor(
        private globalSettingService: GlobalSettingService,
        private changeDetectorRef: ChangeDetectorRef
    ) {
        this.onColorChanged = this.onColorChanged.bind(this);
    }

    ngAfterViewInit() {      

        if (this.wjInputColor) {
            this.wjInputColor.valueChanged.removeHandler(this.onColorChanged);
            this.wjInputColor.valueChanged.addHandler(this.onColorChanged);
        }

        //if (this.item.controlType === 'MultiSelect') {
        //    this.multiSelectInputValue = this.buildMultiSelectInputValue(this.item.options);
        //}
    }

    ngOnInit() {
    }

    ngOnDestroy() {
    }

    onCheckboxChanged(item) {
        item.dirty = true;
        this.onPropertiesChange.emit(this.item);
    }    

    onInputChanged(newValue) {
        this.item.value = newValue;
        this.item.dirty = true;
        this.onPropertiesChange.emit(this.item);
    }

    onColorChanged(event) {
        this.item.value = event.value;
        this.item.dirty = true;
        this.onPropertiesChange.emit(this.item);
    }

    onPropMultiSelectComboboxChanged(propMultiSelectCombobox) {
        this.item.value = propMultiSelectCombobox.checkedItems;
        this.item.dirty = true;
        this.onPropertiesChange.emit(this.item);
    }

    onComboBoxChanged(event) {
        this.item.value = event.selectedValue;
        this.item.dirty = true;
        this.onPropertiesChange.emit(this.item);
    }

    buildMultiSelectInputValue(options) {
        if (options)
            return options.filter(i => i.selected === true && (isNil(i.isHidden) || i.isHidden === false)).length + ' items selected';
        else
            return '';
    }
}
