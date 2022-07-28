import { Injectable, Injector } from '@angular/core';
import { ApiResultResponse } from '@app/models';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs/Rx';
import { BaseService } from '../base.service';

@Injectable()
export class InvoiceAprrovalService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getInvoiceItem(options: any): Observable<any> {
        return this.get<any>(this.serUrl.getInvoiceItems, options).pipe(
            map((data: ApiResultResponse) => {
                if (data.statusCode !== 1) return null;
                return data.item;
            }),
        );
    }

    public searchSupplier(params): Observable<ApiResultResponse> {
        const url = this.serUrl.searchSupplier;

        return this.get<any>(url, params);
    }

    public searchMandant(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.searchMandant;

        return this.get<any>(url, params);
    }

    public getDynamicFormAddMandant(IdPerson: string): Observable<ApiResultResponse> {
        const url = this.serUrl.getDynamicFormAddMandant;

        return this.get<any>(url, { IdPerson });
    }

    public saveDynamicForm(params): Observable<ApiResultResponse> {
        const url = this.serUrl.saveDynamicForm;

        return this.post<any>(url, params);
    }

    public saveProcessingForm(params): Observable<ApiResultResponse> {
        const url = this.serUrl.saveProcessingForm;
        return this.post<any>(url, JSON.stringify(params)).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }

    public getMandantOverviewById(IdMainDocument: string): Observable<ApiResultResponse> {
        const url = this.serUrl.getMandantOverview;

        return this.get<any>(url, { IdMainDocument });
    }

    public getListGroupApproval(): Observable<ApiResultResponse> {
        const url = this.serUrl.getApprovalGroups;

        return this.get<any>(url);
    }

    public getAllUserApproval(IdRepInvoiceApprovalGroup: string): Observable<ApiResultResponse> {
        const url = this.serUrl.getApprovalGroupsUser;
        const params = { IdRepInvoiceApprovalGroup };
        return this.get<any>(url, params);
    }

    public getGroupAssignedUsers(IdRepInvoiceApprovalGroup: string): Observable<ApiResultResponse> {
        const params = { IdRepInvoiceApprovalGroup };
        const url = this.serUrl.getGroupAssignedUsers;

        return this.get<any>(url, params);
    }

    public updateGroupInformation(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.getApprovalGroups;

        return this.post<any>(url, params);
    }

    public getInvoiceApprovalHistory(IdMainDocument: string): Observable<ApiResultResponse> {
        const url = this.serUrl.getInvoiceApprovalHistory;

        return this.get<any>(url, { IdMainDocument });
    }

    public searchBookingInfo(searchString: string): Observable<ApiResultResponse> {
        const url = this.serUrl.searchBookingNr;

        return this.get<any>(url, { SearchString: searchString });
    }

    public searchCostCentre(searchString?: string): Observable<ApiResultResponse> {
        const url = this.serUrl.searchCostCentre;

        return this.get<any>(url, { SearchString: searchString });
    }

    public searchCostType(searchString: string): Observable<ApiResultResponse> {
        const url = this.serUrl.searchCostType;

        return this.get<any>(url, { SearchString: searchString });
    }

    public searchProjectNumber(searchString: string): Observable<ApiResultResponse> {
        const url = this.serUrl.searchProjectNumber;

        return this.get<any>(url, { SearchString: searchString });
    }

    public getNotes(idMainDocument: number): Observable<ApiResultResponse> {
        const url = this.serUrl.getNotes;

        return this.get<any>(url, { IdMainDocument: idMainDocument });
    }

    public getPaymentOverview(idMainDocument: number): Observable<ApiResultResponse> {
        const url = this.serUrl.getPaymentOverview;

        return BaseService.cacheService.get(
            url + idMainDocument,
            this.get<ApiResultResponse>(url, { IdMainDocument: idMainDocument }),
            5000,
        );
    }

    public getPdfFile(idMainDocument: number): Observable<any> {
        const options = {};
        options['responseType'] = 'blob';

        return this.getV2<any>(`${this.serUrl.getReportNotesFile}?idMainDocument=${idMainDocument}`, options);
    }

    public saveSupportNotes(data: any): Observable<any> {
        return this.post<any>(
            this.serUrl.getNotes,
            JSON.stringify({
                InvoiceApprovalNotes: [data],
            }),
        ).pipe(
            map((result: ApiResultResponse) => {
                return result.item;
            }),
        );
    }

    public sendEmailNotes(params: any): Observable<ApiResultResponse> {
        const url = this.serUrl.getNotes;

        return this.post<any>(url, params);
    }

    //
    public getExtractAIData(idDocumentContainerScan: any): Observable<any> {
        const url = this.serUrl.getExtractedDataFromOcr;

        return this.get<any>(url, { idDocumentContainerScan, module: 'approval' });
    }

    public getExtractedDataWhenInitApporvalProcessing(IdDocumentContainerScans: any): Observable<any> {
        const url = this.serUrl.getExtractedDataWhenInitApporvalProcessing;

        return this.get<any>(url, {
            IdDocumentContainerScans,
        });
    }
}
