import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { HotKeySetting } from '@app/models';
import { map } from 'rxjs/operators';

@Injectable()
export class HotKeySettingService {
    private hotKeySettingState$: Observable<HotKeySetting>;
    public articleNr$: Observable<{ key: string; value: string }>;
    public quantity$: Observable<{ key: string; value: string }>;
    public campaignNumber$: Observable<{ key: string; value: string }>;
    public barcode$: Observable<{ key: string; value: string }>;
    public barcodeStatus$: Observable<{ key: string; value: string }>;
    public customer$: Observable<{ key: string; value: string }>;
    public mediacode$: Observable<{ key: string; value: string }>;
    public orderBy$: Observable<{ key: string; value: string }>;
    public orderType$: Observable<{ key: string; value: string }>;
    public orderDate$: Observable<{ key: string; value: string }>;
    public idRepIsoCountryCode$: Observable<{ key: string; value: string }>;
    public idRepLanguage$: Observable<{ key: string; value: string }>;
    public idRepTitle$: Observable<{ key: string; value: string }>;
    public dateOfBirth$: Observable<{ key: string; value: string }>;
    public firstName$: Observable<{ key: string; value: string }>;
    public lastName$: Observable<{ key: string; value: string }>;
    public nameAddition$: Observable<{ key: string; value: string }>;
    public street$: Observable<{ key: string; value: string }>;
    public streetNr$: Observable<{ key: string; value: string }>;
    public streetAddition1$: Observable<{ key: string; value: string }>;
    public streetAddition2$: Observable<{ key: string; value: string }>;
    public idRepPoBox$: Observable<{ key: string; value: string }>;
    public poboxLabel$: Observable<{ key: string; value: string }>;
    public zip$: Observable<{ key: string; value: string }>;
    public zip2$: Observable<{ key: string; value: string }>;
    public place$: Observable<{ key: string; value: string }>;
    public area$: Observable<{ key: string; value: string }>;
    public allArticle$: Observable<{ key: string; value: string }>;
    public gift$: Observable<{ key: string; value: string }>;
    public addArticle$: Observable<{ key: string; value: string }>;
    public deliveryCharge$: Observable<{ key: string; value: string }>;
    public allGift$: Observable<{ key: string; value: string }>;
    public giftMale$: Observable<{ key: string; value: string }>;
    public giftFemale$: Observable<{ key: string; value: string }>;
    public paymentTypeCreditCardMonthDefault$: Observable<{ key: string; value: string }>;
    public paymentTypeCreditCardMonth3M$: Observable<{ key: string; value: string }>;
    public paymentTypeCreditCardMonth6M$: Observable<{ key: string; value: string }>;
    public paymentTypeCreditCardMonth12M$: Observable<{ key: string; value: string }>;
    public paymentTypeCreditCardMonthCustom$: Observable<{ key: string; value: string }>;
    public paymentTypeCtrl$: Observable<{ key: string; value: string }>;
    public paymentTypeCreditCardIssuer$: Observable<{ key: string; value: string }>;
    public paymentTypeCreditCardNumber$: Observable<{ key: string; value: string }>;
    public paymentTypeCreditCardValidThru$: Observable<{ key: string; value: string }>;
    public paymentTypeCreditCardCVV$: Observable<{ key: string; value: string }>;
    public paymentTypeChequeAddAmount$: Observable<{ key: string; value: string }>;
    public paymentTypeChequeRemoveAmount$: Observable<{ key: string; value: string }>;

