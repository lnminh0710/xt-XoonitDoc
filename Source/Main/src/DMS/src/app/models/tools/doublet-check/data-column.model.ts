export class DataColumn {
    public DictionaryType: string = 'No dictionary';
    public Fields: Array<Field> = [];
    public IgnoreNullValues: boolean = false;
    public Level: number;
    public MatchingType: number = 0;
    public Weight: number = 1;

    public constructor(init?: Partial<DataColumn>) {
        Object.assign(this, init);        
    }
}

export class Field {
    public ColumnIndex: number = 0;
    public ColumnName: string = '';

    public constructor(init?: Partial<Field>) {
        Object.assign(this, init);
    }
}