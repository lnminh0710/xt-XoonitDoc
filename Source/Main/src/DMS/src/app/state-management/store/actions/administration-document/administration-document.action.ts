import { Action } from '@ngrx/store';
import { ModuleOverview, XnDocumentTreeOptions, Module } from '@app/models';
import { FieldFormOnFocusModel } from '@app/state-management/store/models/administration-document/field-form-on-focus.model.payload';
import { InitialFormStateModel } from '@app/state-management/store/models/administration-document/initial-form-state.model.payload';
import { Injectable } from '@angular/core';
import { FieldFormOnFocusHasChanges } from '@app/state-management/store/models/administration-document/field-form-on-focus-has-changes.model.payload';

import { DocumentFormNameEnum } from '@app/app.constants';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { TreeNode } from '@circlon/angular-tree-component';
import { SaveDocumentContractForms } from '@app/state-management/store/models/administration-document/document-contract.model.payload';
import { SaveOtherDocumentForms } from '@app/state-management/store/models/administration-document/document-other.model.payload';
import { DocumentContainerOCRModel } from '@app/models/administration-document/document-container-ocr.model';
import { DocumentContainerOcrStateModel } from '@app/state-management/store/models/administration-document/state/document-container-ocr.state.model';
import { GetDocumentTreeOptions } from '../../models/administration-document/get-document-tree-options.payload';
import { GlobalSearchFilterModel } from '@app/models/global-search-filter.model';
import { FavouriteContactModel } from '@app/models/favourite-contact.model';
import { RefCommunicationModel, ContactDetailRequestModel } from '@app/models/contact-document.model';
import { SaveDocumentInvoiceModel } from '@app/state-management/store/models/administration-document/document-invoice.model.payload';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { DocumentFileInfoModel } from '../../models/administration-document/state/document-file-info.state.model';
import { DynamicFieldsPayloadModel } from '@app/models/administration-document/document-form/dynamic-fields.payload.model';
import { CapturedFormMediator } from '../../models/administration-document/captured-form-mediator.payload';
import { CapturedFormColleague } from '../../models/administration-document/captured-form-colleague.payload';
import { OcrDataVisitor } from '../../models/administration-document/ocr-data-visitor-pattern/ocr-data-visitor.payload';
import { CapturedFormElement } from '../../models/administration-document/ocr-data-visitor-pattern/captured-form-element.payload';
import { IElement } from '@app/models/common/ielement.model';
import { ExtractedDataOcrState } from '../../models/administration-document/state/extracted-data-ocr.state.model';
import { DocumentContainerScanStateModel } from '../../models/administration-document/state/document-container-scan.state.model';
import { AttachDocument } from '../../../../models/email';

