import { CustomAction } from '@app/state-management/store/actions/base';
import {
    AdministrationDocumentActionNames,
    AdministrationDocumentSuccessAction,
    AdministrationDocumentFailedAction,
} from '@app/state-management/store/actions/administration-document';
import { AdministrationDocumentState } from '@app/state-management/store/reducer/administration-document';
import { InitialFormStateModel } from '@app/state-management/store/models/administration-document/initial-form-state.model.payload';
import { FieldFormOnFocusHasChanges } from '@app/state-management/store/models/administration-document/field-form-on-focus-has-changes.model.payload';
import { find, cloneDeep } from 'lodash-es';
import { DocumentProcessingTypeEnum, DocumentTreeTypeDisplayName } from '@app/app.constants';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';
import { Uti } from '@app/utilities';
import {
    DocumentsState,
    DocumentForm,
} from '@app/state-management/store/models/administration-document/state/document-forms.state.model';
import { QueueWorker } from '@app/utilities/queue-worker';
import { DocumentHelper } from '@app/utilities';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { ComboboxRepositoryStateModel } from '../../models/administration-document/state/combobox-repository.state.model';

const initialState: AdministrationDocumentState = {
    comboboxCurrency: null,
    comboboxMeansOfPayment: null,
    modulesOverview: null,
    fieldFormOnFocus: null,
    queueDocumentsStateChange: new QueueWorker(),
    documentsState: null,
    documentFields: null,
    documentContainerOcr: null,
    documentContainerScan: null,
    totalImage: 0,
    communicationDefaultControl: null,
    comboboxCommunicationTypeType: null,
    folder: null,
    listDocumentType: null,
    extractedDataFromOcr: null,
    detailedDocumentData: null,
    keyword: null,
    toDo: null,
    isTodo: false,
    originalFileName: null,
    refCommunicationsSettingList: null,
    capturedFormMode: CapturedFormModeEnum.Created,
    docFileInfo: null,
    didManipulateCaptureFile: false,
    docTypes: null,
    headquarterInfo: {},
    allAddons: {},
    invoiceDateProcessing: null,
};

