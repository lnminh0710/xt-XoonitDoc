import { Injectable } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { createFeatureSelector, Store, createSelector } from '@ngrx/store';
import { BaseSelector } from '@app/state-management/store/reducer/base-selector.selector';
import { Observable } from 'rxjs';
import { IDynamicFormState } from './widget-dynamic-form.state';
import { WidgetDynamicFormActionNames } from './widget-dynamic-form.actions';

export const dynamicFormState = createFeatureSelector<IDynamicFormState>(
    // is a property name of reducers.formBuilderReducer
    'dynamicFormReducer',
);

@Injectable()
export class WidgetDynamicFormSelectors extends BaseSelector {
    constructor(private store: Store<IDynamicFormState>, protected actions: Actions) {
        super(
            actions,
            WidgetDynamicFormActionNames.SUCCESS,
            WidgetDynamicFormActionNames.FAILED,
        );
    }
}
