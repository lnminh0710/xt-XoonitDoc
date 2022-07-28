import { AgGridViewModel } from '@app/models';

export interface ScanningHistoryTotalSummary {
    scan: number;
    import: number;
    mobile: number;
    transferring: number;
    transferred: number;
}

export interface HistoryAgGridModel extends AgGridViewModel<any> {
    totalSummary: ScanningHistoryTotalSummary;
}