export function administrationDocumentReducer(state = initialState, action: CustomAction): AdministrationDocumentState {
    switch (action.type) {
        case AdministrationDocumentActionNames.ADMINISTRATION_DOCUMENT_SUCCESS_ACTION:
            return actionSuccessReducer(state, action as AdministrationDocumentSuccessAction);

        case AdministrationDocumentActionNames.ADMINISTRATION_DOCUMENT_FAILED_ACTION:
            return actionFailedReducer(state, action as AdministrationDocumentFailedAction);

        case AdministrationDocumentActionNames.INITIAL_FORM_STATE:
            return initialStateForm(state, action);

        case AdministrationDocumentActionNames.CLEAR_FORM_STATE:
            state.documentsState = null;
            state.extractedDataFromOcr = [];
            state.detailedDocumentData = null;
            return { ...state };

        case AdministrationDocumentActionNames.SET_EMPTY_FORM_STATE:
            return setEmptyFormState(state);

        case AdministrationDocumentActionNames.SET_FIELD_FORM_ON_FOCUS:
            return {
                ...state,
                fieldFormOnFocus: action.payload,
            };

        case AdministrationDocumentActionNames.SET_VALUE_CHANGE_TO_FIELD_FORM_ON_FOCUS:
            return setValueChangeOnFieldFormFocus(state, action);

        case AdministrationDocumentActionNames.SET_MODULES_OVERVIEW:
            return {
                ...state,
                modulesOverview: action.payload,
            };

        case AdministrationDocumentActionNames.SET_DOCUMENT_FIELDS:
            return {
                ...state,
                documentFields: action.payload,
            };

        case AdministrationDocumentActionNames.CLEAR_DOCUMENT_CONTAINER_OCR:
            return {
                ...state,
                documentContainerOcr: null,
                documentContainerScan: null,
            };

        case AdministrationDocumentActionNames.CLEAR_SELECTED_FOLDER_OF_CLASSIFICATION:
            return {
                ...state,
                folder: null,
            };
        case AdministrationDocumentActionNames.SET_DOCUMENT_CONTAINER_SCAN:
            return {
                ...state,
                documentContainerScan: { ...action.payload },
            };

        case AdministrationDocumentActionNames.SET_DOCUMENT_CONTAINER_OCR:
            // if (!action.payload || !action.payload.DocumentType) return;

            // const documentProcessingType = Object.keys(DocumentProcessingTypeEnum).find(
            // (enumStr) => DocumentProcessingTypeEnum[enumStr] === action.payload.DocumentType,
            // );
            // action.payload.DocumentType = DocumentHelper.parseDocumentProcessingType(
            // documentProcessingType || action.payload.DocumentType,
            // );

            return {
                ...state,
                documentContainerOcr: { ...action.payload },
            };

        case AdministrationDocumentActionNames.SET_TOTAL_IMAGE:
            return {
                ...state,
                totalImage: action.payload,
            };

        case AdministrationDocumentActionNames.SET_DOCUMENT_COMMUNICATION:
            return {
                ...state,
                communicationDefaultControl: action.payload,
            };

        case AdministrationDocumentActionNames.SET_REF_COMMUNICATONS_SETTING:
            return {
                ...state,
                refCommunicationsSettingList: action.payload,
            };

        case AdministrationDocumentActionNames.SAVE_DOCUMENT_INTO_FOLDER:
            const _documentContainerOcr = state.documentContainerOcr;
            if (!_documentContainerOcr) return state;

            const payload = action.payload as DocumentTreeModel;
            _documentContainerOcr.IdRepDocumentType = payload.idDocumentType?.toString();
            _documentContainerOcr.DocumentType = DocumentHelper.parseDocumentTypeToDocumentProcessingTypeEnum(
                payload.idDocumentType,
            );

            // !update state without notification
            state.documentContainerOcr = _documentContainerOcr;

            return {
                ...state,
                folder: Object.assign({}, payload),
            };
        case AdministrationDocumentActionNames.SET_DOCUMENT_KEYWORD:
            return {
                ...state,
                keyword: action.payload,
            };
        case AdministrationDocumentActionNames.SET_DOCUMENT_TODO:
            return {
                ...state,
                toDo: action.payload,
            };
        case AdministrationDocumentActionNames.SET_DOCUMENT_IS_TODO:
            return {
                ...state,
                isTodo: action.payload,
            };
        case AdministrationDocumentActionNames.SET_ORIGINAL_FILE_NAME:
            return {
                ...state,
                originalFileName: action.payload,
            };
        case AdministrationDocumentActionNames.SET_ALL_ADD_ONS:
            return {
                ...state,
                allAddons: action.payload,
            };
        case AdministrationDocumentActionNames.CHANGE_INVOICE_DATE:
            return {
                ...state,
                invoiceDateProcessing: action.payload,
            };

        case AdministrationDocumentActionNames.SET_CAPTURED_FORMS_MODE:
            return {
                ...state,
                capturedFormMode: action.payload,
            };

        case AdministrationDocumentActionNames.SET_DOCUMENT_FILE_INFO_TO_CAPTURE:
            return {
                ...state,
                docFileInfo: action.payload,
            };

        case AdministrationDocumentActionNames.FILL_UPDATED_DATA_AFTER_CHANGING_FOLDER:
            return {
                ...state,
                extractedDataFromOcr: action.payload.data,
            };

        case AdministrationDocumentActionNames.MANIPULATED_CAPTURE_FILE:
            return {
                ...state,
                didManipulateCaptureFile: action.payload,
            };
        case AdministrationDocumentActionNames.CLEAR_DOCUMENT_TREE:
            return {
                ...state,
                docTypes: null,
                // xnDocumentTreeOptions: null,
            };

        case AdministrationDocumentActionNames.CLEAR_EXTRACTED_DATA_OCR:
            return {
                ...state,
                extractedDataFromOcr: null,
            };

        default:
            return state;
    }
}

