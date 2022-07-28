using System.ComponentModel;

namespace DMS.Constants
{
    public static class ConstAuth
    {
        public static string AppSettings_OAuthSecretKey = "AppSettings:OAuthSecretKey";
        public static string TokenType = "Bearer";
        public static string UserRoleKey = "UserRole";
        public static string RoleKey = "Role";
        public static string RoleAdminKey = "Admin";
        public static string AppInfoKey = "appinfo";
        public static string NewSecretKey = "new_secret_key";
        public static string IsResetPassword = "isResetPassword";
        public static string IsRefreshToken = "isRefreshToken";

        public static string LogTimeXenaAPI = "X-ElapsedTime-XenaAPI";
        public static string LogTimeUniqueService = "X-ElapsedTime-UniqueService";

        public static string PASSWORD_DEFAULT = "Bx!%eA6G*+qXHChf";
        public static string WEBSITE = "XoonDoc";
    }

    public static class ConstNameSpace
    {
        public static string ModelProperty = "DMS.Models.Property";
        public static string ModelNameSpace = "DMS.Models";
        public static string ModelPropertyValue = "value";
        public static string ModelPropertyDisplayValue = "displayValue";
        public static string ModelPropertyOriginalColumnName = "originalComlumnName";
        public static string ModelPropertySetting = "setting";
        public static string TabSummaryInfor = "TabSummaryInfor";
        public static string TabSummaryData = "TabSummaryData";
        public static string TabSummaryRawData = "TabSummaryRawData";
        public static string ComboBox = "ComboBox";
        public static string ColumnName = "ColumnName";
        public static string DataType = "DataType";
        public static string Setting = "Setting";
        public static string ColumnSettings = "ColumnSettings";
        public static string DataLength = "DataLength";
        public static string OriginalColumnName = "OriginalColumnName";
        public static string CollectionData = "CollectionData";
        public static string WidgetTitle = "WidgetTitle";
        public static string Data = "Data";
        public static string IdValue = "idValue";
        public static string TextValue = "textValue";
        public static string IsoCode = "isoCode";
        public static string IsMain = "isMain";
        public static string IsActive = "isActive";
        public static string IdSalesCampaignWizardItems = "idSalesCampaignWizardItems";
        public static string IdBusinessCostsItems = "idBusinessCostsItems";
        public static string IdBusinessCostsItemsCountries = "idBusinessCostsItemsCountries";
        public static string DynamicColumn = "DynamicColumn";
    }

    public static class ConstWidgetReplaceToken
    {
        public static string LoginInfoToken = "<<LoginInformation>>";
        public static string FilterToken = "<<InputParameter>>";
        public static string ModeToken = "<<Mode>>";
    }

    public enum EAuthMessageType
    {
        ExpiredSoon = 1, // just warning
        Expired,// not allow
        Denied// not allow
    }

    public enum EComboBoxType
    {
        Language = 1,
        Title = 2,
        CountryCode = 3,
        CustomerStatus = 4,
        POBox = 5,
        ContactType = 6,
        TitleOfCourtesy = 7,
        CommunicationTypeType = 8,
        CreditCardType = 9,
        CashProviderType = 10,
        Principal = 11,
        Mandant = 12,
        Currency = 13,
        ProviderCostType = 14,
        PaymentType = 15,
        IdentifierCode = 16,
        ArticleStatus = 17,
        AllMandant = 18,
        ServiceProvider = 19,
        WareHouse = 20,
        CampaignWizardAddress = 21,
        CampaignGroup = 22,
        CampaignNamePrefix = 23,
        CurrencyByCountry = 24,
        CurrencyByWizardItems = 25,
        InvoicePaymentType = 26,
        DataEntryLots = 27,
        VAT = 28,
        WidgetType = 29,
        ModuleItems = 30,
        PersonType = 31,
        MeansOfPayment = 32,
    }

    public enum EIdRepWidgetType
    {
        DataSet = 1,
        DataGrid = 2,
        EditableDataGrid = 3,
        EditableTable = 4,
        Combination = 5,
        CombinationType2 = 6,
        GroupTable = 8,
        TreeCategoriesTable = 11,
        FileExplorer = 12,
        TableWithFilter = 20,
        ToolsFileTemplate = 29
    }

