import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit } from "@angular/core";

@Component({
    selector: 'widget-subtitle',
    templateUrl: './widget-subtitle.component.html',
    styleUrls: ['./widget-subtitle.component.scss']
})
export class WidgetSubtitleComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() widgetType: any;
    @Input() gridData: any;
    @Input() formData: any;
    @Input() creditCardData: any;
    @Input() countryCheckListData: any;
    @Input() articleMediaManagerData: any;
    @Input() treeViewData: any;
    @Input() fileExplorerData: any;
    @Input() translationData: any;
    @Input() historyContainerData: any;

    constructor() {

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

}