import { Input, HostListener, Directive, HostBinding, ElementRef, EventEmitter, Output, OnDestroy } from '@angular/core';
import {
    AppErrorHandler,  MenuStatusService
} from '@app/services';
import { Module, WidgetDetail, WidgetMenuStatusModel, WidgetType } from '@app/models';
import { Uti } from '@app/utilities';

@Directive({
    selector: '[widgetMenuProcess]',
    inputs: ['config: widgetMenuProcess']
})

export class XnWidgetMenuProcessDirective implements OnDestroy {

    @Input() menuStatusSettings: WidgetMenuStatusModel;

    private _data;
    @Input() set data(data: WidgetDetail) {
        this._data = data;
        this.buildMenuStatusSettings();
    }
    get data() {
        return this._data;
    }

    private _edittingWidgetMode : boolean;
    @Input() set edittingWidgetStatus(edittingWidgetMode: boolean) {
        this._edittingWidgetMode = edittingWidgetMode;
        this.buildMenuStatusSettings();
    }

    get edittingWidgetStatus() {
        return this._edittingWidgetMode;
    }

    private _displayReadonlyGridAsForm : boolean;
    @Input() set displayReadonlyGridAsForm(displayReadonlyGridAsForm: boolean) {
        this._displayReadonlyGridAsForm = displayReadonlyGridAsForm;
        this.buildMenuStatusSettings();
    }

    get displayReadonlyGridAsForm() {
        return this._displayReadonlyGridAsForm;
    }

    constructor (
        public menuStatusService: MenuStatusService,
        private appErrorHandler: AppErrorHandler) {
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private buildMenuStatusSettings() {
        const isSwitchedFromGridToForm = this.data.idRepWidgetType == WidgetType.DataGrid && this.displayReadonlyGridAsForm;
        this.menuStatusService.buildMenuStatusSettings(this.menuStatusSettings, this.data, isSwitchedFromGridToForm, this.edittingWidgetStatus);
    }

}
