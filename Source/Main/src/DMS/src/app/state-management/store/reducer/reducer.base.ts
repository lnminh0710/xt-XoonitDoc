import { CustomAction } from '@app/state-management/store/actions/base';

export function getFeature(action: CustomAction, state: any) {
    let feature: any;
    const moduleId = action.module ? action.module.moduleNameTrim : null;
    if (state.features && state.features[moduleId]) {
        feature = state.features[moduleId];
    }
    return feature;
}

export function updateStateData(action: CustomAction, feature, state, newStateData) {
    const moduleId = action.module ? action.module.moduleNameTrim : null;
    feature = Object.assign({}, feature, newStateData);
    state.features[moduleId] = feature;
    return state;
}

export function getFeatureFromArea(action: CustomAction, state: any) {
    let feature: any;
    const area = action.area;
    if (state.features && state.features[area]) {
        feature = state.features[area];
    }
    return feature;
}

export function updateStateDataFromArea(action: CustomAction, feature, state, newStateData) {
    const area = action.area;
    feature = Object.assign({}, feature, newStateData);
    state.features[area] = feature;
    return state;
}


