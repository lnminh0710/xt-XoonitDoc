import { Component, Input, ElementRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import isNil from 'lodash-es/isNil';

@Component({
    selector: 'clear-text',
    template: `
    <span *ngIf="enableClearText && isShown && control && control.val() && control.val()['length'] >= 1" class="clear-textbox" (click)="clearText($event)">
        <i class="fa fa-times-circle" aria-hidden="true"></i>
    </span>
    `
})
export class ClearTextComponent implements OnInit {
    @Input() controlName: string;
    @Input() enableClearText = true;
    @Input() inputControl: any = null;
    @Input() controlType = 'text';

    public control: any;
    private MAX_TIMES = 5;
    public isShown = false;

    constructor(private eRef: ElementRef) { }
    public ngOnInit() {
        this.bindEventToControl(0);
    }

    private bindEventToControl(currentLoopTimes: number) {
        currentLoopTimes++;
        setTimeout(() => {
            if (this.controlName && this.eRef) {
                const wijmoControl = $('wj-combo-box', $(this.eRef.nativeElement).parent());
                if (wijmoControl.length) {
                    return;
                }
                this.control = $('input[type=text][name=' + this.controlName + ']', $(this.eRef.nativeElement).parent());
                if (this.control) {
                    if (this.control['length']) {
                        this.control.addClass('padding-right--mx');
                    }
                    this.control.bind('focusin', () => {
                        this.isShown = true;
                    })
                    .bind('keyup', (event) => {
                        this.isShown = true;
                    })
                    .bind('focusout', (event) => {
                        setTimeout(() => { this.isShown = false; }, 200);
                    });
                    return;
                }
                if (currentLoopTimes < this.MAX_TIMES)
                    this.bindEventToControl(currentLoopTimes);
            }
        }, 100);
    }

    public clearText(event) {
        if (this.control && this.control['length'] &&
            !isNil($(this.control).val()) && $(this.control).val()['length'] > 0) {
            if (this.inputControl) {
                if (this.inputControl.setValue) {
                    this.inputControl.setValue('');
                    this.inputControl.updateValueAndValidity();
                } else {
                    if (this.controlType === 'number')
                        this.inputControl.value = 0;
                    else
                        this.inputControl.value = '';
                }
            }
            $(this.control).val('');
            $(this.control).focus();
        }
    }
}
