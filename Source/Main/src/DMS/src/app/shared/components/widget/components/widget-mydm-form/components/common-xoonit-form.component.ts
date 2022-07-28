import { ChangeDetectorRef, Directive, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { CommonFormComponent } from '@app/xoonit-share/processing-form/common-form/common-form.component';
import { DynamicField } from '@app/xoonit-share/processing-form/interfaces/dynamic-field.interface';

@Directive()
export abstract class CommonXoonitFormComponent extends CommonFormComponent {
    protected cdRef: ChangeDetectorRef;

    constructor(
        protected router: Router,
        protected injector: Injector,
    ) {
        super(router, injector);
        this._setXoonitFormDependencies();
    }

    public setToolbar(): void {
        this.toolbar = {
            scanQR: true,
            scanOCR: true,
            resetForm: true,
            clearForm: true,
            addDynamicField: true,
        };
    }

    public addDynamicFields(dynamicFields: DynamicField[]) {
        super.addDynamicFields(dynamicFields);
        this.cdRef.detectChanges();
    }

    private _setXoonitFormDependencies() {
        this.cdRef = this.injector.get(ChangeDetectorRef);
    }
}
