export class ScanningHistoryFilter {
    fromDate: string;
    toDate: string;
    userId: number;
    idDocument: number;
    pageIndex: number;
    pageSize: number;
    company: string;

    constructor() {
        this.fromDate = null;
        this.toDate = null;
        this.userId = null;
        this.idDocument = null;
        this.company = null;
        this.pageIndex = 0;
        this.pageSize = 0;
    }
}
