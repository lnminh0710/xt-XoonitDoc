import { Injectable, Injector } from '@angular/core';
import { BaseService } from '@app/services';
import { Observable } from 'rxjs';
import { ApiResultResponse } from '@app/models';

@Injectable()
export class DocumentImageOcrService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getDocument(): Observable<ApiResultResponse> {
        const params: any = {};
        const url = this.serUrl.getDocument;

        return this.get<any>(url, params);
    }

    public getThumbnails(params): Observable<ApiResultResponse> {
        const url = this.serUrl.getThumbnails;

        return this.get<any>(url, params);
    }

    public deleteImage(IdDocumentContainerScans: string): Observable<ApiResultResponse> {
        const params: any = { DocumentContainerScanIds: [IdDocumentContainerScans] };
        const url = this.serUrl.deleteScanDocument;

        return this.post<any>(url, params);
    }

    public getDocumentById(IdDocumentContainerScans: string): Observable<any> {
        const params: any = { IdDocumentContainerScans };
        const url = this.serUrl.getPagesByDocId;

        return this.get<any>(url, params);
    }

    public getEmailData(IdDocumentContainerScans: string): Observable<any> {
        const params: any = { IdDocumentContainerScans };
        const url = this.serUrl.getEmailData;

        return this.get<any>(url, params);
    }

    public getDocumentOfTree(IdDocumentTree: string): Observable<any> {
        const params: any = { IdDocumentTree };
        const url = this.serUrl.getDocumentOfTree;

        return this.get<any>(url, params);
    }

    public getDocumentOfEmailTree(IdDocumentTree: string, idLogin: number): Observable<any> {
        const params: any = { IdDocumentTree };
        if (idLogin) params.IdLogin = idLogin;
        const url = this.serUrl.getDocumentOfEmailTree;

        return this.get<any>(url, params);
    }

    public getEmailAttachements(IdDocumentContainerScans: any): Observable<any> {
        const params: any = { IdDocumentContainerScans };
        const url = this.serUrl.getEmailAttachements;

        return this.get<any>(url, params);
    }

    public getScanFile(IdDocumentContainerScans: string): Observable<ApiResultResponse> {
        const params: any = { IdDocumentContainerScans };
        const url = this.serUrl.getDocumentScanFile;

        return this.getV2<any>(url, params);
    }

    public savePageOrder(params): Observable<ApiResultResponse> {
        const url = this.serUrl.saveDocumentContainerPage;

        return this.post<any>(url, params);
    }

    public sendMailDocument(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.sendMailScanDocument;

        return this.post<any>(url, params);
    }

    public getPdfFile(IdDocumentContainerScans: string) {
        const options = {};
        options['responseType'] = 'blob';

        return this.getV2<any>(
            `${this.serUrl.getDocumentScanFile}?IdDocumentContainerScans=${IdDocumentContainerScans}`,
            options,
        );
    }

    public changeAngle(OcrDocs: any): Observable<ApiResultResponse> {
        const params: any = {
            OcrDocs,
        };
        const url = this.serUrl.changeAngle;

        return this.post<any>(url, params);
    }

    public getOCRJsonOfImage(idDocumentContainerFile: any): Observable<any> {
        const url = this.serUrl.getOCRJsonByImageId;
        const params: any = {
            idDocumentContainerFile,
        };
        return this.get<any>(url, params);
    }
}
