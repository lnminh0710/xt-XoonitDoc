import { Action } from '@ngrx/store';
import { GridActions } from '@app/state-management/store/actions';
import cloneDeep from 'lodash-es/cloneDeep';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubGridState {
    columnLayout: any;
}

export const initialSubGridState: SubGridState = {
    columnLayout: {},
};

export interface GridState {
    features: { [id: string]: SubGridState }
}

const initialState: GridState = {
    features: {}
};

export function gridReducer(state = initialState, action: CustomAction): GridState {
    switch (action.type) {
        case GridActions.SET_COLUMN_LAYOUT: {
            let feature = baseReducer.getFeature(action, state);
            if (!feature) return state;

            const newColumnLayout = cloneDeep(feature.columnLayout)
            newColumnLayout[action.payload['widgetId']] = action.payload['columnLayout'];
            state = baseReducer.updateStateData(action, feature, state, {
                columnLayout: newColumnLayout
            });

            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
}
