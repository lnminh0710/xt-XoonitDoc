using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class OrderDataEntryByLoginData : Data
    {
        /// <summary>
        /// DateFrom
        /// </summary>
        public string DateFrom { get; set; }

        /// <summary>
        /// DateTo
        /// </summary>
        public string DateTo { get; set; }

    }

    public class OrderDataEntryData : Data
    {
        /// <summary>
        /// MediaCode
        /// </summary>
        public string MediaCode { get; set; }

        /// <summary>
        /// CampaignNr
        /// </summary>
        public string CampaignNr { get; set; }

        /// <summary>
        /// CustomerNr
        /// </summary>
        public string CustomerNr { get; set; }

        /// <summary>
        /// SkipIdScansContainerItemsPreload
        /// </summary>
        public string SkipIdScansContainerItemsPreload { get; set; }

        /// <summary>
        /// IdScansContainerItems
        /// </summary>
        public string IdScansContainerItems { get; set; }

        /// <summary>
        /// IdScansContainer 
        /// </summary>
        public string IdScansContainer { get; set; }
    }

    public class LotData : Data
    {
        /// <summary>
        /// IdScansContainer
        /// </summary>
        public string IdScansContainer { get; set; }

        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get; set; }

        /// <summary>
        /// QuantityEstimated
        /// </summary>
        public string QuantityEstimated { get; set; }

        /// <summary>
        /// QuantityProcessed
        /// </summary>
        public string QuantityProcessed { get; set; }

        /// <summary>
        /// LotName
        /// </summary>
        public string LotName { get; set; }

        /// <summary>
        /// SourceContainerGUID
        /// </summary>
        public string SourceContainerGUID { get; set; }

        /// <summary>
        /// ClientOpenDateUTC
        /// </summary>
        public string ClientOpenDateUTC { get; set; }

        /// <summary>
        /// ClientCloseDateUTC
        /// </summary>
        public string ClientCloseDateUTC { get; set; }

        /// <summary>
        /// AbortDateUTC
        /// </summary>
        public string AbortDateUTC { get; set; }

        /// <summary>
        /// ContainerColor
        /// </summary>
        public string ContainerColor { get; set; }

        /// <summary>
        /// LotReportFilename
        /// </summary>
        public string LotReportFilename { get; set; }

        /// <summary>
        /// DoneDate
        /// </summary>
        public string DoneDate { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// IsOnlyGamer
        /// </summary>
        public string IsOnlyGamer { get; set; }
    }

    public class ScanningLotItemData : Data
    {
        public string BranchNr { get; set; }

        public string IdBranches { get; set; }
        /// <summary>
        /// IdScansContainer
        /// </summary>
        public string IdScansContainer { get; set; }

        /// <summary>
        /// IdScansContainerItems
        /// </summary>
        public string IdScansContainerItems { get; set; }

        /// <summary>
        /// IdRepScansContainerType
        /// </summary>
        public string IdRepScansContainerType { get; set; }

        /// <summary>
        /// IdCountrylanguage
        /// </summary>
        public string IdCountrylanguage { get; set; }

        /// <summary>
        /// IdRepPaymentsMethods
        /// </summary>
        public string IdRepPaymentsMethods { get; set; }

        /// <summary>
        /// ScannerTwainDllVersion
        /// </summary>
        public string ScannerTwainDllVersion { get; set; }

        /// <summary>
        /// ScannerDevice
        /// </summary>
        public string ScannerDevice { get; set; }

        /// <summary>
        /// CustomerNr
        /// </summary>
        public string CustomerNr { get; set; }

        /// <summary>
        /// MediaCode
        /// </summary>
        public string MediaCode { get; set; }

        /// <summary>
        /// ScannedPath
        /// </summary>
        public string ScannedPath { get; set; }

        /// <summary>
        /// ScannedFilename
        /// </summary>
        public string ScannedFilename { get; set; }

        /// <summary>
        /// ScannedDateUTC
        /// </summary>
        public string ScannedDateUTC { get; set; }

        /// <summary>
        /// ReceivingDate
        /// </summary>
        public string ReceivingDate { get; set; }

        /// <summary>
        /// CoordinateX
        /// </summary>
        public string CoordinateX { get; set; }

        /// <summary>
        /// CoordinateY
        /// </summary>
        public string CoordinateY { get; set; }

        /// <summary>
        /// CoordinatePageNr
        /// </summary>
        public string CoordinatePageNr { get; set; }

        /// <summary>
        /// NumberOfImages
        /// </summary>
        public string NumberOfImages { get; set; }

        /// <summary>
        /// NumberOfImagesCheques
        /// </summary>
        public string NumberOfImagesCheques { get; set; }

        /// <summary>
        /// SourceScanGUID
        /// </summary>
        public string SourceScanGUID { get; set; }

        /// <summary>
        /// ProcessGUID
        /// </summary>
        public string ProcessGUID { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// IsWhiteMail
        /// </summary>
        public string IsWhiteMail { get; set; }

        /// <summary>
        /// IsCheque
        /// </summary>
        public string IsCheque { get; set; }

        /// <summary>
        /// IsDeletedByAdmin
        /// </summary>
        public string IsDeletedByAdmin { get; set; }

        /// <summary>
        /// IsCustomerNrEnteredManually
        /// </summary>
        public string IsCustomerNrEnteredManually { get; set; }

        /// <summary>
        /// IsMediaCodeEnteredManually
        /// </summary>
        public string IsMediaCodeEnteredManually { get; set; }

        /// <summary>
        /// IsOnlyGamer
        /// </summary>
        public string IsOnlyGamer { get; set; }
        /// <summary>
        /// IdRepScansDocumentType
        /// </summary>
        public string IdRepScansDocumentType { get; set; }
        public string IdDocumentTree { get; set; }


        public string IdRepScanDeviceType { get; set; }

        public string IsSendToCapture { get; set; }

        public string JsonQRCode { get; set; }
        public string GroupUuid { get; set; }

        public string IdRepDocumentGuiType { get; set; }
        public string FilePath { get; set; }
        public string FileName { get; set; }

        public string Size { get; set; }
        public string OriginalCreateDate { get; set; }
        public string OriginalUpdateDate { get; set; }

        public string JSONDocumentContainerEmail { get; set; }
        public string JSONEmailAttachments { get; set; }
    }

    public class CustomerOrderDataEntryData : Data
    {
        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get; set; }

        /// <summary>
        /// CustomerNr
        /// </summary>
        public string CustomerNr { get; set; }

        /// <summary>
        /// JSONCustomerData
        /// </summary>
        public string JSONCustomerData { get; set; }

        /// <summary>
        /// JSONCustomerComm
        /// </summary>
        public string JSONCustomerComm { get; set; }

        /// <summary>
        /// JSONOrderData
        /// </summary>
        public string JSONOrderData { get; set; }

        /// <summary>
        /// JSONOrderArticles
        /// </summary>
        public string JSONOrderArticles { get; set; }

        /// <summary>
        /// JSONOrderPayments
        /// </summary>
        public string JSONOrderPayments { get; set; }
    }

    public class ToolScanManagerData : Data
    {
        /// <summary>
        /// _IdScanCenter
        /// </summary>
        public int? _IdScanCenter { get; set; }

        /// <summary>
        /// IdPerson
        /// </summary>
        public int? IdPerson { get; set; }

        /// <summary>
        /// IdScansContainerDispatchers
        /// </summary>        
        public int? IdScansContainerDispatchers { get; set; }

        /// <summary>
        /// IdScansContainer
        /// </summary> 
        public int? IdScansContainer { get; set; }

        /// <summary>
        /// JSONSaveScanDispatcherPool
        /// </summary>
        public string JSONSaveScanDispatcherPool { get; set; }

        /// <summary>
        /// JSONSaveScanDispatcherUndispatch
        /// </summary>
        public string JSONSaveScanDispatcherUndispatch { get; set; }

        /// <summary>
        /// JSONSSaveAssignPool
        /// </summary>
        public string JSONSSaveAssignPool { get; set; }

        /// <summary>
        /// JSONSSaveAssignUser
        /// </summary>
        public string JSONSSaveAssignUser { get; set; }

        /// <summary>
        /// JSONSavePoolAndUserUnAssign
        /// </summary>
        public string JSONSavePoolAndUserUnAssign { get; set; }
    }

    public class MatchingData : Data
    {
        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public string IdRepIsoCountryCode { get; set; }
    }

    public class MatchingConfigurationData : Data
    {

    }

    public class MatchingConfigurationSavingData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }
    }

    public class SendOrderToAdministratorData : Data
    {
        public int IdLoginToAdmin { get; set; }
        public int IdScansContainerItems { get; set; }
        public int IdRepNotificationType { get; set; }
        public string Notes { get; set; }
    }

    public class ScanningItemData : Data
    {
        /// <summary>
        /// IdScansContainerItems
        /// </summary>
        public string IdScansContainerItems { get; set; }


        /// <summary>
        /// IdCountrylanguage
        /// </summary>
        public string IdCountrylanguage { get; set; }

        /// <summary>
        /// IdRepPaymentsMethods
        /// </summary>
        public string IdRepPaymentsMethods { get; set; }

        /// <summary>
        /// ScannerTwainDllVersion
        /// </summary>
        public string ScannerTwainDllVersion { get; set; }

        /// <summary>
        /// ScannerDevice
        /// </summary>
        public string ScannerDevice { get; set; }

        /// <summary>
        /// CustomerNr
        /// </summary>
        public string CustomerNr { get; set; }

        /// <summary>
        /// MediaCode
        /// </summary>
        public string MediaCode { get; set; }

        /// <summary>
        /// ScannedPath
        /// </summary>
        public string ScannedPath { get; set; }

        /// <summary>
        /// ScannedFilename
        /// </summary>
        public string ScannedFilename { get; set; }

        /// <summary>
        /// ScannedDateUTC
        /// </summary>
        public string ScannedDateUTC { get; set; }

        /// <summary>
        /// ReceivingDate
        /// </summary>
        public string ReceivingDate { get; set; }

        /// <summary>
        /// CoordinateX
        /// </summary>
        public string CoordinateX { get; set; }

        /// <summary>
        /// CoordinateY
        /// </summary>
        public string CoordinateY { get; set; }

        /// <summary>
        /// CoordinatePageNr
        /// </summary>
        public string CoordinatePageNr { get; set; }

        /// <summary>
        /// NumberOfImages
        /// </summary>
        public string NumberOfImages { get; set; }

        /// <summary>
        /// NumberOfImagesCheques
        /// </summary>
        public string NumberOfImagesCheques { get; set; }

        /// <summary>
        /// SourceScanGUID
        /// </summary>
        public string SourceScanGUID { get; set; }

        /// <summary>
        /// ProcessGUID
        /// </summary>
        public string ProcessGUID { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }

        /// <summary>
        /// IsWhiteMail
        /// </summary>
        public string IsWhiteMail { get; set; }

        /// <summary>
        /// IsCheque
        /// </summary>
        public string IsCheque { get; set; }

        /// <summary>
        /// IsDeletedByAdmin
        /// </summary>
        public string IsDeletedByAdmin { get; set; }

        /// <summary>
        /// IsCustomerNrEnteredManually
        /// </summary>
        public string IsCustomerNrEnteredManually { get; set; }

        /// <summary>
        /// IsMediaCodeEnteredManually
        /// </summary>
        public string IsMediaCodeEnteredManually { get; set; }

        /// <summary>
        /// IsOnlyGamer
        /// </summary>
        public string IsOnlyGamer { get; set; }
        /// <summary>
        /// IdRepScansDocumentType
        /// </summary>
        public string IdRepScansDocumentType { get; set; }
        public string IdDocumentTree { get; set; }
    }
}
