import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';
import { DynamicFormGroupDefinition } from '@app/models/common/form-group-definition.model';
import { OpenFormMethodEnumV2 } from '../consts/common.enum';

export interface IOpenFormParamsActionV2 {
    folder: DocumentTreeModel,
    documentContainerOcr: DocumentContainerOcrStateModel,
    idMainDocument?: number;
    idBranch?: number;
    idDocumentContainerScans?: number;
    config: IOpenFormConfigV2;
}

export interface IOpenFormConfigV2 {
    method: OpenFormMethodEnumV2;
    getDetail: () => DynamicFormGroupDefinition;
}
