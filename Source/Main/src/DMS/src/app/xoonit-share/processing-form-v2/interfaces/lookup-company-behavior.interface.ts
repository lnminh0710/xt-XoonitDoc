import { SharingContactInformationModel } from '@app/models/administration-document/document-form/sharing-contact-information.model';
import { IAutocompleteMaterialControlConfig } from '@xn-control/xn-dynamic-material-control/interfaces/material-control-config.interface';

export interface ILookupCompanyBehaviorV2 {
    isFillingData: boolean;
    sharingContact: SharingContactInformationModel;
    showAutocompleteOptionsOnShowForm: boolean;
    isShowAutocompleteWhenDblClickOCR: boolean;
    sharingQCCodeContact: SharingContactInformationModel;
    isShowAutocompleteWhenApplyQRCode: boolean;
    companyAutoCompleteConfig: IAutocompleteMaterialControlConfig;
}
