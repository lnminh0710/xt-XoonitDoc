export class ExtractedDataOcrState {
    ColumnName: string;
    DataType: string;
    DataLength: string;
    GroupField?: string;
    IdRepTableModuleTemplateName: number;
    IdTableModuleEntityTemplate: number;
    OrderBy: number;
    OriginalColumnName: string;
    Setting: string;
    Value: any;
    WordsCoordinates: any[];
    DataState?: DataState;
}

export enum DataState {
    REPLACE = 0,
    INSERT = 1,
    DELETE = 2,
}
