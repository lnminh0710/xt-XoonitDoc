import { MasterExtractedData } from '@app/models/approval/master-extracted.model';

export interface InvoiceApprovalProcessingState {
    invoiceInfoAndPaymentOverviewExtracteMasterdData: MasterExtractedData;
    supplierExtractedMasterData: MasterExtractedData;
    mandantOverviewExtractedMasterData: MasterExtractedData;
}