export enum AdministrationDocumentActionNames {
    ADMINISTRATION_DOCUMENT_SUCCESS_ACTION = '[ADMINISTARTION DOCUMENT] Success Action',
    ADMINISTRATION_DOCUMENT_FAILED_ACTION = '[ADMINISTARTION DOCUMENT] Failed Action',
    GET_DOCUMENT_SUMMARY = '[ADMINISTARTION DOCUMENT] Get Document Summary',
    SET_MODULES_OVERVIEW = '[ADMINISTARTION DOCUMENT] Set Modules Overview',
    GET_DOCUMENT_TREE = '[ADMINISTARTION DOCUMENT] Get Document Tree',
    GET_FAVOURITE_FOLDER = '[ADMINISTARTION DOCUMENT] Get Favourite folder',
    GET_DOCUMENT_DYNAMIC_COMBOBOX = '[ADMINISTARTION DOCUMENT] Get Document invoice dynamic combobox',
    SET_FORMS = '[ADMINISTARTION DOCUMENT] Set Forms',
    INITIAL_FORM_STATE = '[ADMINISTARTION DOCUMENT] Initial Form State',
    SET_FIELD_FORM_ON_FOCUS = '[ADMINISTARTION DOCUMENT] Set Field Form On Focus',
    SET_VALUE_CHANGE_TO_FIELD_FORM_ON_FOCUS = '[ADMINISTARTION DOCUMENT] Set Value Change To Field Form On Focus',
    SCAN_OCR_TEXT = '[ADMINISTARTION DOCUMENT] Scan OCR Text',
    SAVE_DOCUMENT_INVOICE_FORMS = '[ADMINISTARTION DOCUMENT] Save Document Forms',
    SAVE_DOCUMENT_CONTRACT_FORMS = '[ADMINISTARTION DOCUMENT] Save Document Contract Forms',
    SAVE_OTHER_DOCUMENT_FORMS = '[ADMINISTARTION DOCUMENT] Save Other Document Forms',
    SET_DOCUMENT_FIELDS = '[ADMINISTARTION DOCUMENT] Set Document Field',
    SET_DOCUMENT_CONTAINER_SCAN = '[ADMINISTARTION DOCUMENT] Set Id document container Scan',
    SET_DOCUMENT_CONTAINER_OCR = '[ADMINISTARTION DOCUMENT] Set Id document container ocr',
    GET_COMMUNICATION_TYPE = '[ADMINISTARTION DOCUMENT] Set communication type',
    GET_INVOICE_COLUMN_SETTING = '[ADMINISTARTION DOCUMENT] Get Invoice Column Setting',
    GET_PERSON_CONTACT_COLUMN_SETTING = '[ADMINISTARTION DOCUMENT] Get Person Contact (BeneficiaryContact, RemitterContact) Column Setting',
    GET_PERSON_CONTACT_COLUMN_SETTING_OF_DOCUMENT_TYPE = '[ADMINISTARTION DOCUMENT] Get Person Contact Column Setting Of Document Type',
    GET_BANK_CONTACT_COLUMN_SETTING = '[ADMINISTARTION DOCUMENT] Get Bank Contact  Column Setting',
    GET_CONTRACT_COLUMN_SETTING = '[ADMINISTARTION DOCUMENT] Get Contract Column Setting',
    GET_OTHER_DOCUMENTS_COLUMN_SETTING = '[ADMINISTARTION DOCUMENT] Get Other Documents Column Setting',
    GET_DOCUMENT_CONTACT_COMMUNICATION = '[ADMINISTARTION DOCUMENT] Get Document Contact Communication',
    SET_DOCUMENT_COMMUNICATION = '[ADMINISTARTION DOCUMENT] Get Document Communication',
    GET_EXTRACTED_DATA_FROM_OCR = '[ADMINISTARTION DOCUMENT] Get Extracted Data From OCR',
    CLEAR_EXTRACTED_DATA_OCR = '[ADMINISTARTION DOCUMENT] Clear Extracted Data OCR',
    GET_LIST_COMBOBOX_CURRENCY = '[ADMINISTARTION DOCUMENT] Get List ComboBox Currency',
    GET_ALL_CAPUTRED_REP_COMBOBOX = '[ADMINISTARTION DOCUMENT] Get All Captured Rep Combobox',
    SET_TOTAL_IMAGE = '[ADMINISTARTION DOCUMENT] Set total images',
    SAVE_DOCUMENT_INTO_FOLDER = '[ADMINISTARTION DOCUMENT] Save Document Into Folder',
    CHANGE_DOCUMENT_DETAIL_INTO_FOLDER = '[ADMINISTARTION DOCUMENT] Change Document Detail Into Folder',
    CREATE_NEW_TREE_FOLDER = '[ADMINISTARTION DOCUMENT] Create New Tree Folder',
    ADD_NEWLY_SUB_TREE_FOLDER = '[ADMINISTARTION DOCUMENT] Add Newly Sub Tree Folder',
    RENAME_TREE_FOLDER = '[ADMINISTARTION DOCUMENT] Rename Tree Folder',
    TOGGLE_ACTIVE_FOLDER = '[ADMINISTARTION DOCUMENT] Toggle Active Folder',
    DELETE_TREE_FOLDER = '[ADMINISTARTION DOCUMENT] Delete Tree Folder',
    SET_LIST_DOCUMENT_TYPE = '[ADMINISTARTION DOCUMENT] Set List Document Type',
    SAVE_DOCUMENT_OCR = '[ADMINISTARTION DOCUMENT] Save Document Container Ocr',
    CHANGE_MODE_SELECTABLE_FOLDER = '[ADMINISTARTION DOCUMENT] Select Folder Document',
    CLEAR_PATH_FOLDER_ON_CAPTURED_TREE = '[ADMINISTARTION DOCUMENT] Clear Path Folder On Captured Tree',
    ON_INITIALIZE_CAPTURED_FORM = '[ADMINISTRATION DOCUMENT] On Initialize Captured Form',
    NEXT_DOCUMENT_TO_CLASSIFY = '[ADMINISTRATION DOCUMENT] Next Document To Classify',
    EXPAND_CAPTURED_FORM = '[ADMINISTRATION DOCUMENT] Expand Captured Form',
    SET_DOCUMENT_TODO = '[ADMINISTRATION DOCUMENT] Set Document Todo',
    SET_DOCUMENT_IS_TODO = '[ADMINISTRATION DOCUMENT] Set Document Is Todo',
    SET_DOCUMENT_KEYWORD = '[ADMINISTRATION DOCUMENT] Set Document Keyword',
    SET_ORIGINAL_FILE_NAME = '[ADMINISTRATION DOCUMENT] Set Original file name',
    GET_ATTACHMENT_BY_CONTACT = '[ADMINISTRATION DOCUMENT] Get Attachement by Contact',
    CREATE_NEW_FAVOURITE_FOLDER = '[ADMINISTRATION DOCUMENT] Create New Favourute Folder',
    GLOBAL_SEARCH_FILTER_BY_FOLDER = '[ADMINISTRATION DOCUMENT] Global Search Filter By Folder',
    GLOBAL_SEARCH_CONTACT = '[ADMINISTRATION DOCUMENT] Global Search Contact',
    GLOBAL_SEARCH_COLLAPASE = '[ADMINISTRATION DOCUMENT] Global Search Collapase',
    GLOBAL_SEARCH_FORCE_SET_RESULT = '[ADMINISTRATION DOCUMENT] Global search force set result',
    ADD_CONTACT_TO_MY_FAVOURITE = '[ADMINISTRATION DOCUMENT] Add Contact To My Favourite',
    GET_CAPTURED_INVOICE_DOCUMENT_DETAIL = '[ADMINISTRATION DOCUMENT] Get Captured Invoice Document Detail',
    GET_CAPTURED_CONTRACT_DOCUMENT_DETAIL = '[ADMINISTRATION DOCUMENT] Get Captured Contract Document Detail',
    GET_CAPTURED_OTHER_DOCUMENT_DETAIL = '[ADMINISTRATION DOCUMENT] Get Captured Other Document Detail',
    GET_DOCUMENT_IMAGE_OCR_FOR_DOCUMENT_DETAIL = '[ADMINISTRATION DOCUMENT] Get Document Image Ocr For Document Detail',
    CLEAR_DOCUMENT_CONTAINER_OCR = '[ADMINISTRATION DOCUMENT] Clear Document Container Ocr',
    CLEAR_FORM_STATE = '[ADMINISTRATION DOCUMENT] Clear Form State',
    SET_EMPTY_FORM_STATE = '[ADMINISTRATION DOCUMENT] Set Empty Form State',
    CLEAR_SELECTED_FOLDER_OF_CLASSIFICATION = '[ADMINISTRATION DOCUMENT] Clear Selected Folder Of Classification',
    NOTIFY_DOCUMENT_IMAGE_OCR_COMPONENT_INIT_DONE = '[ADMINISTRATION DOCUMENT] Notify Document Image Ocr Component Init Done',
    SET_REF_COMMUNICATONS_SETTING = '[ADMINISTRATION DOCUMENT] Set RefCommunication Setting',
    GET_CONTACT_DETAIL = '[ADMINISTRATION DOCUMENT] Get Contact Detail',
    SAVE_CONTACT_DETAIL = '[ADMINISTRATION DOCUMENT] Save Contact Detail',
    SET_HIGHLIGHT_AND_SAVE_DOCUMENT_INTO_FOLDER = '[ADMINISTRATION DOCUMENT] Set Highlight ANd Save Document Into Folder',
    SET_CAPTURED_FORMS_MODE = '[ADMINISTRATION DOCUMENT] Set Captured Forms Mode',
    SET_DYNAMIC_FIELDS = '[ADMINISTRATION DOCUMENT] Set Dynamic Fields',
    GET_HISTORY_DOCUMENT = '[ADMINISTRATION DOCUMENT] Get History Document',
    SELECT_CAPTURE_DOCUMENT_ON_GLOBAL_SEARCH = '[ADMINISTRATION DOCUMENT] Select Capture Document On Global Search',
    SET_DOCUMENT_FILE_INFO_TO_CAPTURE = '[ADMINISTRATION DOCUMENT] Set Document File Info To Capture',
    GET_DOCUMENTS_THUMBNAIL_DONE = '[ADMINISTRATION DOCUMENT] Get Documents Thumbnail Done',
    FILL_UPDATED_DATA_AFTER_CHANGING_FOLDER = '[ADMINISTRATION DOCUMENT] Fill Updated Data After Changing Folder',
    ENABLE_BUTTON_SAVE_WIDGET_DMS_ACTION = '[ADMINISTRATION DOCUMENT] Enable Button Save Widget Dms Action',
    ENABLE_BUTTON_TOGGLED_CAPTURED_FORM = '[ADMINISTRATION DOCUMENT] Enable Button Toggled Captured Form',
    SHOW_DIALOG_ADD_NEW_NOTE = '[ADMINISTRATION DOCUMENT] Show Dialog Add New Note',
    MANIPULATED_CAPTURE_FILE = '[ADMINISTRATION DOCUMENT] Manipulated Capture File',
    RESET_DOCUMENT = '[ADMINISTRATION DOCUMENT] Reset Document',
    CLEAR_DOCUMENT = '[ADMINISTRATION DOCUMENT] Clear Document',
    DELETE_IMAGE_SCAN_DOCUMENT_ON_THUMBNAIL = '[ADMINISTRAION DOCUMENT] Delete Image Scan Document On Thumbnail',
    REGISTER_LINK_CONNECTION_CONTACT_FORM_COLLEAGUE = '[ADMINISTRATION DOCUMENT] Register Link Connection Contact Form Colleague',
    REGISTER_OCR_DATA_VISITOR = '[ADMINISTRATION DOCUMENT] Register Ocr Data Visitor',
    REGISTER_TAB_FORM_ELEMENT = '[ADMINISTRATION DOCUMENT] Register Tab Form Element',
    CHECK_AND_GET_COMPANY_NAME_LIST = '[ADMINISTRATION DOCUMENT] Check And Get Company Name List',
    SET_XN_DOCUMENT_TREE_OPTIONS = '[ADMINISTRATION DOCUMENT] Set Xn Document Tree Options',
    CLEAR_DOCUMENT_TREE = '[ADMINISTARTION DOCUMENT] Clear Document Tree',
    WIDGET_MYDM_FORM_INIT_SUCCESS = '[ADMINISTARTION DOCUMENT] Wigget mydm form init success',

