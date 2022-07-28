import { createSelector } from '@ngrx/store';
import { AppState } from '../..';
import { GlobalSearchActions } from '../../actions';
import { GlobalSearchState } from './global-search.reducer';

export const selectGlobalSearch = (state: AppState) => state.globalSearchState;

export const selectGSRowDbClick = createSelector(
    selectGlobalSearch,
    (state: GlobalSearchState) => {
        if (state?.action?.type === GlobalSearchActions.ROW_DOUBLE_CLICK) {
            return state.action;
        }
    }
);
