export class ArticleModel {
    public articleManufacturersNr: any = '';
    public articleNr: any = {};
    public articleNameShort: any = {};
    public idArticle: any = {};
    public defaultValue: any = {};
    public articleDescriptionShort: any = {};
    public idArticleDescription: any = {};
    public idArticleName: any = {};
    public idRepIsoCountryCode: any = {};
    public isPrintProduct: any = {};
    public isService: any = {};
    public isSetArticle: any = {};
    public isVirtual: any = {};
    public notes: any = {};
    public countryCode: any = {};
    public dataInNotes: any = {};

    public constructor(init?: Partial<ArticleModel>) {
        Object.assign(this, init);
    }
}