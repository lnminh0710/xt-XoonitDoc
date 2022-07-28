import { CustomAction } from '../../actions';
import { DropdownListModel, HotKey } from '@app/models';
import { AppActionNames, AppSuccessAction, AppFailedAction } from '../../actions/app/app.actions';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { NextDocument } from '@app/models/next-document.model';
import { KostnestelleData } from '@app/models/kostneststelle-change.model';

export interface IAppState {
    companyList: DropdownListModel[];
    invoiceDate: Date;
    folder: DocumentTreeModel;
    isGuarantee: boolean;
    hotKey: HotKey;
    nextDocument: NextDocument;
    urgentState: boolean;
    kostnestelleChange: KostnestelleData;
    invoiceIncludeExchanged: string;
}

const initialState: IAppState = {
    companyList: [],
    invoiceDate: new Date(),
    folder: null,
    isGuarantee: false,
    hotKey: null,
    nextDocument: null,
    urgentState: false,
    kostnestelleChange: null,
    invoiceIncludeExchanged: null
};

export function appRootReducer(state = initialState, action: CustomAction): IAppState {
    switch (action.type) {
        case AppActionNames.APP_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as AppSuccessAction);

        case AppActionNames.APP_FAILED_ACTION:
            return actionFailedReducer(state, action as AppFailedAction);
        case AppActionNames.APP_INVOICE_DATE_CHANGE:
            return {...state, invoiceDate: action.payload.InvoiceDate} as IAppState;
        case AppActionNames.SELECT_FOLDER_TREE:
            return {...state, folder: action.payload.folder};
        case AppActionNames.TOGGLE_IS_GUARANTEE:
            return {...state, isGuarantee: action.payload.isGuarantee};
        case AppActionNames.ADD_HOT_KEY: {
            return { ...state, hotKey: action.payload };
        }
        case AppActionNames.APP_NEXT_DOCUMENT: {
            return {...state, nextDocument: action.payload};
        }
        case AppActionNames.TOGGLE_STATE_URGENT: {
            return {...state, urgentState: action.payload};
        }
        case AppActionNames.APP_KOSTNESTSTELLE_CHANGE: {
            return { ...state, kostnestelleChange: action.payload.kostnestelleData };
        }
        case AppActionNames.APP_INVOICE_INCLUDE_EXCHANGED: {
            return { ...state, invoiceIncludeExchanged: action.payload.invoiceIncludeExchanged };
        }
        default:
            return state;
    }
}

function actionSuccessReducer(state: IAppState, action: AppSuccessAction) {
    switch (action.subType) {
        case AppActionNames.GET_COMPANY_DROPDOWN_LIST:
            return {
                ...state,
                companyList: action.payload,
            };

        default:
            return state;
    }
}

function actionFailedReducer(state: IAppState, action: AppFailedAction) {
    switch (action.subType) {
        default:
            return state;
    }
}
