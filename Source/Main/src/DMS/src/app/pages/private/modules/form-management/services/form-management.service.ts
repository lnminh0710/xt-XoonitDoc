import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '@app/services';
import { ApiResultResponse } from '@app/models';

@Injectable()
export class FormManagementService extends BaseService {
  constructor(injector: Injector) {
    super(injector);
  }

  public getAllDocumentType(): Observable<ApiResultResponse> {
    const params: any = {};
    const url = this.serUrl.documentSystemGetDocType;

    return this.get<any>(url, params);
  }

  public getAllModule(idRepDocumentType?: any): Observable<ApiResultResponse> {
    const params: any = { idRepDocumentType };
    const url = this.serUrl.documentSystemGetModule;

    return this.get<any>(url, params);
  }

  public getFieldByModuleId(idRepTableModule?: any): Observable<ApiResultResponse> {
    const params: any = { idRepTableModule };
    const url = this.serUrl.documentSystemGetField;

    return this.get<any>(url, params);
  }

  public saveDoctype(params: any): Observable<ApiResultResponse> {
    const url = this.serUrl.documentSystemSaveDocType;

    return this.post<any>(url, params);
  }

  public saveModule(params: any): Observable<ApiResultResponse> {
    const url = this.serUrl.documentSystemSaveModule;

    return this.post<any>(url, params);
  }

  public saveField(params: any): Observable<ApiResultResponse> {
    const url = this.serUrl.documentSystemSaveField;

    return this.post<any>(url, params);
  }

  public assignModule(params: any): Observable<ApiResultResponse> {
    const url = this.serUrl.documentSystemAssignModule;

    return this.post<any>(url, params);
  }
}
