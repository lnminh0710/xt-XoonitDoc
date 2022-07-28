import { WidgetPropertyModel } from '@app/models';

/**
 * RawFieldEntity
 * Data Structure (upper case first letter of variable) response from service
 * So we create this model to map.
 */
export class RawFieldEntity {
    public Group: string = '';
    public ColumnName: string = '';
    public DataLength: string = '';
    public DataType: string = '';
    public OrderBy: string = '';
    public OriginalColumnName: string = '';
    public Setting: string = '';
    public Value: string = '';

    public constructor(init?: Partial<RawFieldEntity>) {
        Object.assign(this, init);
    }

    public toFieldEntity() {
        let display = true;
        if (this.Setting) {
            const settingArray = JSON.parse(this.Setting);
            for (let i = 0; i < settingArray.length; i++) {
                if (settingArray[i].DisplayField && settingArray[i].DisplayField.Hidden == '1') {
                    display = false;
                }
            }
        }
        let dataSetting: DataSetting = new DataSetting({
            display: display
        });
        return new FieldEntity({
            group: this.Group,
            columnName: this.ColumnName,
            dataLength: this.DataLength,
            dataType: this.DataType,
            orderBy: this.OrderBy,
            originalColumnName: this.OriginalColumnName,
            value: this.Value,
            setting: dataSetting
        });
    }


    toStyleFormatFieldEntity() {
        let display = true;
        if (this.Setting) {
            const settingArray = JSON.parse(this.Setting);
            for (let i = 0; i < settingArray.length; i++) {
                if (settingArray[i].DisplayField && settingArray[i].DisplayField.Hidden == '1') {
                    display = false;
                }
            }
        }
        let dataSetting: DataSetting = new DataSetting({
            display: display
        });
        return new StyleFormatFieldEntity({
            group: this.Group,
            columnName: this.ColumnName,
            originalColumnName: this.OriginalColumnName,
            setting: dataSetting
        });
    }
}

/**
 * BaseFieldEntity
 */
export class BaseFieldEntity {
    public isParent: boolean;
    public group: string = '';
    public columnName: string = '';
    public originalColumnName: string = '';
    public setting: DataSetting = null;
    public ignoredActionButton: boolean;

    public constructor(init?: Partial<BaseFieldEntity>) {
        Object.assign(this, init);
    }
}

/**
 * FieldEntity
 */
export class FieldEntity extends BaseFieldEntity {
    public dataLength: string = '';
    public dataType: string = '';
    public orderBy: string = '';
    public value: string = '';

    public constructor(init?: Partial<FieldEntity>) {
        super(init);
        Object.assign(this, init);
    }
}

/**
 * StyleFormatFieldEntity
 */
export class StyleFormatFieldEntity extends BaseFieldEntity {
    public stylePoperties: Array<WidgetPropertyModel> = null;

    public constructor(init?: Partial<StyleFormatFieldEntity>) {
        super(init);
        Object.assign(this, init);
    }
}

/**
 * DataSetting
 */
export class DataSetting {
    public display: boolean = false;

    public constructor(init?: Partial<DataSetting>) {
        Object.assign(this, init);
    }
}
