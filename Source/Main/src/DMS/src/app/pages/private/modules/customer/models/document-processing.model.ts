/**
 * DocumentProcessing
 */
export class DocumentProcessing {
    public icon : string;
    public type: string;
    public title: string;
    public documentProcessingDetail: DocumentProcessingDetail;

    public constructor(init?: Partial<DocumentProcessing>) {
        Object.assign(this, init);
    }
}

/**
 * DocumentProcessingDetail
 **/
export class DocumentProcessingDetail {
    public email : any;
    public contracts: any;
    public complaints: any;
    public generalCorresopondence: any;

    public constructor(init?: Partial<DocumentProcessingDetail>) {
        Object.assign(this, init);
    }
}
