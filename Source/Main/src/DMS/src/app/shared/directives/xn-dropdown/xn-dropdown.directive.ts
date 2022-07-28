import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
    selector: '[xn-dropdown]'
})
export class XnDropdownDirective implements OnInit {
    @Input('xn-dropdown') menu: Array<any>;
    @Input('mode-event') mode: string;
    @Input('screen-class') screenClass: string = 'sub-menu';
    @Input('check-data') checkData: boolean = true;

    constructor(private el: ElementRef) {

    }

    ngOnInit() {
        if (this.menu && this.menu.length > 0 || !this.checkData) {
            let that = this;
            switch (this.mode) {
                case 'click':
                    jQuery(this.el.nativeElement).click(
                        function (e) {
                            $(this).find('.' + that.screenClass).first().show(200);
                        }
                    );
                    jQuery(this.el.nativeElement).hover(
                        null,
                        function (e) {
                            clearTimeout($(this).data('timeout'));
                            const $this = $(this);
                            const t = setTimeout(function () {
                                $this.find('.' + that.screenClass).first().hide();
                            }, 500);
                            $(this).data('timeout', t);
                        }
                    );
                    break;
                default:
                    jQuery(this.el.nativeElement).hover(
                        function (e) {
                            clearTimeout($(this).data('timeout'));
                            const $this = $(this);
                            const t = setTimeout(function () {
                                $this.find('.' + that.screenClass).first().show(200);
                            }, 200);
                            $(this).data('timeout', t);
                        },
                        function (e) {
                            clearTimeout($(this).data('timeout'));
                            const $this = $(this);
                            const t = setTimeout(function () {
                                $this.find('.' + that.screenClass).first().hide();
                            }, 500);
                            $(this).data('timeout', t);
                        }
                    );
            }
        }
    }
}
