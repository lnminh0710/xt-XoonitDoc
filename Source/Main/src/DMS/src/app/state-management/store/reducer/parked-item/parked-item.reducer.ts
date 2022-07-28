import { Action, ActionReducer } from '@ngrx/store';
import {
    ParkedItemModel
} from '@app/models';
import { ParkedItemActions } from '@app/state-management/store/actions/parked-item';
import cloneDeep from 'lodash-es/cloneDeep';
import isEmpty from 'lodash-es/isEmpty';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';
import { LocalStorageKey } from '@app/app.constants';

export interface SubParkedItemState {
    parkedItems: ParkedItemModel[];
    selectedParkedItem: ParkedItemModel;
    idSettingsModule: string;
    currentParkedItem: ParkedItemModel;
    requestTogglePanel: any;
    toggleDisabledPanel: any;
    isCollapsed: boolean;
    fieldConfig: any[];
}

export const initialSubParkedItemState: SubParkedItemState = {
    parkedItems: [],
    idSettingsModule: null,
    selectedParkedItem: null,
    currentParkedItem: null,
    requestTogglePanel: null,
    toggleDisabledPanel: null,
    isCollapsed: false,
    fieldConfig: []
};

export interface ParkedItemState {
    features: { [id: string]: SubParkedItemState }
}

const initialState: ParkedItemState = {
    features: {}
};

