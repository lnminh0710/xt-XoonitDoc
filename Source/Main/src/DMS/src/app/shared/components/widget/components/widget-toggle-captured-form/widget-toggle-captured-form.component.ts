import { Component, OnInit, OnDestroy, ChangeDetectorRef, TemplateRef, EventEmitter, ViewChild, Output, AfterViewInit } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { DocumentsState, FormState } from '@app/state-management/store/models/administration-document/state/document-forms.state.model';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { AdministrationDocumentActions, AdministrationDocumentActionNames, CustomAction } from '@app/state-management/store/actions';
import { ToasterService } from 'angular2-toaster';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { MessageModal, DocumentProcessingTypeEnum, DocumentFormNameEnum } from '@app/app.constants';
import { Uti } from '@app/utilities';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'widget-toggle-captured-form',
    styleUrls: ['./widget-toggle-captured-form.component.scss'],
    templateUrl: './widget-toggle-captured-form.component.html'
})
export class WidgetToggleCapturedFormComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {

    public isDisabledButton: boolean;
    private _toggleExpanded: boolean;

    constructor(
        protected router: Router,
        private cdRef: ChangeDetectorRef,
        private store: Store<AppState>,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
        private toastService: ToasterService,
    ) {
        super(router);
        this.isDisabledButton = true;
        this._toggleExpanded = false;
    }

    public ngOnInit(): void {
        this.registerSubscriptions();
    }

    ngAfterViewInit(): void {

    }

    public ngOnDestroy(): void {
        super.onDestroy();
    }

    public toggleCapturedForm($event) {
        if (this.isDisabledButton) return;

        this._toggleExpanded = !this._toggleExpanded;

        this.store.dispatch(this.administrationDocumentActions.expandCapturedForm(this._toggleExpanded));
    }

    private registerSubscriptions() {
        this.administrationDocumentSelectors.actionOfType$(AdministrationDocumentActionNames.CHANGE_MODE_SELECTABLE_FOLDER)
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe(action => {
                this.isDisabledButton = true;
            });

        this.administrationDocumentSelectors.capturedFormMode$
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe(capturedFormMode => {
                this._toggleExpanded = capturedFormMode === CapturedFormModeEnum.Updated ? true : false ;
            });

        this.administrationDocumentSelectors.actionOfType$(AdministrationDocumentActionNames.ENABLE_BUTTON_TOGGLED_CAPTURED_FORM)
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe((action: CustomAction) => {
                const payload = action.payload as { isEnabled: boolean };
                this.isDisabledButton = !payload.isEnabled;

                // just update for synchronous data
                this._toggleExpanded = payload.isEnabled;
            });

        this.administrationDocumentSelectors.folder$
            .pipe(
                takeUntil(this.getUnsubscriberNotifier())
            )
            .subscribe(folder => {
                this.isDisabledButton = folder ? false : true;
            });
    }

}
