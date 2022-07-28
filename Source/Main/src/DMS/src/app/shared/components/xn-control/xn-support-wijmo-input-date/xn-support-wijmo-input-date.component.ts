import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { WjInputDate } from 'wijmo/wijmo.angular2.input';

@Component({
    selector: 'support-wijmo-input-date',
    template: `<ng-template></ng-template>`
})
export class SupportWijmoInputDateComponent implements OnInit {
    @Input() control: FormControl;
    @Input() wjControl: WjInputDate;
    @Input() controlType = 'DOB';

    private MAX_TIMES = 5;
    private currentText = '';

    constructor(private eRef: ElementRef) {}
    public ngOnInit() {
        this.bindEventToControl(0);
    }

    private bindEventToControl(currentLoopTimes: number) {
        currentLoopTimes++;
        setTimeout(() => {
            if (this.control && this.wjControl) {
                this.wjControl.valueChanged.addHandler(this.onChange, this);
                this.wjControl.gotFocus.addHandler(this.gotFocus, this);
                this.wjControl.isDroppedDownChanged.addHandler(this.onDDLChanged, this);
                $(this.wjControl.calendar.hostElement).click((event) => {
                    this.clickOnDate(event);
                })
            }else {
                if (currentLoopTimes < this.MAX_TIMES)
                    this.bindEventToControl(currentLoopTimes);
            }
        }, 100);
    }

    private gotFocus(event) {
        this.control.markAsTouched();
        this.control.parent.markAsTouched();
        setTimeout(() => {
            this.currentText = this.wjControl.inputElement.value;
            if (!this.control.value)
                this.wjControl.inputElement.value = '';
        });
    }

    private onChange(event) {
        if (this.control.untouched) {
            return;
        }
        this.control.setValue(this.wjControl.value);
        this.control.markAsDirty();
        this.control.updateValueAndValidity();
        this.control.parent.markAsDirty();
        this.control.parent.updateValueAndValidity();
    }

    private onDDLChanged(event) {
        setTimeout(() => {
            if (!this.control.value)
                this.wjControl.inputElement.value = '';
        });
    }

    private clickOnDate(event) {
        if (event && event.target && $(event.target).hasClass('wj-day-today')) {
            this.onChange(null);
            this.wjControl.inputElement.value = this.currentText;
            this.wjControl.isDroppedDown = false;
        }
    }
}
