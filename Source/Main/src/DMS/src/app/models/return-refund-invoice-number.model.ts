export class ReturnRefundInvoiceNumberModel {
    public idPerson: string = null;
    public invoiceDetailData: any = null;
    public isSalesOrderInvoice: string = null;
    public isSalesOrder: string = null;
    public invoiceNr: string = null;
    public idSalesOrderReturn: string = null;
    public idCountrylanguage: string = null;
    public mediaCode: string = null;
    public enableConfirmButton: boolean;

    public constructor(init?: Partial<ReturnRefundInvoiceNumberModel>) {
        Object.assign(this, init);
    }
}