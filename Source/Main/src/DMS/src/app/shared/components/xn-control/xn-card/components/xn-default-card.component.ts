import { Component, OnInit, Input, OnChanges, SimpleChanges, DoCheck, ChangeDetectionStrategy } from '@angular/core';
import { AccomplishedColorEnum } from '../models/accomplished-color.enum';
import { isBoolean } from 'lodash-es';


@Component({
    selector: 'xn-default-card',
    templateUrl: './xn-default-card.component.html',
    styleUrls: ['./xn-default-card.component.scss'],
})
export class XnDefaultCardComponent implements OnInit, OnChanges, DoCheck {

    /**
     * Set title value
     */
    @Input('data') set data(tabHeader: any) {
        tabHeader.totalFields = 0;
        tabHeader.completedFields = 0;

        if (tabHeader.fields && tabHeader.fields.length) {
            tabHeader.totalFields = (tabHeader.fields as any[]).reduce((prevField, curField) => {
                if (isBoolean(curField.value)) return prevField;

                return prevField + 1;
            }, tabHeader.totalFields);

            for (let i = 0; i < tabHeader.fields.length; i++) {
                const field = tabHeader.fields[i];
                if (!field.value) continue;

                ++tabHeader.completedFields;
            }
        }

        if (tabHeader.completedFields === 0 || tabHeader.totalFields === 0) {
            this.accomplishedColor = AccomplishedColorEnum.NONE;
        } else if (tabHeader.completedFields < tabHeader.totalFields) {
            this.accomplishedColor = AccomplishedColorEnum.PARTIAL;
        } else {
            this.accomplishedColor = AccomplishedColorEnum.ALL;
        }

        this._data = tabHeader;
    }

    get data(): any {
        return this._data;
    }

    @Input('active') isActive: boolean;
    @Input('showIconOnly') showIconOnly: boolean;

    private _data: any;

    public ACCOMPLISHED_COLOR_ENUMERATION = AccomplishedColorEnum;
    public accomplishedColor: AccomplishedColorEnum;

    constructor() { }

    ngOnInit(): void {
    }

    ngDoCheck(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    public trackByFn(index: number, node: { name: string, value: any, textValue: string, columnName: string }) {
        return node.value;
    }
}
