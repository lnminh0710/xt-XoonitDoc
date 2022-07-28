import { OnInit, OnDestroy, Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { WidgetDocumentForm } from '../widget-document-form.component';
import { Store } from '@ngrx/store';
import { AdministrationDocumentActions } from '@app/state-management/store/actions/administration-document/administration-document.action';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { AppState } from '@app/state-management/store';
import { DocumentContainerOCRModel } from '@app/models/administration-document/document-container-ocr.model';
import { Router } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'widget-classification',
    styleUrls: ['./widget-classification.component.scss'],
    templateUrl: './widget-classification.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})


export class WidgetClassificationComponent extends WidgetDocumentForm implements OnInit, OnDestroy {

    constructor(
        protected router: Router,
        protected store: Store<AppState>,
        protected administrationActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        private cdRef: ChangeDetectorRef,
    ) {
        super(router, store, administrationActions, administrationSelectors, null, null);
    }

    private _idRepDocumentType: string;
    set idRepDocumentType(value) {
        if (value === this._idRepDocumentType) return;
        this._idRepDocumentType = value ? value : null;

        if (!this.documentTypeList || this._documentContainerOcr.IdRepDocumentType.toString() === value) return;

        const documentType = this.documentTypeList.find(x => x.idValue === value);
        const newDocContainerOcr = { ...this._documentContainerOcr };
        newDocContainerOcr.IdRepDocumentType = value;
        newDocContainerOcr.DocumentType = documentType ? documentType.textValue : '';

        const docOcr = {
            idDocumentContainerOcr: +this._documentContainerOcr.IdDocumentContainerOcr,
            idRepDocumentType: Number(value),
            isActive: true,
        } as DocumentContainerOCRModel;
        this.store.dispatch(this.administrationActions.saveDocumentContainerOcrAction([docOcr], newDocContainerOcr));
    }
    get idRepDocumentType() {
        return this._idRepDocumentType;
    }
    documentTypeList: any[];
    // private _documentContainerOcr: DocumentContainerOcrStateModel;


    ngOnInit(): void {
        this.initFunction();
    }

    ngOnDestroy(): void {
        super.onDestroy();
    }

    onSubcribeAction() {

    }

    initFunction() {
        this.administrationSelectors.documentContainerOcr$
            .pipe(
                filter(documentContainerOcr => !!documentContainerOcr &&
                    (!this._documentContainerOcr || documentContainerOcr.IdRepDocumentType !== this._documentContainerOcr.IdRepDocumentType)),
                takeUntil(super.getUnsubscriberNotifier()),
            )
            .subscribe(documentContainerOcr => {
                this._documentContainerOcr = documentContainerOcr;
                this.idRepDocumentType = documentContainerOcr.IdRepDocumentType.toString()
            });


        this.administrationSelectors.listDocumentType$
            .pipe(
                takeUntil(super.getUnsubscriberNotifier())
            )
            .subscribe(listDocumentType => {
                if (!listDocumentType) {
                    this.store.dispatch(this.administrationActions.setLisDocumentTypeAction());
                    return;
                }
                this.documentTypeList = listDocumentType;
                this.cdRef.detectChanges();
            });
    }
}
