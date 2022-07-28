/**
 * ArticleOrder
 */
export class ArticleOrder {
    public idArticle: number;
    public idSalesOrder: number;
    public idSalesOrderArticles: number;
    public articleNumber: string;
    public description: string;
    public quantity: number;
    public price: number;
    public total: number;
    public keep: number;
    public back: number;
    public defect: number;

    public constructor(init?: Partial<ArticleOrder>) {
        Object.assign(this, init);
    }
}

/**
 * ArticleQuantity
 */
export class ArticleQuantity {
    public defaultValue: number;
    public value: number;
    public valid: boolean;
    public status: ArticleQuantityStatus = null;

    public constructor(init?: Partial<ArticleQuantity>) {
        Object.assign(this, init);
    }
}

export class ArticleQuantityStatus {
    public checked: boolean = false;
    public disabled: boolean = false;

    public constructor(init?: Partial<ArticleQuantityStatus>) {
        Object.assign(this, init);
    }
}