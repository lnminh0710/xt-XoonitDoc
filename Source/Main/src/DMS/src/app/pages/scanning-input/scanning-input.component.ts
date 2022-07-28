import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '@app/services';
import { ScanningActions } from '@app/state-management/store/actions';
import { Uti } from '@app/utilities';
import { ReducerManagerDispatcher} from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '../private/base';

@Component({
    selector: 'scanning-input',
    templateUrl: './scanning-input.component.html',
    styleUrls: ['./scanning-input.component.scss'],
})
export class ScanningInputComponent extends BaseComponent implements OnInit {

    constructor(
        protected router: Router,
        private dispatcher: ReducerManagerDispatcher,
        private loadingService: LoadingService,
    ) {
        super(router);

        this._subscribe();
    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        super.onDestroy();
        Uti.unsubscribe(this);
    }

    public _subscribe() {
        this.dispatcher
            .filter((action) => {
                return action && action.type === ScanningActions.LOAD_CONFIGURATION_SCAN_SETTING_DONE;
            })
            .pipe(takeUntil(this.getUnsubscriberNotifier()))
            .subscribe((action) => {
                this.loadingService.xnLoading = { loading: false };
            });
    }
}
