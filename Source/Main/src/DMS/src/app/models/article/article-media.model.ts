export class ArticleMediaModel {
    public articleGroupsMedia : ArticleGroupsMedia = null;
    public sharingTreeMedia: SharingTreeMedia = null;

    public constructor(init?: Partial<ArticleMediaModel>) {
        Object.assign(this, init);
    }
}

export class ArticleGroupsMedia {
    public idArticle: number = null;
    public idSharingTreeMedia: number = null;
    public isActive: boolean = false;
    public idArticleGroupsMedia: number = null;
    public isDeleted: boolean = false;
    
    public constructor(init?: Partial<ArticleGroupsMedia>) {
        Object.assign(this, init);
    }
}

export class SharingTreeMedia {
    public idRepTreeMediaType: number = null;
    public idSharingTreeGroups: number = null;
    public mediaRelativePath: string = '';
    public mediaName: string = '';
    public mediaOriginalName: string = '';
    public mediaNotes: string = '';
    public mediaTitle: string = '';
    public mediaDescription: string = '';
    public mediaSize: string = '';
    public mediaHight: string = '';
    public mediaWidth: string = '';
    public mediaPassword: string = '';
    public isBlocked: boolean = false;
    public idSharingTreeMedia: number = null;
    public isDeleted: boolean = false;
    
    public constructor(init?: Partial<SharingTreeMedia>) {
        Object.assign(this, init);
    }
}