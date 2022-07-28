import { Component, OnInit } from '@angular/core';
import { BaseWidget, BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';

@Component({
    selector: 'widget-mydm-summary',
    templateUrl: './widget-mydm-summary.component.html',
    styleUrls: ['./widget-mydm-summary.component.scss']
})
export class WidgetMyDmSummaryComponent extends BaseComponent implements OnInit {
    constructor(
        protected router: Router,
    ) {
        super(router);
    }

    ngOnInit(): void { }
}