export function parkedItemStateReducer(state = initialState, action: CustomAction): ParkedItemState {
    switch (action.type) {
        case ParkedItemActions.LOAD_PARKED_ITEMS_SUCCESS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                parkedItems: action.payload.collectionParkedtems || [],
                idSettingsModule: action.payload.idSettingsModule,
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.RESET: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                parkedItems: [],
                idSettingsModule: null,
                selectedParkedItem: null,
                currentParkedItem: null,
                requestSaveParkedItemList: null,
                requestTogglePanel: null,
                toggleDisabledPanel: null,
                isCollapsed: false
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.SELECT_PARKED_ITEM: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                selectedParkedItem: action.payload.parkedItem,
                currentParkedItem: action.payload.parkedItem
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.UNSELECT_PARKED_ITEM: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                parkedItems: updateSelected(feature.parkedItems, action.payload),
                selectedParkedItem: null,
                currentParkedItem: null,
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.REMOVE_PARKED_ITEM: {
            let feature = baseReducer.getFeature(action, state);

            const currentSelectedParked = feature.parkedItems.find(c => c.selected);
            state = baseReducer.updateStateData(action, feature, state, {
                parkedItems: removeSelected(feature.parkedItems, action.payload.parkedItem),
                selectedParkedItem: currentSelectedParked != null ? feature.selectedParkedItem : null
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.REMOVE_ALL_PARKED_ITEM: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                parkedItems: [],
                selectedParkedItem: null
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.LOAD_THEN_ADD_PARKED_ITEM_SUCCESS: {
            let feature = baseReducer.getFeature(action, state);
            // Check if this parked item exists state.
            let index = findIndexParkedItem(action.payload.parkedItem, feature.parkedItems);

            // Case 1: If exists, then we just need update
            if (index >= 0) {
                feature.parkedItems[index] = action.payload.parkedItem;
                state = baseReducer.updateStateData(action, feature, state, {
                    parkedItems: Object.assign([], feature.parkedItems)
                });
            }
            else {
                // Case 2: If not exists , so we need to add new 
                action.payload.parkedItem.isNewInsertedItem = true;
                action.payload.parkedItem.createDateValue = new Date();
                const clone = feature.parkedItems.slice(0);
                clone.splice(0, 0, action.payload.parkedItem);
                state = baseReducer.updateStateData(action, feature, state, {
                    parkedItems: clone
                });
            }            
            return Object.assign({}, state);
        }

        case ParkedItemActions.ADD_DRAFT_ITEM: {
            let feature = baseReducer.getFeature(action, state);

            const newItem = feature.parkedItems.filter(item => {
                return item.isNew == true;
            });
            if (newItem.length) {
                return state;
            }
            const clone = feature.parkedItems.slice(0);
            clone.splice(0, 0, action.payload.draftItem);
            state = baseReducer.updateStateData(action, feature, state, {
                parkedItems: updateSelected(clone, action.payload.draftItem),
                selectedParkedItem: action.payload.draftItem
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.REMOVE_DRAFT_ITEM: {
            let feature = baseReducer.getFeature(action, state);

            const draftItem = feature.parkedItems.filter(item => {
                return item.isNew == true;
            });
            if (!draftItem.length) {
                return state;
            }

            const draftItemIndex = feature.parkedItems.findIndex(item => {
                return item.isNew == true;
            });
            const clone = cloneDeep(feature.parkedItems);
            clone.splice(draftItemIndex, 1);
            state = baseReducer.updateStateData(action, feature, state, {
                parkedItems: clone,
                selectedParkedItem: null
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.REQUEST_TOGGLE_PANEL: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestTogglePanel: {
                    isShow: action.payload.isShow
                }
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.SELECT_PREVIOUS_PARKED_ITEM: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                parkedItems: updateSelected(feature.parkedItems, feature.currentParkedItem),
                selectedParkedItem: feature.currentParkedItem
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.TOGGLE_DISABLED_PANEL: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                toggleDisabledPanel: {
                    isDisabled: action.payload.isDisabled
                }
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.SET_COLLAPSE_STATE: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                isCollapsed: action.payload.isCollapsed
            });
            return Object.assign({}, state);
        }

        case ParkedItemActions.STORE_FIELD_CONFIG: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                fieldConfig: action.payload
            });
            return Object.assign({}, state);
        }

        default: {
            return state;
        }
    }
};

export function persistParkedItemStateReducer(_reducer: ActionReducer<ParkedItemState>) {
    return (state: ParkedItemState | undefined, action: Action) => {
        const nextState = _reducer(state, action);        
        switch (action.type) {
            case ParkedItemActions.LOAD_PARKED_ITEMS_SUCCESS:
            case ParkedItemActions.RESET:
            case ParkedItemActions.SELECT_PARKED_ITEM:                
            case ParkedItemActions.UNSELECT_PARKED_ITEM:
            case ParkedItemActions.REMOVE_PARKED_ITEM:
            case ParkedItemActions.REMOVE_ALL_PARKED_ITEM:
            case ParkedItemActions.LOAD_THEN_ADD_PARKED_ITEM_SUCCESS:
            case ParkedItemActions.ADD_DRAFT_ITEM:
            case ParkedItemActions.REMOVE_DRAFT_ITEM:
            case ParkedItemActions.SELECT_PREVIOUS_PARKED_ITEM:
                //console.log(location.pathname);
                if (location.pathname != "/search") {
                    //TODO: enhance, only save the necessary state
                    localStorage.setItem(LocalStorageKey.LocalStorageGSParkedItemsKey, JSON.stringify(nextState));
                }                    
                break;
        }
        return nextState;
    };
}

export function updateParkedItemStateReducer(_reducer: ActionReducer<ParkedItemState>) {
    return (state: ParkedItemState | undefined, action: Action) => {
        if (action.type === ParkedItemActions.UPDATE_GLOBAL_SEARCH_STATE_FROM_LOCAL_STORAGE) {
            return (<any>action).payload;
        }
        return _reducer(state, action);
    };
}

export function parkedItemReducer(state = initialState, action: CustomAction): ParkedItemState {
    return updateParkedItemStateReducer(persistParkedItemStateReducer(parkedItemStateReducer))(state, action);
};

function findIndexParkedItem(item: ParkedItemModel, array: ParkedItemModel[]) {
    let index = -1;
    try {
        index = array.findIndex(p => p.id.value == item.id.value);
    } catch {}
    finally {
        return index;
    }
}

function updateSelected(array: ParkedItemModel[], selectedItem: ParkedItemModel) {
    for (let i = 0; i < array.length; i++) {
        array[i].selected = false;
    }

    if (!isEmpty(selectedItem)) {
        const item = array.find(i => i.id.value == selectedItem.id.value);

        if (item) {
            item.selected = true;
        }
    }

    return array;
}

function removeSelected(array: ParkedItemModel[], selectedItem) {
    const idx = array.findIndex(i => i.id.value == selectedItem.id.value);
    if (idx > -1) {
        array.splice(idx, 1);
    }
    return array;
}
