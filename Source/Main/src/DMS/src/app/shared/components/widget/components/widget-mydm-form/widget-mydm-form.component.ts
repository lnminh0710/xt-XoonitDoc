import {
    Component,
    OnInit,
    ViewContainerRef,
    ViewChild,
    ComponentFactoryResolver,
    OnDestroy,
    ComponentRef,
    Type,
    ChangeDetectionStrategy,
    Input,
    Injector,
    Output,
    EventEmitter,
} from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { BaseMyDmFormComponent } from '@app/xoonit-share/processing-form/base/base-mydm-form.component';
import { ReducerManagerDispatcher, Action, Store } from '@ngrx/store';
import { filter, takeUntil, take } from 'rxjs/operators';
import {
    CustomAction,
    AdministrationDocumentActionNames,
    AdministrationDocumentActions,
    LayoutInfoActions,
} from '@app/state-management/store/actions';
import { ContractFormComponent } from './components/contract-form/contract-form.component';
import { InvoiceFormComponent } from './components/invoice-form/invoice-form.component';
import { OtherDocumentsFormComponent } from './components/other-documents-form/other-documents-form.component';
import { IMyDMForm, IToolbarForm } from '@app/xoonit-share/processing-form/interfaces/mydm-form.interface';
import { IconNames } from '@app/app-icon-registry.service';
import { ISaveFormHandler } from '@app/xoonit-share/processing-form/interfaces/save-form-handler.interface';
import { isNullOrUndefined } from 'util';
import {
    AppGlobalActionNames,
    AppInjectWigetInstanceIsAbleToSaveAction,
} from '@app/state-management/store/actions/app-global/app-global.actions';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { IOpenFormParamsAction } from '@app/xoonit-share/processing-form/interfaces/open-form-params-action.interface';
import {
    WidgetMyDmFormActionNames,
    OpenFormMethodEnum,
    ShowMyDMFormUIAction,
    HideMyDMFormUIAction,
    OpenMyDMFormAction,
} from './actions/widget-mydm-form.actions';
import { MatDialog } from '@xn-control/light-material-ui/dialog';
import { DynamicFieldDialogComponent } from '@app/xoonit-share/components/dynamic-field-dialog/dynamic-field-dialog.component';
import {
    DynamicField,
    DynamicFieldItemDropdown,
} from '@app/xoonit-share/processing-form/interfaces/dynamic-field.interface';
import { AppState } from '@app/state-management/store';
import { Observable } from 'rxjs';
import { cloneDeep } from 'lodash-es';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DocumentMetadata } from '@app/xoonit-share/processing-form/interfaces/document-metadata.interface';
import { DocumentMyDMType } from '@app/app.constants';
import { CommonWidgetProcessingFormContainer } from '@app/xoonit-share/processing-form/common-widget-processing-form-container.component';

@Component({
    selector: 'widget-mydm-form',
    templateUrl: 'widget-mydm-form.component.html',
    styleUrls: ['widget-mydm-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetMyDmFormComponent extends CommonWidgetProcessingFormContainer implements OnInit, OnDestroy {
    public IconNamesEnum = IconNames;
    @Output() onMaximizeWidget = new EventEmitter<any>();
    @ViewChild('formContainer', { read: ViewContainerRef }) formContainer: ViewContainerRef;
    public dynamicTypeList: DynamicFieldItemDropdown[];
    public isFullScreen = false;

    constructor(protected router: Router, protected injector: Injector) {
        super(router, injector);
        this.checkIsShowRollbackButton();
    }

    protected registerSubscriptionsOnCreated() {
        super.registerSubscriptionsOnCreated();
    }

    protected setViewContainerRef(): ViewContainerRef {
        return this.formContainer;
    }

    protected setSupportedDocumentTypeForm(): Map<DocumentMyDMType, Type<IMyDMForm<IToolbarForm>>> {
        return new Map<DocumentMyDMType, Type<IMyDMForm<IToolbarForm>>>()
            .set(DocumentMyDMType.Invoice, InvoiceFormComponent)
            .set(DocumentMyDMType.Contract, ContractFormComponent)
            .set(DocumentMyDMType.OtherDocuments, OtherDocumentsFormComponent);
    }

    private checkIsShowRollbackButton() {
        this._isShowRollbackButton = this.ofModule && this.ofModule.moduleName == 'Document';
    }

    public ngOnInit() {
        super.ngOnInit();
        this.store.dispatch(this.administrationActions.widgetMyDMFormInitSuccessAction(true));
        this.store.dispatch(new AppInjectWigetInstanceIsAbleToSaveAction(this));
    }

    validateBeforeSave() {
        return this.componentRef?.instance.validateBeforeSave?.();
    }

    validateForm() {
        return this.componentRef?.instance.validateForm?.();
    }

    getDataSave() {
        return this.componentRef?.instance.getDataSave?.();
    }

    reset() {
        return this.componentRef?.instance.reset();
    }

    public ngOnDestroy(): void {
        super.onDestroy();
    }

    public addDynamicField($event: Event) {
        this.store.dispatch(this.administrationActions.getDocumentDynamicCombobox(this.folder.idDocument));
        this.administrationSelectors
            .actionSuccessOfSubtype$(AdministrationDocumentActionNames.GET_DOCUMENT_DYNAMIC_COMBOBOX)
            .pipe(take(1))
            .subscribe((action: CustomAction) => {
                const payload = action.payload as DynamicFieldItemDropdown[];
                this._openDynamicFieldDialog(payload);
            });
    }

    private _openDynamicFieldDialog(payload: DynamicFieldItemDropdown[]) {
        const dialogRef = this.dialog.open<DynamicFieldDialogComponent, DynamicFieldItemDropdown[]>(
            DynamicFieldDialogComponent,
            {
                data: payload,
                width: `${381 + 24 + 5}px`, // design width 381px + padding mat-dialog-container 24px + offset 5px
                height: `${206 + 24 + 40}px`, // design height 206px + padding mat-dialog-container 24px + offset 40px of fontsize and form
                maxWidth: '100%',
                disableClose: true,
            },
        );

        dialogRef.componentInstance.dynamicFieldAdded
            .pipe(takeUntil(dialogRef.beforeClosed()))
            .subscribe((newDynamicField) => {
                this._listenNewDynamicFieldAdded(newDynamicField);
            });

        dialogRef
            .beforeClosed()
            .pipe(
                filter((dynamicFields) => dynamicFields && dynamicFields.length > 0),
                take(1),
            )
            .subscribe((dynamicFields) => {
                dynamicFields.forEach((dynamicField) => {
                    dynamicField.idDocumentTree = this.folder.idDocument.toString();
                });
                this.componentRef?.instance.addDynamicFields(dynamicFields);
            });
    }

    private _listenNewDynamicFieldAdded(newDynamicField: DynamicField) {
        const dynamicField = cloneDeep(newDynamicField);
        dynamicField.idDocumentTree = this.folder.idDocument.toString();

        this.componentRef?.instance.addDynamicFields([dynamicField]);
    }

    public expandWidget() {
        this.isFullScreen = !this.isFullScreen;
        this.onMaximizeWidget.emit({
            isMaximized: this.isFullScreen,
        });
    }
}