    GET_DOCUMENT_BY_ID_SCAN = '[ADMINISTARTION DOCUMENT] Get document by id scan',
    GET_SELECTED_DOCUMENT = '[ADMINISTARTION DOCUMENT] Get selected document',
    DISPATCH_ID_MAIN_INVOICE_APPROVAL = '[INVOICE APPROVAL DOCUMENT] Dispatch Id Main',
    SET_IS_TODO_INVOICE_APPROVAL = '[ADMINISTARTION DOCUMENT] Set isTodo Invoice Approval',

    CHANGE_DOCUMENT_TO_OTHER_TREE = '[ADMINISTARTION DOCUMENT] Change Document to other tree',
    CHANGE_DOCUMENT_TO_OTHER_TREE_SUCCESS = '[ADMINISTARTION DOCUMENT] Change Document to other tree success',
    SAVE_DOCUMENT_FORM_SUCCESS = '[ADMINISTARTION DOCUMENT] Save document form success',
    SAVE_DOCUMENT_FORM_FAIL = '[ADMINISTARTION DOCUMENT] Save document form fail',
    SET_ALL_ADD_ONS = '[ADMINISTARTION DOCUMENT] Set All Addons',
    CHANGE_INVOICE_DATE = '[ADMINISTARTION DOCUMENT] Change Invoice Date',
    CLOSE_EXTRACTION_DATA = '[ADMINISTARTION DOCUMENT] Close Popup Extraction Data',
    SHOW_DOCUMENT_VIEWER = '[ADMINISTARTION DOCUMENT] Show document viewer',

