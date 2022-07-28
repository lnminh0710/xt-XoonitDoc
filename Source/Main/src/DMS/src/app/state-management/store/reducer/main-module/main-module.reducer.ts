import { Action, ActionReducer } from '@ngrx/store';
import { Module, ParkedItemModel } from '@app/models';
import { ModuleActions } from '@app/state-management/store/actions/main-module/index';
import cloneDeep from 'lodash-es/cloneDeep';
import isEmpty from 'lodash-es/isEmpty';
import { CustomAction } from '@app/state-management/store/actions/base';
import { LocalStorageKey } from '@app/app.constants';
import { Uti } from '@app/utilities';

export interface ModuleState {
    mainModules: Module[];
    activeModule: Module;
    activeSubModule: Module;
    searchingModule: Module;
    subModules: Module[];
    workingModules: Array<any>;
    moduleStates: Array<any>;
    requestCreateNewModuleItem: any;
    usingModule: Module;
    requestChangeModule: any;
    requestChangeSubModule: any;
    isWorkingModulesDragging: boolean;
    dirtyModules: Module[];
    companyName: string;
}

const initialState: ModuleState = {
    mainModules: [],
    activeModule: {},
    activeSubModule: {},
    subModules: [],
    workingModules: [],
    moduleStates: [],
    requestCreateNewModuleItem: null,
    searchingModule: {},
    usingModule: null,
    requestChangeModule: null,
    requestChangeSubModule: null,
    isWorkingModulesDragging: false,
    dirtyModules: [],
    companyName: 'Test',
};

