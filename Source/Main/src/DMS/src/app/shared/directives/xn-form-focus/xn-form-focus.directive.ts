import { Input, HostListener, Directive, HostBinding, ElementRef, EventEmitter, Output, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import {
    AppErrorHandler,  MenuStatusService
} from '@app/services';
import { Module, WidgetDetail, WidgetMenuStatusModel, WidgetType } from '@app/models';
import { Uti } from '@app/utilities';

@Directive({
    selector: '[formFocus]',
    inputs: ['config: formFocus']
})

export class XnFormFocusDirective implements OnInit, OnDestroy {

    @Input() set focusHandleStart(status: boolean) {
        if (status) {
            setTimeout(() => {
                this.processEnterFocus();
            }, 1500);
        }
    }

    @Input() querySelector: string = 'input:visible,div.content-editable:visible';

    constructor(private el: ElementRef, private _renderer: Renderer2) {
    }

    public ngOnInit() {        
    }

    private processEnterFocus() {
        let that = this;
        let $canfocus = $(this.querySelector, this.el.nativeElement);
        $(this.el.nativeElement).on('keyup', this.querySelector, function (e) {
            if (e.which == 13) {
                e.preventDefault();
                var index = $canfocus.index(this) + 1;
                if (index >= $canfocus.length)
                    index = 0;
                // $($canfocus.eq(index)).focus();
                that._renderer.selectRootElement($canfocus.eq(index)).focus();
            }
        });
    }

    public ngOnDestroy() {
        Uti.unsubscribe(this);
        $(this.querySelector, this.el.nativeElement).off('keyup');
    }

}
