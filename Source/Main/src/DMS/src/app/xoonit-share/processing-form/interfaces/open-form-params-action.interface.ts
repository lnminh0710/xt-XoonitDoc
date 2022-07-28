import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { OpenFormMethodEnum } from '@app/xoonit-share/processing-form/consts/common.enum';
import { ColumnDefinition } from '@app/models/common/column-definition.model';

export interface IOpenFormParamsAction {
    folder: DocumentTreeModel,
    documentContainerOcr: DocumentContainerOcrStateModel,
    idMainDocument?: number;
    idBranch?: number;
    config: IOpenFormConfig;
}

export interface IOpenFormConfig {
    method: OpenFormMethodEnum;
    getDetail: () => ColumnDefinition[];
}
