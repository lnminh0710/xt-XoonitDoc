import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormFieldDefinition } from '@app/models/common/form-field-definition.model';
import { DocumentMetadata } from '@app/xoonit-share/processing-form/interfaces/document-metadata.interface';
import { SimpleFormComponent } from '../widget-dynamic-form/components/simple-form/simple-form.component';
import { CommonFormComponent } from '../widget-dynamic-form/components/common-form/common-form.component';
import { FocusControlEvent } from '../../../shared/components/xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';

@Component({
    selector: 'dynamic-form-field',
    styleUrls: ['dynamic-form-field.component.scss'],
    templateUrl: 'dynamic-form-field.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormFieldComponent implements OnInit, AfterViewInit {

    @Input() formDefinition: FormFieldDefinition;
    @Output() initialized = new EventEmitter<CommonFormComponent>();
    @Output() dataChanged = new EventEmitter<any>();
    @Output() onControlClick = new EventEmitter<FocusControlEvent>();
    @Output() onControlIconClick = new EventEmitter<FocusControlEvent>();

    @ViewChild(SimpleFormComponent) simpleFormComp: SimpleFormComponent;

    constructor() { }

    ngOnInit() {
        if (!this.formDefinition) return;

        this.formDefinition.setDocumentMetadata = this._setDocumentMetadata.bind(this);
        this.formDefinition.validate = this._validateBeforeSave.bind(this);
        this.formDefinition.getFormatDataSave = this._getFormatDataSave.bind(this);
        this.formDefinition.reset = this._resetForm.bind(this);
        this.formDefinition.clear = this._clear.bind(this);
    }

    ngAfterViewInit(): void {
        this.initialized.next(this.simpleFormComp);
    }

    private _validateBeforeSave(): boolean {
        return this.simpleFormComp.validateDataBeforeSaving();
    }

    private _getFormatDataSave(): { [key: string]: any } {
        return this.simpleFormComp.getDataForSaving();
    }

    private _resetForm(): void {
        this.simpleFormComp.resetDataForm();
    }

    private _clear(): void {
        this.simpleFormComp.clearForm();
    }

    private _setDocumentMetadata(metadata: DocumentMetadata) {
        this.simpleFormComp.updateDocumentMetadata(metadata);
    }

    public dataFormChanged(data) {
        this.dataChanged.emit(data);
    }

    public onClickChanged($event: FocusControlEvent) {
        this.onControlClick.emit($event);
    }

    public onIconClickChanged($event: FocusControlEvent) {
        this.onControlIconClick.emit($event);
    }
}
