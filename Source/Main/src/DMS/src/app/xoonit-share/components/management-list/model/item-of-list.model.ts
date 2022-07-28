export class ItemOfList {
    id: string;
    name: string;
    isActive?: boolean = false;
    fontawesomeIconName?: string;
    htmlIcon?: string;
    editable?: boolean = true;
    deletable?: boolean = true;
    children: ItemOfList[];

    constructor(init?: Partial<ItemOfList>) {
        Object.assign(this, init);
    }
}

export class ItemFlatOfList {
    id: string;
    name: string;
    isActive?: boolean = true;
    fontawesomeIconName?: string;
    htmlIcon?: string;
    editable?: boolean = true;
    deletable?: boolean = true;
    level: number;
    expandable: boolean;

    constructor(init?: Partial<ItemOfList>) {
        Object.assign(this, init);
    }
}
