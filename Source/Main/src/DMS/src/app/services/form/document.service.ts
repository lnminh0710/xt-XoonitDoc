import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiResultResponse, MessageModel } from '@app/models';
import { BaseService } from '../base.service';
import { LoadingService, ModalService } from '@app/services';
import { Uti, DocumentHelper } from '@app/utilities';
import { MessageModal, RepProcessingTypeEnum, DocumentProcessingTypeEnum } from '@app/app.constants';
import orderBy from 'lodash-es/orderBy';
import { DocumentFileInfo } from '@app/pages/private/modules/customer/models/document/document-fileInfo.model';
import { DocumentGeneratePdf, OPSaveDocumentsLinkModel } from '@app/pages/private/modules/customer/models/document';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { SaveDocumentContractForms } from '@app/state-management/store/models/administration-document/document-contract.model.payload';
import { SaveOtherDocumentForms } from '@app/state-management/store/models/administration-document/document-other.model.payload';
import { DocumentContainerOCRModel } from '@app/models/administration-document/document-container-ocr.model';
import {
    GetDocumentTreeOptions,
    TreeTypeEnum,
} from '@app/state-management/store/models/administration-document/get-document-tree-options.payload';
import { FavouriteContactModel } from '@app/models/favourite-contact.model';
import { SaveDocumentInvoiceModel } from '@app/state-management/store/models/administration-document/document-invoice.model.payload';
import { map, finalize } from 'rxjs/operators';
import { ContactDetailRequestModel } from '@app/models/contact-document.model';
import { ScanningHistoryFilter } from '@app/pages/history/history.statemanagement/model/payload/scanning-history-filter.payload.model';

@Injectable()
export class DocumentService extends BaseService {
    constructor(
        injector: Injector,
        @Inject(forwardRef(() => LoadingService)) protected loadingService: LoadingService,
        @Inject(forwardRef(() => ModalService)) protected modalService: ModalService,
    ) {
        super(injector);
    }

    public getCustomerAssignmentsDetail(idPerson: number, idOrderProcessing: number): Observable<ApiResultResponse> {
        return this.get<any>(this.serUrl.getCustomerAssignmentsDetail, {
            idPerson: idPerson,
            idOrderProcessing: idOrderProcessing,
        });
    }

