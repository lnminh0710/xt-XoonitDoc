import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DynamicFormStoreActionNames } from '../../actions/dynamic-form-store';
import { BaseSelector } from '../base-selector.selector';

@Injectable()
export class DynamicFormStoreSelectors extends BaseSelector {
    constructor(private store: Store<any>, protected actions$: Actions) {
        super(actions$, DynamicFormStoreActionNames.SUCCESS, DynamicFormStoreActionNames.FAILED);
    }
}
