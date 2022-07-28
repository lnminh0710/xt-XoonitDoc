export enum SettingQuantityEnum {
    FROM_SERVER = 1,
    FROM_CLIENT = 2,
}

export interface DocumentNodeQuantityChanged {
    documentTreeName: string;
    idDocument: number;
    quantityIncrement: number;
}

interface CallbackQuantityChanged {
    (documentTreeQuantityChangedList: DocumentNodeQuantityChanged[]): void;
}

export class XnDocumentTreeOptions {
    public settingQuantity: SettingQuantityEnum;

    private _listeners: CallbackQuantityChanged[];

    constructor() {
        this._listeners = [];
    }

    public registerXnDocumentTreeListener(
        callback: (documentTreeQuantityChangedList: DocumentNodeQuantityChanged[]) => void,
    ) {
        this._listeners.push(callback);
    }

    public notifyDocumentQuantityChanged(documentTreeQuantityChangedList: DocumentNodeQuantityChanged[]) {
        this._listeners.forEach((callback) => {
            callback(documentTreeQuantityChangedList);
        });
    }
}
