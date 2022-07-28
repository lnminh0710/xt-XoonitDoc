import { Action } from '@ngrx/store';
import { WarehouseMovementActions } from '@app/state-management/store/actions';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubWarehouseMovementState {
    requestConfirmAll: boolean;
}

export const initialSubWarehouseMovementState: SubWarehouseMovementState = {
    requestConfirmAll: false
};

export interface WarehouseMovementState {
    features: { [id: string]: SubWarehouseMovementState }
}

const initialState: WarehouseMovementState = {
    features: {}
};

export function warehouseMovementReducer(state = initialState, action: CustomAction): WarehouseMovementState {
    switch (action.type) {
        case WarehouseMovementActions.REQUEST_CONFIRM_ALL: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestConfirmAll: {}
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
};