    constructor(private store: Store<any>) {
        this.hotKeySettingState$ = store.select((state) => state.hotKeySettingtState.hotKeySetting);

        //expose to view
        this.articleNr$ = this.getHotKey('articleNr');
        this.quantity$ = this.getHotKey('quantity');
        this.campaignNumber$ = this.getHotKey('campaignNumber');
        this.barcode$ = this.getHotKey('barcode');
        this.barcodeStatus$ = this.getHotKey('barcodeStatus');
        this.customer$ = this.getHotKey('customer');
        this.mediacode$ = this.getHotKey('mediacode');
        this.orderBy$ = this.getHotKey('orderBy');
        this.orderType$ = this.getHotKey('orderType');
        this.orderDate$ = this.getHotKey('orderDate');
        this.idRepIsoCountryCode$ = this.getHotKey('idRepIsoCountryCode');
        this.idRepLanguage$ = this.getHotKey('idRepLanguage');
        this.idRepIsoCountryCode$ = this.getHotKey('idRepIsoCountryCode');
        this.idRepTitle$ = this.getHotKey('idRepTitle');
        this.dateOfBirth$ = this.getHotKey('dateOfBirth');
        this.firstName$ = this.getHotKey('firstName');
        this.lastName$ = this.getHotKey('lastName');
        this.nameAddition$ = this.getHotKey('nameAddition');
        this.idRepLanguage$ = this.getHotKey('idRepLanguage');
        this.street$ = this.getHotKey('street');
        this.streetNr$ = this.getHotKey('streetNr');
        this.streetAddition1$ = this.getHotKey('streetAddition1');
        this.streetAddition2$ = this.getHotKey('streetAddition2');
        this.idRepPoBox$ = this.getHotKey('idRepPoBox');
        this.poboxLabel$ = this.getHotKey('poboxLabel');
        this.zip$ = this.getHotKey('zip');
        this.zip2$ = this.getHotKey('zip2');
        this.place$ = this.getHotKey('place');
        this.area$ = this.getHotKey('area');
        this.allArticle$ = this.getHotKey('allArticle');
        this.gift$ = this.getHotKey('gift');
        this.addArticle$ = this.getHotKey('addArticle');
        this.deliveryCharge$ = this.getHotKey('deliveryCharge');
        this.allGift$ = this.getHotKey('allGift');
        this.giftMale$ = this.getHotKey('giftMale');
        this.giftFemale$ = this.getHotKey('giftFemale');

        this.paymentTypeCreditCardMonthDefault$ = this.getHotKey('paymentTypeCreditCardMonthDefault');
        this.paymentTypeCreditCardMonth3M$ = this.getHotKey('paymentTypeCreditCardMonth3M');
        this.paymentTypeCreditCardMonth6M$ = this.getHotKey('paymentTypeCreditCardMonth6M');
        this.paymentTypeCreditCardMonth12M$ = this.getHotKey('paymentTypeCreditCardMonth12M');
        this.paymentTypeCreditCardMonthCustom$ = this.getHotKey('paymentTypeCreditCardMonthCustom');
        this.paymentTypeCtrl$ = this.getHotKey('paymentTypeCtrl');
        this.paymentTypeCreditCardIssuer$ = this.getHotKey('paymentTypeCreditCardIssuer');
        this.paymentTypeCreditCardNumber$ = this.getHotKey('paymentTypeCreditCardNumber');
        this.paymentTypeCreditCardValidThru$ = this.getHotKey('paymentTypeCreditCardValidThru');
        this.paymentTypeCreditCardCVV$ = this.getHotKey('paymentTypeCreditCardCVV');
        this.paymentTypeChequeAddAmount$ = this.getHotKey('paymentTypeChequeAddAmount');
        this.paymentTypeChequeRemoveAmount$ = this.getHotKey('paymentTypeChequeRemoveAmount');
    }

    /**
     * getHotKey
     * @param key
     */
    public getHotKey(key: string): Observable<{ key: string; value: string }> {
        return this.hotKeySettingState$.pipe(
            map((vm) => {
                const obj = {
                    key: key,
                    value: vm[key],
                };
                return obj;
            }),
        );
    }

    /**
     * getHotKeyTab
     * @param key
     */
    public getHotKeyTab(key: string): Observable<{ key: string; value: string }> {
        return this.hotKeySettingState$.pipe(
            map((vm) => {
                const obj = {
                    key: 'tab_' + key,
                    value: vm['tab_' + key],
                };
                return obj;
            }),
        );
    }
}
