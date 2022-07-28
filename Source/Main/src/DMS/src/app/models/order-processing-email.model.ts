export class OrderProcessingPdfFileInfo {
    public idOrderProcessing: string = null;
    public idRepProcessingType: string = null;
    public fileType: string = null;
    public relativeFolderPath: string = null;
    public fullFolderPath: string = null;
    public fileName: string = null;
    public originalFileName: string = null;
    public fullFileName: string = null;
    public mediaSize: number = null;

    public constructor(init?: Partial<OrderProcessingPdfFileInfo>) {
        Object.assign(this, init);
    }
}

export class OrderProcessingEmail {
    public toEmails: string = null;
    public subject: string = null
    public content: string = null

    public attachmentFiles: OrderProcessingPdfFileInfo[] = [];

    public constructor(init?: Partial<OrderProcessingEmail>) {
        Object.assign(this, init);
    }
}
