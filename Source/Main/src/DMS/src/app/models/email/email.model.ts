export class EmailContentModel {
    public body: string;
    public createDate: string;
    public recipientsBcc: string;
    public recipientsCc: string;
    public recipientsTo: string;
    public sender: string;
    public sentDate: string;
    public subject: string;
    public scannedFilename: string;
    public scannedPath: string;

    public constructor(init?: Partial<EmailContentModel>) {
        Object.assign(this, init);
    }
}

export class AttachDocument {
    public fileName: string;
    public scannedPath: string;
    public idDocumentContainerScans: string;
    public idDocumentContainerOcr: string;
    public idDocumentContainerFiles: string;
    public isSelected: boolean;
    public docType: string;
    public constructor(init?: Partial<AttachDocument>) {
        Object.assign(this, init);
    }
}
