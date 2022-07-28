import { AdditionalInfromationPageModel } from './ai-page.model'

export class AdditionalInfromationTabContentModel {
	public Page: AdditionalInfromationPageModel = null;

    public constructor(init?: Partial<AdditionalInfromationTabContentModel>) {
        Object.assign(this, init);
    }
}
