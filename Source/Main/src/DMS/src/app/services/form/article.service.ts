import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base.service';
import { ArticleMediaModel } from '@app/models';
import { map } from 'rxjs/operators';

@Injectable()
export class ArticleService extends BaseService {
    constructor(injector: Injector) {
        super(injector);
    }

    public getArticleById(idArticle: string, idLanguage?: string): Observable<any> {
        return this.get<any>(this.serUrl.getArticleById, {
            idArticle: idArticle,
            idLanguage: idLanguage
        });
    }

    public checkArticleNr(number: string, currentNumber: any): Observable<any> {
        return this.get<any>(this.serUrl.checkArticleNr, {
            articleNr: number,
            currentArticleNr: currentNumber
        }, null, null, null, 200).pipe(
            map((res: any) => {
                return (!!res.item.data[0][0].CountReturn) ? { 'exists': true } : null;
            }),
        );
    }

    public getArticleByNr(number: string): Observable<any> {
        return this.get<any>(this.serUrl.getArticleByNr, {
            articleNr: number
        });
    }

    public searchArticleByNr(mediaCode: string, articleNr: string, idCountrylanguage?: string): Observable<any> {
        return this.get<any>(this.serUrl.searchArticleByNr, {
            mediaCode: mediaCode,
            articleNr: articleNr,
            idCountrylanguage: idCountrylanguage
        });
    }

    public createArticle(data: any): Observable<any> {
        return this.post<any>(this.serUrl.createArticle, JSON.stringify(data));
    }

    public updateArticle(data: any): Observable<any> {
        return this.post<any>(this.serUrl.updateArticle, JSON.stringify(data));
    }

    public createArticlePurchasing(data: any): Observable<any> {
        return this.post<any>(this.serUrl.createArticlePurchasing, JSON.stringify(data));
    }

    public getArticleSetComposition(articleId: any): Observable<any> {
        return this.get<any>(this.serUrl.getArticleSetComposition, {
            idArticle: articleId
        });
    }

    public updateArticleSetComposition(data: any): Observable<any> {
        return this.post<any>(this.serUrl.updateArticleSetComposition, JSON.stringify(data));
    }

    public insertArticleMedia(data: ArticleMediaModel): Observable<any> {
        return this.post<any>(this.serUrl.insertArticleMedia, JSON.stringify(data));
    }

    public updateArticleMedia(data: ArticleMediaModel): Observable<any> {
        return this.post<any>(this.serUrl.updateArticleMedia, JSON.stringify(data));
    }

    public getArticleMedia(idArticle: number): Observable<any> {
        return this.get<any>(this.serUrl.getArticleMedia, {
            idArticle: idArticle
        });
    }
}
