import { Component, OnInit, Input } from '@angular/core';
import { ControlProperty } from '../../models/control-property';
import { IDragItem } from '../../models/drag-item.interface';
import { FormLayoutBuilderSelectors } from '../../form-layout-builder.statemanagement/form-layout-builder.selectors';
import { takeUntil } from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs';


@Component({
    selector: 'control-property-panel',
    styleUrls: ['control-property-panel.component.scss'],
    templateUrl: 'control-property-panel.component.html'
})
export class ControlPropertyPanelComponent implements OnInit {

    public properties: Array<ControlProperty> = [];
    private _activedControl: IDragItem;
    private _unsubscribedNotifer$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

    @Input() set activedControl(data: IDragItem) {
        this._activedControl = data;
        if (data) {
            this.loadConfig();
        }
    }

    get activedControl() {
        return this._activedControl;
    }

    constructor(private formLayoutSelectors: FormLayoutBuilderSelectors) {
    }

    ngOnInit() {
        this.subscribe();
    }

    ngOnDestroy() {
        this.unsubscribeFromNotifier();
    }

    private subscribe() {
        this.formLayoutSelectors.currentSettingControl$.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((data) => {
            this.activedControl = data;
        });
    }

    private getUnsubscriberNotifier(): Observable<any> {
        return this._unsubscribedNotifer$.asObservable();
    }

    private unsubscribeFromNotifier() {
        this._unsubscribedNotifer$.next(true);
        this._unsubscribedNotifer$.complete();
    }

    private loadConfig() {
        // Switch case here
        this.properties = this.activedControl.config;
    }
}
