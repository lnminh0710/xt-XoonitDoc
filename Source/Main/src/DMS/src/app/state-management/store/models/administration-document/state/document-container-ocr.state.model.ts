import { DocumentProcessingTypeEnum } from '@app/app.constants';

export class DocumentContainerOcrStateModel {
    IdDocumentContainerOcr: string;
    IdDocumentContainerScans: string;
    DocumentType: DocumentProcessingTypeEnum;
    IdDocumentTree: string;
    IdRepDocumentType: string;
    OriginalFileName: string;
    FileName: string;
    OCRText: string;
    OCRJson: string;
    PageNr: number;
    RowNum: number;
    ScannedPath: string;
    JsonQRCode: any;
}
