import { OnInit, Directive, ElementRef, EventEmitter, HostListener, OnDestroy, Input, Output } from '@angular/core';
import { CustomAction, LayoutInfoActions } from '@app/state-management/store/actions';
import { ReducerManagerDispatcher } from '@ngrx/store';
import { Subject } from 'rxjs';
import { auditTime, filter, takeUntil } from 'rxjs/operators';
import { TableDropdownComponent } from '.';

@Directive({
    selector: '[TableDropdown]',
})
export class TableDropdownDirective implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();

    @Input('TableDropdown') tableDropdown: TableDropdownComponent;
    @Input() inside: boolean;
    @Output() closeDropdown: EventEmitter<void> = new EventEmitter<void>();

    constructor(private elementRef: ElementRef, private dispatcher: ReducerManagerDispatcher) {}

    ngOnInit() {
        this.calculatePosition();
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    @HostListener('keydown', ['$event'])
    onKeydown(event: KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
                this.closeDropdown.emit();
                this.tableDropdown.hideDropdown = true;
                break;
            case 'ArrowDown':
            case 'ArrowUp':
                if (this.tableDropdown.rowSelected == null) {
                    this.tableDropdown.rowSelected = 0;
                    return;
                }
                let nextPosition = event.key === 'ArrowDown' ? 1 : -1;
                this.tableDropdown.rowSelected += nextPosition;
                event.stopPropagation();
                break;
            case 'Enter':
                this.tableDropdown.choose();
                break;
        }
    }

    @HostListener('click', ['$event'])
    @HostListener('input', ['$event'])
    onClick(event: MouseEvent) {
        if (!this.inside) {
            this.calculatePosition();
        }
        this.tableDropdown.hideDropdown = false;
    }

    private calculatePosition() {
        if (this.tableDropdown) {
            const position = this.elementRef.nativeElement.getBoundingClientRect();
            if (this.inside) {
                this.tableDropdown.topPos = position.top;
                this.tableDropdown.leftPos = position.left + position.width + 10;
                this.tableDropdown.isReverseX = true;
                return;
            }
            if (position.top + this.tableDropdown.maxHeight > window.innerHeight) {
                this.tableDropdown.isReverseY = true;
                this.tableDropdown.topPos = position.top;
            } else {
                this.tableDropdown.topPos = position.top + position.height;
            }

            if ((this.tableDropdown.isReverseX = position.left + this.tableDropdown.width > window.innerWidth)) {
                this.tableDropdown.leftPos = position.left + position.width;
                this.tableDropdown.isReverseX = true;
            } else {
                this.tableDropdown.leftPos = position.left;
            }
        }
    }
}
