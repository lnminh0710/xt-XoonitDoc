import { Component, OnInit, OnDestroy, ElementRef, Input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { Uti } from '@app/utilities';
import { CustomerCommunication, CustomerCommunicationValue } from '../../models';
import orderBy from 'lodash-es/orderBy';

@Component({
    selector: 'customer-communication',
    styleUrls: ['./customer-communication.component.scss'],
    templateUrl: './customer-communication.component.html'
})
export class CustomerCommunicationComponent extends BaseComponent implements OnInit, OnDestroy {
    public contactList: any = [];

    private _widgetDetail: any;
    @Input() set widgetDetail(data: any) {
        if (data) {
            this._widgetDetail = data;
            this.mapData();
        }
    }

    constructor(
        protected router: Router,
        protected elRef: ElementRef,
        protected uti: Uti
    ) {
        super(router);
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private mapData() {
        if (!this._widgetDetail || !this._widgetDetail.contentDetail ||
            !this._widgetDetail.contentDetail.data || !this._widgetDetail.contentDetail.data.length) {
            this.contactList.length = 0;
            return;
        }

        const data = this._widgetDetail.contentDetail.data[0];

        this.contactList = data.map((item, index) => {
            let contact = new CustomerCommunication({
                id: index + '',
                isMain: item.IsMain ? true : false,
                businessTitle: item.BusinessTitle,
                name: item.ContactName
            });

            //[{"DefaultValue":"Skype","CommValue1":"tran truong duong"},{"DefaultValue":"Mobile Phone","CommValue1":"09090909090"}]
            if (item.Communication) {
                const communications = JSON.parse(item.Communication);
                if (communications.length) {
                    contact.values = communications.map((com, indexCom) => {
                        return new CustomerCommunicationValue({
                            isMain: com.IsMainCommunication ? true : false,
                            value1: com.DefaultValue,
                            value2: com.CommValue1,
                        })
                    });

                    //Sort values
                    contact.values = orderBy(contact.values, ['isMain'], ['desc']);
                    //get mailValue
                    if (contact.values.length) {
                        contact.mailValue = contact.values.shift();
                    }
                }
            }

            return contact;
        });

        //Sort contact List
        this.contactList = orderBy(this.contactList, ['isMain'], ['desc']);
    }

    private createFakeData() {
        this.contactList = [
            new CustomerCommunication({
                id: '1',
                isMain: true,
                businessTitle: 'Administration',
                name: '',
                mailValue: new CustomerCommunicationValue({
                    isMain: true,
                    value1: 'Phone Desk',
                    value2: '+41 44 650 50 50'
                }),
                values: [
                    new CustomerCommunicationValue({
                        value1: 'Skype',
                        value2: 'huycool'
                    }),
                    new CustomerCommunicationValue({
                        value1: 'Zalo',
                        value2: 'huypro'
                    }),
                    new CustomerCommunicationValue({
                        value1: 'wechat',
                        value2: 'huyhandsome'
                    })
                ]
            }),
            new CustomerCommunication({
                id: '2',
                isMain: false,
                businessTitle: 'CEO',
                name: 'Michel Graf',
                mailValue: new CustomerCommunicationValue({
                    value1: 'Mobile private',
                    value2: '+41 79 698 65 13'
                }),
                values: [
                    new CustomerCommunicationValue({
                        value1: 'Skype',
                        value2: 'huycool2'
                    }),
                    new CustomerCommunicationValue({
                        value1: 'Zalo',
                        value2: 'huypro2'
                    }),
                    new CustomerCommunicationValue({
                        value1: 'wechat',
                        value2: 'huyhandsome2'
                    })
                ]
            }),
            new CustomerCommunication({
                id: '3',
                isMain: false,
                businessTitle: 'PM',
                name: 'Lam Huynh',
                mailValue: new CustomerCommunicationValue({
                    value1: 'Phone direct',
                    value2: '+84 770 777'
                })
            }),
            new CustomerCommunication({
                id: '4',
                isMain: false,
                businessTitle: 'Team Leader',
                name: 'Michel Werndli',
                mailValue: new CustomerCommunicationValue({
                    value1: 'Phone direct',
                    value2: '+41 79 698 65 61'
                }),
                values: [
                    new CustomerCommunicationValue({
                        value1: 'Skype',
                        value2: 'huycool3'
                    }),
                    new CustomerCommunicationValue({
                        value1: 'Zalo',
                        value2: 'huypro3'
                    }),
                    new CustomerCommunicationValue({
                        value1: 'wechat',
                        value2: 'huyhandsome3'
                    })
                ]
            })
        ];
    }

    public showMore(popup, id) {
        popup.show(false);
    }
}
