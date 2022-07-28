export class ArticleDetailViewModel {
    public idArticle: number;
    public artilceNr: string;
    public articleNameShort: string;
    public articleDescription: string;

    public constructor(init?: Partial<ArticleDetailViewModel>) {
        Object.assign(this, init);
    }
}
