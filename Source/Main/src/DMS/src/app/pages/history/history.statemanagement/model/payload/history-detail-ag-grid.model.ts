import { AgGridViewModel } from '@app/models';

export interface HistoryDetailAgGridModel extends AgGridViewModel<any> {
    fileName: string;
}