    SELECT_EMAIL_ITEM = '[ADMINISTARTION DOCUMENT] Select email item',
}

@Injectable()
export class AdministrationDocumentActions {
    public administrationDocumentSuccessAction(actionType: string, payload: any): AdministrationDocumentSuccessAction {
        return {
            type: AdministrationDocumentActionNames.ADMINISTRATION_DOCUMENT_SUCCESS_ACTION,
            subType: actionType,
            payload: payload,
        };
    }

    public administrationDocumentFailedAction(actionType: string, payload: any): AdministrationDocumentFailedAction {
        return {
            type: AdministrationDocumentActionNames.ADMINISTRATION_DOCUMENT_FAILED_ACTION,
            subType: actionType,
            payload: payload,
        };
    }

    public setModulesOverview(payload: ModuleOverview[]) {
        return {
            type: AdministrationDocumentActionNames.SET_MODULES_OVERVIEW,
            payload: payload,
        };
    }

    public getDocumentSummary() {
        return {
            type: AdministrationDocumentActionNames.GET_DOCUMENT_SUMMARY,
        };
    }

    public setFieldFormOnFocus(payload: FieldFormOnFocusModel) {
        return {
            type: AdministrationDocumentActionNames.SET_FIELD_FORM_ON_FOCUS,
            payload: payload,
        };
    }

    public setValueChangeToFieldFormOnFocus(payload: FieldFormOnFocusHasChanges) {
        return {
            type: AdministrationDocumentActionNames.SET_VALUE_CHANGE_TO_FIELD_FORM_ON_FOCUS,
            payload: payload,
        };
    }

    public scanOcrText(payload: ExtractedDataOcrState) {
        return {
            type: AdministrationDocumentActionNames.SCAN_OCR_TEXT,
            payload: payload,
        };
    }

    public initialFormState(payload: InitialFormStateModel) {
        return {
            type: AdministrationDocumentActionNames.INITIAL_FORM_STATE,
            payload: payload,
        };
    }

    public saveDocumentInvoiceForms(payload: Partial<SaveDocumentInvoiceModel>) {
        return {
            type: AdministrationDocumentActionNames.SAVE_DOCUMENT_INVOICE_FORMS,
            payload: payload,
        };
    }

    public getDocumentTree(options: GetDocumentTreeOptions) {
        return {
            type: AdministrationDocumentActionNames.GET_DOCUMENT_TREE,
            payload: options,
        };
    }

    public getFavouriteFolder() {
        return {
            type: AdministrationDocumentActionNames.GET_FAVOURITE_FOLDER,
        };
    }

    public getDocumentDynamicCombobox(idDocumentTree: number) {
        return {
            type: AdministrationDocumentActionNames.GET_DOCUMENT_DYNAMIC_COMBOBOX,
            payload: idDocumentTree,
        };
    }

