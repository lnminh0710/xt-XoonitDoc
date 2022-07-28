import { Action } from '@ngrx/store';
import { XnCommonActions } from '@app/state-management/store/actions/xn-common';
import { MessageModalModel, LayoutPageInfoModel, HotKey } from '@app/models';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface SubCommonState {
    listComboBox: any;
    moduleToPersonType: any;
    layoutPageInfo: LayoutPageInfoModel[];
    hotKey: HotKey;
    contextMenuData: Array<any>;
    contextMenuClicked: boolean;
    modalData: MessageModalModel;
    modalShowMessage: any;
    modalCloseMessage: any;
}

export const initialSubCommonState: SubCommonState = {
    listComboBox: {},
    moduleToPersonType: {},
    layoutPageInfo: null,
    hotKey: null,
    contextMenuData: [],
    contextMenuClicked: false,
    modalData: new MessageModalModel(),
    modalShowMessage: false,
    modalCloseMessage: false,
};

export interface CommonState {
    features: { [id: string]: SubCommonState }
}

const initialState: CommonState = {
    features: {}
};

export function xnCommonReducer(state = initialState, action: CustomAction): CommonState {
    switch (action.type) {
        case XnCommonActions.LOAD_COMBO_BOX_LIST_SUCCESS: {
            let feature = baseReducer.getFeature(action, state);

            if (action.payload && feature)
                state = baseReducer.updateStateData(action, feature, state, {
                    listComboBox: Object.assign({}, feature.listComboBox, action.payload)
                });
            else
                state = baseReducer.updateStateData(action, feature, state, {
                    listComboBox: {}
                });

            return Object.assign({}, state);
        }
        case XnCommonActions.GET_MODULE_TO_PERSON_TYPE: {
            let feature = baseReducer.getFeature(action, state);

            if (action.payload && feature)
                state = baseReducer.updateStateData(action, feature, state, {
                    moduleToPersonType: Object.assign({}, feature.moduleToPersonType, action.payload)
                });
            else
                state = baseReducer.updateStateData(action, feature, state, {
                    moduleToPersonType: {}
                });


            return Object.assign({}, state);
        }
        case XnCommonActions.SET_WIDGETBOXES_INFO: {
            let feature = baseReducer.getFeature(action, state);

            let layoutPageInfo = [];
            if (feature && feature.layoutPageInfo) {
                layoutPageInfo = feature.layoutPageInfo.filter((item) => item.moduleName === action.payload.moduleName);
            }
            if (layoutPageInfo) {
                const index = layoutPageInfo.findIndex((page) => page.id === action.payload.id);
                if (action.payload && action.payload.widgetboxesTitle && action.payload.widgetboxesTitle.length) {
                    if (index >= 0)
                        layoutPageInfo[index] = action.payload;
                    else
                        layoutPageInfo.push(action.payload);
                }
                else if (index >= 0)
                    layoutPageInfo.splice(index, 1);

            }
            state = baseReducer.updateStateData(action, feature, state, {
                layoutPageInfo: layoutPageInfo
            });

            return Object.assign({}, state);
        }
        case XnCommonActions.ADD_HOT_KEY: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                hotKey: action.payload
            });
            return Object.assign({}, state);
        }
        case XnCommonActions.CONTEXT_MENU_CLICKED: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                contextMenuClicked: Object.assign({}, feature.contextMenuClicked, { contextMenuClicked: action.payload })
            });
            return Object.assign({}, state);
        }
        default: {
            return state;
        }
    }
};
