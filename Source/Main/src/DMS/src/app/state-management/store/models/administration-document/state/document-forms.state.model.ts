import { DocumentFormType } from '@app/models/administration-document/document-form/document-form-type.model';
import { DocumentProcessingTypeEnum, DocumentFormNameEnum } from '@app/app.constants';
import { FormGroup } from '@angular/forms';
import { ExtractedDataFormModel } from '@app/models/administration-document/document-form/extracted-data-form.model';

export class DocumentsState {
    public documentOnUpdate: {
        documentType: DocumentProcessingTypeEnum,
        originalColumnName: string,
        formName: string,
        isOnInit: boolean;
        isScannedByOCR: boolean
    };

    // documentProcessingType is string value of DocumentProcessingTypeEnum enum
    public documentsForm: {
        [documentProcessingType: string]: DocumentForm
    };

    constructor() {
        this.documentsForm = {};
        this.documentOnUpdate = { formName: '', documentType: null, isScannedByOCR: false, isOnInit: true, originalColumnName: '' };
    }
}

export class DocumentForm {
    public documentFormType: DocumentFormType;

    // formName is string value of DocumentFormNameEnum enum
    public formsState: {
        [ formName: string ]: FormState
    };

    constructor() {
        this.documentFormType = null;
        this.formsState = null;
    }
}

export class FormState {
    form: FormGroup;
    data: ExtractedDataFormModel[];
    documentFormName: DocumentFormNameEnum;
    onInit: boolean;
    /*
        * prepare data format
    */
    formatDataBeforeSaving: () => any;
    validateData: () => boolean;

    constructor() {
        this.form = null,
        this.data = null;
        this.documentFormName = null;
        this.formatDataBeforeSaving = null;
    }
}
