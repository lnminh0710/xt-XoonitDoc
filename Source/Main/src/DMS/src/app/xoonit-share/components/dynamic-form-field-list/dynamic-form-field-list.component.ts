import { AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChildren, QueryList } from '@angular/core';
import { SimpleFormComponent } from '../widget-dynamic-form/components/simple-form/simple-form.component';
import { GroupFormsDefinition } from '../../../models/common/group-forms-definition.model';
import { FocusControlEvent } from '../../../shared/components/xn-control/xn-dynamic-material-control/interfaces/focus-control-event.interface';
import { FormDefinitionType } from '../../../models/common/abstract-form-definition.model';

@Component({
    selector: 'dynamic-form-field-list',
    styleUrls: ['dynamic-form-field-list.component.scss'],
    templateUrl: 'dynamic-form-field-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFormFieldListComponent implements OnInit, AfterViewInit {

    private _formDefinition: GroupFormsDefinition;
    @Input() set formDefinition(data: GroupFormsDefinition){
        this._formDefinition = data;
    }

    get formDefinition() {
        return this._formDefinition;
    }

    @Output() initialized = new EventEmitter<Array<SimpleFormComponent>>();
    @Output() dataChanged = new EventEmitter<any>();
    @Output() onControlClick = new EventEmitter<FocusControlEvent>();
    @Output() onControlIconClick = new EventEmitter<FocusControlEvent>();

    @ViewChildren(SimpleFormComponent) simpleFormComps: QueryList<SimpleFormComponent>;

    public FORM_DEF_TYPE = FormDefinitionType;

    constructor() { }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
        this.initialized.next(this.simpleFormComps.toArray());
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
