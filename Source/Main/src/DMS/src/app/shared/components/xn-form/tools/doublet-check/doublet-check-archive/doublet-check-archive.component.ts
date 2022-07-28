import { Component, OnInit, OnDestroy, Input, Output,
    ChangeDetectorRef, EventEmitter, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BaseComponent } from '@app/pages/private/base';
import { Router } from '@angular/router';import {
    ControlGridModel
} from '@app/models';

@Component({
    selector: 'doublet-check-archive',
    styleUrls: ['./doublet-check-archive.component.scss'],
    templateUrl: './doublet-check-archive.component.html'
})

export class DoubletCheckArchiveComponent extends BaseComponent implements OnInit, AfterViewInit {
    public archiveGridData: ControlGridModel = new ControlGridModel();

    constructor(
        protected router: Router
    ) {
        super(router);
    }

    public ngOnInit() {
    }

    public ngAfterViewInit() {

    }
}