export function mainModuleStateReducer(state = initialState, action: CustomAction): ModuleState {
    switch (action.type) {
        case ModuleActions.LOAD_MAIN_MODULES_SUCCESS: {
            // return Object.assign({}, state, { mainModules: [...state.mainModules, ...action.payload] });
            return Object.assign({}, state, { mainModules: [...action.payload] });
        }

        case ModuleActions.ACTIVE_MODULE: {
            localStorage.setItem(LocalStorageKey.LocalStorageActiveModule, JSON.stringify(action.payload));
            return Object.assign({}, state, { activeModule: action.payload, activeSubModule: {} });
        }

        case ModuleActions.ACTIVE_SUB_MODULE: {
            const subModule: Module = action.payload;
            if (subModule.idSettingsGUI == -1 && (subModule.isCanNew || subModule.isCanSearch)) {
                const rs = state.subModules.filter((p) => p.idSettingsGUI == subModule.idSettingsGUIParent);
                if (rs.length > 0) {
                    return Object.assign({}, state, { activeSubModule: rs[0] });
                }
                return Object.assign({}, state, { activeSubModule: {} });
            }
            return Object.assign({}, state, { activeSubModule: action.payload });
        }

        case ModuleActions.GET_SUB_MODULE_SUCCESS: {
            const subModules = action.payload;
            if (!subModules || (subModules && subModules.length == 0)) {
                action.payload = updateSubModuleIfEmpty(state.activeModule);
            }
            localStorage.setItem(LocalStorageKey.LocalStorageActiveModule, JSON.stringify(state.activeModule));
            return Object.assign({}, state, { subModules: action.payload });
        }

        case ModuleActions.CLEAR_ACTIVE_MODULE: {
            localStorage.setItem(LocalStorageKey.LocalStorageActiveModule, JSON.stringify({}));
            return Object.assign({}, state, { activeModule: {} });
        }

        case ModuleActions.CLEAR_ACTIVE_SUB_MODULE: {
            return Object.assign({}, state, { activeSubModule: {} });
        }

        case ModuleActions.CLEAR_SUB_MODULES: {
            return Object.assign({}, state, { subModules: [] });
        }

        case ModuleActions.ADD_WORKING_MODULE: {
            return Object.assign({}, state, {
                workingModules: Object.assign([], updateWorkingModules(action.payload, state.workingModules)),
            });
        }

        case ModuleActions.REMOVE_WORKING_MODULE: {
            return Object.assign({}, state, {
                workingModules: Object.assign([], removeWorkingModule(action.payload, state.workingModules)),
            });
        }

        case ModuleActions.RESET_SELECTING_WORKING_MODULE_PARKED_ITEM: {
            return Object.assign({}, state, {
                workingModules: Object.assign(
                    [],
                    resetSelectingWorkingModuleParkedItem(action.payload, state.workingModules),
                ),
            });
        }

        case ModuleActions.MOVE_SELECTED_PARKED_ITEM_TO_TOP: {
            return Object.assign({}, state, {
                workingModules: Object.assign([], moveSelectedParkedItemToTop(action.payload, state.workingModules)),
            });
        }

        case ModuleActions.STORE_MODULE_STATES: {
            let newModuleStates = cloneDeep(state.moduleStates);

            newModuleStates = updateModuleStates(action.payload, newModuleStates);
            return Object.assign({}, state, {
                moduleStates: newModuleStates,
            });
        }

        case ModuleActions.CLEAR_MODULE_STATE: {
            let newModuleStates = cloneDeep(state.moduleStates);

            newModuleStates = clearModuleState(action.payload, newModuleStates);
            return Object.assign({}, state, {
                moduleStates: newModuleStates,
            });
        }

        case ModuleActions.REQUEST_CREATE_NEW_MODULE_ITEM: {
            return Object.assign({}, state, {
                requestCreateNewModuleItem: cloneDeep(action.payload),
            });
        }

        case ModuleActions.SEARCH_KEYWORD_MODULE: {
            const _module: Module = cloneDeep(action.payload);
            if (_module.idSettingsGUI == -1 && (_module.isCanNew || _module.isCanSearch)) {
                let rs = state.subModules.filter((p) => p.idSettingsGUI == _module.idSettingsGUIParent);
                if (rs.length > 0) {
                    _module.idSettingsGUI = rs[0].idSettingsGUI;
                    return Object.assign({}, state, { searchingModule: _module });
                } else {
                    rs = state.mainModules.filter((p) => p.idSettingsGUI == _module.idSettingsGUIParent);
                    if (rs.length > 0) {
                        _module.idSettingsGUI = rs[0].idSettingsGUI;
                        return Object.assign({}, state, { searchingModule: _module });
                    }
                }
            }

            return Object.assign({}, state, { searchingModule: _module });
        }

        case ModuleActions.SET_USING_MODULE: {
            return Object.assign({}, state, {
                usingModule: action.payload,
            });
        }

        case ModuleActions.CLEAR_USING_MODULE: {
            return Object.assign({}, state, { usingModule: null });
        }

        case ModuleActions.REQUEST_CHANGE_MODULE: {
            return Object.assign({}, state, {
                requestChangeModule: {
                    requestedModule: action.payload,
                },
            });
        }
        case ModuleActions.CLEAR_REQUEST_CHANGE_MODULE: {
            return Object.assign({}, state, {
                requestChangeModule: null,
            });
        }

        case ModuleActions.REQUEST_CHANGE_SUB_MODULE: {
            return Object.assign({}, state, {
                requestChangeSubModule: {
                    requestedModuleId: action.payload.requestedModuleId,
                    requestedSubModuleId: action.payload.requestedSubModuleId,
                },
            });
        }
        case ModuleActions.CLEAR_REQUEST_CHANGE_SUB_MODULE: {
            return Object.assign({}, state, {
                requestChangeSubModule: null,
            });
        }

        case ModuleActions.TOGGLE_IS_WORKING_MODULES_DRAGGING: {
            return Object.assign({}, state, {
                isWorkingModulesDragging: action.payload,
            });
        }

        case ModuleActions.REMOVE_ALL_PARKED_ITEMS_OF_WORKING_MODULE: {
            return Object.assign({}, state, {
                workingModules: removeAllParkedItems(action.payload, state.workingModules),
            });
        }

        case ModuleActions.REMOVE_PARKED_ITEM_OF_WORKING_MODULE: {
            return Object.assign({}, state, {
                workingModules: removeParkedItem(action.payload, state.workingModules),
            });
        }

        case ModuleActions.ADD_DIRTY_MODULE: {
            return Object.assign({}, state, {
                dirtyModules: addDirtyModule(action.payload.module, state.dirtyModules),
            });
        }

        case ModuleActions.REMOVE_DIRTY_MODULE: {
            return Object.assign({}, state, {
                dirtyModules: removeDirtyModule(action.payload.module, state.dirtyModules),
            });
        }
        case ModuleActions.GET_COMPANY: {
            return Object.assign({}, state, {
                companyName: action.payload,
            });
        }

        default: {
            return state;
        }
    }
}

