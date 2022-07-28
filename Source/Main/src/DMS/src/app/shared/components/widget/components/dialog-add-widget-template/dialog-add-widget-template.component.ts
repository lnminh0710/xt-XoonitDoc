import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
    selector: 'dialog-add-widget-template',
    styleUrls: ['./dialog-add-widget-template.component.scss'],
    templateUrl: './dialog-add-widget-template.component.html'
})
export class DialogAddWidgetTemplateComponent implements OnInit, OnDestroy, AfterViewInit {

    public showDialog = false;
    public submitted = false;
    public templateName: string;

    @Output() onSave = new EventEmitter();
    @Output() onClose = new EventEmitter();

    @ViewChild('templateNameCtrl') templateNameCtrl: ElementRef;

    constructor() {
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {

    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.templateNameCtrl.nativeElement.focus();
        }, 800);
    }

    public open() {
        this.showDialog = true;
    }

    public save() {
        this.submitted = true;
        if (!this.templateName)
            return;

        this.onSave.emit(this.templateName);
        this.showDialog = false;
    }

    public cancel() {
        this.showDialog = false;
        this.onClose.emit();
    }

    public templateNameUp($event) {
        if ($event.keyCode === 13) {
            this.save();
        }
    }
}
