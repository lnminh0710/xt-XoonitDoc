import { FieldFilter } from "@app/models";
import { FilterModeEnum } from "@app/app.constants";

export class DocumentDetail {
    public docType: DocType;
    public docName: string;
    public docNr: string;
    public createDate: string;
    public updateDate: string;
    public visible: boolean;
    public disable: boolean;
    public dataSource: Array<any>;
    public docHistoryFiles: Array<DocumentFile>;
    public fieldFilters: Array<FieldFilter>;
    public filterMode: FilterModeEnum;
    public docIcon: string;
    public isActived: boolean = true;
    public selected: boolean;
    public isArchiveOP: boolean = false;

    public constructor(init?: Partial<DocumentDetail>) {
        Object.assign(this, init);
    }
}

export class DocumentDetailListGroup {
    public docType: DocType;
    public documentDetailList: Array<DocumentDetail>;
    public visible: boolean;
    public docIcon: string;
    public docName: string;

    public constructor(init?: Partial<DocumentDetailListGroup>) {
        Object.assign(this, init);
    }
}

export enum DocType {
    Offer,
    Order,
    Invoice,
    All
}

export enum DocUpdateMode {
    New,
    Edit
}

/**
 * DocumentFile
 **/
export class DocumentFile {
    public id: string;
    public name: string;
    public createdBy: string;

    public constructor(init?: Partial<DocumentFile>) {
        Object.assign(this, init);
    }
}

/**
 * DocumentCustomer
 * */
export class DocumentCustomer {
    public name: string;
    public customerNr: string;
    public contact: string;
    public phoneContact: string;
    public address: string;

    public constructor(init?: Partial<DocumentCustomer>) {
        Object.assign(this, init);
    }
}

export class OrderProcessingUpdateModel {
    public idOffer?: number;
    public idOrder?: number;
    public idInvoice?: number;
    public idPerson: any;
    public idOrderProcessing: number;

    public constructor(init?: Partial<OrderProcessingUpdateModel>) {
        Object.assign(this, init);
    }
}
