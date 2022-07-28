import { ExtractedDataOcrState } from './extracted-data-ocr.state.model';

export class DetailedDocumentDataState {
    ColumnName: string;
    Value: string;
    DataType: string;
    OriginalColumnName: string;
    Setting: DocumentDataSetting;
    WordsCoordinates: any[];

    constructor(data: any) {
        Object.assign(this, data);
    }

    public mapToExtractedData(): ExtractedDataOcrState {
        return <ExtractedDataOcrState> {
            ColumnName: this.ColumnName,
            Value: this.Value,
            OriginalColumnName: this.OriginalColumnName,
            DataType: this.DataType,
            WordsCoordinates: this.WordsCoordinates,
        };
    }
}

export class DocumentDataSetting {
    DisplayField: DisplayFieldSetting;
    ControlType: ControlTypeSetting;
    Validators: any;
}

export class DisplayFieldSetting {
    Hidden: '1' | '0';
    ReadOnly: '1' | '0';
    OrderBy: string;
}

export class ControlTypeSetting {
    Type: string;
    Value: string;
}

export class ValidatorsSetting {
    IgnoreKeyCharacters: string;
    MaxLength: string;
    Pattern: PatternValidator;
}

export class PatternValidator {
    Regex: string;
    Message: string;
}
