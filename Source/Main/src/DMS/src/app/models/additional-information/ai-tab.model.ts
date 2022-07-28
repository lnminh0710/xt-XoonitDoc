import { AdditionalInfromationTabContentModel } from './ai-tab-content.model'

export class AdditionalInfromationTabModel {
    public TabID: string = '';
    public TabName?: string = '';
    public Active?: boolean = false;
    public Disabled?: boolean = false;
    public Removable?: boolean = false;
    public TabContent?: AdditionalInfromationTabContentModel = null;
    public Visible?: boolean = false;
    public Loaded?: boolean = false;

    public constructor(init?: Partial<AdditionalInfromationTabModel>) {
        Object.assign(this, init);
    }
}
