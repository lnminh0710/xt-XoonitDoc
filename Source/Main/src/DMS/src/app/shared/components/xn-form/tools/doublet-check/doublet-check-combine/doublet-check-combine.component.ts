import { Component, OnInit, OnDestroy, Input, Output,
    ChangeDetectorRef, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';

@Component({
    selector: 'doublet-check-combine',
    styleUrls: ['./doublet-check-combine.component.scss'],
    templateUrl: './doublet-check-combine.component.html'
})

export class DoubletCheckCombineComponent extends BaseComponent implements OnInit, AfterViewInit {
    @Input() countryGridId: string;
    @Input() columnsGridId: string;
    @Input() autoMatchingGridId: string;
    @Input() manualMatchingGridId: string;

    constructor(
        protected router: Router
    ) {
        super(router);
    }

    public ngOnInit() {
        
    }

    public ngAfterViewInit() {

    }

    public selectTab(tabIndex, $event) {

    }
}
