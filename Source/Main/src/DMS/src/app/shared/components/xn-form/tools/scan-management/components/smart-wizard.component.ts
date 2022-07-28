import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'smart-wizzard',
    styleUrls: ['./smart-wizard.component.scss'],
    templateUrl: './smart-wizard.component.html'
})
export class SmartWizzardComponent implements OnInit, OnDestroy {

    @Input() data: Array<any>;
    @Output() wizzardClick: EventEmitter<any> = new EventEmitter();

    constructor() { }

    public ngOnInit() {
    }

    public ngOnDestroy() {
    }

    public itemClick(itemId: any) {
        const clickItem = this.data.find(x => x.id === itemId);
        if (!clickItem || !clickItem.id || !clickItem.isCanSelect) return;
        this.setActive(clickItem);
    }

    private setActive(item: any) {
        this.data.forEach(x => {
            x.isActive = (x.id === item.id);
        });
        this.wizzardClick.emit(item);
    }

    public next(currentItem: any) {
        const index = this.data.indexOf(currentItem);
        currentItem.isSave = true;
        currentItem.isCanSelect = true;
        this.data[index + 1].isCanSelect = true;
        this.setActive(this.data[index + 1]);
    }

    public back(currentItem: any) {
        const index = this.data.indexOf(currentItem);
        this.setActive(this.data[index - 1]);
    }
}
