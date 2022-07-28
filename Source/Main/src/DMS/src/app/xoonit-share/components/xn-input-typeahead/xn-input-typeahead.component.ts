import {
    Component,
    OnInit,
    OnDestroy,
    AfterViewInit,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { BaseComponent } from '@app/pages/private/base';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';

@Component({
    selector: 'xn-input-typeahead',
    styleUrls: ['./xn-input-typeahead.component.scss'],
    templateUrl: './xn-input-typeahead.component.html',
})
export class XnInputTypeaheadComponent<T> extends BaseComponent implements OnInit, OnDestroy, AfterViewInit {
    private _formControlClassStyle: string;
    private _typeaheadString: string;

    public noResults: boolean;

    @Input() set typeaheadValue(value: string) {
        if (this._typeaheadString === value) {
            return;
        }

        this._typeaheadString = value;
        this.typeaheadValueChange.emit(value);
    }
    @Input() typeaheadOptionField: string;
    @Input() dataSource: Observable<T[]>;
    @Input() typeaheadWaitMs: number;
    @Input() public set formControlClassStyle(val: string) {
        this._formControlClassStyle = val;
    }
    public get formControlClassStyle() {
        return this._formControlClassStyle ? ' ' + this._formControlClassStyle : null;
    }

    @Output() typeaheadValueChange = new EventEmitter<string>();
    @Output() onSelectedItemChanged = new EventEmitter<T>();
    @Output() onEmptyTypeahead = new EventEmitter<T>();

    @ViewChild('inputTypeahead') inputTypeahead: ElementRef;

    constructor(protected router: Router) {
        super(router);
    }

    ngOnInit(): void {}

    ngOnDestroy(): void {
        super.onDestroy();
    }

    ngAfterViewInit(): void {}

    public changeInputNull($event) {
        const inputElem = $event.target as HTMLInputElement;
        if (!inputElem.value) {
            this.onEmptyTypeahead.emit(null);
        }
    }

    public selectItem($event: TypeaheadMatch) {
        const item = $event.item as T;
        this.onSelectedItemChanged.emit(item);
    }

    public noDataResults($event: boolean) {
        // if do not input anything => don't show noResults html
        if (!this._typeaheadString) {
            $event = false;
        }

        this.noResults = $event;
    }

    public clear() {
        this._typeaheadString = null;
        (this.inputTypeahead.nativeElement as HTMLInputElement).value = '';
    }
}
