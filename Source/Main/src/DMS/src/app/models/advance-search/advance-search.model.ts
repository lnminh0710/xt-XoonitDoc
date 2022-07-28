/**
 * AdvanceSearchFilter
 */
export class AdvanceSearchFilter {
    public condition: string;
    public field: string;
    public operator: string;
    public value: any;
    public dataType: string;    

    public constructor(init?: Partial<AdvanceSearchFilter>) {
        Object.assign(this, init);
    }
}
