import {
    Component, OnInit, OnDestroy, EventEmitter, Input,
    Output, ViewChild, ElementRef, AfterViewInit
} from '@angular/core';
import { ControlGridModel, ApiResultResponse} from '@app/models';
import {  AppErrorHandler } from '@app/services';
import { Uti } from '@app/utilities';

@Component({
    selector: 'doublette-group',
    styleUrls: ['./doublette-group.component.scss'],
    templateUrl: './doublette-group.component.html'
})
export class DoubletteGroupComponent implements OnInit, OnDestroy, AfterViewInit {

    @Input() groupNumber: number = 1;
    @Input() groupTotal: number;
    @Output() nextGroup: EventEmitter<number> = new EventEmitter<number>();
    @Output() groupNumberChange: EventEmitter<number> = new EventEmitter<number>();

    constructor(private appErrorHandler: AppErrorHandler) {

    }

    public ngOnInit() {

    }

    public ngOnDestroy() {

    }

    ngAfterViewInit() {
       
    }

    next() {
        if (this.groupNumber < this.groupTotal) {
            this.groupNumber += 1;
            this.nextGroup.emit(this.groupNumber);
            this.groupNumberChange.emit(this.groupNumber);
        }
    }

    prev() {
        if (this.groupNumber == 1) {
            return;
        }
        this.groupNumber -= 1;
        this.nextGroup.emit(this.groupNumber);
        this.groupNumberChange.emit(this.groupNumber);
    }
}
