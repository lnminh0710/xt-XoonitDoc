
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter,
    ChangeDetectorRef
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
@Component({
    selector: 'elastic-search-sync-command',
    styleUrls: ['./elastic-search-sync-command.component.scss'],
    templateUrl: './elastic-search-sync-command.component.html'
})
export class ElasticSearchSyncCommandComponent extends BaseComponent implements OnInit, OnDestroy {
    private isStopped = true;
    private defaultTimeRemaining = 300;

    public timeRemaining: number = this.defaultTimeRemaining;
    public progressBarValue: number = 0;
    public syncMode: string = 'All';
    public syncModeList: Array<any> = [
        {
            idValue: 'All',
            textValue: 'All',
        },
        {
            idValue: 'CurrentDate',
            textValue: 'Current Date',
        }
    ]

    @Input() isIdle: boolean = true;
    @Input() set percentValue(data: number) {this.executePercentValue(data);}

    @Output() output: EventEmitter<any> = new EventEmitter();
    @Output() callStart: EventEmitter<any> = new EventEmitter();
    @Output() callStop: EventEmitter<any> = new EventEmitter();

    constructor(private ref: ChangeDetectorRef,
        router ? : Router) {
        super(router);
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
    }

    public onSyncModeChanged() {
        this.output.emit(this.syncMode);
    }

    public startStop() {
        if (this.isIdle) {
            this.start();
            return;
        }
        this.stop();
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private start() {
        this.progressBarValue = 0;
        this.ref.detectChanges();
        this.callStart.emit();
    }

    private stop() {
        this.isStopped = true;
        this.callStop.emit();
        this.timeRemaining = this.defaultTimeRemaining;
    }

    private executePercentValue(data: number) {
        this.progressBarValue = data;
        this.ref.detectChanges();
    }
}
                
