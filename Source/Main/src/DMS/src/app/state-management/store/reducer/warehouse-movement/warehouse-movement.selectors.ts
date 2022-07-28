import { Store, createSelector } from '@ngrx/store';
import { AppState } from '@app/state-management/store/';
import { Module } from '@app/models';
import { initialSubWarehouseMovementState } from './warehouse-movement.reducer';

const initDefaultData = (state: AppState, ofModule) => {
    if (!state.warehouseMovementState.features[ofModule]) {
        state.warehouseMovementState.features[ofModule] = initialSubWarehouseMovementState;
    }
}

export const getWarehouseMovementState = (state: AppState, ofModule) => {
    initDefaultData(state, ofModule);
    return state.warehouseMovementState.features[ofModule];
};