    public setDocumentField(payload: any[]) {
        return {
            type: AdministrationDocumentActionNames.SET_DOCUMENT_FIELDS,
            payload: payload,
        };
    }

    public dispatchDocumentContainerOCR(payload: any) {
        return {
            type: AdministrationDocumentActionNames.SET_DOCUMENT_CONTAINER_OCR,
            payload: payload,
        };
    }

    public dispatchDocumentContainerScan(payload: DocumentContainerScanStateModel) {
        return {
            type: AdministrationDocumentActionNames.SET_DOCUMENT_CONTAINER_SCAN,
            payload: payload,
        };
    }

    public getExtractedDataFromOcr(payload: { idRepDocumentType: string; idDocumentContainerOcr: string }) {
        return {
            type: AdministrationDocumentActionNames.GET_EXTRACTED_DATA_FROM_OCR,
            payload: payload,
        };
    }

    public clearExtractedDataOcr() {
        return {
            type: AdministrationDocumentActionNames.CLEAR_EXTRACTED_DATA_OCR,
        };
    }

    public getInvoiceColumnSetting() {
        return {
            type: AdministrationDocumentActionNames.GET_INVOICE_COLUMN_SETTING,
        };
    }

    public getPersonContactColumnSetting(payload: any) {
        return {
            type: AdministrationDocumentActionNames.GET_PERSON_CONTACT_COLUMN_SETTING,
            payload,
        };
    }

    public getPersonContactColumnSettingBasedOnDocumentType(documentType: string) {
        return {
            type: AdministrationDocumentActionNames.GET_PERSON_CONTACT_COLUMN_SETTING_OF_DOCUMENT_TYPE,
            payload: documentType,
        };
    }

    public getBankContactColumnSetting(payload: any) {
        return {
            type: AdministrationDocumentActionNames.GET_BANK_CONTACT_COLUMN_SETTING,
            payload,
        };
    }

    public setTotalImage(payload: any) {
        return {
            type: AdministrationDocumentActionNames.SET_TOTAL_IMAGE,
            payload,
        };
    }

    public getDocumentContactCommunication(payload: any) {
        return {
            type: AdministrationDocumentActionNames.GET_DOCUMENT_CONTACT_COMMUNICATION,
            payload,
        };
    }

    public getCommunicationType() {
        return {
            type: AdministrationDocumentActionNames.GET_COMMUNICATION_TYPE,
        };
    }

    public setDocumentCommunication(payload: any[]) {
        return {
            type: AdministrationDocumentActionNames.SET_DOCUMENT_COMMUNICATION,
            payload,
        };
    }

    public getListComboBoxCurrency(payload: any, orginalColumnName: string) {
        return {
            type: AdministrationDocumentActionNames.GET_LIST_COMBOBOX_CURRENCY,
            payload,
            orginalColumnName,
        };
    }

    public getAllCapturedRepCombobox(comboboxList: string) {
        return {
            type: AdministrationDocumentActionNames.GET_ALL_CAPUTRED_REP_COMBOBOX,
            payload: comboboxList,
        };
    }

    public getContractColumnSetting() {
        return {
            type: AdministrationDocumentActionNames.GET_CONTRACT_COLUMN_SETTING,
        };
    }

    public saveDocumentContractForms(payload: Partial<SaveDocumentContractForms>) {
        return {
            type: AdministrationDocumentActionNames.SAVE_DOCUMENT_CONTRACT_FORMS,
            payload: payload,
        };
    }

    public getOtherDocumentsColumnSetting() {
        return {
            type: AdministrationDocumentActionNames.GET_OTHER_DOCUMENTS_COLUMN_SETTING,
        };
    }

    public saveOtherDocumentForms(payload: Partial<SaveOtherDocumentForms>) {
        return {
            type: AdministrationDocumentActionNames.SAVE_OTHER_DOCUMENT_FORMS,
            payload: payload,
        };
    }

    public saveDocumentIntoFolder(payload: DocumentTreeModel) {
        return {
            type: AdministrationDocumentActionNames.SAVE_DOCUMENT_INTO_FOLDER,
            payload: payload,
        };
    }

    public changeDocumentDetailIntoFolder(payload: DocumentTreeModel) {
        return {
            type: AdministrationDocumentActionNames.CHANGE_DOCUMENT_DETAIL_INTO_FOLDER,
            payload: payload,
        };
    }

    public createNewTreeFolder(payload: DocumentTreeModel) {
        return {
            type: AdministrationDocumentActionNames.CREATE_NEW_TREE_FOLDER,
            payload: payload,
        };
    }

    public addNewlySubTreeFolder(payload: DocumentTreeModel) {
        return {
            type: AdministrationDocumentActionNames.ADD_NEWLY_SUB_TREE_FOLDER,
            payload: payload,
        };
    }

    public renameTreeFolder(payload: DocumentTreeModel) {
        return {
            type: AdministrationDocumentActionNames.RENAME_TREE_FOLDER,
            payload: payload,
        };
    }

