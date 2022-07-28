export class DeleteCancelModel {
    public title: string = 'Delete/ Cancel Reasons';
    public actionType: DeleteCancelActionType = null;//1. Delete OP, 2. Cancel OP, ....
    public note: string = null;
    public data: any = null;

    public constructor(init?: Partial<DeleteCancelModel>) {
        Object.assign(this, init);
    }
}

export enum DeleteCancelActionType {
    OP_DeleteOP,
    OP_ArchiveOP,
    OP_DeleteOrder,
    OP_DeleteInvoice,
    OP_CancelInvoice,
}