export function persistMainModuleStateReducer(_reducer: ActionReducer<ModuleState>) {
    return (state: ModuleState | undefined, action: Action) => {
        const nextState = _reducer(state, action);
        const browserTabId = Uti.defineBrowserTabId();
        switch (action.type) {
            case ModuleActions.ACTIVE_MODULE:
            case ModuleActions.ACTIVE_SUB_MODULE:
            case ModuleActions.LOAD_MAIN_MODULES_SUCCESS:
            case ModuleActions.GET_SUB_MODULE_SUCCESS:
                localStorage.setItem(LocalStorageKey.buildKey(LocalStorageKey.LocalStorageGSCaptureSearchModule, browserTabId), JSON.stringify({...nextState, browserTabId}));
                break;
        }
        return nextState;
    };
}

export function updateMainModuleStateReducer(_reducer: ActionReducer<ModuleState>) {
    return (state: ModuleState | undefined, action: Action) => {
        if (action.type === ModuleActions.UPDATE_MODULE_STATE_FROM_LOCAL_STORAGE) {
            return (<any>action).payload;
        }
        return _reducer(state, action);
    };
}

export function mainModuleReducer(state = initialState, action: CustomAction): ModuleState {
    return updateMainModuleStateReducer(persistMainModuleStateReducer(mainModuleStateReducer))(state, action);
}

function updateSubModuleIfEmpty(activeModule: Module) {
    const subModules = [];
    let entry: any;
    if (activeModule.isCanSearch) {
        entry = {
            idSettingsGUI: -1,
            moduleName: activeModule.moduleName,
            isCanSearch: activeModule.isCanSearch,
            idSettingsGUIParent: activeModule.idSettingsGUI,
        };
        subModules.push(new Module(entry));
    }
    if (activeModule.isCanNew) {
        entry = {
            idSettingsGUI: -1,
            moduleName: activeModule.moduleName,
            isCanNew: activeModule.isCanNew,
            idSettingsGUIParent: activeModule.idSettingsGUI,
        };
        subModules.push(new Module(entry));
    }
    return [...subModules];
}

function updateWorkingModules(payload, currentWorkingModules) {
    if (!payload.workingModule) {
        return currentWorkingModules;
    }

    if (!payload.loadFromSetting) {
        for (const workingModule of currentWorkingModules) {
            workingModule.active = false;
        }
    }

    if (payload.parkedItems && payload.parkedItems.length) {
        payload.parkedItems = payload.parkedItems.filter((parkedItem) => parkedItem.isNew != true);

        const selectedParkedItem = payload.parkedItems.find((parkedItem) => parkedItem.selected);
        payload.parkedItems = moveItemToTop(payload.parkedItems, selectedParkedItem);
    }

    const existingWorkingModule = currentWorkingModules.find(
        (curWorkingModule) => curWorkingModule.workingModule.idSettingsGUI == payload.workingModule.idSettingsGUI,
    );
    if (existingWorkingModule) {
        existingWorkingModule.active = !payload.loadFromSetting;
        existingWorkingModule.parkedItems = payload.parkedItems;
        existingWorkingModule.fieldConfig = payload.fieldConfig;
        existingWorkingModule.subModules = payload.subModules;
    } else {
        currentWorkingModules.push({
            workingModule: payload.workingModule,
            parkedItems: payload.parkedItems,
            active: !payload.loadFromSetting,
            fieldConfig: payload.fieldConfig,
            subModules: payload.subModules,
        });
    }

    return currentWorkingModules;
}

function removeWorkingModule(payload, currentWorkingModules) {
    if (!payload.workingModule) {
        return currentWorkingModules;
    }

    let moduleIndex = currentWorkingModules.findIndex(
        (cwm) => cwm.workingModule.idSettingsGUI == payload.workingModule.idSettingsGUI,
    );
    if (moduleIndex != -1) {
        currentWorkingModules.splice(moduleIndex, 1);
    }

    return currentWorkingModules;
}

function moveSelectedParkedItemToTop(payload, currentWorkingModules) {
    if (!payload.workingModule || !payload.selectedParkedItem) {
        return currentWorkingModules;
    }

    const existingWorkingModule = currentWorkingModules.find(
        (curWorkingModule) => curWorkingModule.workingModule.idSettingsGUI == payload.workingModule.idSettingsGUI,
    );
    if (existingWorkingModule) {
        existingWorkingModule.parkedItems = moveItemToTop(
            existingWorkingModule.parkedItems,
            payload.selectedParkedItem,
        );
    }

    return currentWorkingModules;
}