    public toggleActiveFolder(payload: DocumentTreeModel) {
        return {
            type: AdministrationDocumentActionNames.TOGGLE_ACTIVE_FOLDER,
            payload: payload,
        };
    }

    public deleteTreeFolder(payload: TreeNode) {
        return {
            type: AdministrationDocumentActionNames.DELETE_TREE_FOLDER,
            payload: payload,
        };
    }

    public setLisDocumentTypeAction() {
        return {
            type: AdministrationDocumentActionNames.SET_LIST_DOCUMENT_TYPE,
        };
    }

    public saveDocumentContainerOcrAction(
        payload: DocumentContainerOCRModel[],
        docContainerOcr: DocumentContainerOcrStateModel,
    ) {
        return {
            type: AdministrationDocumentActionNames.SAVE_DOCUMENT_OCR,
            payload,
            docContainerOcr,
        };
    }

    // event dispatched when there is no selected folder from capture-page
    public changeModeSelectableFolder(payload?: number) {
        return {
            type: AdministrationDocumentActionNames.CHANGE_MODE_SELECTABLE_FOLDER,
            payload,
        };
    }

    public clearPathFolderOnCapturedTree() {
        return {
            type: AdministrationDocumentActionNames.CLEAR_PATH_FOLDER_ON_CAPTURED_TREE,
        };
    }

    public onInitializeCaptureForm(documentFormName: DocumentFormNameEnum) {
        return {
            type: AdministrationDocumentActionNames.ON_INITIALIZE_CAPTURED_FORM,
            payload: documentFormName,
        };
    }

    public nextDocumentToClassify(payload?: boolean) {
        return {
            type: AdministrationDocumentActionNames.NEXT_DOCUMENT_TO_CLASSIFY,
            payload,
        };
    }

    public expandCapturedForm(isExpanded: boolean) {
        return {
            type: AdministrationDocumentActionNames.EXPAND_CAPTURED_FORM,
            payload: isExpanded,
        };
    }

    public setDocumentTodo(value: string) {
        return {
            type: AdministrationDocumentActionNames.SET_DOCUMENT_TODO,
            payload: value,
        };
    }

    public setDocumentIsTodo(value: boolean) {
        return {
            type: AdministrationDocumentActionNames.SET_DOCUMENT_IS_TODO,
            payload: value,
        };
    }

    public setDocumentKeyword(value: string) {
        return {
            type: AdministrationDocumentActionNames.SET_DOCUMENT_KEYWORD,
            payload: value,
        };
    }

    public setOriginalFileName(value: string) {
        return {
            type: AdministrationDocumentActionNames.SET_ORIGINAL_FILE_NAME,
            payload: value,
        };
    }

    public getAttachmentByContact(personId: string) {
        return {
            type: AdministrationDocumentActionNames.GET_ATTACHMENT_BY_CONTACT,
            payload: personId,
        };
    }

    public createNewFavouriteFolder(data: DocumentTreeModel) {
        return {
            type: AdministrationDocumentActionNames.CREATE_NEW_FAVOURITE_FOLDER,
            payload: data,
        };
    }

    public registerLinkConnectionContactFormColleague(payload: CapturedFormColleague) {
        return {
            type: AdministrationDocumentActionNames.REGISTER_LINK_CONNECTION_CONTACT_FORM_COLLEAGUE,
            payload,
        };
    }

    public globalSearchFilterByFolder(gsFilterData: GlobalSearchFilterModel) {
        return {
            type: AdministrationDocumentActionNames.GLOBAL_SEARCH_FILTER_BY_FOLDER,
            payload: gsFilterData,
        };
    }

    public globalSearchContactAction() {
        return {
            type: AdministrationDocumentActionNames.GLOBAL_SEARCH_CONTACT,
        };
    }

    public globalSearchCollaspe(isHide: boolean) {
        return {
            type: AdministrationDocumentActionNames.GLOBAL_SEARCH_COLLAPASE,
            payload: isHide,
        };
    }

    public globalSearchForceSetResultAction(data: Module) {
        return {
            type: AdministrationDocumentActionNames.GLOBAL_SEARCH_FORCE_SET_RESULT,
            payload: data,
        };
    }

    public addContactToMyFavourite(favouriteContactData: FavouriteContactModel) {
        return {
            type: AdministrationDocumentActionNames.ADD_CONTACT_TO_MY_FAVOURITE,
            payload: favouriteContactData,
        };
    }

    public getCapturedInvoiceDocumentDetail(idMainDocument: number) {
        return {
            type: AdministrationDocumentActionNames.GET_CAPTURED_INVOICE_DOCUMENT_DETAIL,
            payload: idMainDocument,
        };
    }

    public getCapturedContractDocumentDetail(idMainDocument: number) {
        return {
            type: AdministrationDocumentActionNames.GET_CAPTURED_CONTRACT_DOCUMENT_DETAIL,
            payload: idMainDocument,
        };
    }

