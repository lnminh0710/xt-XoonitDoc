import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'list-box',
    styleUrls: ['./list-box.component.scss'],
    templateUrl: './list-box.component.html'
})
export class ListBoxComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() draggable = false;
    @Input() data = [];
    @Input() height: number = 250;
    @Input() canApply = false;
    @Input() canClose = false;

    @Output() onClick = new EventEmitter<any>();
    @Output() onApply = new EventEmitter<any>();
    @Output() onClose = new EventEmitter<any>();

    constructor(
        private elmRef: ElementRef
    ) {
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
    }

    ngAfterViewInit() {

    }

    public onMouseover(item, e) {
        if (this.draggable) {
            if (e.target.localName !== 'input') {
                $('input.temp', this.elmRef.nativeElement).remove();
                $('span', this.elmRef.nativeElement).show();

                let $target = null;
                if (e.target.localName === 'li') {
                    $target = $(e.target).children().first();
                } else {
                    $target = $(e.target);
                }

                let text = item.data;
                let $input = $('<input type=text class=temp>');
                $input.css('border', 'none');
                $input.css('width', '100%');
                $input.css('line-height', '23px');
                $input.css('padding-left', '10px');
                $input.css('cursor', 'pointer');
                $input.css('background-color', '#eee');
                $input.prop('value', text);
                $input.prop('readonly', true);
                $input.insertAfter($target);
                $input.focus();
                $input.select();
                $target.hide();
            }
        }
    }

    public onMouseleave(e) {
        if (this.draggable) {
            $('input.temp', this.elmRef.nativeElement).remove();
            $('span', this.elmRef.nativeElement).show();
        }
    }

    public click(item, e) {
        if (!this.draggable) {
            this.data.forEach(i => {
                i.active = false;
            });

            item.active = true;
        }
        this.onClick.emit(item);
    }

    public apply() {
        let activeItem = this.data.find(i => i.active);
        if (activeItem) {
            this.onApply.emit(activeItem);
        }
    }

    public close() {
        this.onClose.emit();
    }
}
