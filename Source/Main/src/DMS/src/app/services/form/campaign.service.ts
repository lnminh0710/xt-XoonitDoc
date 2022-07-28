import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseService } from '../base.service';
import { DatatableService } from '@app/services';
import { CheckCampaignNumber } from '@app/models/apimodel';

import isNil from 'lodash-es/isNil';
import { map } from 'rxjs/operators';

@Injectable()
export class CampaignService extends BaseService {
    constructor(
        injector: Injector,
        @Inject(forwardRef(() => DatatableService)) public datatableService: DatatableService,
    ) {
        super(injector);
    }

    public getCampaignArticle(idSalesCampaignWizard: any): Observable<any> {
        return this.get<any>(this.serUrl.getCampaignArticle, {
            idSalesCampaignWizard: idSalesCampaignWizard,
        });
    }

    public getCampaignArticleCountries(idArticle: any, idSalesCampaignWizard: any): Observable<any> {
        return this.get<any>(this.serUrl.getCampaignArticleCountries, {
            idArticle: idArticle,
            idSalesCampaignWizard: idSalesCampaignWizard,
        });
    }

    public createCampaignArticle(data: any): Observable<any> {
        return this.post<any>(this.serUrl.createCampaignArticle, JSON.stringify(data));
    }

    public createMediaCode(data: any): Observable<any> {
        return this.post<any>(this.serUrl.createMediaCode, JSON.stringify(data));
    }