    public getCapturedOtherDocumentDetail(idMainDocument: number) {
        return {
            type: AdministrationDocumentActionNames.GET_CAPTURED_OTHER_DOCUMENT_DETAIL,
            payload: idMainDocument,
        };
    }

    public getDocumentImageOcrForDocumentDetail(payload: {
        idDocumentContainerScans: number;
        idMainDocument?: number;
        indexName?: string;
        isCapturePage?: boolean;
        callback?: any;
        firstInit?: boolean;
    }) {
        return {
            type: AdministrationDocumentActionNames.GET_DOCUMENT_IMAGE_OCR_FOR_DOCUMENT_DETAIL,
            payload: payload,
        };
    }

    public notifyDocumentImageOcrInitDone() {
        return {
            type: AdministrationDocumentActionNames.NOTIFY_DOCUMENT_IMAGE_OCR_COMPONENT_INIT_DONE,
        };
    }

    public setHighlightAndSaveDocumentIntoFolder(idDocumentTree: number) {
        return {
            type: AdministrationDocumentActionNames.SET_HIGHLIGHT_AND_SAVE_DOCUMENT_INTO_FOLDER,
            payload: idDocumentTree,
        };
    }

    public setCapturedFormsMode(mode: CapturedFormModeEnum) {
        return {
            type: AdministrationDocumentActionNames.SET_CAPTURED_FORMS_MODE,
            payload: mode,
        };
    }

    public setDynamicFields(data: DynamicFieldsPayloadModel[]) {
        return {
            type: AdministrationDocumentActionNames.SET_DYNAMIC_FIELDS,
            payload: data,
        };
    }

    public clearDocumentContainerOcr(): any {
        return {
            type: AdministrationDocumentActionNames.CLEAR_DOCUMENT_CONTAINER_OCR,
        };
    }

    public clearFormState(): any {
        return {
            type: AdministrationDocumentActionNames.CLEAR_FORM_STATE,
        };
    }

    public setEmptyFormState(): any {
        return {
            type: AdministrationDocumentActionNames.SET_EMPTY_FORM_STATE,
        };
    }

    public clearSelectedFolderOfClassification(): any {
        return {
            type: AdministrationDocumentActionNames.CLEAR_SELECTED_FOLDER_OF_CLASSIFICATION,
        };
    }

    public setRefCommunicationSettingAction(payload: RefCommunicationModel[]) {
        return {
            type: AdministrationDocumentActionNames.SET_REF_COMMUNICATONS_SETTING,
            payload: payload,
        };
    }

    public getContactDetailAction(data: ContactDetailRequestModel) {
        return {
            type: AdministrationDocumentActionNames.GET_CONTACT_DETAIL,
            payload: data,
        };
    }

    public saveContactDetailAction(data: any) {
        return {
            type: AdministrationDocumentActionNames.SAVE_CONTACT_DETAIL,
            payload: data,
        };
    }

    public getHistoryDocumentAction() {
        return {
            type: AdministrationDocumentActionNames.GET_HISTORY_DOCUMENT,
        };
    }

    public selectCaptureDocumentOnGlobalSearch(idDocumentContainerScans: number) {
        return {
            type: AdministrationDocumentActionNames.SELECT_CAPTURE_DOCUMENT_ON_GLOBAL_SEARCH,
            payload: { idDocumentContainerScans },
        };
    }

    public setDocFileInfoToCaptureAction(docFileInfo: DocumentFileInfoModel) {
        return {
            type: AdministrationDocumentActionNames.SET_DOCUMENT_FILE_INFO_TO_CAPTURE,
            payload: docFileInfo,
        };
    }

    public getDocumentsThumbnailDone() {
        return {
            type: AdministrationDocumentActionNames.GET_DOCUMENTS_THUMBNAIL_DONE,
        };
    }

    public fillUpdatedDataAfterFolder(payload: { data: any[] }) {
        return {
            type: AdministrationDocumentActionNames.FILL_UPDATED_DATA_AFTER_CHANGING_FOLDER,
            payload,
        };
    }

    public enableButtonSaveWidgetDmsAction(payload: { isEnabled: boolean }) {
        return {
            type: AdministrationDocumentActionNames.ENABLE_BUTTON_SAVE_WIDGET_DMS_ACTION,
            payload,
        };
    }

    public enableButtonToggledCapturedForm(payload: { isEnabled: boolean }) {
        return {
            type: AdministrationDocumentActionNames.ENABLE_BUTTON_TOGGLED_CAPTURED_FORM,
            payload,
        };
    }

    public showDialogAddNewNoteAction() {
        return {
            type: AdministrationDocumentActionNames.SHOW_DIALOG_ADD_NEW_NOTE,
        };
    }

    public didManipulateCapturedFile(isEnabled: boolean) {
        return {
            type: AdministrationDocumentActionNames.MANIPULATED_CAPTURE_FILE,
            payload: isEnabled,
        };
    }

