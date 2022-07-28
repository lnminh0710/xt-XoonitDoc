export enum HistoryEnum {
    Person = 'ApprovalUser',
    DateTime = 'Date',
    ReasonReject = 'Notes',
    StatusApproval = 'Status',
    StatusLabel = 'StatusLabel',
}

export class ConfirmHistory {
    public Status: boolean;
    public ApprovalUser: string;
    public Date: string;
    public Notes: string;
    public StatusApproval: StatusApprovalEnum;
    public StatusLabel: string;

    public constructor(init?: Partial<ConfirmHistory>) {
        Object.assign(this, init);
    }
}

export enum StatusApprovalEnum {
    Pending = null,
    Approved = 1,
    Rejected = 0,
}