function actionSuccessReducer(state: AdministrationDocumentState, action: AdministrationDocumentSuccessAction) {
    switch (action.subType) {
        case AdministrationDocumentActionNames.GET_ALL_CAPUTRED_REP_COMBOBOX:
            return setAllComboboxState(action.payload.data.item, state);

        case AdministrationDocumentActionNames.GET_DOCUMENT_SUMMARY:
            return {
                ...state,
                documentSummaryModel: action.payload,
            };

        case AdministrationDocumentActionNames.SET_LIST_DOCUMENT_TYPE:
            return {
                ...state,
                listDocumentType: action.payload,
            };

        // comment this reducer action temporarily 27/04/2020
        case AdministrationDocumentActionNames.GET_EXTRACTED_DATA_FROM_OCR:
            return {
                ...state,
                extractedDataFromOcr: action.payload[1],
            };

        case AdministrationDocumentActionNames.GET_CAPTURED_INVOICE_DOCUMENT_DETAIL:
        case AdministrationDocumentActionNames.GET_CAPTURED_CONTRACT_DOCUMENT_DETAIL:
        case AdministrationDocumentActionNames.GET_CAPTURED_OTHER_DOCUMENT_DETAIL:
            return {
                ...state,
                detailedDocumentData: action.payload,
                extractedDataFromOcr: [],
            };

        case AdministrationDocumentActionNames.GET_DOCUMENT_TREE:
            const docTypes = DocumentHelper.mapToDocumentNode(action.payload, DocumentTreeTypeDisplayName.TREE_FOLDER);
            return {
                ...state,
                docTypes: docTypes,
            };

        default:
            return state;
    }
}

function actionFailedReducer(state: AdministrationDocumentState, action: AdministrationDocumentFailedAction) {
    switch (action.type) {
        default:
            return state;
    }
}

function initialStateForm(state: AdministrationDocumentState, action: CustomAction) {
    const payload = action.payload as InitialFormStateModel;
    const documentsState = state.documentsState || new DocumentsState();
    const documentFormName = payload.formState.documentFormName;

    let documentForm = Uti.getDocumentFormByDocumentProcessingType(documentsState, payload.documentProcessingType);

    if (!documentForm) {
        documentForm = initialDocumentFormsState(payload.documentProcessingType);
        documentsState.documentsForm = {}; // clear all documents form of current type => then new type document
        documentsState.documentsForm[payload.documentProcessingType] = documentForm;
    }

    payload.formState.data = cloneDeep(payload.formState.data);

    documentForm.formsState[documentFormName] = payload.formState;
    documentsState.documentOnUpdate.isOnInit = true;

    // state.queueDocumentsStateChange.enqueue(documentsState);
    // state.queueDocumentsStateChange = new QueueWorker(state.queueDocumentsStateChange.queue);

    return {
        ...state,
        documentsState: { ...documentsState },
        // queueDocumentsStateChange: state.queueDocumentsStateChange,
    };
}

