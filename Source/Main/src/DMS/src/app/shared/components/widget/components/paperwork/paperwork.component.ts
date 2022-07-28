import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit, ElementRef } from "@angular/core";
import {
    DomHandler
} from '@app/services';

import { BaseWidgetModuleInfo } from '../widget-info';

import {
    WidgetDetail, WidgetType
} from '@app/models';

@Component({
    selector: 'paperwork',
    templateUrl: './paperwork.component.html',
    styleUrls: ['./paperwork.component.scss']
})
export class PaperworkComponent implements OnInit, OnDestroy, AfterViewInit {

    baseWidgetModuleInfo: BaseWidgetModuleInfo;

    constructor(public eref: ElementRef, private domHandler: DomHandler) {

    }

    /**
     * ngOnInit
     */
    public ngOnInit() {
    }

    /**
     * ngOnDestroy
     */
    public ngOnDestroy() {
    }

    /**
     * ngAfterViewInit
     */
    ngAfterViewInit() {
    }

    /**
     * registerWidgetModuleInfo
     * @param baseWidgetModuleInfo
     */
    public registerWidgetModuleInfo(widgetModuleInfo: BaseWidgetModuleInfo) {
        this.baseWidgetModuleInfo = widgetModuleInfo;
    }

    /**
     * setTitle
     * @param title
     */
    public setTitle(title: string) {
        let labelTitle: HTMLElement = this.domHandler.findSingle(this.eref.nativeElement, ".title");
        labelTitle.innerText = title;
    }

    /**
     * setBodyContent
     */
    public setBodyContent(element: any) {
        let bodyContainer: HTMLElement = this.domHandler.findSingle(this.eref.nativeElement, ".body-containner");        
        if (this.domHandler.isElement(element)) {
            bodyContainer.innerHTML = element.outerHTML;
        }
        else {
            bodyContainer.innerHTML = element;
        }
    }

    /**
     * createPrintContent
     */
    private createPrintContent() {
        if (!this.baseWidgetModuleInfo) {
            return;
        }
        let bodyContainer: any;
        const widgetDetail: WidgetDetail = this.baseWidgetModuleInfo.data;
        this.setTitle(widgetDetail.title);
        let widgetForm: any;
        switch (widgetDetail.idRepWidgetType) {
            case WidgetType.FieldSet:
            case WidgetType.FieldSetReadonly:
                bodyContainer = this.domHandler.findSingle(this.baseWidgetModuleInfo.elementRef.nativeElement, "widget-form");
                break;
            case WidgetType.EditableGrid:
            case WidgetType.TableWithFilter:
            case WidgetType.EditableRoleTreeGrid:
                bodyContainer = this.baseWidgetModuleInfo.agGridComponent ? this.baseWidgetModuleInfo.agGridComponent.getHTMLTable() : '';
                break;
            //case WidgetType.EditableRoleTreeGrid:
            //    bodyContainer = this.baseWidgetModuleInfo.treeGridComponent ? this.baseWidgetModuleInfo.treeGridComponent.getHTMLTable() : '';
            //    break;
            case WidgetType.DataGrid:
                if (this.baseWidgetModuleInfo.displayReadonlyGridAsForm) {
                    bodyContainer = this.domHandler.findSingle(this.baseWidgetModuleInfo.elementRef.nativeElement, "widget-form");
                } else {
                    bodyContainer = this.baseWidgetModuleInfo.agGridComponent ? this.baseWidgetModuleInfo.agGridComponent.getHTMLTable() : '';
                }
                break;
            case WidgetType.Combination:
                widgetForm = this.domHandler.findSingle(this.baseWidgetModuleInfo.elementRef.nativeElement, "widget-form");
                let table = this.baseWidgetModuleInfo.agGridComponent ? this.baseWidgetModuleInfo.agGridComponent.getHTMLTable() : '';
                bodyContainer = widgetForm.outerHTML + table;
                break;
            case WidgetType.CombinationCreditCard:
                widgetForm = this.domHandler.findSingle(this.baseWidgetModuleInfo.elementRef.nativeElement, "widget-form");
                let creditCard = this.domHandler.findSingle(this.baseWidgetModuleInfo.elementRef.nativeElement, "xn-credit-card");
                bodyContainer = widgetForm.outerHTML + creditCard.outerHTML;
                break;
            case WidgetType.Country:
                const countryCheckList = this.domHandler.findSingle(this.baseWidgetModuleInfo.elementRef.nativeElement, "xn-country-check-list");
                bodyContainer = countryCheckList.outerHTML;
                break;
            case WidgetType.TreeView:
                const treeView = this.domHandler.findSingle(this.baseWidgetModuleInfo.elementRef.nativeElement, "app-xn-tree-view");
                bodyContainer = treeView.outerHTML;
                break;
            case WidgetType.WidgetEmailViewer:
                const email = this.domHandler.findSingle(this.baseWidgetModuleInfo.elementRef.nativeElement, ".email-body");
                bodyContainer = email.outerHTML;
                break;
            default:
                bodyContainer = this.domHandler.findSingle(this.baseWidgetModuleInfo.elementRef.nativeElement, ".box-body");                
        }

        if (typeof bodyContainer === 'object' && bodyContainer !== null) {
            let inputs = bodyContainer.getElementsByTagName('input');
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].defaultValue = inputs[i].value;
            }
        }
        this.setBodyContent(bodyContainer);
    }

    /**
     * createPrintContent_v2
     */
    private createPrintContent_v2(nativeElement: HTMLElement | string) {       
        let bodyContainer: any;
        bodyContainer = nativeElement; // this.domHandler.findSingle(elementRef.nativeElement, ".box-body");
        let inputs = bodyContainer.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].defaultValue = inputs[i].value;
        }
        if (bodyContainer) {
            this.setBodyContent(bodyContainer);
        }
    }

    /**
     * print
     */
    public print() {
        this.createPrintContent();
        const widgetBoxElm = this.eref.nativeElement;
        const w = 1024;
        const h = 764;
        const left = (screen.width / 2) - (w / 2);
        const top = (screen.height / 2) - (h / 2);

        var params = [
            'height=' + h,
            'width=' + w,
            'top=' + top,
            'left=' + left
        ].join(',');

        let printContents, popupWin;
        let headContent = document.getElementsByTagName('head')[0].innerHTML;
        printContents = widgetBoxElm.outerHTML;
        popupWin = window.open('', '_blank', params);
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <link rel="stylesheet" type="text/css" href="/public/assets/lib/print/css/print.css">
              ${headContent}
            </head>
            <body id="print" onload="window.print();">${printContents}</body>
          </html>`
        );
        popupWin.document.close();
    }

    /**
     * print
     */
    public print_v2(nativeElement: HTMLElement | string) {
        this.createPrintContent_v2(nativeElement);
        const widgetBoxElm = this.eref.nativeElement;
        const w = 1024;
        const h = 764;
        const left = (screen.width / 2) - (w / 2);
        const top = (screen.height / 2) - (h / 2);

        var params = [
            'height=' + h,
            'width=' + w,
            'top=' + top,
            'left=' + left
        ].join(',');

        let printContents, popupWin;
        let headContent = document.getElementsByTagName('head')[0].innerHTML;
        printContents = widgetBoxElm.outerHTML;
        popupWin = window.open('', '_blank', params);
        popupWin.document.open();
        popupWin.document.write(`
          <html>
            <head>
              <link rel="stylesheet" type="text/css" href="/public/assets/lib/print/css/print.css">
              ${headContent}
            </head>
            <body id="print" onload="window.print();">${printContents}</body>
          </html>`
        );
        popupWin.document.close();
    }
}
