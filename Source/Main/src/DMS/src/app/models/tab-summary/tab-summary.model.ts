import { TabSummaryInfoModel } from './tab-summary-info.model';
import { TabSummaryDataModel } from './tab-summary-data.model';
import { AccessRightModel } from '../access-right.model';
import { Observable, Subject } from 'rxjs';

export class TabFieldSummaryModel {
    name: string;
    value: any;
    textValue: string;
    columnName: string;
}

export enum BadgeTabEnum {
    None = 0,
    Completed = 1,
    Partial = 2,
}

export class TabSummaryModel {
    public tabSummaryInfor: TabSummaryInfoModel = new TabSummaryInfoModel();
    public tabSummaryData: TabSummaryDataModel[] = [];
    public tabSummaryMenu: TabSummaryDataModel[] = [];
    public tabSummaryRawData: Array<any> = [];
    public active: boolean = false;
    public disabled: boolean = false;
    public visible: boolean = true;
    public accessRight?: AccessRightModel;
    public showAsOtherTab: boolean = false;
    public fields: TabFieldSummaryModel[];
    public initDone = false;
    public badgeColorChanged: Subject<BadgeTabEnum>;
    public badgeColor = BadgeTabEnum.None;

    public constructor(init?: Partial<TabSummaryModel>) {
        Object.assign(this, init);
    }
}