    public saveOrderProcessing(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveOrderProcessing, JSON.stringify({ Data: data })).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }

    public sendMailOrderProcessing(data: any): Observable<any> {
        return this.post<any>(this.serUrl.sendMailOrderProcessing, JSON.stringify(data));
    }

    public saveOrderProcessingDocumentsLink(model: OPSaveDocumentsLinkModel): Observable<any> {
        return this.post<any>(this.serUrl.saveOrderProcessingDocumentsLink, JSON.stringify(model)).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }

    public getOrderProcessingEmail(idOrderProcessing: string, perType: string): Observable<any> {
        return this.get<any>(this.serUrl.getOrderProcessingEmail, {
            idOrderProcessing: idOrderProcessing,
            perType: perType,
        }).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }

    public deleteCancelDocument(data: any): Observable<any> {
        return this.post<any>(this.serUrl.deleteCancelDocument, JSON.stringify({ Data: data })).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }

    public getDocumentSummary(): Observable<any> {
        return this.get<any>(this.serUrl.getDocumentSummary).pipe(
            map((data: ApiResultResponse) => {
                if (data.statusCode !== 1) return null;

                return data.item;
            }),
        );
    }

    public getDocumentTree(options: GetDocumentTreeOptions): Observable<any> {
        let url;
        switch (options.treeType) {
            case TreeTypeEnum.INDEXING:
                url = this.serUrl.getDocumentTreeIndexing;
                break;
            case TreeTypeEnum.EMAIL:
                url = this.serUrl.getDocumentTreeEmail;
                break;
            default:
                url = this.serUrl.getDocumentTreeByUser;
                break;
        }
        delete options.treeType;

        return this.get<any>(url, options).pipe(
            map((data: ApiResultResponse) => {
                if (data.statusCode !== 1) return null;
                return data.item;
            }),
        );
    }

    public getDocumentTreeAgGrid(options: GetDocumentTreeOptions): Observable<any> {
        return this.get<any>(this.serUrl.getDocumentTreeAgGridIndexing, options).pipe(
            map((data: ApiResultResponse) => {
                if (data.statusCode !== 1) return null;
                return data.item;
            }),
        );
    }

    public getFavouriteFolder(): Observable<any> {
        return this.get<any>(this.serUrl.getFavouriteFolderByUser).pipe(
            map((data: ApiResultResponse) => {
                if (data.statusCode !== 1) return null;
                return data.item;
            }),
        );
    }

    public createNewFavouriteFolder(data: DocumentTreeModel): Observable<any> {
        const json = JSON.stringify(data);
        return this.post<any>(this.serUrl.createNewFavouriteFolder, json).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1) return null;
                return result.item;
            }),
        );
    }

    public addContactToFavourite(data: FavouriteContactModel): Observable<any> {
        const json = JSON.stringify(data);
        return this.post<any>(this.serUrl.addContactToMyFavourite, json).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1) return null;
                return result.item;
            }),
        );
    }

    //#region Dialog download Pdf File, Send Mail
    public generateDownloadPdfFileAnOpenPopup(model: DocumentGeneratePdf) {
        if (model.idRepProcessingTypes && model.idRepProcessingTypes.length) {
            this.loadingService.showLoading();
            this.saveOrderProcessingDocumentsLink(
                new OPSaveDocumentsLinkModel({
                    IdRepProcessingTypes: model.idRepProcessingTypes,
                    IdOrderProcessing: model.idOrderProcessing,
                    IdOffer: model.idOffer,
                    IdOrder: model.idOrder,
                    IdInvoice: model.idInvoice,
                    AllFileInfos: model.allFileInfos,
                }),
            )
                .pipe(
                    finalize(() => {
                        this.loadingService.hideLoading();
                    }),
                )
                .subscribe((response) => {
                    this.loadingService.hideLoading();
                    if (response && response.length) {
                        model.fileInfos = model.fileInfos || new Array<DocumentFileInfo>();

                        response.forEach((n) => {
                            model.fileInfos.push(
                                new DocumentFileInfo({
                                    idOrderProcessing: n.idOrderProcessing,
                                    idRepProcessingType: n.idRepProcessingType,
                                    fullFileName: n.fullFileName,
                                    originalFileName: n.originalFileName,
                                    mediaSize: n.mediaSize,
                                }),
                            );
                        });

                        model.fileInfos = orderBy(model.fileInfos, ['idRepProcessingType'], ['asc']);
                    }

                    if (model.callBack) model.callBack(model.fileInfos, true);

                    if (model.isPrint) this.openDialogDownloadPdfFile(model.fileInfos);
                    else if (model.isExport) this.downloadPdfFiles(model.fileInfos);
                });
        } else if (model.fileInfos && model.fileInfos.length) {
            if (model.isPrint) this.openDialogDownloadPdfFile(model.fileInfos);
            else if (model.isExport) this.downloadPdfFiles(model.fileInfos);
            else if (model.callBack) model.callBack(model.fileInfos, false); //'Send Mail' always calls the Callback
        }
    }

    public getDataOrderProcessingById(idOrderProcessing: number): Observable<ApiResultResponse> {
        return this.get<any>(this.serUrl.getDataOrderProcessingById, {
            idOrderProcessing: idOrderProcessing,
        });
    }

    public openDialogDownloadPdfFile(fileInfos: any) {
        if (!fileInfos || !fileInfos.length) return;

        if (fileInfos.length == 1) {
            if (fileInfos[0].fullFileName) {
                const url = Uti.getFileUrl(fileInfos[0].fullFileName);
                Uti.openPopupCenter(url, 'Order Processing Pdf', 800, 800);
            }
            return;
        }

        const buttonPdfHtml = this.getListButtonPdfHtml(fileInfos);
        if (!buttonPdfHtml) return;

        this.modalService.showMessage(
            new MessageModel({
                customClass: 'modal-OPDownloadPdf',
                headerText: 'Print Preview',
                headerIconClass: 'fa-print',
                messageType: MessageModal.MessageType.confirm,
                modalSize: MessageModal.ModalSize.small,
                message: [{ key: '<div>' }, { key: buttonPdfHtml }, { key: '<div>' }],
            }),
        );

        setTimeout(() => {
            $('.modal-OPDownloadPdf .btn').click(function () {
                const type: number = Number($(this).attr('data-type'));

                const findItem = fileInfos.find((x) => x.idRepProcessingType == type);
                if (findItem && findItem.fullFileName) {
                    const url = Uti.getFileUrl(findItem.fullFileName);
                    Uti.openPopupCenter(url, 'Order Processing Pdf', 800, 800);
                }
            });
        }, 800);
    }

    private getListButtonPdfHtml(fileInfos: Array<any>): string {
        let buttonHtml = '';

        //All Documents
        if (
            fileInfos.findIndex((item) => {
                return item.idRepProcessingType == RepProcessingTypeEnum.AllDocuments;
            }) !== -1
        ) {
            buttonHtml += `<div class="btn all" data-type="6">All Pdf</div>`;
        }

        fileInfos.forEach((item) => {
            if (item.idRepProcessingType == RepProcessingTypeEnum.Offer)
                //Offer
                buttonHtml += `<div class="btn offer" data-type="1">Offer Pdf</div>`;
            else if (item.idRepProcessingType == RepProcessingTypeEnum.Order)
                //Order
                buttonHtml += `<div class="btn order" data-type="2">Order Pdf</div>`;
            else if (item.idRepProcessingType == RepProcessingTypeEnum.Invoice)
                //Invoice
                buttonHtml += `<div class="btn invoice" data-type="3">Invoice Pdf</div>`;
        });

        return buttonHtml;
    }

    private downloadPdfFiles(fileInfos: any) {
        if (!fileInfos || !fileInfos.length) return;

        fileInfos.forEach((item) => {
            if (item.fullFileName) {
                const url = Uti.getFileUrl(item.fullFileName, null, item.originalFileName);
                this.downloadFileWithIframe(url);
            }
        });
    }

    private downloadFileWithIframe(url: string) {
        try {
            const frame = document.createElement('iframe');
            frame.src = url;
            document.body.appendChild(frame);
            setTimeout(() => {
                try {
                    frame.remove();
                } catch (ex) {
                    console.log(ex);
                }
            }, 1000);
        } catch (ex) {
            console.log(ex);
        }
    }
    //#endregion

    // dynamic field Invoice get lis combobox
    public getDocumentInvoiceCombobox(idDocumentTree: number): Observable<any> {
        return this.get<any>(this.serUrl.getDocumentInvoiceCombobox, { idDocumentTree }).pipe(
            map((data: ApiResultResponse) => {
                if (data.statusCode !== 1) return null;

                return data.item;
            }),
        );
    }

    public saveDocumentContract(data: SaveDocumentContractForms): Observable<any> {
        const json = JSON.stringify(data);

        if (!data.mainDocument.idMainDocument) {
            return this.post<any>(this.serUrl.saveDocumentContract, json).pipe(
                map((result: ApiResultResponse) => {
                    if (result.statusCode !== 1 || !result.item.isSuccess) return null;
                    return result.item;
                }),
            );
        }

        return this.post<any>(
            `${this.serUrl.saveDocumentContract}?idMainDocument=${data.mainDocument.idMainDocument}`,
            json,
        ).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item.isSuccess) return null;
                return result.item;
            }),
        );
    }

    public saveDocumentInvoice(data: SaveDocumentInvoiceModel): Observable<any> {
        const json = JSON.stringify(data);

        // insert new
        if (!data.mainDocument.idMainDocument) {
            return this.post<any>(this.serUrl.saveDocumentInvoice, json).pipe(
                map((result: ApiResultResponse) => {
                    if (result.statusCode !== 1 || !result.item.isSuccess) return null;
                    return result.item;
                }),
            );
        }

        // update existed one
        return this.post<any>(
            `${this.serUrl.saveDocumentInvoice}?idMainDocument=${data.mainDocument.idMainDocument}`,
            json,
        ).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item.isSuccess) return null;
                return result.item;
            }),
        );
    }

    public saveOtherDocument(data: SaveOtherDocumentForms): Observable<any> {
        const json = JSON.stringify(data);

        // insert new
        if (!data.mainDocument.idMainDocument) {
            return this.post<any>(this.serUrl.saveOtherDocument, json).pipe(
                map((result: ApiResultResponse) => {
                    if (result.statusCode !== 1 || !result.item.isSuccess) return null;
                    return result.item;
                }),
            );
        }

        // update existed one
        return this.post<any>(
            `${this.serUrl.saveOtherDocument}?idMainDocument=${data.mainDocument.idMainDocument}`,
            json,
        ).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item.isSuccess) return null;
                return result.item;
            }),
        );
    }

    public getDocumentInvoice(params: any) {
        return this.get<any>(this.serUrl.getDataSettingColumnsInvoice, params);
    }

    public saveDocumentBank(contact: any, data: any): Observable<any> {
        return of('save document bank');
    }

    public getExtractedDataFromOcr(idRepDocumentType: number, idDocumentContainerOcr: number): Observable<any> {
        return this.get<any>(
            `${this.serUrl.getExtractedDataFromOcr}?idRepDocumentType=${idRepDocumentType}&idDocumentContainerOcr=${idDocumentContainerOcr}`,
        ).pipe(map((result: ApiResultResponse) => result.item));
    }

    public getColumnSettingsOfContact(object: string) {
        const params = {
            object,
        };
        return this.get<any>(this.serUrl.getDataSettingColumnsContact, params);
    }

    public getDataSettingColumnsContactOfDocumentType(documentType: string) {
        return this.get<any>(`${this.serUrl.getDataSettingColumnsContactOfDocumentType}/${documentType}`).pipe(
            map((response: ApiResultResponse) => {
                if (response.statusCode !== 1 || !response.item) return null;
                return response;
            }),
        );
    }

    public getDocumentContactCommunication(data: any) {
        const params = {
            data,
        };
        return this.get<any>(this.serUrl.getDocumentContactCommunication, params);
    }

    public getColumnSettingsOfContract(params?: any) {
        return this.get<any>(this.serUrl.getDataSettingColumnsContract, params);
    }

    public getColumnSettingsOfOtherDocuments(params?: any) {
        return this.get<any>(this.serUrl.getDataSettingColumnsOtherDocuments, params);
    }

    public createFolder(data: DocumentTreeModel) {
        if (!data.idDocumentType) {
            data.idDocumentType = DocumentHelper.parseDocumentProcessingTypeEnumToDocumentType(
                DocumentProcessingTypeEnum.OTHER_DOCUMENT,
            );
        }
        return this.post<any>(this.serUrl.createFolder, JSON.stringify(data)).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item) return null;

                return result.item;
            }),
        );
    }

    public updateFolder(data: DocumentTreeModel) {
        return this.put<any>(this.serUrl.updateFolder, JSON.stringify(data)).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item) return null;
                return result.item;
            }),
        );
    }

    public deleteFolder(data: DocumentTreeModel) {
        return this.post<any>(this.serUrl.deleteFolder, JSON.stringify(data)).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item) return null;
                return result.item;
            }),
        );
    }

    public saveDocumentOCRResult(data: DocumentContainerOCRModel[]): Observable<any> {
        const json = JSON.stringify(data);
        return this.post<any>(this.serUrl.saveOCRResult, json).pipe(
            map((result: any) => {
                return !result.isSuccess ? null : result;
            }),
        );
    }

    public getDocumentsByFolder(idDocumentTree: number): Observable<any> {
        return this.get<any>(this.serUrl.getDocumentsByFolder + '/' + idDocumentTree).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item) return null;
                return result.item;
            }),
        );
    }

    public getAttachmentListByContact(personId: string): Observable<any> {
        var object = {
            idPerson: personId,
        };
        return this.get<any>(this.serUrl.getAttachmentListByContact, object).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item) return null;
                return result.item;
            }),
        );
    }

    public getCapturedInvoiceDocumentDetail(idMainDocument: number, params?: any) {
        return this.get<any>(this.serUrl.getCapturedInvoiceDocumentDetail, {
            idMainDocument: idMainDocument,
            ...(params || {}),
        }).pipe(
            map((response: ApiResultResponse) => {
                if (response.statusCode !== 1 || !response.item || !response.item.length) return null;

                return response.item;
            }),
        );
    }

    public getContactDetail(request: ContactDetailRequestModel): Observable<any> {
        return this.get<any>(`${this.serUrl.getContactDetail}/${request.idPersonType}/${request.idPerson}`).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1) return null;
                return result.item;
            }),
        );
    }

    public saveContactDetail(data: any): Observable<any> {
        const json = JSON.stringify(data);
        return this.post<any>(this.serUrl.saveDocumentContact, json).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item) return null;
                return result.item;
            }),
        );
    }

    public getCapturedContractDocumentDetail(idMainDocument: number, params?: any) {
        return this.get<any>(this.serUrl.getCapturedContractDocumentDetail, {
            idMainDocument: idMainDocument,
            ...(params || {}),
        }).pipe(
            map((response: ApiResultResponse) => {
                if (response.statusCode !== 1 || !response.item || !response.item.length) return null;

                return response.item;
            }),
        );
    }

    public getCapturedOtherDocumentDetail(idMainDocument: number, params?: any) {
        return this.get<any>(this.serUrl.getCapturedOtherDocumentDetail, {
            idMainDocument: idMainDocument,
            ...(params || {}),
        }).pipe(
            map((response: ApiResultResponse) => {
                if (response.statusCode !== 1 || !response.item || !response.item.length) return null;

                return response.item;
            }),
        );
    }

    public getHistoryDocument() {
        return this.get<any>(this.serUrl.getAllHistoryDocument).pipe(
            map((response: ApiResultResponse) => {
                if (response.statusCode !== 1 || !response.item) return null;

                return response.item;
            }),
        );
    }

    public checkAndGetCompanyList(payload: { companyName: string }) {
        return this.get<any>(this.serUrl.checkAndGetCompanyList, payload).pipe(
            map((response: ApiResultResponse) => {
                if (response.statusCode !== 1 || !response.item) return null;

                return response.item;
            }),
        );
    }
    public getPathTreeDocument(idDocumentContainerScans: string) {
        return this.get<any>(this.serUrl.getPathTreeDocument, { idDocumentContainerScans }).pipe(
            map((response: ApiResultResponse) => {
                if (response.statusCode !== 1 || !response.item) return null;

                return response.item;
            }),
        );
    }

    public getScanningHistory(filter: ScanningHistoryFilter) {
        return this.get<any>(this.serUrl.getScanningHistory, filter).map((response: ApiResultResponse) => {
            if (response.statusCode !== 1 || !response.item) return null;

            return response.item;
        });
    }

    public getScanningHistoryDetail(params: any) {
        return this.get<any>(this.serUrl.getScanningHistoryDetail, params).map((response: ApiResultResponse) => {
            if (response.statusCode !== 1 || !response.item) return null;

            return response.item;
        });
    }

    public getReportNotes(idMainDocument: number): Observable<any> {
        return this.get<any>(this.serUrl.getReportNotes, { idMainDocument }).pipe(
            map((data: ApiResultResponse) => {
                if (data.statusCode !== 1) return null;
                return data.item;
            }),
        );
    }

    public getFormGroupSettings(data: {
        idMainDocument?: number;
        idBranch?: number;
        idPerson?: number;
        idDocumentContainerScans?: number;
        methodName: string;
        object: string;
        mode?: string;
    }): Observable<any> {
        return this.get<any>(this.serUrl.getFormGroupSettings, data).pipe(
            map((response: ApiResultResponse) => {
                if (response.statusCode !== 1) return null;
                return response.item;
            }),
        );
    }

    /*
     * {"SupportNotes": [] }
     */
    public saveSupportNotes(data: any): Observable<any> {
        return this.post<any>(
            this.serUrl.saveSupportNotes,
            JSON.stringify({
                SupportNotes: [data],
            }),
        ).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }

    public sendEmailNotes(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.sendMailNotes;

        return this.post<any>(url, params);
    }

    public getPdfFile(idMainDocument: number) {
        const options = {};
        options['responseType'] = 'blob';

        return this.getV2<any>(`${this.serUrl.getReportNotesFile}?idMainDocument=${idMainDocument}`, options);
    }

    public changDocToOtherTree(data: any) {
        const json = JSON.stringify(data);

        return this.post<any>(this.serUrl.changeDocumentToOtherTree, json).pipe(
            map((result: ApiResultResponse) => {
                if (result.statusCode !== 1 || !result.item) return null;
                return result.item;
            }),
        );
    }

    public getNotes(idMainDocument: number): Observable<ApiResultResponse> {
        const url = this.serUrl.notesHandleProcess;

        return this.get<any>(url, { IdMainDocument: idMainDocument });
    }

    public saveNotes(data: any): Observable<any> {
        return this.post<any>(
            this.serUrl.notesHandleProcess,
            JSON.stringify({
                JSONMainDocumentNotes: {
                    MainDocumentNotes: [data],
                },
            }),
        ).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }

    public getPermissionMailTree(idDocumentTree: any) {
        return this.get<any>(this.serUrl.permissionMailTree, { IdDocumentTree: idDocumentTree });
    }
    public getPermissionIndexingTree(idDocumentTree: any) {
        return this.get<any>(this.serUrl.permissionIndexingTree, { IdDocumentTree: idDocumentTree });
    }

    public updatePermissionIndexingTree(params: any): Observable<ApiResultResponse> {
        return this.post<any>(this.serUrl.permissionIndexingTree, params);
    }
    public updatePermissionMailTree(params: any): Observable<ApiResultResponse> {
        return this.post<any>(this.serUrl.permissionMailTree, params);
    }

    public removeDocumentFile(params: any): Observable<ApiResultResponse> {
        return this.post<any>(this.serUrl.removeDocument, params);
    }

    public changeFolderForFile(params: any): Observable<ApiResultResponse> {
        return this.post<any>(this.serUrl.changeFolderForFiles, params);
    }
}
