export class DocumentFileInfo {
    public idOrderProcessing: number;
    public idRepProcessingType: number;
    public fullFileName: string;
    public originalFileName: string;
    public mediaSize?: number;
    public emails: any;
    public allEmailsOfCustomer: any;
    
    public constructor(init?: Partial<DocumentFileInfo>) {
        Object.assign(this, init);
    }
}
