import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';
import { TabModel } from '@app/models';
import { Uti } from '@app/utilities';

@Component({
    selector: 'gs-history',
    styleUrls: ['./gs-history.component.scss'],
    templateUrl: './gs-history.component.html',
})
export class GlobalSearchHistoryComponent extends BaseComponent implements OnInit, OnDestroy {
    private ITEM_WIDTH = 60;
    public math = Math;
    public numberWidth: number = 0;
    public breadcrumbWidth: number = 0;
    public showTooltip: boolean = false;

    @Input() currentTab: TabModel;

    @Output() texClickedAction: EventEmitter<any> = new EventEmitter();
    @Output() deleteItemAction: EventEmitter<any> = new EventEmitter();
    @Output() deleteAllAction: EventEmitter<any> = new EventEmitter();
    constructor(router?: Router) {
        super(router);
    }

    public ngOnInit() {
        this.breadcrumbWidth = window.innerWidth - 500;
    }

    public ngOnDestroy() {}

    public textClicked(currentItem: any) {
        for (let item of this.currentTab.histories) {
            item.active = item.text === currentItem.text;
        }
        this.texClickedAction.emit(currentItem);
    }

    public onMouseEnterText(currentItem: any, event: any) {
        for (let item of this.currentTab.histories) {
            item.showNumber = item.text === currentItem.text;
        }
        this.numberWidth = event.srcElement.offsetWidth - 17;
        this.checkShowTooltip(currentItem, event);
    }

    public onMouseLeaveText(currentItem: any, event: any) {
        currentItem.showNumber = false;
        currentItem.showTooltip = false;
    }

    public deleteItem(item: any) {
        if (item.active && this.currentTab.histories.length > 1) {
            let nextItem = {};
            for (let i = 0; i < this.currentTab.histories.length; i++) {
                if (item.text !== this.currentTab.histories[i].text) continue;

                if (i === 0) {
                    nextItem = this.currentTab.histories[i + 1];
                    break;
                }
                nextItem = this.currentTab.histories[i - 1];
            }
            this.textClicked(nextItem);
        }
        this.deleteItemAction.emit(item);
    }

    public deleteAll() {
        this.deleteAllAction.emit();
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private checkShowTooltip(currentItem: any, event: any) {
        if (!event || !event.srcElement) return;
        // const li = <any>$(event.srcElement);
        // const span = event.srcElement.children[1].children[0];
        // if (span.scrollWidth <= span.offsetWidth) return;
        currentItem.showTooltip = true;
    }
}
