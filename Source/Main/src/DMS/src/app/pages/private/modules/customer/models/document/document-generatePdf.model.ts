import { DocumentFileInfo } from ".";

export class DocumentGeneratePdf{
    public idOrderProcessing: number;
    public idRepProcessingTypes?: Array<number>;
    public fileInfos?: Array<DocumentFileInfo>;
    public callBack?: Function;
    public isPrint?: boolean;
    public isExport?: boolean;
    public idOffer?: number;
    public idOrder?: number;
    public idInvoice?: number;
    public allFileInfos?: Array<DocumentFileInfo>;

    public constructor(init?: Partial<DocumentGeneratePdf>) {
        Object.assign(this, init);
    }
}

export class OPSaveDocumentsLinkModel {
    public IdOrderProcessing: number;
    public IdRepProcessingTypes?: Array<number>;
    public IdOffer?: number;
    public IdOrder?: number;
    public IdInvoice?: number;
    public AllFileInfos?: Array<DocumentFileInfo>;

    public constructor(init?: Partial<OPSaveDocumentsLinkModel>) {
        Object.assign(this, init);
    }
}
