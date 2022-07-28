import  { DataColumn } from './data-column.model';

export class MatchingGroup {
    public Conditions: Array<DataColumn>;
    public GroupId: number;
    public GroupLevel: string = '';
    public GroupName: string;    
    public IsAutoMatching: boolean;
    public MatchingStatus: number = null
    public IsActive: boolean;

    public constructor(init?: Partial<MatchingGroup>) {
        Object.assign(this, init);      
    }
}
