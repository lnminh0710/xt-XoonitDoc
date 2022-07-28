import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef } from "@angular/core";
import { TabSummaryModel } from "@app/models";
import { DocumentProcessingDetail, DocumentProcessing } from "../../models";

@Component({
    selector: 'document-processing',
    templateUrl: './document-processing.component.html',
    styleUrls: ['./document-processing.component.scss']
})
export class DocumentProcessingComponent implements OnInit, OnDestroy, AfterViewInit {

    public documentProcessingList: Array<DocumentProcessing> = [];

    private _data: TabSummaryModel;
    @Input() set data(data: TabSummaryModel) {
        if (data) {
            //console.log(data);
            this._data = data;
            this.mapData();
        }
    }

    constructor(private _eref: ElementRef) {
    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
        //this.createFakeData();
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
    }

    /**
     * ngAfterViewInit
     */
    public ngAfterViewInit() {
    }

    private mapData() {
        if (!this._data || !this._data.tabSummaryData) return;

        this.documentProcessingList = this._data.tabSummaryRawData.map((item, index) => {
            let documentProcessing = new DocumentProcessing({
                icon: item.iconName,
                type: this.getType(item.processingType),
                documentProcessingDetail: new DocumentProcessingDetail({
                    email: item.email,
                    complaints: item.complaints_Objections,
                    contracts: item.contracts,
                    generalCorresopondence: item.general_Corresspondencel
                })
            });
            return documentProcessing;
        });
    }

    private getType(processingType: number) {
        switch (processingType) {
            case 1:
                return 'offers';
            case 2:
                return 'orders';
            case 3:
                return 'delivery';
            case 4:
                return 'invoices';
            case 5:
                return 'depts';
            default:
                return 'orders';
        }
    }

    /**
     * createFakeData
     * */
    public createFakeData() {
        this.documentProcessingList = [
            new DocumentProcessing({
                icon: 'fa-book',
                type: 'offers',
                documentProcessingDetail: new DocumentProcessingDetail({
                    email: 69,
                    complaints: 69,
                    contracts: 69,
                    generalCorresopondence: 69
                })
            }),
            new DocumentProcessing({
                icon: '',
                type: 'orders',
                documentProcessingDetail: new DocumentProcessingDetail({
                    email: 69,
                    complaints: 69,
                    contracts: 69,
                    generalCorresopondence: 69
                })
            }),
            new DocumentProcessing({
                icon: '',
                type: 'delivery',
                documentProcessingDetail: new DocumentProcessingDetail({
                    email: 69,
                    complaints: 69,
                    contracts: 69,
                    generalCorresopondence: 69
                })
            })            
        ];
    }
}
