import { AdditionalInfromationTabModel } from './ai-tab.model'
import { AdditionalInfromationPageModel } from './ai-page.model'

export class AdditionalInfromationMainModel {
    public SimpleTabs: AdditionalInfromationTabModel[] = null;
    public Page: AdditionalInfromationPageModel = null;

    constructor(init?: Partial<AdditionalInfromationMainModel>) {
        Object.assign(this, init);
    }
}
