import { CustomAction } from '@app/state-management/store/actions/base';
import * as baseReducer from '@app/state-management/store/reducer/reducer.base';
import { DocumentImageOCRActions } from '../../actions';

export interface SubImageOCRState {
    ocrJson: any;
}

export const initialSubImageOCRState: any = {
    ocrJson: {},
};

export interface ImageOCRState {
    features: { [id: string]: ImageOCRState };
}

const initialState: ImageOCRState = {
    features: {},
};

export function ImageOCRStateReducer(state = initialState, action: CustomAction): ImageOCRState {
    switch (action.type) {
        case DocumentImageOCRActions.UPDATE_OCR_JSON:
            const feature = baseReducer.getFeature(action, state) || {};
            state = baseReducer.updateStateData(action, feature, state, {
                ocrJson: Object.assign(feature.ocrJson || {}, action.payload),
            });
            return Object.assign({}, state);

        default: {
            return state;
        }
    }
}
