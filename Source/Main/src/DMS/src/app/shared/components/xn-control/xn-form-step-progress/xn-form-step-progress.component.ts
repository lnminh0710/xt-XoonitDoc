import {
    Component, OnInit, OnDestroy,
    EventEmitter, Input, Output,
    SimpleChanges, OnChanges
} from '@angular/core';

@Component({
    selector: 'app-form-step-progress',
    styleUrls: ['./xn-form-step-progress.component.scss'],
    templateUrl: './xn-form-step-progress.component.html'
})
export class XnFormStepProgessComponent implements OnInit, OnDestroy, OnChanges {
    public leftProcessFirstClass = '';
    public leftProcessCenterClass = '';
    public leftProcessLastClass = '';
    public leftProcessBowClass = '';
    public rightProcessFirstClass = '';
    public rightProcessCenterClass = '';
    public rightProcessLastClass = '';
    public rightProcessBowClass = '';

    // 1: New
    // 2: Step 1 is saved
    // 3: Step 2 is saved
    @Input() status: any;

    @Input() headerLeftText: any;
    @Input() footerLeftText: any;
    @Input() headerRightText: any;
    @Input() footerRightText: any;

    @Output() step1Click: EventEmitter<any> = new EventEmitter();
    @Output() step2Click: EventEmitter<any> = new EventEmitter();

    constructor() {
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
    }

    public ngOnChanges(changes: SimpleChanges) {
        const hasChangesData = this.hasChanges(changes['status']);
        if (hasChangesData) {
            this.changeStatus(this.status);
        }
    }
    private hasChanges(changes) {
        return changes && changes.hasOwnProperty('currentValue') && changes.hasOwnProperty('previousValue');
    }

    private changeStatus(status: number) {
        switch (status) {
            case 1: {
                this.leftProcessFirstClass
                    = this.leftProcessCenterClass
                    = 'process-form__active';
                this.leftProcessLastClass
                    = this.rightProcessFirstClass
                    = this.rightProcessCenterClass
                    = this.rightProcessLastClass
                    = 'process-form__inactive';
                this.leftProcessBowClass = 'process-form-bow__inactive';
                break;
            }
            case 2: {
                this.leftProcessFirstClass
                    = this.leftProcessCenterClass
                    = this.leftProcessLastClass
                    = this.rightProcessFirstClass
                    = this.rightProcessCenterClass
                    = 'process-form__active';
                this.rightProcessLastClass = 'process-form__inactive';
                this.leftProcessBowClass = 'process-form-bow__active';
                this.rightProcessBowClass = 'process-form-bow__inactive';
                break;
            }
            case 3: {
                this.leftProcessFirstClass
                    = this.leftProcessCenterClass
                    = this.leftProcessLastClass
                    = this.rightProcessFirstClass
                    = this.rightProcessCenterClass
                    = this.rightProcessLastClass
                    = 'process-form__active';
                this.leftProcessBowClass
                    = this.rightProcessBowClass
                    = 'process-form-bow__active';
                break;
            }
        }
    }

    public step1ItemClick(event: any) {
        this.step1Click.emit(event);
    }

    public step2ItemClick(event: any) {
        // if (this.status < 2) return;
        this.step2Click.emit(event);
    }
}
