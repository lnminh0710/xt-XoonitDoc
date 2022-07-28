import { ScanningHistoryFilter } from '@app/pages/history/history.statemanagement/model/payload/scanning-history-filter.payload.model';

export class HistoryDetailParameters {
    public company: string;
    public userId: number;
    public idDocument: number;
    public companyTitle: string;

    constructor(public email: string, public date: string, filter: ScanningHistoryFilter) {
        if (filter) {
            this.company = filter.company;
            this.userId = filter.userId;
            this.idDocument = filter.idDocument;
        }
    }
}
