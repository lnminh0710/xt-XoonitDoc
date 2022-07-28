import { Directive, ElementRef } from '@angular/core';
import { KeyCode } from '@app/app.constants';

@Directive({ selector: '[enterNextFocus]' })
export class XnMaterialEnterNextFocusDirective {

    constructor(
        private elem: ElementRef
    ) {
        (this.elem.nativeElement as HTMLElement).addEventListener('keydown', (ev) => {
            if (ev.keyCode === KeyCode.Enter) {
                ev.preventDefault();
                ev.stopPropagation();
                ev.stopImmediatePropagation();
                this.nextFocus(ev.shiftKey);
            }
        });
    }

    private nextFocus(shiftKey: boolean) {
        let parent = (this.elem.nativeElement as HTMLElement).parentElement;
        while (parent.tagName.toLowerCase() !== 'xn-dynamic-material-control') {
            parent = parent.parentElement;
        }

        let foundElement = false;
        let sibling = this.getSibling(parent, shiftKey);

        if (!sibling) {
            return;
        }

        while (!foundElement) {
            const nodeList = sibling.querySelectorAll('input, select, mat-slide-toggle, mat-select');
            if (nodeList && nodeList.length) {
                (nodeList[0] as HTMLElement).focus();
                foundElement = true;
            } else {
                sibling = this.getSibling(sibling, shiftKey);
                if (!sibling) {
                    break;
                }
            }
        }
    }

    private getSibling(el: Element, shiftKey: boolean) {
        return shiftKey === false ? el.nextElementSibling : el.previousElementSibling;
    }
}