    public saveCampaignWizard(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveCampaignWizard, JSON.stringify(data));
    }

    public saveCampaignWizardCountriesT2(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveCampaignWizardCountriesT2, JSON.stringify(data));
    }

    public getCampaignWizardCountry(idSalesCampaignWizard?: number): Observable<any> {
        return this.get<any>(this.serUrl.getCampaignWizardCountry, {
            idSalesCampaignWizard: idSalesCampaignWizard,
        });
    }

    public getCampaignWizardT1(idSalesCampaignWizard: any): Observable<any> {
        return this.get<any>(this.serUrl.getCampaignWizardT1, {
            idSalesCampaignWizard: idSalesCampaignWizard,
        });
    }

    public getCampaignWizardT2(idSalesCampaignWizard: any, idLanguage?: string): Observable<any> {
        return this.get<any>(this.serUrl.getCampaignWizardT2, {
            idSalesCampaignWizard: idSalesCampaignWizard,
            idLanguage: idLanguage,
        }).pipe(
            map((result: any) => {
                result = this.datatableService.formatDataTableFromRawData(result.item.data);
                return result;
            }),
        );
    }

    public checkExistingMediaCodeMulti(mediaCodeNrs: string): Observable<any> {
        return this.get<any>(this.serUrl.checkExistingMediaCodeMulti, {
            mediaCodeNrs: mediaCodeNrs,
        });
    }

    public getMediaCodeDetail(idSalesCampaignWizardItems: any): Observable<any> {
        return this.get<any>(this.serUrl.getMediaCodeDetail, {
            idSalesCampaignWizardItems: idSalesCampaignWizardItems,
        });
    }

    public checkMediaCodeNumber(mediaCodeNr: string): Observable<any> {
        mediaCodeNr = mediaCodeNr ? mediaCodeNr.trim() : '';
        if (mediaCodeNr) {
            return this.get<any>(this.serUrl.searchMediaCode, {
                mediaCodeNr: mediaCodeNr,
            }).pipe(
                map((res: any) => {
                    return !!res.item.data[0][0].CountReturn ? { exists: true } : null;
                }),
            );
        } else {
            return of(null);
        }
    }

    public getCampaignTracks(idSalesCampaignWizard: any): Observable<any> {
        return this.get<any>(this.serUrl.getCampaignTracks, {
            idSalesCampaignWizard: idSalesCampaignWizard,
        });
    }

    public getCampaignTracksCountries(
        idSalesCampaignTracks: any,
        idSalesCampaignWizard: any,
        idSalesCampaignWizardTrack: any,
    ): Observable<any> {
        return this.get<any>(this.serUrl.getCampaignTracksCountries, {
            idSalesCampaignWizard: idSalesCampaignWizard,
            idSalesCampaignTracks: idSalesCampaignTracks,
            idSalesCampaignWizardTrack: idSalesCampaignWizardTrack,
        });
    }

    public saveCampaignTracks(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveCampaignTracks, JSON.stringify(data));
    }

    public saveCampaignCosts(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveCampaignCosts, JSON.stringify(data));
    }

    public getCampaignMediaCodeArticleSalesPrice(
        idCountrylanguage: any,
        idSalesCampaignWizard: any,
        idSalesCampaignArticle: any,
    ): Observable<any> {
        return this.get<any>(this.serUrl.getCampaignMediaCodeArticleSalesPrice, {
            idSalesCampaignWizard: idSalesCampaignWizard,
            idCountrylanguage: idCountrylanguage,
            idSalesCampaignArticle: idSalesCampaignArticle,
        });
    }

    public saveCampaignMediaCodeArticleSalesPrice(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveCampaignMediaCodeArticleSalesPrice, JSON.stringify(data));
    }

    public saveSalesCampaignAddOn(data: any, deleteFiles?: any, externalParam?: any): Observable<any> {
        return this.post<any>(
            this.serUrl.saveSalesCampaignAddOn,
            JSON.stringify({
                JSONText: '{"DocumentTemplate":' + JSON.stringify(data) + '}',
                DeleteFiles: deleteFiles,
                ExternalParam: externalParam,
            }),
        );
    }

    public saveDocumentTemplateSampleDataFile(data: any): Observable<any> {
        return this.post<any>(
            this.serUrl.saveDocumentTemplateSampleDataFile,
            JSON.stringify({ JSONText: '{"DocumentTemplateFile":' + JSON.stringify(data) + '}' }),
        );
    }

    public getCampaignCosts(id: any, _isWrap?: boolean): Observable<any> {
        if (isNil(_isWrap)) _isWrap = false;
        return this.get<any>(this.serUrl.getCampaignCosts, {
            idBusinessCosts: id,
            isWrap: _isWrap,
        });
    }

    public getCampaignCostsTreeView(idBusinessCosts: any): Observable<any> {
        return this.get<any>(this.serUrl.getCampaignCostsTreeView, {
            idBusinessCosts: idBusinessCosts,
        });
    }

    public checkCampaignNumber(checkCampaignNumber: CheckCampaignNumber): Observable<any> {
        return this.get<any>(this.serUrl.checkCampaignNumber, checkCampaignNumber);
    }

    public listDocumentTemplateColumnName(idRepAppSystemColumnNameTemplate: any): Observable<any> {
        return this.get<any>(this.serUrl.listDocumentTemplateColumnName, {
            idRepAppSystemColumnNameTemplate: idRepAppSystemColumnNameTemplate,
        });
    }

    public getDocumentTemplateCountries(idRepAppSystemColumnNameTemplate: any): Observable<any> {
        return this.get<any>(this.serUrl.getDocumentTemplateCountries, {
            idRepAppSystemColumnNameTemplate: idRepAppSystemColumnNameTemplate,
        });
    }

    public saveAppSystemColumnNameTemplate(data: any): Observable<any> {
        return this.post<any>(
            this.serUrl.saveAppSystemColumnNameTemplate,
            JSON.stringify({ JSONText: '{"SystemColumnNameTemplate":' + JSON.stringify(data) + '}' }),
        );
    }

    public listDocumentTemplatesBySharingTreeGroup(idSharingTreeGroups: any): Observable<any> {
        return this.get<any>(this.serUrl.listDocumentTemplatesBySharingTreeGroup, {
            idSharingTreeGroups: idSharingTreeGroups,
        });
    }

    public listTreeItemByIdSharingTreeGroupsRootname(idSharingTreeGroupsRootname: any): Observable<any> {
        return this.get<any>(this.serUrl.listTreeItemByIdSharingTreeGroupsRootname, {
            idSharingTreeGroupsRootname: idSharingTreeGroupsRootname,
        });
    }

    public saveFilesByIdSharingTreeGroups(data: any): Observable<any> {
        return this.post<any>(this.serUrl.saveFilesByIdSharingTreeGroups, JSON.stringify(data));
    }
}
