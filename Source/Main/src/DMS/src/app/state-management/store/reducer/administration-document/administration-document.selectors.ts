import { Injectable } from '@angular/core';
import { BaseSelector } from '../base-selector.selector';
import { Actions } from '@ngrx/effects';
import { AdministrationDocumentActionNames } from '@app/state-management/store/actions/administration-document';
import { AdministrationDocumentState } from '@app/state-management/store/reducer/administration-document';
import { createSelector, createFeatureSelector, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FieldFormOnFocusModel } from '../../models/administration-document/field-form-on-focus.model.payload';
import { DocumentsState } from '../../models/administration-document/state/document-forms.state.model';
import { DocumentContainerOcrStateModel } from '../../models/administration-document/state/document-container-ocr.state.model';
import { DocumentContainerScanStateModel } from '../../models/administration-document/state/document-container-scan.state.model';
import { DocumentTreeModel } from '@app/models/administration-document/document-tree.payload.model';
import { QueueWorker } from '@app/utilities/queue-worker';
import { ExtractedDataOcrState } from '../../models/administration-document/state/extracted-data-ocr.state.model';
import { RefCommunicationModel } from '@app/models/contact-document.model';
import { CapturedFormModeEnum } from '@app/models/administration-document/document-form/captured-form-mode.enum';
import { ComboboxRepositoryStateModel } from '../../models/administration-document/state/combobox-repository.state.model';
import { DocumentFileInfoModel } from '../../models/administration-document/state/document-file-info.state.model';
import { DetailedDocumentDataState } from '../../models/administration-document/state/detailed-document-data.state.model';
import { HeadquarterInfoModel } from '../../../../models/octopus-document.model';

export const administrationDocumentState = createFeatureSelector<AdministrationDocumentState>(
    // is a property name of reducers.administrationDocumentState
    'administrationDocumentState',
);

const getModulesOverview = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.modulesOverview,
);

const getFieldFormOnFocus = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.fieldFormOnFocus,
);

const getDocumentFields = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.documentFields,
);

const getDocumentContainerScan = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.documentContainerScan,
);

const getDocumentContainerOcr = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.documentContainerOcr,
);

const getTotalImage = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.totalImage,
);

// const getQueueDocumentsStateChange = createSelector(
//     administrationDocumentState,
//     (state: AdministrationDocumentState) => state.queueDocumentsStateChange,
// );

const getDocumentFormsStateModel = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.documentsState,
    // getQueueDocumentsStateChange,
    // (queue: QueueWorker<DocumentsState>) => {
    //     if (!queue) return null;

    //     if (queue.isEmpty()) {
    //         // console.log(`administration-document.selectors: queue is null`);
    //         return null;
    //     }

    //     const item = queue.dequeue();
    //     // console.log(`administration-document.selectors: DEQUEUE`, item);

    //     return item;
    // }
);

const setCommunicationTypeDefaultControl = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.communicationDefaultControl,
);

const getFolder = createSelector(administrationDocumentState, (state: AdministrationDocumentState) => state.folder);

const setListDocumentType = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.listDocumentType,
);

const getExtractedDataFromOcr = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.extractedDataFromOcr,
);

const getKeyword = createSelector(administrationDocumentState, (state: AdministrationDocumentState) => state.keyword);

const getToDo = createSelector(administrationDocumentState, (state: AdministrationDocumentState) => state.toDo);

const getIsTodo = createSelector(administrationDocumentState, (state: AdministrationDocumentState) => state.isTodo);

const getAllAddons = createSelector(administrationDocumentState, (state: AdministrationDocumentState) => state.allAddons);

const getInvoiceDateProcessing = createSelector(administrationDocumentState, (state: AdministrationDocumentState) => state.invoiceDateProcessing);

const getOriginalFileName = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.originalFileName,
);

const setRefCommunicationsSetting = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.refCommunicationsSettingList,
);

const getCapturedFormMode = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.capturedFormMode,
);

const getComboboxCurrency = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.comboboxCurrency,
);

const getComboboxMeansOfPayment = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.comboboxMeansOfPayment,
);

const getComboboxCommunicationTypeType = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.comboboxCommunicationTypeType,
);

const getDocumentFileInfo = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.docFileInfo,
);

const getDidManipulateCaptureFile = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.didManipulateCaptureFile,
);

const getDetailedDocumentDataState = createSelector(
    administrationDocumentState,
    (state: AdministrationDocumentState) => state.detailedDocumentData,
);

const getDocTypes = createSelector(administrationDocumentState, (state: AdministrationDocumentState) => state.docTypes);

