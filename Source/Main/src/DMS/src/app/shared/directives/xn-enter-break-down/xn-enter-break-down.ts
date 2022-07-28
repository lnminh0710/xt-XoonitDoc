import { Directive, Input, HostListener } from '@angular/core';
import { ControlData } from '@app/models/control-model/control-data';
import { FormGroup } from '@angular/forms';

@Directive({
    selector: '[xnEnteBreakDown]',
})
export class XnEnterBreakDownDirective {
    constructor() {}

    @Input() xnControlsData: ControlData[];

    @HostListener('document:keydown.enter', ['$event']) onKeyDown(event: KeyboardEvent) {
        if ((!event && !event.srcElement) || !this.xnControlsData || !this.xnControlsData.length) return;
        const id = event.srcElement['id'];

        const currentControl = this.xnControlsData.find((x) => x.controlName === id);
        const lastControl = this.xnControlsData[this.xnControlsData.length - 1];

        if (!currentControl || !lastControl) return;

        if (currentControl.order === lastControl.order) {
            document.getElementById(currentControl.controlName).blur();
            return;
        }
        const listNextControl = this.xnControlsData.filter((x) => x.order > currentControl.order);
        const nextControl = listNextControl[0];

        document.getElementById(nextControl.controlName).focus();
    }
}
