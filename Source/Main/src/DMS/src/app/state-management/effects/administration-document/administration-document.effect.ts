import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Effect, Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import {
    AdministrationDocumentActions,
    AdministrationDocumentActionNames,
} from '@app/state-management/store/actions/administration-document';
import { GlobalSearchService, DocumentService } from '@app/services';
import { CommonService } from '@app/services';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { TreeNode } from '@circlon/angular-tree-component';
import { SaveDocumentContractForms } from '@app/state-management/store/models/administration-document/document-contract.model.payload';
import { SaveOtherDocumentForms } from '@app/state-management/store/models/administration-document/document-other.model.payload';
import { ComboBoxTypeConstant } from '@app/app.constants';
import { GetDocumentTreeOptions } from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import { SaveDocumentInvoiceModel } from '@app/state-management/store/models/administration-document/document-invoice.model.payload';
import { DocumentImageOcrService } from '@app/pages/private/modules/image-control/services';
import { DetailedDocumentDataState } from '@app/state-management/store/models/administration-document/state/detailed-document-data.state.model';
import { switchMap, map, catchError } from 'rxjs/operators';

@Injectable()
export class AdministrationDocumentEffects {
    constructor(
        private store: Store<AppState>,
        private actions$: Actions,
        private administrationDocumentActions: AdministrationDocumentActions,
        private globalSearchService: GlobalSearchService,
        private documentService: DocumentService,
        private documentImageOcrService: DocumentImageOcrService,
        private commonService: CommonService,
    ) {}