    public enum EExecuteMappingType
    {
        None,
        Normal,

        /// <summary>
        /// [[{\"ColumnName\":\"PersonNr,LastName,FirstName,COName,...\"}],[],[{\"PersonNr\":\"3010099103\",\"Last-Name\":\"Schneiter\",...},{...}]]
        /// </summary>
        Dynamic,

        DynamicType2,

        /// <summary>
        /// [[{\"WidgetTitle\":\"New Title....\"}],[{\"ColumnName\":\"IdPerson\",\"Value\":\"\",\"DataType\":\"bigint\",\"DataLength\":\"0\",\"OriginalColumnName\":\"B00Person_IdPerson\", \"Setting\":\"\"},...}]]
        /// </summary>
        DynamicType3,

        /// <summary>
        /// { "Data": "[[{\"SettingColumnName\":\"[{\\\"WidgetTitle\\\":\\\"Begin new World...\\\"},{\\\"ColumnsName\\\": [\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t   {\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\\"ColumnName\\\":........
        /// </summary>
        DynamicType4,

        /// <summary>
        /// combineation of Dataset and table
        /// </summary>
        DynamicType5,

        /// <summary>
        /// DynamicCoulumnsType
        /// </summary>
        DynamicCoulumnsType,

        TabSummary,
        ComboBox,
        Country,
        Country2,
        CreatePerson,
        OnlyReplaceAllEmtyObjectJson,
        DataFormDetail // WidgetDetail
    }

    public enum EGetPageSettingType
    {
        ById = 1,
        ObjectNr = 2
    }

    public enum ERepProcessingType
    {
        Offer = 1,
        Order = 2,
        Invoice = 3,
        Delivery = 4,
        Depts = 5,
        AllDocuments = 6 // Offer, Order, Invoice in a file
    }

    public enum OrderProcessingRequestSavingMode
    {
        None = 0,
        OPStoreTemporarily = 4,
        OPSaveAndRunAsPrint = 5,
        OPSaveAndRunAsEmail = 6
    }

    public static class CloudType
    {
        public static string All = "all";
        public static string OneDrive = "onedrive";
        public static string GoogleDrive = "googledrive";
        public static string Dropbox = "dropbox";
        public static string MyCloud = "mycloud";
        public static string Sftp = "sftp";
        public static string Ftp = "ftp";
        public static string FileServer = "fileserver";
        public static string Remote = "remote connection";
    }
    public static class OneDriveType
    {
        public static string Business = "business";
        public static string Personal = "personal";
       
    }
    public static class CloudDocChangeAction
    {
        public static string Move = "move";
        public static string Rename = "rename";
        public static string Delete = "delete";

    }

    public enum RepPersonTypeEnum
    {
        ContractingParty = 1,
        Contractor = 2,
        BankContact = 3,
        Postoffice = 4,
        BeneficiaryContact = 5,
        RemitterContact = 6,
        Contact = 7,
        Privat = 8
    }

    public static class RepScanDeviceType
    {
        public const string SCAN = "By Scan";
        public const string MOBILE = "By Smart Phone";
        public const string UPLOAD = "by Upload";
        public const string EMAIL = "By Email";

        public static string ConvertDisplayDevice(string device)
        {
            string result = "";
            switch (device)
            {
                case MOBILE:
                    result = "Mobile";
                    break;
                case EMAIL:
                    result = "Email";
                    break;
                default:
                    result = "Website";
                    break;
            }
            return result;
        }
    }

    public static class SyncStatus
    {
        public const string DONE = "Sync Ok";
        public const string ERROR = "Sync in Error";
        public const string LOADING = "Sync in progres..";

        public static string ConvertDisplayStatus(string status)
        {
            string result = "";
            switch (status)
            {
                case DONE:
                    result = "Done";
                    break;
                case LOADING:
                    result = "Loading";
                    break;
                default:
                    result = "Error";
                    break;
            }
            return result;
        }
    }

