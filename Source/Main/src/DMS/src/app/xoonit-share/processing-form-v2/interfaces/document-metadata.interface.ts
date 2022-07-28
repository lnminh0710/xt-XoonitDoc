import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { HeadquarterInfoModel } from '@app/models/octopus-document.model';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';

export interface DocumentMetadataV2 {
    originalFileName?: string;
    isTodo?: boolean;
    toDos?: string;
    keyword?: string;
    headquarterInfo?: HeadquarterInfoModel;
    folder?: DocumentTreeModel;
    documentContainerOcr?: DocumentContainerOcrStateModel;
}