    @Effect()
    getDocumentSummary$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_DOCUMENT_SUMMARY),
        switchMap((action: any) => {
            return this.documentService.getDocumentSummary().pipe(
                map((value) => {
                    if (!value)
                        return this.administrationDocumentActions.administrationDocumentFailedAction(
                            action.type,
                            value,
                        );
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, value);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    saveDocumentForms$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS),
        switchMap((action: any) => {
            const payload = action.payload as SaveDocumentInvoiceModel;

            return this.documentService.saveDocumentInvoice(payload).pipe(
                map((value: any[]) => {
                    // save incompletely of invoice
                    if (value[0] === null)
                        return this.administrationDocumentActions.administrationDocumentFailedAction(
                            action.type,
                            value,
                        );
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, value);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    saveDocumentContractForms$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS),
        switchMap((action: any) => {
            const payload = action.payload as SaveDocumentContractForms;

            return this.documentService.saveDocumentContract(payload).pipe(
                map((value: any[]) => {
                    // save incompletely of contract
                    if (value[0] === null)
                        return this.administrationDocumentActions.administrationDocumentFailedAction(
                            action.type,
                            value,
                        );
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, value);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    saveOtherDocumentForms$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS),
        switchMap((action: any) => {
            const payload = action.payload as SaveOtherDocumentForms;

            return this.documentService.saveOtherDocument(payload).pipe(
                map((value: any[]) => {
                    // save incompletely of other document
                    if (value[0] === null)
                        return this.administrationDocumentActions.administrationDocumentFailedAction(
                            action.type,
                            value,
                        );
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, value);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getDocumentTree$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_DOCUMENT_TREE),
        switchMap((action: any) => {
            const payload = action.payload as GetDocumentTreeOptions;
            return this.documentService.getDocumentTree(payload).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getFavouriteFolder$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_FAVOURITE_FOLDER),
        switchMap((action: any) => {
            return this.documentService.getFavouriteFolder().pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getDocumentDynamicCombobox$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_DOCUMENT_DYNAMIC_COMBOBOX),
        switchMap((action: any) => {
            return this.documentService.getDocumentInvoiceCombobox(action.payload).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getExtractedDataFromOcr$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_EXTRACTED_DATA_FROM_OCR),
        switchMap((action: any) => {
            const { idRepDocumentType, idDocumentContainerOcr } = action.payload;

            return this.documentService.getExtractedDataFromOcr(idRepDocumentType, idDocumentContainerOcr).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getInvoiceColumnSetting$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_INVOICE_COLUMN_SETTING),
        switchMap((action: any) => {
            return this.documentService.getDocumentInvoice(null).pipe(
                map((data: any) => {
                    if (data.item[1] && data.item[1].length) {
                        data.item[1] = (data.item[1] as any[]).map((item) => {
                            item.OriginalColumnName = (item.OriginalColumnName as string).substring(
                                item.OriginalColumnName.lastIndexOf('_') + 1,
                            );
                            return item;
                        });
                    }
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getPersonContactColumnSetting$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_PERSON_CONTACT_COLUMN_SETTING),
        switchMap((action: any) => {
            return this.documentService.getColumnSettingsOfContact(action.payload).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getPersonContactColumnSettingBasedOnDocumentType$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_PERSON_CONTACT_COLUMN_SETTING_OF_DOCUMENT_TYPE),
        switchMap((action: any) => {
            return this.documentService.getDataSettingColumnsContactOfDocumentType(action.payload).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getBankContactColumnSetting$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_BANK_CONTACT_COLUMN_SETTING),
        switchMap((action: any) => {
            return this.documentService.getColumnSettingsOfContact(action.payload).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getDocumentContactCommunication$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_DOCUMENT_CONTACT_COMMUNICATION),
        switchMap((action: any) => {
            return this.documentService.getDocumentContactCommunication(action.payload).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getCommunicationType$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_COMMUNICATION_TYPE),
        switchMap((action: any) => {
            const communicationTypeKey = 'CommunicationTypeType';
            return this.commonService.getListComboBox(communicationTypeKey).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getListComboBoxCurrency$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_LIST_COMBOBOX_CURRENCY),
        switchMap((action: any) => {
            return this.commonService.getListComboBox(action.payload).pipe(
                map((data) => {
                    const response = {
                        orginalColumnName: action.orginalColumnName,
                        data,
                    };
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(
                        action.type,
                        response,
                    );
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getAllCapturedRepCombobox$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_ALL_CAPUTRED_REP_COMBOBOX),
        switchMap((action: any) => {
            const comboboxList = action.payload as string;
            return this.commonService.getListComboBox(comboboxList).pipe(
                map((data) => {
                    const response = {
                        orginalColumnName: action.orginalColumnName,
                        data,
                    };
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(
                        action.type,
                        response,
                    );
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getContractColumnSetting$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_CONTRACT_COLUMN_SETTING),
        switchMap((action: any) => {
            return this.documentService.getColumnSettingsOfContract().pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getOtherDocumentsColumnSetting$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_OTHER_DOCUMENTS_COLUMN_SETTING),
        switchMap((action: any) => {
            return this.documentService.getColumnSettingsOfOtherDocuments().pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    createNewFolder$ = this.actions$.pipe(
        ofType(
            AdministrationDocumentActionNames.ADD_NEWLY_SUB_TREE_FOLDER,
            AdministrationDocumentActionNames.CREATE_NEW_TREE_FOLDER,
        ),
        switchMap((action: any) => {
            return this.documentService.createFolder(action.payload).pipe(
                map((idDocumentTree) => {
                    const payload = action.payload as DocumentTreeModel;
                    payload.idDocument = idDocumentTree;
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, payload);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    renameTreeFolder$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.RENAME_TREE_FOLDER),
        switchMap((action: any) => {
            const data = action.payload as DocumentTreeModel;
            data.children = null;
            return this.documentService.updateFolder(data).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(
                        action.type,
                        action.payload,
                    );
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    toggleActiveFolder$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.TOGGLE_ACTIVE_FOLDER),
        switchMap((action: any) => {
            return this.documentService.updateFolder(action.payload).pipe(
                map((data) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(
                        action.type,
                        action.payload,
                    );
                }),
                catchError((err) =>
                    of(
                        this.administrationDocumentActions.administrationDocumentFailedAction(
                            action.type,
                            action.payload,
                        ),
                    ),
                ),
            );
        }),
    );

    @Effect()
    deleteTreeFolder$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.DELETE_TREE_FOLDER),
        switchMap((action: any) => {
            const node = action.payload as TreeNode;
            const data = node.data as DocumentTreeModel;
            data.children = null;
            return this.documentService.deleteFolder(data).pipe(
                map((result) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, node);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getListComboBoxDocumentType$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.SET_LIST_DOCUMENT_TYPE),
        switchMap((action: any) => {
            return this.commonService.getListComboBox(ComboBoxTypeConstant.documentType).pipe(
                map((data: any) => {
                    const response =
                        data &&
                        data.statusCode === 1 &&
                        data.item &&
                        data.item.documentType &&
                        data.item.documentType.length
                            ? data.item.documentType
                            : null;
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(
                        action.type,
                        response,
                    );
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );
    @Effect()
    saveDocumentOCR$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.SAVE_DOCUMENT_OCR),
        switchMap((action: any) => {
            return this.documentService.saveDocumentOCRResult(action.payload).pipe(
                map((value: any) => {
                    if (!value)
                        return this.administrationDocumentActions.administrationDocumentFailedAction(
                            action.type,
                            'Fail!',
                        );

                    return this.administrationDocumentActions.dispatchDocumentContainerOCR(action.docContainerOcr);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getAttachmentList$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_ATTACHMENT_BY_CONTACT),
        switchMap((action: any) => {
            return this.documentService.getAttachmentListByContact(action.payload).pipe(
                map((data: any) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    createNewFavouriteFolder$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.CREATE_NEW_FAVOURITE_FOLDER),
        switchMap((action: any) => {
            return this.documentService.createNewFavouriteFolder(action.payload).pipe(
                map((data: any) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    addContactToFavourite$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.ADD_CONTACT_TO_MY_FAVOURITE),
        switchMap((action: any) => {
            return this.documentService.addContactToFavourite(action.payload).pipe(
                map((data: any) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getContactDetail$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_CONTACT_DETAIL),
        switchMap((action: any) => {
            return this.documentService.getContactDetail(action.payload).pipe(
                map((data: any) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    saveContactDetail$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.SAVE_CONTACT_DETAIL),
        switchMap((action: any) => {
            return this.documentService.saveContactDetail(action.payload).pipe(
                map((data: any) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getCapturedInvoiceDocumentDetail = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_CAPTURED_INVOICE_DOCUMENT_DETAIL),
        switchMap((action: any) => {
            return this.documentService.getCapturedInvoiceDocumentDetail(action.payload).pipe(
                map((data: any[]) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getCapturedContractDocumentDetail = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_CAPTURED_CONTRACT_DOCUMENT_DETAIL),
        switchMap((action: any) => {
            return this.documentService.getCapturedContractDocumentDetail(action.payload).pipe(
                map((data: any[]) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getCapturedOtherDocumentDetail = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_CAPTURED_OTHER_DOCUMENT_DETAIL),
        switchMap((action: any) => {
            return this.documentService.getCapturedOtherDocumentDetail(action.payload).pipe(
                map((data: any[]) => {
                    const detailedDocumentState: DetailedDocumentDataState[] = data.map((item) => {
                        return new DetailedDocumentDataState(item);
                    });
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(
                        action.type,
                        detailedDocumentState,
                    );
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    getHistoryDocument = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.GET_HISTORY_DOCUMENT),
        switchMap((action: any) => {
            return this.documentService.getHistoryDocument().pipe(
                map((data: any[]) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    checkAndGetCompanyList$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.CHECK_AND_GET_COMPANY_NAME_LIST),
        switchMap((action: any) => {
            return this.documentService.checkAndGetCompanyList(action.payload).pipe(
                map((data: any[]) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );

    @Effect()
    changeDocumentToOtherTree$ = this.actions$.pipe(
        ofType(AdministrationDocumentActionNames.CHANGE_DOCUMENT_TO_OTHER_TREE),
        switchMap((action: any) => {
            return this.documentService.changDocToOtherTree(action.payload).pipe(
                map((data: any[]) => {
                    return this.administrationDocumentActions.administrationDocumentSuccessAction(action.type, data);
                }),
                catchError((err) =>
                    of(this.administrationDocumentActions.administrationDocumentFailedAction(action.type, err)),
                ),
            );
        }),
    );
}