const getHeadquarterInfo = createSelector(administrationDocumentState, (state: AdministrationDocumentState) => state.headquarterInfo);

@Injectable()
export class AdministrationDocumentSelectors extends BaseSelector {
    public modulesOverview$: Observable<any>;
    public fieldFormOnFocus$: Observable<FieldFormOnFocusModel>;
    public documentFields$: Observable<any[]>;
    public documentContainerScan$: Observable<DocumentContainerScanStateModel>;
    public documentContainerOcr$: Observable<DocumentContainerOcrStateModel>;
    public totalImage$: Observable<number>;
    public documentsState$: Observable<DocumentsState>;
    public communicationDefaultControl$: Observable<any[]>;
    public folder$: Observable<DocumentTreeModel>;
    // private queueFieldsValueChange$: Observable<QueueWorker<DocumentsState>>;
    public listDocumentType$: Observable<any[]>;
    public extractedDataFromOcr$: Observable<ExtractedDataOcrState[]>;
    public refCommunicationsSettingList$: Observable<RefCommunicationModel[]>;
    public comboboxCurrency$: Observable<ComboboxRepositoryStateModel[]>;
    public comboboxMeansOfPayment$: Observable<ComboboxRepositoryStateModel[]>;
    public comboboxCommunicationTypeType$: Observable<ComboboxRepositoryStateModel[]>;
    public keyword$: Observable<string>;
    public toDo$: Observable<string>;
    public originalFileName$: Observable<string>;
    public capturedFormMode$: Observable<CapturedFormModeEnum>;
    public docFileInfo$: Observable<DocumentFileInfoModel>;
    public didManipulateCaptureFile$: Observable<boolean>;
    public detailedDocumentDataState$: Observable<DetailedDocumentDataState[]>;
    public isToDo$: Observable<boolean>;
    public docTypes$: Observable<DocumentTreeModel[]>;
    public headquarterInfo$: Observable<HeadquarterInfoModel>;
    public allAddons$: Observable<{}>;
    public invoiceDateProcessing$: Observable<Date>;

    constructor(private store: Store<any>, protected actions$: Actions) {
        super(
            actions$,
            AdministrationDocumentActionNames.ADMINISTRATION_DOCUMENT_SUCCESS_ACTION,
            AdministrationDocumentActionNames.ADMINISTRATION_DOCUMENT_FAILED_ACTION,
        );
        this.modulesOverview$ = this.store.select(getModulesOverview);
        this.fieldFormOnFocus$ = this.store.select(getFieldFormOnFocus);
        this.documentFields$ = this.store.select(getDocumentFields);
        this.documentContainerScan$ = this.store.select(getDocumentContainerScan);
        this.documentContainerOcr$ = this.store.select(getDocumentContainerOcr);
        this.totalImage$ = this.store.select(getTotalImage);
        this.documentsState$ = this.store.select(getDocumentFormsStateModel);
        this.communicationDefaultControl$ = this.store.select(setCommunicationTypeDefaultControl);
        this.folder$ = this.store.select(getFolder);

        // this.queueFieldsValueChange$ = this.store.select(getQueueDocumentsStateChange);
        this.listDocumentType$ = this.store.select(setListDocumentType);
        this.extractedDataFromOcr$ = this.store.select(getExtractedDataFromOcr);
        this.keyword$ = this.store.select(getKeyword);
        this.toDo$ = this.store.select(getToDo);
        this.isToDo$ = this.store.select(getIsTodo);
        this.originalFileName$ = this.store.select(getOriginalFileName);
        this.refCommunicationsSettingList$ = this.store.select(setRefCommunicationsSetting);
        this.capturedFormMode$ = this.store.select(getCapturedFormMode);
        this.comboboxCurrency$ = this.store.select(getComboboxCurrency);
        this.comboboxMeansOfPayment$ = this.store.select(getComboboxMeansOfPayment);
        this.comboboxCommunicationTypeType$ = this.store.select(getComboboxCommunicationTypeType);
        this.docFileInfo$ = this.store.select(getDocumentFileInfo);
        this.didManipulateCaptureFile$ = this.store.select(getDidManipulateCaptureFile);
        this.detailedDocumentDataState$ = this.store.select(getDetailedDocumentDataState);
        this.docTypes$ = this.store.select(getDocTypes);
        this.headquarterInfo$ = this.store.select(getHeadquarterInfo);
        this.allAddons$ = this.store.select(getAllAddons);
        this.invoiceDateProcessing$ = this.store.select(getInvoiceDateProcessing);
    }
}