    public resetDocumentAction(tabId: string) {
        return {
            type: AdministrationDocumentActionNames.RESET_DOCUMENT,
            payload: tabId,
        };
    }

    public clearDocumentAction(tabId: string) {
        return {
            type: AdministrationDocumentActionNames.CLEAR_DOCUMENT,
            payload: tabId,
        };
    }

    public deleteImageScanDocumentOnThumbnail(idDocumentContainerScans: string) {
        return {
            type: AdministrationDocumentActionNames.DELETE_IMAGE_SCAN_DOCUMENT_ON_THUMBNAIL,
            payload: idDocumentContainerScans,
        };
    }

    public registerOcrDataVisitor(ocrDataVisitor: OcrDataVisitor): any {
        return {
            type: AdministrationDocumentActionNames.REGISTER_OCR_DATA_VISITOR,
            payload: ocrDataVisitor,
        };
    }

    public registerTabFormElement(element: IElement): any {
        return {
            type: AdministrationDocumentActionNames.REGISTER_TAB_FORM_ELEMENT,
            payload: element,
        };
    }

    public checkAndGetCompanyNameList(payload: { companyName: string }) {
        return {
            type: AdministrationDocumentActionNames.CHECK_AND_GET_COMPANY_NAME_LIST,
            payload: payload,
        };
    }

    public saveXnDocumentTreeOptions(payload: XnDocumentTreeOptions) {
        return {
            type: AdministrationDocumentActionNames.SET_XN_DOCUMENT_TREE_OPTIONS,
            payload,
        };
    }

    public clearDocumentTree() {
        return {
            type: AdministrationDocumentActionNames.CLEAR_DOCUMENT_TREE,
        };
    }

    public widgetMyDMFormInitSuccessAction(isSuccess: boolean) {
        return {
            type: AdministrationDocumentActionNames.WIDGET_MYDM_FORM_INIT_SUCCESS,
            isSuccess,
        };
    }

    public getDocumentByIdScan(payload: any) {
        return {
            type: AdministrationDocumentActionNames.GET_DOCUMENT_BY_ID_SCAN,
            payload,
        };
    }

    public setSelectedDocument(payload: AttachDocument | null) {
        return {
            type: AdministrationDocumentActionNames.GET_SELECTED_DOCUMENT,
            payload,
        };
    }

    public dispatchInvoiceApprovalIdMain(payload: any) {
        return {
            type: AdministrationDocumentActionNames.DISPATCH_ID_MAIN_INVOICE_APPROVAL,
            payload,
        };
    }

    public setIsTodoInvoiceApprovalAction(payload: boolean) {
        return {
            type: AdministrationDocumentActionNames.SET_IS_TODO_INVOICE_APPROVAL,
            payload,
        };
    }

    public changeDocumentToOtherTreeAction(payload: any) {
        return {
            type: AdministrationDocumentActionNames.CHANGE_DOCUMENT_TO_OTHER_TREE,
            payload,
        };
    }
    public changeDocumentToOtherTreeSuccessAction(payload: any) {
        return {
            type: AdministrationDocumentActionNames.CHANGE_DOCUMENT_TO_OTHER_TREE_SUCCESS,
            payload,
        };
    }

    public setAllAddons(payload: any) {
        return {
            type: AdministrationDocumentActionNames.SET_ALL_ADD_ONS,
            payload,
        };
    }

    public changeInvoiceDate(payload: any) {
        return {
            type: AdministrationDocumentActionNames.CHANGE_INVOICE_DATE,
            payload,
        };
    }

    public saveDocumentFormSuccessAction() {
        return {
            type: AdministrationDocumentActionNames.SAVE_DOCUMENT_FORM_SUCCESS,
        };
    }

    public saveDocumentFormFailAction() {
        return {
            type: AdministrationDocumentActionNames.SAVE_DOCUMENT_FORM_FAIL,
        };
    }

    public closePopupExtractionData(payload: any) {
        return {
            type: AdministrationDocumentActionNames.CLOSE_EXTRACTION_DATA,
            payload,
        };
    }

    public showDocumentViewer(payload: any) {
        return {
            type: AdministrationDocumentActionNames.CLOSE_EXTRACTION_DATA,
            payload,
        };
    }

    public selectEmailItemAction(payload: any) {
        return {
            type: AdministrationDocumentActionNames.SELECT_EMAIL_ITEM,
            payload,
        };
    }
}

export class AdministrationDocumentSuccessAction implements Action {
    public type = AdministrationDocumentActionNames.ADMINISTRATION_DOCUMENT_SUCCESS_ACTION;

    constructor(public subType: string, public payload?: any) {}
}

export class AdministrationDocumentFailedAction implements Action {
    public type = AdministrationDocumentActionNames.ADMINISTRATION_DOCUMENT_FAILED_ACTION;

    constructor(public subType: string, public payload?: any) {}
}
