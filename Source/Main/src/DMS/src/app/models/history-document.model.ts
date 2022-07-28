export class HistoryResponse {
    data: HistoryModel[];
    columns: HistoryColumnSettingModel[];
    totalResults: number;
}

export class HistoryModel {
    IdDocumentContainerScans: string;
    FileName: string;
    DocType: string;
    TotalDocument: string;
    ScanDate: string;
    ScanTime: string;
    Devices: string;
    SyncStatus: string;
    Cloud: string;
}

export class HistoryColumnSettingModel {
    columnName: string;
    columnHeader: string;
    setting: HistorySettingModel[];
}

export class HistorySettingModel {
    displayField: HistoryDisplayFieldModel
}

export class HistoryDisplayFieldModel {
    hidden: string
}