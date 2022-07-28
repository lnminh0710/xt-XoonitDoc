export enum WidgetType {
    None = 0,
    FieldSet = 1,
    DataGrid = 2,
    EditableGrid = 3,
    EditableTable = 4,
    Combination = 5, // combination of FieldSet + EditableTable
    CombinationCreditCard = 6, // combination of FieldSet and CreditCard,
    SearchAndFilterTable = 7,
    GroupTable = 8,
    Country = 9,
    Upload = 10,
    TreeView = 11,
    FileExplorer = 12,
    OrderDataEntry = 13,
    FieldSetReadonly = 16,
    Translation = 17,
    CustomerHistory = 18,
    ReturnRefund = 19,
    TableWithFilter = 20,
    SystemManagement = 21,
    Doublette = 22,
    EditableRoleTreeGrid = 23,
    BlankWidget = 24,
    FileExplorerWithLabel = 25,
    FileTemplate = 27,
    DateFilterCondition = 28,
    ToolFileTemplate = 29,
    ArticleTemplateUpload = 30,
    Report = 31,
    CountrySelection = 121,
    DoubleGrid = 122,
    SynchronizeElasticsSearch = 32,
    CustomerLogo = 33,
    CustomerSummary = 34,
    CustomerCommunication = 35,
    ArticleDetailView = 36,
    DocumentProcessing = 40,
    PdfViewer = 41,
    Chart = 42,
    // dms
    Document = 37,
    DocumentManagement = 38,
    Document_Grouping = 39,
    FileManager = 43,
    FormManagement = 44,
    WidgetViewer = 45,
    DocumentPath = 46,
    Kontakt = 47,
    ModulesOverview = 48,
    InvoiceInfo = 49,
    BankInfo = 50,
    ElasticSearch = 51,
    NotesForm = 52,
    ContractForm = 53,
    WidgetActions = 54,
    WidgetClassification = 55,
    WidgetScanner = 56,
    WidgetScanSummary = 57,
    WidgetMyContactTree = 58,
    WidgetContactList = 59,
    WidgetAttachment = 60,
    WidgetMyDmSummary = 61,
    WidgetStructureTree = 62,
    ScanningConfig = 63,
    ScanningImageViewer = 64,
    ScanningImageList = 65,
    ScanningAction = 66,
    Cloud = 67,
    WidgetHistory = 68,
    ExportConfiguration = 69,
    CloudViewer = 70,
    WidgetForm = 71,
    UserManagement = 74,
    WidgetAttachmentViewer = 75,
    WidgetEmailViewer = 76,
    WidgetEmailAttachment = 77,
    WidgetNoteForm = 78,
    WidgetPaymentOverview = 79,
    EditTableCustom = 80,
    WidgetInvoiceApprovalConfirm = 81,
    WidgetInvoiceApprovalMandantOverview = 82,
    PaymentInformation = 83,
    WidgetInvoiceSupplierInformation = 84,
    WidgetInvoiceAddon = 85,
    WidgetOwnerDocument = 86,
    WidgetInvoiceAddonV2 = 87,
    UserManagementV2 = 88,
    WidgetDocumentViewer = 89,

    WidgetBranch = 93,
    HeadquarterList = 94,
    WidgetPriceTag = 95,
    WidgetImageGallery = 96,
}

export enum WidgetApp {
    WidgetFileManager = 172,
    WidgetContactCapture = 176,
    WidgetElasticSearch = 181,
    WidgetDmsActions = 184,
    WidgetContactDetail = 191,
    WidgetMyDmFolderTree = 193,
    WidgetEmailFolderTree = 226,
    WidgetElasticSearchMyDmManagement = 194,
    WidgetFileExplorer = 200,
    WidgetImportUploadFile = 201,
    WidgetCloudManagement = 203,
    WidgetExportTree = 207,
    WidgetFolderStructTree = 211,
    WidgetFavouriteFolder = 212,
    WidgetToggleCapturedForm = 213,

    WidgetScanTree = 215,
    WidgetImportTree = 202,
    WidgetCaptureTree = 220,
    WidgetUserMangement = 222,

    WidgetIndexingTree = 244,
    WidgetIndexingFile = 245,

    // Image ocr
    WidgetImageOCRReadOnly = 216,
    WidgetImageOCR = 157,
    WidgetMyDMForm = 218,
    WidgetPositionDetail = 229,

    InvoiceApprovalConfirmProcessing = 232,
    InvoiceApprovalConfirm = 230,
    PaymentInformation = 233,
    WidgetPaymentOverview = 228,
    WidgetInvoiceInfoApproval = 238,
    WidgetSupplierInfoApproval = 239,
    WidgetUserManagementV2 = 240,
    WidgetUserGroupManagement = 241,
    WidgetRoleGroupManagement = 243,
    WidgetRoleManagement = 242,

    WidgetEmailViewer = 224,
    WidgetEmailList = 249,
}

export enum WidgetKeyType {
    None = 0,
    Main = 1,
    Sub = 2,
}