function setValueChangeOnFieldFormFocus(state: AdministrationDocumentState, action: CustomAction) {
    const payload = action.payload as FieldFormOnFocusHasChanges;
    const data = payload.data;
    const documentsState = state.documentsState;

    const documentForm = Uti.getDocumentFormByDocumentProcessingType(documentsState, payload.documentProcessingType);
    const formState = Uti.getFormStateByDocumentFormName(documentForm.formsState, payload.documentFormName);

    if (!formState) return state;

    let originalColumnName: string;

    if (data.OriginalColumnName) {
        originalColumnName = data.OriginalColumnName;
    } else if (state.fieldFormOnFocus) {
        originalColumnName = state.fieldFormOnFocus.fieldOnFocus;
    }
    let item = find(formState.data, ['OriginalColumnName', originalColumnName]) as ExtractedDataFormModel;

    // in case of scanning OCR not found the field was defined in dataOfForm => insert new data column to dataOfForm
    // other case is when typing a value on form => root event where is dispatch event setValueChangeToFieldFormOnFocus => not found the field was defined in dataOfForm => insert new data column to dataOfForm
    item = !item ? addNewlyDataOfForm(formState.data, originalColumnName, data.Value) : item;

    item.Value = data.Value;
    if (typeof data.isDelete === 'boolean') {
        item.isDeletedOcr = data.isDelete;
        delete data.isDelete;
    }
    item.WordsCoordinates = data.WordsCoordinates || [];

    // if (
    //     !state.fieldFormOnFocus ||
    //     !state.fieldFormOnFocus.formOnFocus ||
    //     !state.fieldFormOnFocus.formOnFocus.controls[originalColumnName]
    // ) {
    //     return state;
    // }
    // !IMPORTANT side-effect set value to form!!!! this case happens when manipulating to scan text on image
    // if (data.WordsCoordinates && data.WordsCoordinates.length) {
    // state.fieldFormOnFocus.formOnFocus.controls[originalColumnName].setValue(data.Value, { emitEvent: false });
    // }

    // ! Update property documentOnUpdate to identify which form already updated
    // state.queueDocumentsStateChange.enqueue({
    //     documentOnUpdate: {
    //         originalColumnName: item.OriginalColumnName,
    //         documentType: payload.documentProcessingType,
    //         formName: payload.documentFormName,
    //         isScannedByOCR: !!data.WordsCoordinates,
    //         isOnInit: false,
    //     },
    //     documentsForm: documentsState.documentsForm,
    // });
    // state.queueDocumentsStateChange = new QueueWorker(state.queueDocumentsStateChange.queue);

    return {
        ...state,
        documentsState: {
            documentOnUpdate: {
                originalColumnName: item.OriginalColumnName,
                documentType: payload.documentProcessingType,
                formName: payload.documentFormName,
                isScannedByOCR: !!data.WordsCoordinates,
                isOnInit: false,
            },
            documentsForm: documentsState.documentsForm,
        },
        // queueFieldsValueChange: state.queueDocumentsStateChange,
    };
}

function addNewlyDataOfForm(
    dataForm: ExtractedDataFormModel[],
    originalColumnName: string,
    value: string,
): ExtractedDataFormModel {
    const item = <ExtractedDataFormModel>{
        Value: value,
        OriginalColumnName: originalColumnName, // field column
        WordsCoordinates: [],
        GroupField: dataForm[0] ? dataForm[0].GroupField : '',
    };

    dataForm.push(item);
    return item;
}

function initialDocumentFormsState(documentProcessingTypeValue: DocumentProcessingTypeEnum): DocumentForm {
    const newDocumentFormState = new DocumentForm();
    newDocumentFormState.documentFormType = {
        documentProcessingType: documentProcessingTypeValue,
    };
    newDocumentFormState.formsState = {};
    return newDocumentFormState;
}

function setAllComboboxState(
    data: { [key: string]: ComboboxRepositoryStateModel[] },
    state: AdministrationDocumentState,
) {
    const comboboxKeysState = Object.keys(state).filter((keyState) => keyState.startsWith('combobox'));
    if (!comboboxKeysState || comboboxKeysState.length <= 0) return state;

    const prefixCombobox = 'combobox';

    // data : { language: [...], productType: [...] }
    Object.keys(data).forEach((dataComboboxName) => {
        for (let i = 0; i < comboboxKeysState.length; i++) {
            // comboboxKeysState : { comboboxLanguage: [...], comboboxProductType: [...] }
            const keyState = comboboxKeysState[i];
            if (prefixCombobox.concat(dataComboboxName).toLowerCase() === keyState.toLowerCase()) {
                state[keyState] = data[dataComboboxName];
            }
        }
    });

    return { ...state };
}

function setEmptyFormState(state: AdministrationDocumentState) {
    if (!state.documentsState || !state.documentsState.documentsForm) return state;
    if (!state.extractedDataFromOcr) return state;

    const documentsForm = state.documentsState.documentsForm;

    Object.keys(documentsForm).forEach((documentProcessingType) => {
        if (!documentsForm[documentProcessingType].formsState) return;
        const formsState = documentsForm[documentProcessingType].formsState;

        Object.keys(formsState).forEach((formName) => {
            const formState = formsState[formName];

            // set empty data for form control
            Uti.setEmptyDataForm(formState.form, (ctrlName) => {
                return false;
            });

            // set empty data for extracted data
            Uti.setEmptyExtractedData(formState.data, (originalColumnName) => {
                return false;
            });
        });
    });
    return state;
}
