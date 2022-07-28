import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef } from "@angular/core";
import { OrderProcessing, OrderProcessingDetail } from "../../models";
import { TabSummaryModel } from "@app/models";

@Component({
    selector: 'order-processing',
    templateUrl: './order-processing.component.html',
    styleUrls: ['./order-processing.component.scss']
})
export class OrderProcessingComponent implements OnInit, OnDestroy, AfterViewInit {

    public orderProcessingList: Array<OrderProcessing> = [];

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

        this.orderProcessingList = this._data.tabSummaryRawData.map((item, index) => {
            let orderProcessing = new OrderProcessing({
                icon: item.iconName,
                toolTip: item.toolTip,
                type: this.getType(item.processingType),
                orderProcessingDetail: new OrderProcessingDetail({
                    inProgress: item.dataInProgress,
                    overdue: item.dataOverdue,
                    shipped: item.dataShipped,
                    total: item.dataTotal
                })
            });
            return orderProcessing;
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
        this.orderProcessingList = [
            new OrderProcessing({
                icon: 'fa-book',
                type: 'offers',
                orderProcessingDetail: new OrderProcessingDetail({
                    inProgress: 69,
                    overdue: 69,
                    shipped: 69,
                    total: 69 
                })
            }),
            new OrderProcessing({
                icon: 'fa-shopping-cart',
                type: 'orders',
                orderProcessingDetail: new OrderProcessingDetail({
                    inProgress: 69,
                    overdue: 69,
                    shipped: 69,
                    total: 69
                })
            }),
            new OrderProcessing({
                icon: 'fa-truck',
                type: 'delivery',
                orderProcessingDetail: new OrderProcessingDetail({
                    inProgress: 69,
                    overdue: 69,
                    shipped: 69,
                    total: 69
                })
            }),
            new OrderProcessing({
                icon: 'fa-dollar',
                type: 'invoices',
                orderProcessingDetail: new OrderProcessingDetail({
                    inProgress: 69,
                    overdue: 69,
                    shipped: 69,
                    total: 69
                })
            }),
            new OrderProcessing({
                icon: 'fa-money',
                //title: 'Debts',
                type: 'depts',
                orderProcessingDetail: new OrderProcessingDetail({
                    inProgress: 69,
                    overdue: 69,
                    shipped: 69,
                    total: 69
                })
            })
        ];
    }
}