function resetSelectingWorkingModuleParkedItem(selectingWorkingModule, currentWorkingModules) {
    if (!selectingWorkingModule) {
        return currentWorkingModules;
    }

    for (const workingModule of currentWorkingModules) {
        if (
            workingModule.workingModule.idSettingsGUI != selectingWorkingModule.idSettingsGUI &&
            workingModule.parkedItems
        ) {
            for (const parkedItem of workingModule.parkedItems) {
                parkedItem.selected = false;
            }
        }
    }

    return currentWorkingModules;
}

function updateModuleStates(payload, currentModuleStates) {
    if (!payload.currentModule) {
        return currentModuleStates;
    }

    const existingModuleState = currentModuleStates.find(
        (curModuleState) => curModuleState.currentModule.idSettingsGUI == payload.currentModule.idSettingsGUI,
    );
    if (existingModuleState) {
        existingModuleState.selectedParkedItem =
            payload.selectedParkedItem && payload.selectedParkedItem.isNew != true ? payload.selectedParkedItem : null;
        existingModuleState.selectedTab = payload.selectedTab;
        existingModuleState.selectedAiTab = payload.selectedAiTab;
    } else {
        currentModuleStates.push({
            currentModule: payload.currentModule,
            selectedParkedItem:
                payload.selectedParkedItem && payload.selectedParkedItem.isNew != true
                    ? payload.selectedParkedItem
                    : null,
            selectedTab: payload.selectedTab,
            selectedAiTab: payload.selectedAiTab,
        });
    }

    return currentModuleStates;
}

function clearModuleState(currentModule, currentModuleStates) {
    if (!currentModule) {
        return currentModuleStates;
    }

    return currentModuleStates.filter(
        (moduleState) => moduleState.currentModule.idSettingsGUI != currentModule.idSettingsGUI,
    );
}

function moveItemToTop(array: ParkedItemModel[], selectedItem: ParkedItemModel) {
    if (!isEmpty(selectedItem)) {
        const itemIndex = array.findIndex((i) => i.id.value == selectedItem.id.value);

        if (itemIndex != -1) {
            array = move(array, itemIndex, 0);
        } else {
            array.splice(0, 0, selectedItem);
        }
    }

    return array;
}

function move(arr, old_index, new_index) {
    while (old_index < 0) {
        old_index += arr.length;
    }
    while (new_index < 0) {
        new_index += arr.length;
    }
    if (new_index >= arr.length) {
        let k = new_index - arr.length;
        while (k-- + 1) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
}

function removeAllParkedItems(module: Module, currentModuleStates) {
    let currentModule = currentModuleStates.find(
        (moduleState) => moduleState.workingModule.idSettingsGUI == module.idSettingsGUI,
    );
    if (currentModule) {
        currentModule.parkedItems = [];
    }

    return currentModuleStates;
}

function removeParkedItem(payload, currentModuleStates) {
    let currentModule = currentModuleStates.find(
        (moduleState) => moduleState.workingModule.idSettingsGUI == payload.module.idSettingsGUI,
    );
    if (currentModule) {
        const idx = currentModule.parkedItems.indexOf(payload.parkedItem);

        if (idx > -1) {
            currentModule.parkedItems.splice(idx, 1);
        }
    }

    return currentModuleStates;
}

function addDirtyModule(dirtyModule: Module, currentDirtyModules: Module[]) {
    const found = currentDirtyModules.find(
        (currentDirtyModule) => currentDirtyModule.idSettingsGUI == dirtyModule.idSettingsGUI,
    );
    if (!found) {
        currentDirtyModules.push(dirtyModule);
    }

    return currentDirtyModules;
}

function removeDirtyModule(dirtyModule: Module, currentDirtyModules: Module[]) {
    const foundIndex = currentDirtyModules.findIndex(
        (currentDirtyModule) => currentDirtyModule.idSettingsGUI == dirtyModule.idSettingsGUI,
    );
    if (foundIndex !== -1) {
        currentDirtyModules.splice(foundIndex, 1);
    }

    return currentDirtyModules;
}
