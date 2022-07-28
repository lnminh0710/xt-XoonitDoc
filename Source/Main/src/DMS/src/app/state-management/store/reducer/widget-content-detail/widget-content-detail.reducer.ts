import { Action } from '@ngrx/store';
import { WidgetDetail, LightWidgetDetail } from '@app/models';
import { WidgetDetailActions } from '@app/state-management/store/actions/widget-content-detail';
import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';

export interface RowData {
    data?: any;
    widgetDetail?: WidgetDetail;
}

export interface EditingWidget {
    widgetDetail?: LightWidgetDetail;
    pageId?: string;
    selectedEntity?: any;
    tabId?: string;
}

export interface WidgetDataUpdated {
    widgetDetail?: LightWidgetDetail;
    updateInfo?: any;
    // True: will find parent and reload parent widget
    isReloadForParent?: boolean;
    isSelfUpdated?: boolean;
}

export interface RelatingWidget {
    mode: string;
    scrWidgetDetail?: WidgetDetail;
    // Connected widgets with scrWidgetDetail
    relatingWidgetIds: Array<string>;
}

export interface SubWidgetDetailState {
    rowData: RowData;
    rowsData: any;
    rowCampaignMediaMainData: RowData;
    widgetDataUpdated: WidgetDataUpdated;
    editingWidgets: Array<EditingWidget>;
    relatingWidget: RelatingWidget;
    requestSave: any;
    requestReload: any;
    isEditAllWidgetMode: boolean;
}

export const initialSubWidgetDetailState: SubWidgetDetailState = {
    rowData: null,
    rowsData: null,
    rowCampaignMediaMainData: null,
    widgetDataUpdated: null,
    editingWidgets: [],
    relatingWidget: null,
    requestSave: null,
    requestReload: null,
    isEditAllWidgetMode: false,
};

export interface WidgetDetailState {
    features: { [id: string]: SubWidgetDetailState }
}

const initialState: WidgetDetailState = {
    features: {}
};

export function widgetDetailReducer(state = initialState, action: CustomAction): WidgetDetailState {
    switch (action.type) {
        case WidgetDetailActions.LOAD_WIDGET_TYPE_DETAIL: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                rowData: action.payload
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.CLEAR_WIDGET_TYPE_DETAIL: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                rowData: null
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.LOAD_WIDGET_TABLE_DATA_ROWS: {
            let feature = baseReducer.getFeature(action, state);

            let result = [];
            if (!feature.rowsData || !feature.rowsData.length) {
                result.push(action.payload);
            } else {
                let exist = false;
                result = feature.rowsData;
                result.forEach(x => {
                    if (x.widgetDetailId == action.payload.widgetDetailId) {
                        x.rowData = action.payload.rowData;
                        exist = true;
                        return;
                    }
                });
                if (!exist) {
                    result.push(action.payload);
                }
            }

            state = baseReducer.updateStateData(action, feature, state, {
                rowsData: result
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.CLEAR_WIDGET_TABLE_DATA_ROWS: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                rowsData: null
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.LOAD_WIDGET_TYPE_DETAIL_FOR_CAMPAIGN_MEDIA: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                rowCampaignMediaMainData: action.payload
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.CLEAR_WIDGET_TYPE_DETAIL_FOR_CAMPAIGN_MEDIA: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                rowCampaignMediaMainData: null
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.SYNC_UPDATE_DATA_WIDGET: {
            let feature = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                widgetDataUpdated: action.payload
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.ADD_WIDGET_EDITING: {
            let feature: SubWidgetDetailState = baseReducer.getFeature(action, state);
            const editingWidgetPayload: EditingWidget = action.payload;
            let isExists: boolean;
            if (feature.editingWidgets && feature.editingWidgets.length > 0) {
                const rs = feature.editingWidgets.filter(p => p.widgetDetail.id == editingWidgetPayload.widgetDetail.id);
                if (rs.length > 0) {
                    isExists = true;
                }
            }
            if (!isExists) {
                state = baseReducer.updateStateData(action, feature, state, {
                    editingWidgets: [...feature.editingWidgets, ...action.payload]
                });
                return Object.assign({}, state);
            }
            return state;
        }
        case WidgetDetailActions.CANCEL_WIDGET_EDITING: {
            let feature: SubWidgetDetailState = baseReducer.getFeature(action, state);
            const editingWidgetPayload: EditingWidget = action.payload;
            let editingWigetFilter: Array<EditingWidget> = [];
            if (feature.editingWidgets && feature.editingWidgets.length > 0) {
                editingWigetFilter = feature.editingWidgets.filter(p => p.widgetDetail.id != editingWidgetPayload.widgetDetail.id);
            }
            state = baseReducer.updateStateData(action, feature, state, {
                editingWidgets: [...editingWigetFilter]
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.REQUEST_SAVE: {
            let feature: SubWidgetDetailState = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestSave: {}
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.CLEAR_REQUEST_SAVE: {
            let feature: SubWidgetDetailState = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestSave: null
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.REQUEST_RELOAD: {
            let feature: SubWidgetDetailState = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestReload: {}
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.CLEAR_REQUEST_RELOAD: {
            let feature: SubWidgetDetailState = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                requestReload: null
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.CANCEL_ALL_WIDGET_EDITING: {
            let feature: SubWidgetDetailState = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                editingWidgets: []
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.HOVER_AND_DISPLAY_RELATING_WIDGET: {
            let feature: SubWidgetDetailState = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                relatingWidget: action.payload
            });
            return Object.assign({}, state);
        }
        case WidgetDetailActions.TOGGLE_EDIT_ALL_WIDGET_MODE: {
            let feature: SubWidgetDetailState = baseReducer.getFeature(action, state);
            state = baseReducer.updateStateData(action, feature, state, {
                isEditAllWidgetMode: action.payload
            });
            return Object.assign({}, state);
        }
        default: {
            return state;
        }
    }
}
