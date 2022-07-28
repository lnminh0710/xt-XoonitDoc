import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { FileService, DocumentService } from '@app/services';
import {
    ImportUploadActionNames,
    SaveDocumentCaptureWhenImportingDoneAction,
    ImportUploadSuccessAction,
} from './import-upload.actions';
import { DocumentMyDMType } from '@app/app.constants';
import { ContractFormModel } from '@app/models/administration-document/document-form/contract-form.model';
import { InvoiceFormModel } from '@app/models/administration-document/document-form/invoice-form.model';
import { switchMap, map } from 'rxjs/operators';

@Injectable()
export class ImportUploadEffects {
    constructor(
        private actions$: Actions,
        private fileService: FileService,
        private documentService: DocumentService,
    ) {}

    @Effect()
    saveDocumentWhenImportingDone$ = this.actions$
        .pipe(
            ofType(ImportUploadActionNames.SAVE_DOCUMENT_CAPTURE_WHEN_IMPORTING_DONE),
            switchMap((action: SaveDocumentCaptureWhenImportingDoneAction) => {
                switch (action.payload.fileUpload.documentType) {
                    case DocumentMyDMType.Invoice:
                        return this.documentService
                            .saveDocumentInvoice({
                                mainDocument: action.payload.mainDocumentData,
                                documentTreeMedia: action.payload.documentTreeMediaData,
                                invoice: new InvoiceFormModel(),
                                personBank: null,
                                personBeneficiary: null,
                                personBeneficiaryComm: null,
                                personRemitter: null,
                                dynamicFields: null,
                                folderChange: null,
                            })
                            .pipe(
                                map((result) => {
                                    return new ImportUploadSuccessAction(action.type, result);
                                })
                            );

                    case DocumentMyDMType.Contract:
                        return this.documentService.saveDocumentContract({
                            mainDocument: action.payload.mainDocumentData,
                            documentTreeMedia: action.payload.documentTreeMediaData,
                            contract: new ContractFormModel(),
                            personContractor: null,
                            personContractingParty: null,
                            dynamicFields: null,
                            folderChange: null,
                        }).pipe(
                            map((result) => {
                                return new ImportUploadSuccessAction(action.type, result);
                            })
                        );

                    case DocumentMyDMType.OtherDocuments:
                        return this.documentService.saveOtherDocument({
                            mainDocument: action.payload.mainDocumentData,
                            documentTreeMedia: action.payload.documentTreeMediaData,
                            otherDocuments: {
                                idDocumentTree: action.payload.fileUpload.documentId.toString(),
                                idDocumentContainerScans: action.payload.mainDocumentData.idDocumentContainerScans,
                            },
                            personContact: null,
                            personPrivat: null,
                            dynamicFields: null,
                            folderChange: null,
                        }).pipe(
                            map((result) => {
                                return new ImportUploadSuccessAction(action.type, result);
                            })
                        );

                    default:
                        throw new Error(`Not supported this document type ${action.payload.fileUpload.documentType}`);
                }
            })
        );
}
