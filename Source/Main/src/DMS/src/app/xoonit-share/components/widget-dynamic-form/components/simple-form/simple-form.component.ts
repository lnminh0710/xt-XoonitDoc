import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Inject,
    Injector,
    Input,
    OnInit,
    Output
} from '@angular/core';
import { Router } from '@angular/router';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { AppState } from '@app/state-management/store';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import {
    CommonFormHandlerV2,
    ICommonFormHandlerV2,
} from '@app/xoonit-share/processing-form-v2/handlers/common-form-handler.service';
import { FORM_HANDLER, IFormHandlerV2 } from '@app/xoonit-share/processing-form-v2/handlers/mydm-form-handler.interface';
import { Store } from '@ngrx/store';
import {
    IAutocompleteMaterialControlConfig,
    IMaterialControlConfig,
} from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';
import { takeUntil } from 'rxjs/operators';
import { WidgetDynamicFormSelectors } from '../../widget-dynamic-form.state/widget-dynamic-form.selectors';
import { CommonFormComponent } from '../common-form/common-form.component';
import { FormFieldDefinition } from '../../../../../models/common/form-field-definition.model';

@Component({
    selector: 'simple-form',
    styleUrls: ['simple-form.component.scss'],
    templateUrl: 'simple-form.component.html',
    providers: [{ provide: FORM_HANDLER, useClass: CommonFormHandlerV2 }],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleFormComponent extends CommonFormComponent implements OnInit {

    @Input() set formGroupDefinition(formGroupDef: DynamicFormGroupDefinition) {
        this.formGroupConfigDef = this.formHandler.buildFormGroupDefinition(formGroupDef);
    }

    @Input() set formDefinition(formDef: FormFieldDefinition) {
        const formGroupDef: DynamicFormGroupDefinition = {
            methodName: '',
            object: '',
            formDefinitions: [formDef],
        };

        this.formGroupConfigDef = this._commonFormHandler.buildFormGroupDefinition(formGroupDef);
    }

    @Input() showTitle = true;
    @Output() outputData = new EventEmitter<any>();

    constructor(
        protected router: Router,
        protected injector: Injector,
        @Inject(FORM_HANDLER) private formHandler: ICommonFormHandlerV2,
        private store: Store<AppState>,
        private widgetDynamicFormSelectors: WidgetDynamicFormSelectors,
        private administrationDocumentSelectors: AdministrationDocumentSelectors
    ) {
        super(router, injector);
        this.setup();
        this.openForm();
    }

    ngOnInit() {
        super.ngOnInit();
        this.subscribeValueChange();
    }
    

    private subscribeValueChange() {
        if (!this.formGroupConfigDef || !this.formGroupConfigDef.formConfigDefs ||
            !this.formGroupConfigDef.formConfigDefs.length ||
            !this.formGroupConfigDef.formConfigDefs[0].formGroup) return;

        this.formGroupConfigDef.formConfigDefs[0].formGroup.valueChanges.debounceTime(500).subscribe(() => {
            if (this.formGroupConfigDef.formConfigDefs[0].formGroup.pristine) return;
            this.outputData.emit(this.formGroupConfigDef.formConfigDefs[0].formGroup.value);
        });
    }

    protected registerSubscriptions() {
        this.administrationDocumentSelectors?.folder$
            ?.pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((folder: DocumentTreeModel) => {
                this.documentMetadata.folder = folder;
            });
    }

    protected configFormHandlerDependency(): IFormHandlerV2 {
        return this.formHandler;
    }

    public configMaterialControlConfigMiddleware(): (opts: { config: IMaterialControlConfig; columnDefinitions: ColumnDefinition[]; }) => void {
        return null;
    }

    public shouldAddColumnToForm(columnSetting: ColumnDefinition) {
        if (!columnSetting.setting) {
            return false;
        }

        if (columnSetting.setting.DisplayField.Hidden === '1' && columnSetting.setting.DisplayField.ReadOnly === '1') {
            return false;
        }

        return true;
    }

    public configAutocompleteControl(autocompleteCtrl: IAutocompleteMaterialControlConfig): void {}

    public setColumnSettings(formGroupDef: DynamicFormGroupDefinition) {
        this.formGroupConfigDef = this.formHandler.buildFormGroupDefinition(formGroupDef);
        this.cdRef.detectChanges();
    }
    
}
