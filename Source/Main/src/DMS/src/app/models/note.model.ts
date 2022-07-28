export class Note {
    date: Date;
    idInvoiceApprovalNotes: string = null;
    idInvoiceMainApproval: string = null;
    loginName: string;
    idLogin: string;
    notes: string;
    isActive: NoteEnum = NoteEnum.ONE;
    isDeleted: NoteEnum = NoteEnum.ZERO;
    editing: boolean;
    cancelable: boolean;
    removeable: boolean;
    idFormsReport: string = null;

    constructor(init?: Partial<Note>) {
        if (init) {
            Object.keys(init).forEach((k: string) => {
                if (k === 'Date') {
                    this.date = new Date(init[k]?.replace(/(\d{2}).(\d{2}).(\d{4})/, '$2/$1/$3'));
                    return;
                }
                this[k.charAt(0).toLowerCase() + k.slice(1)] = init[k];
            });
        }
    }
}

export class NoteDocument {
    date: Date;
    idMainDocument: string = null;
    idMainDocumentNotes: string = null;
    loginName: string;
    idLogin: string;
    notes: string;
    isActive: NoteEnum = NoteEnum.ONE;
    isDeleted: NoteEnum = NoteEnum.ZERO;
    editing: boolean;
    cancelable: boolean;
    removeable: boolean;
    idFormsReport: string = null;

    constructor(init?: Partial<NoteDocument>) {
        if (init) {
            Object.keys(init).forEach((k: string) => {
                if (k === 'Date') {
                    this.date = new Date(init[k]?.replace(/(\d{2}).(\d{2}).(\d{4})/, '$2/$1/$3'));
                    return;
                }
                this[k.charAt(0).toLowerCase() + k.slice(1)] = init[k];
            });
        }
    }
}

export enum NoteEnum {
    ZERO = '0',
    ONE = '1'
}

export interface NoteLoading {
    share: boolean;
    download: boolean;
    print: boolean;
}
