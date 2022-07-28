import { ExtractedDataOcrState } from '@app/state-management/store/models/administration-document/state/extracted-data-ocr.state.model';
import { ColumnDefinition } from '@app/models/common/column-definition.model';

export class ExtractedDataFormModel {
    ColumnName: string;
    OriginalColumnName: string;
    Value: any;
    WordsCoordinates: any[];
    isDeletedOcr?: boolean;
    GroupField?: string;
    DataType: string;
    Data?: any;

    static copyWith(dataState: ExtractedDataOcrState): ExtractedDataFormModel {
        return {
            ColumnName: dataState.ColumnName,
            OriginalColumnName: dataState.OriginalColumnName,
            Value: dataState.Value,
            WordsCoordinates: dataState.WordsCoordinates,
            isDeletedOcr: false,
            GroupField: dataState.GroupField,
            DataType: dataState.DataType,
            Data: null,
        };
    }

    static mergeWith(currentData: ColumnDefinition, data: ExtractedDataFormModel) {
        currentData.columnName = data.ColumnName;
        currentData.originalColumnName = data.OriginalColumnName;
        currentData.value = data.Value;
        (currentData as any).wordsCoordinates = data.WordsCoordinates;
        (currentData as any).isDeletedOcr = data.isDeletedOcr;
        (currentData as any).groupField = data.GroupField;
        (currentData as any).dataType = data.DataType;
        (currentData as any).data = data.Data;
    }
}
