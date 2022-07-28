import { Component, Output, EventEmitter, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import cloneDeep from 'lodash-es/cloneDeep';
import {   
    WidgetDetail, WidgetType
} from '@app/models';
import { Uti } from '@app/utilities/uti';

@Component({
    selector: 'xn-credit-card',
    styleUrls: ['./xn-credit-card.component.scss'],
    templateUrl: './xn-credit-card.component.html'
})
export class XnCreditCardComponent implements OnInit, OnDestroy {
    public isRendered = false;
    public creditCards: any = [];
    public selectedCreditCards: any = [];
    public config: any = {};
    private initationData: any;
    public _editMode = false;

    public perfectScrollbarConfig: any = {};

    @Input() set initInformation(initInformation: any) {
        if (initInformation && initInformation.data && initInformation.config) {
            this.initationData = cloneDeep(initInformation.data);
            this.creditCards = initInformation.data;
            this.selectedCreditCards = this.getSelectedCreditCard(this.creditCards);
            this.config = initInformation.config;
        }
    }

    @Input() set editMode(data: boolean) {
        this._editMode = data;
    }

    @Input() set widgetDetail(data : WidgetDetail) {
        let creditCardData = this.setUpDataForCreditCard(data);
        this.initInformation = creditCardData;
        this.editMode = false;
    };

    // If true , this form is displaying on Widget
    private _isActivated: boolean;
    @Input() set isActivated(status: boolean) {
        this._isActivated = status;
        if (!status) {
            this.ref.detach();
        }
        else {
            this.ref.reattach();
        }
    };

    get isActivated() {
        return this._isActivated;
    }

    @Output() selectedData: EventEmitter<any> = new EventEmitter();
    @Output() changeToEditMode: EventEmitter<any> = new EventEmitter();

    public isFormChanged: boolean;

    constructor(
        private ref: ChangeDetectorRef
    ) {
    }

    public ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        }
        this.isRendered = true;
    }

    public ngOnDestroy() {
    }

    public resetCreditCardComponent() {
        this.creditCards = cloneDeep(this.initationData);
        this.selectedCreditCards = this.getSelectedCreditCard(this.creditCards);
        this.ref.detectChanges();
    }

    private itemChanged() {
        this.isFormChanged = true;
        this.selectedData.emit(this.creditCards);
    }

    public callChangeToEditMode($event) {
        this._editMode = true;
        this.changeToEditMode.emit(true);
    }

    private getSelectedCreditCard(creditCards) {
        return creditCards.filter(cc => cc.select);
    }

    private checkHasSubCollectionData(data: WidgetDetail) {
        try {          
            return (data.contentDetail.data[3] && data.contentDetail.data[3].length);
        } catch (ex) {
            return false;
        }
    }

    /**
     * setUpDataForCreditCard
     * @param data
     */
    private setUpDataForCreditCard(data: WidgetDetail) {
        if (!this.checkHasSubCollectionData(data) || data.idRepWidgetType !== WidgetType.CombinationCreditCard) { return; }
        const array = data.contentDetail.data[3].map(function (x) {
            return {
                'id': Uti.strValObj(x.IdCashProviderContractCreditcardTypeContainer),
                'iconFileName': Uti.strValObj(x.IconFileName),
                'textValue': Uti.strValObj(x.DefaultValue),
                'select': !!Uti.strValObj(x.IsActive)
            };
        });
        let creditCardData : any = {
            data: array,
            config: {
                headerText: 'Credit card',
                editMode: false
            }
        };
        return creditCardData;
    }
}
