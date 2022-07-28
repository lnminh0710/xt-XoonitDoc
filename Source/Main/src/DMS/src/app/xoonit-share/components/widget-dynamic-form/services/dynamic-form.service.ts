import { Injectable, Injector } from '@angular/core';
import { ServiceUrl } from '@app/app.constants';
import { ApiResultResponse } from '@app/models';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { FormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { BaseService } from '@app/services';

@Injectable()
export class DynamicFormService extends BaseService {
    constructor(protected injector: Injector) {
        super(injector);
    }

    public getFormColumnSettings(payload: { idMainDocument?: number; idBranch: number }) {
        return this.get<ApiResultResponse>(this.serUrl.getFormColumnSettings, payload);
    }

    public saveFormColumnSettings(payload: {
        folder: DocumentTreeModel;
        formGroupDefinition: FormGroupDefinition;
    }) {
        return this.post<ApiResultResponse>(this.serUrl.saveFormColumnSettings, payload);
    }
}
