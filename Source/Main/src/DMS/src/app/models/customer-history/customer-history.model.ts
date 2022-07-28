import { UUID } from 'angular2-uuid';

/**
 * HistoryHeaderMenuItem
 */
export class HistoryHeaderMenuItem {
    public text: string;
    public icon: string;
    public action: HistoryHeaderMenuItemAction = null;

    constructor(init?: Partial<HistoryHeaderMenuItem>) {
        Object.assign(this, init);
    }
}

export class HistoryHeaderMenuItemAction {
    public type: number = null;
    public query: string = '';

    constructor(init?: Partial<HistoryHeaderMenuItemAction>) {
        Object.assign(this, init);
    }
}

export class HistoryHeaderMenu {
    public type: number = null;
    public items: Array<HistoryHeaderMenuItem> = null;

    public constructor(init?: Partial<HistoryHeaderMenu>) {
        Object.assign(this, init);
    }
}

/**
 * HistoryHeaderInfo
 */
export class HistoryHeaderInfo {
    public content: HistoryHeaderInfoContent = null;
    public menu: Array<HistoryHeaderMenu> = null;

    public constructor(init?: Partial<HistoryHeaderInfo>) {
        Object.assign(this, init);
    }
}

export class HistoryHeaderInfoContent {
    public text: string = '';
    public icon: string = '';

    public constructor(init?: Partial<HistoryHeaderInfoContent>) {
        Object.assign(this, init);
    }
}

/**
 * HistoryBodyInfo
 */
export class HistoryBodyInfo {
    public type: number = null;
    public content: any = null;

    public constructor(init?: Partial<HistoryBodyInfo>) {
        Object.assign(this, init);
    }
}

/**
 * HistoryFooterInfo
 */
export class HistoryFooterInfo {
    public date: string = null;
    public icon: string = null;
    public infoJsonString: string = null;

    public constructor(init?: Partial<HistoryFooterInfo>) {
        Object.assign(this, init);
    }
}

/**
 * CustomerHistory
 */
export class CustomerHistory {
    public id: string = UUID.UUID();
    public header: HistoryHeaderInfo = null;
    public body: HistoryBodyInfo = null;
    public footer: HistoryFooterInfo = null;
    public isHidden: boolean = false;
    public constructor(init?: Partial<CustomerHistory>) {
        Object.assign(this, init);
    }
}
