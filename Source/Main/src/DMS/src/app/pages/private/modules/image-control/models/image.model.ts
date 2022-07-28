// import { DocumentTreeModel } from 'app/models/administration-document/document-tree.payload.model';

export class ImageThumbnailModel {
    public IdDocumentContainerScans: any;

    public DocumentName?: string;
    public FileName?: string;
    public ScannedPath?: string;
    public Base64?: string;

    public DocumentType?: string;
    public ExtractedFields?: string;
    public TotalFields?: string;
    public NumberOfImages?: any;

    public IdDocumentContainerOcr?: any;
    public PageNr?: any;
    public OCRJson?: any;
    public OCRText?: any;

    public isSelected?: boolean;
    public IsOriginal?: boolean;
    public IsHidden?: boolean;

    public ImageNote?: string;
    public Color?: string;
    public IsFiltered?: boolean;

    public DoctypeSelected?: any;

    // Invoice approval
    public IdDocumentType?: any;
    public IdDocument?: any;
    public IdTreeRoot?: any;
    public IdInvoiceMainApproval?: any;

    public constructor(init?: Partial<ImageThumbnailModel>) {
        Object.assign(this, init);
    }
}

export enum CoordinateColorEnum {
    selected = '#00ac47', //'#1a237e',
    database = '#64dd17', // green # 1b5e20
    drawing = 'red',
}

export enum ImageThumbnailType {
    slider = 0,
    info = 1,
    scanningList = 2,
}
