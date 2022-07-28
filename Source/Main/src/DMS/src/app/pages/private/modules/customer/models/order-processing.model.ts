/**
 * OrderProcessing
 */
export class OrderProcessing {
    public icon : string;
    public type: string;
    public title: string;
    public toolTip: string;
    public orderProcessingDetail: OrderProcessingDetail;

    public constructor(init?: Partial<OrderProcessing>) {
        Object.assign(this, init);
    }
}

/**
 * OrderProcessingDetail
 **/
export class OrderProcessingDetail {
    public overdue : number;
    public shipped: number;
    public inProgress: number;
    public total: number;

    public constructor(init?: Partial<OrderProcessingDetail>) {
        Object.assign(this, init);
    }
}
