import { BaseSelector } from '../base-selector.selector';
import { Observable } from 'rxjs';
import { Actions } from '@ngrx/effects';
import { Store, createSelector, createFeatureSelector } from '@ngrx/store';
import { AppGlobalActionNames } from '../../actions/app-global/app-global.actions';
import { Injectable } from '@angular/core';
import { AppGlobalState } from './app-global.state';
import { StructureTreeSettingsStateModel } from '../../models/app-global/state/structure-tree-settings.state.model';

export const appGlobalState = createFeatureSelector<AppGlobalState>(
    // is a property name of reducers.appGlobalState in file src/app/state-management/store/index.ts
    'appGlobalState',
);

const getStructureTreeToggleActiveFolders = createSelector(
    appGlobalState,
    (state: AppGlobalState) => state.structureTreeSettings,
);

@Injectable({ providedIn: 'root' })
export class AppGlobalSelectors extends BaseSelector {
    public structureTreeSettings$: Observable<StructureTreeSettingsStateModel>;

    constructor(private store: Store<any>, protected actions$: Actions) {
        super(actions$, AppGlobalActionNames.APP_GLOBAL_SUCCESS, AppGlobalActionNames.APP_GLOBAL_FAILED);

        this.structureTreeSettings$ = store.select(getStructureTreeToggleActiveFolders);
    }
}
