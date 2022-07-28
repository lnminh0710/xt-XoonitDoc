import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { Uti } from '@app/utilities';

@Component({
    selector: 'customer-logo',
    styleUrls: ['./customer-logo.component.scss'],
    templateUrl: './customer-logo.component.html'
})
export class CustomerLogoComponent extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    public imageLoaded: boolean = false;
    public imageUrl: string = '';
    public uploadMessage: string = '';
    public fileData: any = {};

    private _widgetDetail: any;
    @Input() set widgetDetail(data: any) {
        if (data) {
            this._widgetDetail = data;
            this.mapData();
        }
    }

    @Input() set logoName(logoName: any) {
        this.setImage(logoName);
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

    ngAfterViewInit() {
        this.registerAvataChangeEvent();
    }

    ngOnDestroy() {
        Uti.unsubscribe(this);
    }

    private setImage(logoName) {
        this.imageUrl = Uti.getCustomerLogoUrl(logoName, '300');
    }

    private mapData() {
        if (!this._widgetDetail || !this._widgetDetail.contentDetail ||
            !this._widgetDetail.contentDetail.data || this._widgetDetail.contentDetail.data.length < 2) return;

        const data = this._widgetDetail.contentDetail.data[1];
        for (let i = 0, length = data.length; i < length; i++) {
            const item = data[i];
            if (item['OriginalColumnName'] == 'Avatar') {
                this.imageUrl = Uti.getCustomerLogoUrl(item.Value, '300');
                break;
            }
        }//for
    }

    private registerAvataChangeEvent() {
        setTimeout(() => {
            let that: CustomerLogoComponent = this;
            let ctrlFileUpload = $(that.elRef.nativeElement).find('input[type="file"]');
            if (!ctrlFileUpload.length) return;
            ctrlFileUpload.change(function () {
                const files = (<any>this).files;
                if (files.length <= 0) return;

                let isValidFile = false;
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (e.target['result']) {
                        $(that.elRef.nativeElement).find('img').attr('src', e.target.result as string);
                        if (isValidFile) {
                            that.fileData['result'] = e.target['result'];
                        }
                    }
                }

                reader.readAsDataURL(files[0]);
                that.fileData = files[0];
                //The max file size upload limit is 1MB
                if (that.fileData.size > 1024000) {
                    that.fileData = {};
                    that.uploadMessage = 'The max file size upload limit is 1MB';
                    console.log(that.fileData);
                }
                else {
                    isValidFile = true;
                    that.uploadMessage = '';
                }
            });
        }, 700);
    }

    public avataLoaded(event) {
        this.imageLoaded = true;
    }

    public getSavingData() {
        const fileData = this.fileData || {};
        return {
            type: fileData.type,
            webkitRelativePath: fileData.webkitRelativePath,

            //Need to these params
            size: fileData.size,
            name: fileData.name,
            result: fileData.result
        };
    }
}