    public enum CloudProvidersEnum
    {
        MyCloud = 1,
        GoogleDrive = 2,
        OneDrive = 3,
        DropBox = 4,
        iCloud = 5
    }

    public enum IdRepDocumentGuiTypeEnum
    {
        Invoice = 1,
        Contract = 2,
        OtherDocuments = 3
    }

    public static class PersonContactObjectMode
    {
        public const string CONTRACTOR_CONTACT = "Contractor";
        public const string CONTRACTOR_CONTACT_SUFFIX = "_CONTRACTOR";

        public const string CONTRACTOR_PARTY_CONTACT = "ContractingParty";
        public const string CONTRACTOR_PARTY_CONTACT_SUFFIX = "_CONTRACTINGPARTY";

        public const string BANK_CONTACT = "BankContact";
        public const string BANK_CONTACT_SUFFIX = "";

        public const string BENEFICIARY_CONTACT = "BeneficiaryContact";
        public const string BENEFICIARY_CONTACT_SUFFIX = "_BENEFICIARY";

        public const string REMITTER_CONTACT = "RemitterContact";
        public const string REMITTER_CONTACT_SUFFIX = "_REMITTER";

        public const string CONTACT = "Contact";
        public const string CONTACT_SUFFIX = "_CONTACT";

        public const string PRIVATE_CONTACT = "Privat";
        public const string PRIVATE_CONTACT_SUFFIX = "_PRIVAT";
    }

    public enum RepCommunicationTypeEnum
    {
        Phone = 1,
        MobilePhone = 2,
        Emails = 3,
        Internet = 4,
        Skype = 5,
        Fax = 6
    }

    public enum CloudTypeEnum
    {
        MY_CLOUD = 1,
        GG_DRIVE = 2,
        ONE_DRIVE = 3,
        DROP_BOX = 4
    }

    public static class UserEncrypted
    {
        public const int ID_PERSONAL_USER = 0;
        public const string PERSONAL_USER = "31BCA02094EB78126A517B206A88C73CFA9EC6F704C7030D18212CACE820F025F00BF0EA68DBF3F3A5436CA63B53BF7BF80AD8D5DE7D8359D0B7FED9DBC3AB99";
        public const int ID_MASTER_ADMIN = 1;
        public const string MASTER_ADMIN = "4DFF4EA340F0A823F15D3F4F01AB62EAE0E5DA579CCB851F8DB9DFE84C58B2B37B89903A740E1EE172DA793A6E79D560E5F7F9BD058A12A280433ED6FA46510A";
        public const int ID_CUSTOMER_ADMIN = 2;
        public const string CUSTOMER_ADMIN = "40B244112641DD78DD4F93B6C9190DD46E0099194D5A44257B7EFAD6EF9FF4683DA1EDA0244448CB343AA688F5D3EFD7314DAFE580AC0BCBF115AECA9E8DC114";
        public const int ID_USER = 3;
        public const string USER = "3BAFBF08882A2D10133093A1B8433F50563B93C14ACD05B79028EB1D12799027241450980651994501423A66C276AE26C43B739BC65C4E16B10C3AF6C202AEBB";

        public const string MASTER_ADMIN_COMPANY = "1";

        public static int GetIdUserRole(string encrypt)
        {
            int result = 0;
            if (string.IsNullOrWhiteSpace(encrypt)) return result;
            switch (encrypt)
            {
                case MASTER_ADMIN:
                    result = ID_MASTER_ADMIN;
                    break;
                case CUSTOMER_ADMIN:
                    result = ID_CUSTOMER_ADMIN;
                    break;
                case USER:
                    result = ID_USER;
                    break;
                default:
                    break;
            }
            return result;
        }
    }

    /// <summary>
    /// EDynamicDataGetReturnType
    /// </summary>
    public enum EDynamicDataGetReturnType
    {
        /// <summary>
        /// None: return JArray
        /// </summary>
        None,

        /// <summary>
        /// One Row
        /// </summary>
        OneRow,

        /// <summary>
        /// Datatable
        /// </summary>
        Datatable
    }

    public enum EumPlatform
    {
        None = 0,
        Linux = 1,
        Windows = 2
    }
}
