import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class Configuration {
    public static PublicSettings: any = {};

    public server = 'http://abc.com/';
    public apiEndpoint = 'http://localhost:5000/api/';
    public maxSizeLimit = 2097152000;

    public static LOCAL_STORAGE_ACCESS_TOKEN = 'accessToken';
    public static LOCAL_STORAGE_REFRESH_TOKEN = 'refreshToken';
    public static SEPARATOR_PATH = '\\';

    public localStorageCurrentUser = 'currentUser';
    public localStorageCurrentUserExpire = 'currentUserExpire';
    public localStorageAuthorization = 'Authorization';
    public localStorageAccessToken = Configuration.LOCAL_STORAGE_ACCESS_TOKEN;
    public localStorageRefreshToken = Configuration.LOCAL_STORAGE_REFRESH_TOKEN;
    public localStorageExpiresIn = 'expiresIn';
    public localStorageLatestUserInfo = 'latestUserInfo';
    public localStorageDefaultRole = 'defaultRole';

    public rootUrl = '/';
    public homeUrl = '/index';
    public static rootPrivateUrl = '/module';

    // PublicUrl
    public static rootPublicUrl = '/auth';
    public loginUrl = Configuration.rootPublicUrl + '/login';
    public signupUrl = Configuration.rootPublicUrl + '/signup';
    public accountDenied = Configuration.rootPublicUrl + '/accountdenied';
    public accountExpireUrl = Configuration.rootPublicUrl + '/accountexpire';
    public accountExpireThankUrl = Configuration.rootPublicUrl + '/expirethank';
    public forgotpasswordUrl = Configuration.rootPublicUrl + '/forgotpassword';
    public changePasswordUrl = Configuration.rootPublicUrl + '/changepassword';
    public authenSuccessUrl = Configuration.rootPublicUrl + '/success';
    public externalLoginCallbackUrl = Configuration.rootPublicUrl + '/externalLoginCallback';

    // Api URL
    public refreshTokenUrl = environment.fakeServer + '/api/authenticate/RefreshToken';

    // URL parameters
    public urlPramToken = 'accesstoken';
    public urlPramLoginName = 'loginName';
    public updateSuccess = 'Successfully';
    public updateFailed = 'Failed';

    // common
    public tokenType = 'Bearer';
    public passwordPath =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\~\`\!\@\#\$\%\^\&\*\(\)\-\_\+\=\[\]\{\}\|\\\:\;\"\'\<\,\>\.\?\/])[A-Za-z\d\~\`\!\@\#\$\%\^\&\*\(\)\-\_\+\=\[\]\{\}\|\\\:\;\"\'\<\,\>\.\?\/]{8,}/;
    public avoidPropetyRemoveText = 'xenapr_';
    public defaultCountDownTime = 5000; // unit: minute
    public static pageSize = 50; // grid page size default
    public static pageIndex = 1; // grid page index default
    public remainCountDownTime = 30; // unit: second
    public emptyGuid = '00000000-0000-0000-0000-000000000000';
    public defaultMainTabId = 'MainInfo';
    public defaultMainTabName = 'Main Overview';
    public expiredTokenOffsetSeconds = 600;
    public valueChangeDeboundTimeDefault = 500;
    public noteLengthDefault = 500;
    public enableTimeTraceLog = false;
    public textEditorFont = [
        {
            import: 'formats/font',
            whitelist: [
                'arial',
                'arialblack',
                'calibri',
                'comicsansms',
                'georgia',
                'helvetica',
                'lucidasansunicode',
                'portableuserinterface',
                'timenewroman',
                'trebuchetms',
                'verdana',
                'tahoma',
            ],
        },
    ];
    public paymentTypeData = [
        // { paymentTypeText: '', paymentTypeId: 0 },
        { paymentTypeText: 'Cash', paymentTypeId: 1, postageCosts: 1 },
        { paymentTypeText: 'Cheque', paymentTypeId: 2, postageCosts: 2 },
        { paymentTypeText: 'Credit Card', paymentTypeId: 3, postageCosts: 3 },
    ];
    public popupResizeClassName = 'xn-p-dialog-resizable';
    public popupFullHeightClassName = 'xn-common-dialog--full-height';
    public popupFullViewClassName = 'xn-common-dialog-full-view';
    public widgetTitleTranslateFieldName = 'widgetTitleTranslate';
    public dateFormatInDataBase = 'MM/dd/yyyy';
    public printingUploadTemplateFolderName = 'Templates';
    public wordExtesion = '.doc, .docx, .dot, .dotx';
    public imageExtesion = '.png, .jpeg, .tiff';
    public widgetDotNotAddThisFilter = 'do no add this filter';

    public keyCode = {
        65: 'a',
        66: 'b',
        67: 'c',
        68: 'd',
        69: 'e',
        70: 'f',
        71: 'g',
        72: 'h',
        73: 'i',
        74: 'j',
        75: 'k',
        76: 'l',
        77: 'm',
        78: 'n',
        79: 'o',
        80: 'p',
        81: 'q',
        82: 'r',
        83: 's',
        84: 't',
        85: 'u',
        86: 'v',
        87: 'w',
        88: 'x',
        89: 'y',
        90: 'z',
        48: '0',
        49: '1',
        50: '2',
        51: '3',
        52: '4',
        53: '5',
        54: '6',
        55: '7',
        56: '8',
        57: '9',
        96: '0',
        97: '1',
        98: '2',
        99: '3',
        100: '4',
        101: '5',
        102: '6',
        103: '7',
        104: '8',
        105: '9',
        16: 'Shift',
        17: 'Ctrl',
        18: 'Alt',
    };
}

@Injectable()
export class ServiceUrl {
    public apiUrl = environment.fakeServer + '/api/';

    // User Control Api URL
    public serviceAuthenticateUrl = environment.fakeServer + '/api/authenticate';
    public serviceForgotPasswordUrl = this.serviceAuthenticateUrl + '/fogotPassword';
    public serviceUpdatePasswordUrl = this.serviceAuthenticateUrl + '/updatepassword';
    public changePasswordUrl = this.serviceAuthenticateUrl + '/changepassword';
    public serviceSendNotificationUrl = this.serviceAuthenticateUrl + '/SendNotification';
    public checkTokenUrl = this.serviceAuthenticateUrl + '/CheckToken';
    public loginByUserIdUrl = this.serviceAuthenticateUrl + '/LoginByUserId';
    public signupUrl = this.serviceAuthenticateUrl + '/signup';
    public newUserUrl = this.serviceAuthenticateUrl + '/newUser';
    public serviceResendEmailNewPasswordUrl = this.serviceAuthenticateUrl + '/resendEmailNewPassword';
    public resendActivateEmailUrl = this.serviceAuthenticateUrl + '/resendActivateEmail';
    public changeStatusUserUrl = this.serviceAuthenticateUrl + '/changeStatusUser';
    public resetPassUser = this.serviceAuthenticateUrl + '/ResetPassUser';

    public globalSearch = this.apiUrl + 'Search/';
    public globalSearchGetAllModules = this.globalSearch + 'GetAllModules';
    public globalSearchGetSearchSummary = this.globalSearch + 'GetSearchSummary';

    public elasticSearch = this.apiUrl + 'ElSearch/';
    public elasticSearchSearchSummary = this.elasticSearch + 'GetSearchSummary';
    public elasticSearchSearchDetail = this.elasticSearch + 'SearchDetail';
    public elasticSearchSearchByField = this.elasticSearch + 'SearchByField';
    public elasticSearchSearchArticle = this.elasticSearch + 'SearchArticle';
    public elasticSearchSearchDocument = this.elasticSearch + 'SearchDocument';
    public elasticGetColumnSetting = this.elasticSearch + 'GetColumnSetting';
    public elasticSearchDetailAdvance = this.elasticSearch + 'SearchDetailAdvance';

    public parkedItem = this.apiUrl + 'parkeditem/';
    public serviceGetParkedItemMenuUrl = this.parkedItem + 'GetParkedItemMenu';
    public serviceGetListParkedItemByModuleUrl = this.parkedItem + 'GetListParkedItemByModule';
    public serviceGetParkedItemByIdUrl = this.parkedItem + 'GetParkedItemById';
    public serviceSaveParkedItemByModuleUrl = this.parkedItem + 'SaveParkedItemByModule';
    public serviceSaveParkedMenuItemUrl = this.parkedItem + 'SaveParkedMenuItem';

    public common = this.apiUrl + 'common/';
    public getAllSearchModules = this.common + 'GetAllSearchModules';
    public getModules = this.common + 'getModules';
    public getDetailSubModule = this.common + 'getdetailsubmodule';
    public getTabSummaryInfor = this.common + 'GetTabSummaryInfor';
    public getTabByDocumentType = this.common + 'GetTabByIdDocumentType';
    public getModuleSetting = this.common + 'GetModuleSetting';
    public getSettingModule = this.common + 'GetSettingModules';
    public getComboxBoxList = this.common + 'GetComboBoxInfo';
    public getModuleToPersonType = this.common + 'GetModuleToPersonType';
    public createContact = this.common + 'createContact';
    public getPublicSetting = this.common + 'GetPublicSetting';
    public getDynamicRulesType = this.common + 'GetDynamicRulesType';
    public sendEmail = this.common + 'SendEmail';
    public matchingCustomerData = this.common + 'MatchingCustomerData';
    public sendEmailWithImageAttached = this.common + 'SendEmailWithImageAttached';
    public getMainLanguages = this.common + 'GetMainLanguages';
    public serviceUpdateSettingsModuleUrl = this.common + 'UpdateSettingsModule';
    public getCustomerColumnsSetting = this.common + 'GetCustomerColumnsSetting';
    public getCountryGroup = this.common + 'GetCountryGroup';
    public saveCountryGroup = this.common + 'SaveCountryGroup';
    public getWidgetAppById = this.common + 'GetWidgetAppById';
    public updateWidgetApp = this.common + 'UpdateWidgetApp';
    public createQueue = this.common + 'CreateQueue';
    public getDocumentProcessingQueues = this.common + 'GetDocumentProcessingQueues';
    public deleteQueues = this.common + 'DeleteQueues';
    public getScanSetting = this.common + 'GetScanSettings';
    public saveScanSetting = this.common + 'SaveScanSettings';

    public globalSetting = this.apiUrl + 'GlobalSetting/';
    public getAllGlobalSettings = this.globalSetting + 'GetAllGlobalSettings';
    public GetGlobalSettingById = this.globalSetting + 'GetGlobalSettingById';
    public DeleteGlobalSettingById = this.globalSetting + 'DeleteGlobalSettingById';
    public SaveGlobalSetting = this.globalSetting + 'SaveGlobalSetting';
    public getTranslateLabelText = this.globalSetting + 'GetTranslateLabelText';
    public saveTranslateLabelText = this.globalSetting + 'SaveTranslateLabelText';
    public getTranslateText = this.globalSetting + 'GetTranslateText';
    public getCommonTranslateLabelText = this.globalSetting + 'GetCommonTranslateLabelText';
    public getAdvanceSearchProfile = this.globalSetting + 'GetAdvanceSearchProfile';

    public widget = this.apiUrl + 'widget/';
    public getAllWidgetTemplateByModuleId = this.widget + 'GetAllWidgetTemplateByModuleId';
    public getWidgetDetailByRequestString = this.widget + 'GetWidgetDetailByRequestString';
    public updateWidgetInfo = this.widget + 'UpdateWidgetInfo';
    public createWidgetSetting = this.widget + 'CreateWidgetSetting';
    public updateWidgetSetting = this.widget + 'UpdateWidgetSetting';
    public deleteWidgetSetting = this.widget + 'DeleteWidgetSetting';
    public getWidgetSetting = this.widget + 'GetWidgetSetting';
    public getWidgetOrderBy = this.widget + 'GetWidgetOrderBy';
    public saveWidgetOrderBy = this.widget + 'SaveWidgetOrderBy';

    public pageSetting = this.apiUrl + 'PageSetting/';
    public savePageSetting = this.pageSetting + 'SavePageSetting';
    public getPageSettingById = this.pageSetting + 'GetPageSettingById';

    // person
    public person = this.apiUrl + 'person/';
    public loadCommunication = this.person + 'LoadCommunication';
    public getPersonById = this.person + 'GetPersonById';
    public preLoadBusinessLogic = this.person + 'PreLoadBusinessLogic';
    public getPaymentAccount = this.person + 'getPaymentAccount';
    public getCCPRN = this.person + 'getCCPRN';
    public createPerson = this.person + 'CreatePerson';
    public updatePerson = this.person + 'UpdatePerson';
    public createPaymentAccount = this.person + 'CreatePaymentAccount';
    public createCostProvider = this.person + 'createCostProvider';
    public createCCPRN = this.person + 'createCCPRN';
    public getPaymentAccountById = this.person + 'GetPaymentAccountById';
    public getCustomerHistory = this.person + 'GetCustomerHistory';
    public getMandatoryField = this.person + 'GetMandatoryField';
    public getPersonData = this.person + 'GetPersonData';
    public saveCustomer = this.person + 'SaveCustomer';

    // article
    public article = this.apiUrl + 'article/';
    public getArticleById = this.article + 'getArticleById';
    public getArticleSetComposition = this.article + 'GetArticleSetComposition';
    public createArticle = this.article + 'createArticle';
    public updateArticle = this.article + 'UpdateArticle';
    public createArticlePurchasing = this.article + 'InsertArticlePurchasing';
    public updateArticleSetComposition = this.article + 'UpdateArticleSetComposition';
    public checkArticleNr = this.article + 'checkArticleNr';
    public getArticleByNr = this.article + 'getArticleByNr';
    public searchArticleByNr = this.article + 'SearchArticleByNr';
    public insertArticleMedia = this.article + 'InsertArticleMedia';
    public updateArticleMedia = this.article + 'UpdateArticleMedia';
    public getArticleMedia = this.article + 'GetArticleMedia';

    // campiagn
    public campaign = this.apiUrl + 'campaign/';
    public createCampaignArticle = this.campaign + 'CreateCampaignArticle';
    public getCampaignArticle = this.campaign + 'GetCampaignArticle';
    public searchMediaCode = this.campaign + 'SearchMediaCode';
    public getCampaignArticleCountries = this.campaign + 'GetCampaignArticleCountries';
    public createMediaCode = this.campaign + 'CreateMediaCode';
    public getCampaignWizardCountry = this.campaign + 'GetCampaignWizardCountry';
    public saveCampaignWizard = this.campaign + 'SaveCampaignWizard';
    public saveCampaignWizardCountriesT2 = this.campaign + 'SaveCampaignWizardCountriesT2';
    public getCampaignWizardT2 = this.campaign + 'GetCampaignWizardT2';
    public getCampaignWizardT1 = this.campaign + 'GetCampaignWizardT1';
    public getCampaignTracks = this.campaign + 'GetCampaignTracks';
    public getCampaignTracksCountries = this.campaign + 'GetCampaignTracksCountries';
    public saveCampaignTracks = this.campaign + 'SaveCampaignTracks';
    public saveCampaignCosts = this.campaign + 'SaveCampaignCosts';
    public getCampaignMediaCodeArticleSalesPrice = this.campaign + 'GetCampaignMediaCodeArticleSalesPrice';
    public saveCampaignMediaCodeArticleSalesPrice = this.campaign + 'SaveCampaignMediaCodeArticleSalesPrice';
    public saveSalesCampaignAddOn = this.campaign + 'SaveSalesCampaignAddOn';
    public saveDocumentTemplateSampleDataFile = this.campaign + 'SaveDocumentTemplateSampleDataFile';
    public getCampaignCostsTreeView = this.campaign + 'GetCampaignCostsTreeView';
    public listDocumentTemplateColumnName = this.campaign + 'ListDocumentTemplateColumnName';
    public getDocumentTemplateCountries = this.campaign + 'GetDocumentTemplateCountries';
    public getMediaCodeDetail = this.campaign + 'GetMediaCodeDetail';
    public checkExistingMediaCodeMulti = this.campaign + 'CheckExistingMediaCodeMulti';
    public checkCampaignNumber = this.campaign + 'CheckCampagneNr';
    public saveAppSystemColumnNameTemplate = this.campaign + 'SaveAppSystemColumnNameTemplate';
    public listDocumentTemplatesBySharingTreeGroup = this.campaign + 'ListDocumentTemplatesBySharingTreeGroup';
    public listTreeItemByIdSharingTreeGroupsRootname = this.campaign + 'ListTreeItemByIdSharingTreeGroupsRootname';
    public saveFilesByIdSharingTreeGroups = this.campaign + 'SaveFilesByIdSharingTreeGroups';

    // business cost
    public saveFilesByBusinessCostsId = this.campaign + 'SaveFilesByBusinessCostsId';
    public getCampaignCosts = this.campaign + 'GetCampaignCosts';
    public getFilesByBusinessCostsId = this.campaign + 'GetFilesByBusinessCostsId';
    public getBusinessCostsItem = this.campaign + 'GetBusinessCostsItem';
    public getBusinessCostsCountries = this.campaign + 'GetBusinessCostsCountries';
    public saveBusinessCostsItem = this.campaign + 'SaveBusinessCostsItem';

    // data entry
    public dataEntry = this.apiUrl + 'OrderDataEntry/';
    public getArticleData = this.dataEntry + 'GetArticleData';
    public getCustomerData = this.dataEntry + 'GetCustomerData';
    public getPreloadOrderData = this.dataEntry + 'GetPreloadOrderData';
    public saveOrderDataEntry = this.dataEntry + 'SaveOrderDataEntry';
    public sendOrderToAdministrator = this.dataEntry + 'SendOrderToAdministrator';
    public getMainCurrencyAndPaymentType = this.dataEntry + 'GetMainCurrencyAndPaymentType';
    public getOrderDataEntryByLogin = this.dataEntry + 'OrderDataEntryByLogin';
    public getTotalDataEntryByLogin = this.dataEntry + 'TotalDataEntryByLogin';
    public getOrderFailed = this.dataEntry + 'GetOrderFailed';
    public saveOrderFailed = this.dataEntry + 'SaveOrderFailed';
    public deleteOrderFailed = this.dataEntry + 'DeleteOrderFailed';
    public deleteAllOrderFailed = this.dataEntry + 'DeleteAllOrderFailed';
    public getListOrderFailed = this.dataEntry + 'GetListOrderFailed';

    // bloomberg
    public bloomberg = this.apiUrl + 'bloomberg/';
    public getExchangeMoney = this.bloomberg + 'GetExchangeMoney';

    // return refund
    public returnRefund = this.apiUrl + 'ReturnAndRefund/';
    public getWidgetInfoByIds = this.returnRefund + 'GetWidgetInfoByIds';
    public saveReturnRefundWidgetData = this.returnRefund + 'SaveWidgetData';
    public saveUnblockOrder = this.returnRefund + 'SaveUnblockOrder';

    // block order
    public blockOrders = this.apiUrl + 'BlockOrders/';
    public getTextTemplate = this.blockOrders + 'GetTextTemplate';
    public getMailingListOfPlaceHolder = this.blockOrders + 'GetMailingListOfPlaceHolder';
    public saveTextTemplate = this.blockOrders + 'SaveTextTemplate';

    // stock correction
    public stockCorrection = this.apiUrl + 'StockCorrection/';
    public getWarehouseArticle = this.stockCorrection + 'GetWarehouseArticle';
    public saveStockCorrection = this.stockCorrection + 'SaveStockCorrection';

    // tool
    public tools = this.apiUrl + 'Tools/';
    public getAllScanCenters = this.tools + 'GetAllScanCenters';
    public getScanCenterPools = this.tools + 'GetScanCenterPools';
    public getScanCenterDispatcher = this.tools + 'GetScanCenterDispatcher';
    public getAllScanDataEntryCenters = this.tools + 'GetAllScanDataEntryCenters';
    public saveScanDispatcherPool = this.tools + 'SaveScanDispatcherPool';
    public saveScanUndispatch = this.tools + 'SaveScanUndispatch';
    public getScanAssignmentDataEntryCenter = this.tools + 'GetScanAssignmentDataEntryCenter';
    public getScanAssignmentPool = this.tools + 'GetScanAssignmentPool';
    public getScanAssignedPool = this.tools + 'GetScanAssignedPool';
    public getScanAssignmentUsers = this.tools + 'GetScanAssignmentUsers';
    public getScanAssignmentUserLanguageAndCountry = this.tools + 'GetScanAssignmentUserLanguageAndCountry';
    public scanAssignmentAssignPoolsToUsers = this.tools + 'ScanAssignmentAssignPoolsToUsers';
    public scanAssignmentUnassignPoolsToUsers = this.tools + 'ScanAssignmentUnassignPoolsToUsers';
    public matchingCountry = this.tools + 'GetMatchingCountry';
    public getMatchingColumns = this.tools + 'GetMatchingColumns';
    public getMatchingConfiguration = this.tools + 'GetMatchingConfiguration';
    public saveMatchingConfiguration = this.tools + 'SaveMatchingConfiguration';
    public getScheduleTime = this.tools + 'GetScheduleTime';
    public saveScheduleTime = this.tools + 'SaveScheduleTime';
    public listSystemScheduleService = this.tools + 'ListSystemScheduleService';
    public getScheduleServiceStatusByQueueId = this.tools + 'GetScheduleServiceStatusByQueueId';
    public getSummayFileResultSystemSchedule = this.tools + 'GetSummayFileResultSystemSchedule';
    public getScheduleByServiceId = this.tools + 'GetScheduleByServiceId';
    public saveSystemSchedule = this.tools + 'SaveSystemSchedule';
    public saveStatusSystemSchedule = this.tools + 'SaveStatusSystemSchedule';
    public savingQueue = this.tools + 'SavingQueue';

    // warehouse
    public wareHouseMovement = this.apiUrl + 'WareHouseMovement/';
    public searchArticles = this.wareHouseMovement + 'SearchArticles';
    public sortingGoods = this.wareHouseMovement + 'SortingGoods';
    public stockedArticles = this.wareHouseMovement + 'StockedArticles';
    public saveWarehouseMovement = this.wareHouseMovement + 'SaveWarehouseMovement';
    public saveGoodsReceiptPosted = this.wareHouseMovement + 'SaveGoodsReceiptPosted';
    public confirmGoodsReceiptPosted = this.wareHouseMovement + 'ConfirmGoodsReceiptPosted';

    // User management
    public user = this.apiUrl + 'User/';
    public getUserById = this.user + 'GetUserById';
    public getAllUserRole = this.user + 'GetAllUserRole';
    public listUserRoleByUserId = this.user + 'ListUserRoleByUserId';
    public listUserRoleInclueUserId = this.user + 'ListUserRoleInclueUserId';
    public checkExistUserByField = this.user + 'CheckExistUserByField';
    public saveUserProfile = this.user + 'SaveUserProfile';
    public saveRoleForUser = this.user + 'SaveRoleForUser';
    public saveUserWidgetLayout = this.user + 'SaveUserWidgetLayout';
    public getUserFunctionList = this.user + 'GetUserFunctionList';
    public assignRoleToMultipleUser = this.user + 'AssignRoleToMultipleUser';
    public uploadAvatar = this.user + 'UploadAvatar';
    public removeAvatar = this.user + 'RemoveAvatar';
    public getUsersByIdLogin = this.user + 'GetUserByIdLogin';
    public getFilterOptionsUser = this.user + 'GetFilterOptionsUser';
    public getCompanyList = this.user + 'CompanyList';
    public changeProfileOtherUser = this.user + 'ChangeProfileOtherUser';
    public editUserProfile = this.user + 'EditProfile';
    public getAllUsers = this.user + 'GetAllUsers';
    public getAllUserAndGroups = this.user + 'UserAndGroups';
    public getAllRoleGroups = this.user + 'RoleGroups';
    public getRoleGroupsDetail = this.getAllRoleGroups + '/Details';
    public getAllUserGroup = this.user + 'Usergroups';
    public getUserGroupById = this.getAllUserGroup + '/Details';
    public getAllPermissions = this.user + 'Permissions';
    public getAllRoles = this.user + 'Roles';
    public getRoleById = this.getAllRoles + '/Details';
    public getPermissionByListRole = this.user + 'PermissionByListRole';
    public getUserPermissions = this.user + 'PermissionsAssign';
    public forceActiveUser = this.apiUrl + 'authenticate/active/';

    // Notification
    public notification = this.apiUrl + 'Notification/';
    public getNotifications = this.notification + 'GetNotifications';
    public createNotification = this.notification + 'CreateNotification';
    public setArchivedNotifications = this.notification + 'SetArchivedNotifications';
    public createNotificationWithSendEmail = this.notification + 'CreateNotificationWithSendEmail';
    public getApproveInvoices = this.notification + 'GetApproveInvoices';
    public approveInvoiceCounter = this.notification + 'ApproveInvoiceCounter';

    //FileManager
    public fileManager = this.apiUrl + 'FileManager/';
    public downloadTemplates = this.fileManager + 'DownloadTemplates';
    public checkFileExisted = this.fileManager + 'CheckFileExisted';
    public getFile = this.fileManager + 'GetFile';
    public uploadFile = this.fileManager + 'UploadFile/';
    public getScanFile = this.fileManager + 'GetScanFile/';
    public uploadScanFile = this.fileManager + 'UploadScanFile/';
    public importArticleMediaZip = this.fileManager + 'ImportArticleMediaZip/';
    public getDocumentZipFile = this.fileManager + 'GetDocumentZipFile/';

    public database = this.apiUrl + 'database/';
    public getListOfDatabaseNames = this.database + 'GetListOfDatabaseNames';
    public getListOfDatabaseCountry = this.database + 'GetListOfDatabaseCountry';
    public saveProjectDatabase = this.database + 'SaveProjectDatabase';

    public rule = this.apiUrl + 'rule/';
    public getProjectRules = this.rule + 'GetProjectRules';
    public getProjectRulesForTemplate = this.rule + 'GetProjectRulesForTemplate';
    public getComboBoxForRuleBuilder = this.rule + 'GetComboBoxForRuleBuilder';
    public getBlackListRules = this.rule + 'GetBlackListRules';
    public getOrdersGroups = this.rule + 'GetOrdersGroups';
    public saveProjectRules = this.rule + 'SaveProjectRules';
    public getTemplate = this.rule + 'GetTemplate';
    public saveBlackListProfile = this.rule + 'SaveBlackListProfile';
    public deleteDataToUsed = this.rule + 'DeleteDataToUsed';

    public country = this.apiUrl + 'country/';
    public getCountryGroupsList = this.country + 'GetCountryGroupsList';
    public getCountryGroupsName = this.country + 'GetCountryGroupsName';
    public getSelectionProjectCountry = this.country + 'GetSelectionProjectCountry';
    public saveCountryGroups = this.country + 'SaveCountryGroups';
    public saveProjectCountry = this.country + 'SaveProjectCountry';

    public frequency = this.apiUrl + 'frequency/';
    public getFrequency = this.frequency + 'GetFrequency';
    public rebuildFrequencies = this.frequency + 'RebuildFrequencies';
    public getFrequencyBusyIndicator = this.frequency + 'GetFrequencyBusyIndicator';
    public saveFrequency = this.frequency + 'SaveFrequency';

    public project = this.apiUrl + 'project/';
    public saveProject = this.project + 'SaveProject';
    public saveMediaCodePricing = this.project + 'SaveMediaCodePricing';
    public getSelectionProject = this.project + 'GetSelectionProject';
    public getMediaCodePricing = this.project + 'GetMediaCodePricing';

    // document
    public document = this.apiUrl + 'document/';
    public Document = this.apiUrl + 'Document/';
    public getCustomerAssignmentsDetail = this.document + 'GetCustomerAssignmentsDetail';
    public getDataOrderProcessingById = this.document + 'GetDataOrderProcessingById';
    public saveOrderProcessing = this.document + 'SaveOrderProcessing';
    public saveOrderProcessingDocumentsLink = this.document + 'SaveOrderProcessingDocumentsLink';
    public sendMailOrderProcessing = this.document + 'SendMailOrderProcessing';
    public getOrderProcessingEmail = this.document + 'GetOrderProcessingEmail';
    public deleteCancelDocument = this.document + 'DeleteCancelDocument';
    public getDocumentSummary = this.document + 'documentSummary';
    public getDocumentTreeByUser = this.document + 'documentTreeByUser';
    public getDocumentTreeIndexing = this.document + 'DocumentTreeIndexing';
    public getDocumentTreeEmail = this.document + 'DocumentTreeEmail';
    public getFavouriteFolderByUser = this.document + 'favouriteFolderByUser';
    public createNewFavouriteFolder = this.document + 'newFolderFavourite';
    public addContactToMyFavourite = this.document + 'addContactToFavourite';
    public getDocumentInvoiceCombobox = this.document + 'DocumentInvoiceDynamicCombobox';
    public getExtractedDataFromOcr = this.document + 'extractedDataFromOcr';
    public saveDocumentIntoFolder = this.document + 'saveDocumentIntoFolder';
    public createFolder = this.document + 'createFolder';
    public updateFolder = this.document + 'updateFolder';
    public deleteFolder = this.document + 'deleteFolder';
    public getDocumentsByFolder = this.document + 'getDocumentsByFolder';
    public getAttachmentListByContact = this.document + 'attachmentListByContact';
    public getPathTreeDocument = this.document + 'PathTreeDocument';
    public getFormColumnSettings = this.document + 'FormColumnSettings';
    public getFormGroupSettings = this.document + 'FormGroupSettings';
    public saveFormColumnSettings = this.document + 'SaveFormColumnSettings';
    public changeDocumentToOtherTree = this.document + 'ChangeDocumentToOtherTree';
    public notesHandleProcess = this.document + 'notes';
    public getDocumentTreeAgGridIndexing = this.document + 'permissionUserTree';
    public permissionIndexingTree = this.document + 'indexing/permission';
    public permissionMailTree = this.document + 'mail/permission';
    public removeDocument = this.document + 'Remove';
    public changeFolderForFiles = this.document + 'TreeOfDocuments';

    public getReportNotes = this.document + 'GetReportNotes';
    public saveSupportNotes = this.document + 'SaveSupportNotes';
    public sendMailNotes = this.apiUrl + 'DocumentContainer/' + 'EmailExportNote';
    public getReportNotesFile = this.fileManager + 'DownloadReportNotes';

    // invoice
    public invoice = this.apiUrl + 'invoice/';
    public saveDocumentInvoice = this.invoice + 'SaveInvoice';
    public getDataSettingColumnsInvoice = this.invoice + 'DataSettingColumnsInvoice';
    public getCapturedInvoiceDocumentDetail = this.invoice + 'CapturedInvoiceDocumentDetail';

    // contact
    public contact = this.apiUrl + 'contact/';
    public saveDocumentContact = this.contact + 'SaveContact';
    public getDataSettingColumnsContact = this.contact + 'DataSettingColumnsContact';
    public getDataSettingColumnsContactOfDocumentType = this.contact + 'DataSettingColumnsContactOfDocumentType';
    public getDocumentContactCommunication = this.contact + 'DocumentCommunication';
    public checkAndGetCompanyList = this.contact + 'checkAndGetCompanyList';
    public getContactDetail = this.contact + 'ContactDetail';

    // contract
    public contract = this.apiUrl + 'contract/';
    public getDataSettingColumnsContract = this.contract + 'DataSettingColumnsContract';
    public saveDocumentContract = this.contract + 'SaveContract';
    public getCapturedContractDocumentDetail = this.contract + 'CapturedContractDocumentDetail';

    // other document
    public otherDocument = this.apiUrl + 'otherDocument/';
    public getDataSettingColumnsOtherDocuments = this.otherDocument + 'DataSettingColumnsOtherDocuments';
    public saveOtherDocument = this.otherDocument + 'SaveOtherDocument';
    public getCapturedOtherDocumentDetail = this.otherDocument + 'CapturedOtherDocumentDetail';

    // document contaniner
    public documentContainer = this.apiUrl + 'documentContainer/';
    public saveOCRResult = this.documentContainer + 'SaveOCRResult';
    public getOCRJsonByImageId = this.documentContainer + 'GetOCRDataByFileId';

    // document history
    public history = this.apiUrl + 'history/';
    public getAllHistoryDocument = this.history + 'AllHistoryDocument';
    public getScanningHistory = this.history + 'ScanningHistory';
    public getScanningHistoryDetail = this.history + 'ScanningHistoryDetail';
    public getHistoryUser = this.history + 'HistoryUsers';

    // dms
    public documentManagement = this.apiUrl + 'DocumentContainer/';
    public getFieldForEntry = this.documentManagement + 'getFieldForEntry';
    public getDocument = this.documentManagement + 'GetDoc2Entry';
    public getThumbnails = this.documentManagement + 'getThumbnails';
    public saveDocument = this.documentManagement + 'SaveDocumentContainerProcessed';
    public deleteScanDocument = this.documentManagement + 'DeleteScanDocument';
    public getPagesByDocId = this.documentManagement + 'GetPagesByDocId';
    public getDocumentScanFile = this.documentManagement + 'GetFile';
    public getAttachmentFile = this.fileManager + 'GetFile';
    public saveDocumentContainerPage = this.documentManagement + 'SaveDocumentContainerPage';
    public sendMailScanDocument = this.documentManagement + 'SendEmail';
    public sendMailDocument = this.Document + 'SendMailDocument';
    public changeAngle = this.apiUrl + 'OCRDocument/manually';
    public uploadImageScan = this.apiUrl + 'ConvertImage/UploadImageByBase64';
    public uploadFileImagesScan = this.apiUrl + 'ConvertImage/UploadImages';
    public getEmailData = this.documentManagement + 'getEmailData';
    public getEmailAttachements = this.documentManagement + 'getEmailAttachements';
    public cloudConfiguration = this.apiUrl + 'Cloud/';
    public getAllCloud = this.cloudConfiguration + 'GetCloudActives';
    public GetCloudConnection = this.cloudConfiguration + 'GetCloudConnection';
    public SaveCloudConnection = this.cloudConfiguration + 'CreateAndSaveCloudConnection'; // SaveCloudConnection
    public testCloudConnection = this.cloudConfiguration + 'TestCloudConnection';
    public getStatusCloudConnection = this.cloudConfiguration + 'StatusConnection'; //StatusCloudConnection
    public getConfigurationCloud = this.cloudConfiguration + 'GetConfigurationCloud';
    public getExternalLoginUrl = this.cloudConfiguration + 'GetExternalLoginUrl';
    public getDocumentOfTree = this.documentManagement + 'DocumentsOfTree';
    public getDocumentOfEmailTree = this.documentManagement + 'DocumentsOfEmailTree';

    public cloudFiles = this.apiUrl + 'CloudFiles/';
    public getFileFromCloud = this.cloudFiles + 'File';

    // file
    public fileExplorer = this.apiUrl + 'FileExplorer/';
    public getTree = this.fileExplorer + 'tree';
    public getChildByPath = this.fileExplorer + 'explorer';
    public folderControl = this.fileExplorer + 'folder';
    public fileControl = this.fileExplorer + 'file';
    public deleteFileExplorer = this.fileExplorer + 'DeleteFile';
    public uploadFileExplorer = this.fileExplorer + 'UploadFile';
    public uploadImages = this.fileExplorer + 'UploadScanFile';

    // form
    public documentSystem = this.apiUrl + 'DocumentSystem/';
    public documentSystemGetDocType = this.documentSystem + 'GetAllDoctypes';
    public documentSystemGetModule = this.documentSystem + 'GetAllModules';
    public documentSystemGetField = this.documentSystem + 'GetAllFields';

    public documentSystemSaveDocType = this.documentSystem + 'SaveDocType';
    public documentSystemSaveModule = this.documentSystem + 'SaveModule';
    public documentSystemSaveField = this.documentSystem + 'SaveField';

    public documentSystemAssignModule = this.documentSystem + 'AssignModule';

    // invoice approval
    public invoiceApproval = this.apiUrl + 'InvoiceApproval/';
    public getInvoiceItems = this.invoiceApproval + 'InvoiceItems';
    public searchSupplier = this.invoiceApproval + 'SearchSupplier';
    public searchBookingNr = this.invoiceApproval + 'SearchBookingInfo';
    public searchCostCentre = this.invoiceApproval + 'SearchCostCentre';
    public searchCostType = this.invoiceApproval + 'SearchCostType';
    public searchProjectNumber = this.invoiceApproval + 'SearchProjectNumber';
    public getNotes = this.invoiceApproval + 'Notes';
    public getApprovalGroups = this.invoiceApproval + 'ApprovalGroups';
    public getApprovalGroupsUser = this.invoiceApproval + 'ApprovalGroupsUser';
    public getGroupAssignedUsers = this.invoiceApproval + 'GroupsAssignedUsers';
    public getInvoiceApprovalHistory = this.invoiceApproval + 'History';
    public getPaymentOverview = this.invoiceApproval + 'InvoiceMainApproval';

    public searchMandant = this.invoiceApproval + 'SearchMandant';
    public getDynamicFormAddMandant = this.invoiceApproval + 'MandantForm';
    public getMandantOverview = this.invoiceApproval + 'MandantOverview';
    public saveDynamicForm = this.invoiceApproval + 'SaveDynamicForm';
    public saveProcessingForm = this.invoiceApproval + 'SaveProcessingForm';
    public getExtractedDataWhenInitApporvalProcessing = this.invoiceApproval + 'AIDataExtracted';

    public getBranchByHeadquarter = this.apiUrl + 'headquarter/branch';
    public priceTag = this.apiUrl + 'pricetag';
    public deletePriceTag = this.apiUrl + 'pricetag/remove';
    public priceTagAttachment = this.apiUrl + 'pricetag/attachments';

    // headQuarter
    public headquarter = this.apiUrl + 'headquarter';
    public headquarterDetail = this.headquarter + '/details';
    public importFileFromLocal = this.apiUrl + 'ConvertImage/ImportDocument';
    public importFileFromServer = this.apiUrl + 'ConvertImage/ImportDocumentFromPath';
}

@Injectable()
export class GlobalSearchConstant {
    public searchAll = 'All';
    public searchAdministration = 'Administration';
    public searchAricle = 'Article';
    public searchCampaign = 'Campaign';
    public searchCampaignCost = 'Campaign Cost';
    public searchCustomer = 'Customer';
    public searchOrder = 'Order';
    public searchPurchase = 'Purchase';
    public searchReturnAndReFund = 'Return & Refund';
    public searchStockCorrection = 'Stock Correction';
    public searchWareHuoseMovement = 'Warehourse Movement';
    public invoiceApproval = 'Invoice Approval';
}

@Injectable()
export class GlobalSettingConstant {
    public settingUserNoticeMessage = 'UserNoticeMessage';
    public settingUserMain = 'SettingUserMain';
    public additionalInformationTabShow = 'AdditionalInformationTabShow';
    public additionalInformationSessionShow = 'AdditionalInformationSessionShow';
    public additionalInformationPinned = 'AdditionalInformationPinned';
    public additionalInformationPanelWidth = 'AdditionalInformationPanelWidth';
    public parkItemSessionShow = 'ParkItemSessionShow';
    public settingCheckedModules = 'SettingCheckedModules';
    public orderDataEntryTabList = 'OrderDataEntryTabList';
    public globalWidgetProperties = 'GlobalWidgetProperties';
    public tabHeaderCollapseState = 'TabHeaderCollapseState';
    public publishSetting = 'PublishSetting';
    public moduleLayoutSetting = 'ModuleLayoutSetting';
    public hotkeySetting = 'HotkeySetting';
    public gridPagingDropdown = 'GridPagingDropdown';
    public workingModulesPosition = 'WorkingModulesPosition';
    public ageFilterTemplate = 'AgeFilter_Template';
    public extendedFilterTemplate = 'ExtendedFilter_Template';
    public searchProfile = 'SearchProfile';

    public gsHistoryTabSearching = 'GSHTSearching';

    public structureTreeSettings = 'StructureTreeSettings';
    public dmsActionToggle = 'DmsActionToggle';
}

@Injectable()
export class PageSettingConstant {
    public HorizontalPageName = 'Horizontal';
    public VerticalPageName = 'Vertical';
}

@Injectable()
export class PageSize {
    public GlobalSearchDefaultSize = 370;
    public GlobalSearchHeaderSize = 37;

    public ParkedItemShowSize = 230;
    public ParkedItemHideSize = 30;
    public AdditionalInformationSize = 29;
}

@Injectable()
export class CustomerFormModeConstant {
    public create = 1;
    public update = 2;
}

@Injectable()
export class ComboBoxTypeConstant {
    static language = 1;
    static title = 2;
    static countryCode = 3;
    static customerStatus = 4;
    static pOBox = 5;
    static contactType = 6;
    static titleOfCourtesy = 7;
    static communicationTypeType = 8;
    static creditCardType = 9;
    static cashProviderType = 10;
    static principal = 11;
    static mandant = 12;
    static currency = 13;
    static providerCostType = 14;
    static paymentType = 15;
    static identifierCode = 16;
    static articleStatus = 17;
    static allMandant = 18;
    static serviceProvider = 19;
    static wareHouse = 20;
    static campaignWizardAddress = 21;
    static campaignGroup = 22;
    static campaignNamePrefix = 23;
    static currencyByCountry = 24;
    static currencyByWizardItems = 25;
    static invoicePaymentType = 26;
    static dataEntryLots = 27;
    static vat = 28;
    static widgetType = 29;
    static moduleItems = 30;
    static personType = 31;
    static meansOfPayment = 32;

    //------------------------------------------
    static treeMediaType = 'TreeMediaType';
    static additionalCosts_CostType = 'AdditionalCosts_CostType';
    static businessCosts_CostType = 'BusinessCosts_CostType';
    static scanDispatcherDataEntryCenter = 'ScanDispatcherDataEntryCenter';
    static orderType = 'orderType';
    static orderBy = 'orderBy';
    static repSalesCampaignCatalogPageType = 'repSalesCampaignCatalogPageType';
    static repSalesCampaignCatalogType = 'repSalesCampaignCatalogType';
    static repSalesCampaignCatalogFormat = 'repSalesCampaignCatalogFormat';
    static sendToAdminReason = 'SendToAdminReason';
    static repAppSystemColumnNameTemplate = 'repAppSystemColumnNameTemplate';
    static countryLanguageCode = 'CountryLanguageCode';
    static campaign = 'Campaign';
    static personBusinessTitle = 'PersonBusinessTitle';
    static chartDataSourceObject = 'ChartDataSourceObject';
    static orderProcessingListOrdersFilter = 'orderProcessingListOrdersFilter';
    static orderProcessingListOrders = 'orderProcessingListOrders';
    static documentType = 'DocumentType';
    static mainMenu = 'MainMenu';
    static comboBoxType = 'ComboBoxType';
}

@Injectable()
export class MenuModuleId {
    static base = -1;
    static processing = 1;
    static contact = 2;
    static invoice = 3;
    static campaign = 4;
    static briefe = 5;
    static businessCosts = 6;
    static orderDataEntry = 7;
    static statistic = 8;
    static tools = 9;
    static selection = 10;
    static broker = 11;
    static cashProvider = 12;
    static desktopProvider = 13;
    static freightProvider = 14;
    static mandant = 15;
    static principal = 16;
    static postProvider = 17;
    static printProvider = 18;
    static provider = 19;
    static scanCenter = 20;
    static serviceProvider = 21;
    static Supplier = 22;
    static Warehouse = 23;
    static blockedOrder = 24;
    static dataExport = 25;
    static doublette = 26;
    static logistic = 27;
    static orders = 28;
    static returnRefund = 29;
    static purchase = 30;
    static stockCorrection = 31;
    static warehouseMovement = 32;
    static cCPRNManager = 33;
    static checkConfirm = 34;
    static tracksSetup = 35;
    static scanManagement = 36;
    static doubletCheckTool = 37;
    static systemManagement = 38;
    static statistisReport = 39;
    static toolsAddOn = 40;
    static campaignAddOn = 41;
    static selectionCampaign = 97;
    static selectionBroker = 98;
    static selectionCollect = 99;
    static orderProcessing = 43;
    static document = 42;
    static scanningInput = 44;
    static importUpload = 45;
    static export = 46;
    static cloud = 47;
    static userGuide = 48;
    static oneDrive = 49;
    static history = 50;
    static allDocuments = 51;
    static contract = 52;
    static otherdocuments = 53;
    static toDoDocument = 54;
    static changePassword = 55;
    static userManagement = 58;
    static formBuilder = 59;
    static email = 60;
    static invoiceApproval = 61;
    static invoiceApprovalProcessing = 62;
    static invoiceApprovalRejected = 66;

    static invoiceApprovalMain = 100;
    static userV2 = 101;
    static indexing = 102;
    static company = 103;
    static preissChild = 104;
}

@Injectable()
export class ModuleType {
    static PARKED_ITEM = 'ParkedItem';
    static WIDGET_TOOLBAR = 'WidgetToolbar';
    static LAYOUT_SETTING = 'LayoutSetting';
    static GLOBAL_PROPERTIES = 'GlobalProps';
}

@Injectable()
export class ArticleTabFieldMapping {
    static isSetArticle = 'ArticleSet';
    static isWarehouseControl = 'Warehouses';
    static isVirtual = 'Virtual';
}

@Injectable()
export class MessageModal {
    static MessageType = class {
        static error = 'error';
        static warning = 'warning';
        static success = 'success';
        static confirm = 'confirm';
        static information = 'information';
        static info = 'info';
        static notice = 'notice';
    };
    static ModalSize = class {
        static large = 'large';
        static middle = 'middle';
        static small = 'small';
    };
    static ButtonType = class {
        static default = 'default';
        static primary = 'primary';
        static success = 'success';
        static info = 'info';
        static warning = 'warning';
        static danger = 'danger';
        static link = 'link';
    };
}

@Injectable()
export class ModuleTabCombineNameConstant {
    static AdContact = '1-Contact';
    static AdPaymentAccount = '1-PaymentAccount';
    static CustomerContact = '2-Contact';
    static CustomerBDAddress = '2-BDAddress';
}

export class ControlType {
    static Numeric = 'numeric';
    static Textbox = 'textbox';
    static TextboxMask = 'textboxMask';
    static Checkbox = 'checkbox';
    static ComboBox = 'combobox';
    static ComboBoxTable = 'comboboxtable';
    static ComboBoxMultiSelect = 'comboboxmultiselect';
    static DateTimePicker = 'datetimepicker';
    static Button = 'button';
}

export class FormSaveEvenType {
    static Successfully = 'Successfully';
    static Fail = 'Fail';
}

export class DispatcherMode {
    static Pool = 'SelectPool';
    static Dispatcher = 'SelectDispatcher';
}

export class AddressFormatConstant {
    public static Street = 'Street';
    public static StreetNr = 'StreetNr';
    public static Addition = 'Addition';
    public static CountryAddition = 'CountryAddition';
    public static NameAddition = 'NameAddition';
    public static StreetAddition1 = 'StreetAddition1';
    public static StreetAddition2 = 'StreetAddition2';
    public static StreetAddition3 = 'StreetAddition3';
    public static PoboxLabel = 'PoboxLabel';
    public static POBOX = 'POBOX';
    public static Place = 'Place';
    public static Area = 'Area';
    public static Zip = 'Zip';
    public static Zip2 = 'Zip2';
    public static CountryCode = 'CountryCode';
}

export enum MouseEvent {
    None = 'none',
    Click = 'click',
    Hover = 'hover',
    Always = 'always',
}

export enum FileUploadModuleType {
    BusinessCost = 0,
    Campaign = 1,
    ToolsFileTemplate = 2,
}

export enum FilterModeEnum {
    ShowAll = 0,
    HasData = 1,
    EmptyData = 2,
    ShowAllWithoutFilter = 3,
}

export enum TabButtonsEnum {
    New = 1,
    Edit = 2,
    Cancel = 3,
}

export enum MainNotificationTypeEnum {
    All = 0,
    Feedback = 1,
    SendToAdmin = 2,
}

export enum NotificationStatusEnum {
    All = 0,
    New = 1,
    Archive = 2,
}

export enum WidgetLayoutSettingModeEnum {
    FullWidth = 0,
    FullHeight = 1,
    FullPage = 2,
    Resizable = 3,
}

export enum OrderDataEntryWidgetLayoutModeEnum {
    Inline = 1,
    InTab = 2,
}

export enum WidgetFormTypeEnum {
    List = 0,
    Group = 1,
}

export enum TranslateModeEnum {
    All = 1,
    WidgetOnly = 2,
}

export enum OrderByModeEnum {
    Default = 1,
    WidgetOnly = 2,
}

export enum TranslateDataTypeEnum {
    Label = 1,
    Data = 2,
}

export enum RequestSavingMode {
    SaveOnly = 0,
    SaveAndNew = 1,
    SaveAndClose = 2,
    SaveAndNext = 3,

    OPStoreTemporarily = 4,
    OPSaveAndRunAsPrint = 5,
    OPSaveAndRunAsEmail = 6,
}

export enum EditWidgetTypeEnum {
    Form = 1,
    Table = 2,
    Country = 3,
    TreeView = 4,
    EditableAddNewRow = 5,
    EditableDeleteRow = 6,
    InPopup = 7,
}

export enum SavingWidgetType {
    Form = 0,
    EditableTable = 1,
    Combination = 2,
    CombinationCreditCard = 3,
    Country = 4,
    TreeView,
    FileExplorer,
    FileExplorerWithLabel,
    FileTemplate = 27,
}

export enum SplitterDirectionMode {
    Horizontal = 0,
    Vertical = 1,
}

export enum UploadFileMode {
    Other = 0,
    ArticleMedia = 1,
    Profile = 2,
    Notification = 3,
    Template = 4,
    Printing = 5,
    Path = 6,
    General = 7,
    ArticleMediaZipImport = 8,
    ODEFailed = 9,
    Inventory = 10,
    Customer = 11,
    FileExplorer = 13,
}

@Injectable()
export class ReplaceString {
    static JsonText = '<<JSONText>>';
    static SubInputParameter = '<<SubInputParameter>>';
}

export enum SalesCampaignType {
    Master = 1,
    Asile = 2,
    Inter = 3,
    Tracks = 4,
}

export enum ApiMethodResultId {
    None = 0,
    Success = 1,
    RecordAlreadyExists = 50,
    RecordAlreadyExistsWarning = 406,
    InternalServerError = 500,
    AuthorizationFailure = 511,
    UpdateFailure = 512,
    InactiveStatus = 513,
    RecordNotFound = 514,
    UnexpectedErrorInsertingData = 515,
    UnexpectedErrorUpdatingData = 517,
    MaxPasswordAttempts = 518,
    InvalidPassword = 519,
    DuplicateNameIsNotAllowed = 523,
    InvalidUser = 525,
    DeleteFailure = 529,
    InvalidWidget = 530,
    InvalidWidgetMethod = 531,
    InvalidLanguage = 532,
    InvalidMethod = 533,
    InvalidAuthorizedDataAccess = 539,
    InvalidApp = 540,
    SqlConnectionError = 998,
    UnexpectedError = 999,
}

@Injectable()
export class StoreStringCall {
    static StoreWidgetRequestMediaCodeMain = `{
		"Request":
		{
			"ModuleName"	: "GlobalModule",
			"ServiceName"	: "GlobalService",
			"Data":
			"{
				\\"MethodName\\"	: \\"SpAppWg001Campaign\\",

				\\"CrudType\\"		: null,
				\\"Object\\" : \\"MediaCodeMain\\",
				\\"Mode\\" : null,


				\\"WidgetTitle\\" : \\"MediaCode Main\\",
				\\"IsDisplayHiddenFieldWithMsg\\" : \\"1\\",
				<<LoginInformation>>,
				<<InputParameter>>
			}"
		}
	}`;
    static StoreWidgetRequestMediaCodeDetail = `{
		"Request":
		{
			"ModuleName"	: "GlobalModule",
			"ServiceName"	: "GlobalService",
			"Data":
			"{
				\\"MethodName\\"	: \\"SpAppWg001Campaign\\",

				\\"CrudType\\"		: null,
				\\"Object\\" : \\"MediaCodeDetail\\",
				\\"Mode\\" : null,


				\\"WidgetTitle\\" : \\"MediaCode Detail\\",
				\\"IsDisplayHiddenFieldWithMsg\\" : \\"1\\",
				<<LoginInformation>>,
				<<InputParameter>>
			}"
		}
	}`;
}

export class LocalSettingKey {
    static LANGUAGE = 'language';
    static SET_LANGUAGE_MODE = 'setLanguageMode';
}

@Injectable()
export class TabButtonActionConst {
    static FIRST_LOAD = 'FIRST_LOAD';
    static CHANGE_PARKED_ITEM_FROM_MAIN_TAB = 'CHANGE_PARKED_ITEM_FROM_MAIN_TAB';
    static CHANGE_PARKED_ITEM_FROM_OTHER_TAB = 'CHANGE_PARKED_ITEM_FROM_OTHER_TAB';
    static CHANGE_SEARCH_RESULT_FROM_MAIN_TAB = 'CHANGE_SEARCH_RESULT_FROM_MAIN_TAB';
    static CHANGE_SEARCH_RESULT_FROM_OTHER_TAB = 'CHANGE_SEARCH_RESULT_FROM_OTHER_TAB';
    static BEFORE_NEW_MAIN_TAB = 'BEFORE_NEW_MAIN_TAB';
    static BEFORE_NEW_OTHER_TAB = 'BEFORE_NEW_OTHER_TAB';
    static NEW_MAIN_TAB = 'NEW_MAIN_TAB';
    static NEW_MAIN_TAB_AND_CHANGE_MODULE = 'NEW_MAIN_TAB_AND_CHANGE_MODULE';
    static NEW_OTHER_TAB = 'NEW_OTHER_TAB';
    static NEW_OTHER_TAB_AND_CHANGE_MODULE = 'NEW_OTHER_TAB_AND_CHANGE_MODULE';
    static BEFORE_EDIT_MAIN_TAB = 'BEFORE_EDIT_MAIN_TAB';
    static BEFORE_EDIT_OTHER_TAB = 'BEFORE_EDIT_OTHER_TAB';
    static EDIT_MAIN_TAB = 'EDIT_MAIN_TAB';
    static EDIT_MAIN_TAB_AND_CHANGE_MODULE = 'EDIT_MAIN_TAB_AND_CHANGE_MODULE';
    static EDIT_OTHER_TAB = 'EDIT_OTHER_TAB';
    static EDIT_OTHER_TAB_AND_CHANGE_MODULE = 'EDIT_OTHER_TAB_AND_CHANGE_MODULE';
    static BEFORE_CLONE_MAIN_TAB = 'BEFORE_CLONE_MAIN_TAB';
    static BEFORE_CLONE_OTHER_TAB = 'BEFORE_CLONE_OTHER_TAB';
    static CLONE_MAIN_TAB = 'CLONE_MAIN_TAB';
    static CLONE_MAIN_TAB_AND_CHANGE_MODULE = 'CLONE_MAIN_TAB_AND_CHANGE_MODULE';
    static CLONE_OTHER_TAB = 'CLONE_OTHER_TAB';
    static CLONE_OTHER_TAB_AND_CHANGE_MODULE = 'CLONE_OTHER_TAB_AND_CHANGE_MODULE';
    static SAVE_AND_CLOSE_MAIN_TAB = 'SAVE_AND_CLOSE_MAIN_TAB';
    static SAVE_AND_CLOSE_OTHER_TAB = 'SAVE_AND_CLOSE_OTHER_TAB';
    static SAVE_AND_NEW_MAIN_TAB = 'SAVE_AND_NEW_MAIN_TAB';
    static SAVE_AND_NEW_OTHER_TAB = 'SAVE_AND_NEW_OTHER_TAB';
    static SAVE_AND_NEXT = 'SAVE_AND_NEXT';
    static SAVE_AND_NEXT_SECOND_STEP = 'SAVE_AND_NEXT_SECOND_STEP';
    static SAVE_ONLY_MAIN_TAB = 'SAVE_ONLY_MAIN_TAB';
    static SAVE_ONLY_OTHER_TAB = 'SAVE_ONLY_OTHER_TAB';
    static SAVE_ORDER_DATA_ENTRY = 'SAVE_ORDER_DATA_ENTRY';
    static SAVE_ORDER_DATA_ENTRY_AND_CHANGE_TAB = 'SAVE_ORDER_DATA_ENTRY_AND_CHANGE_TAB';
    static SAVE_ORDER_DATA_ENTRY_AND_REMOVE_TAB = 'SAVE_ORDER_DATA_ENTRY_AND_REMOVE_TAB';
    static SAVE_ORDER_DATA_ENTRY_AND_RELOAD = 'SAVE_ORDER_DATA_ENTRY_AND_RELOAD';
    static EDIT_AND_SAVE_AND_CLOSE_MAIN_TAB = 'EDIT_AND_SAVE_AND_CLOSE_MAIN_TAB';
    static EDIT_AND_SAVE_AND_CLOSE_OTHER_TAB = 'EDIT_AND_SAVE_AND_CLOSE_OTHER_TAB';
    static EDIT_AND_SAVE_ONLY_MAIN_TAB = 'EDIT_AND_SAVE_ONLY_MAIN_TAB';
    static EDIT_AND_SAVE_ONLY_OTHER_TAB = 'EDIT_AND_SAVE_ONLY_OTHER_TAB';
    static EDIT_AND_SAVE_AND_NEXT_MAIN_TAB = 'EDIT_AND_SAVE_AND_NEXT_MAIN_TAB';
    static EDIT_AND_SAVE_AND_NEXT_OTHER_TAB = 'EDIT_AND_SAVE_AND_NEXT_OTHER_TAB';
    static EDIT_AND_SAVE_AND_NEXT_SECOND_STEP = 'EDIT_AND_SAVE_AND_NEXT_SECOND_STEP';
    static CHANGE_TAB = 'CHANGE_TAB';
    static RELOAD_ORDER_DATA_ENTRY = 'RELOAD_ORDER_DATA_ENTRY';
    static REMOVE_TAB = 'REMOVE_TAB';
    static CREATE_NEW_FROM_MODULE_DROPDOWN = 'CREATE_NEW_FROM_MODULE_DROPDOWN';
    static CHANGE_MODULE = 'CHANGE_MODULE';
    static CHANGE_SUB_MODULE = 'CHANGE_SUB_MODULE';
    static BEFORE_CLOSE = 'BEFORE_CLOSE';
    static EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP = 'EDIT_MAIN_TAB_AND_GO_TO_FIRST_STEP';
    static EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP = 'EDIT_MAIN_TAB_AND_GO_TO_SECOND_STEP';
    static EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP = 'EDIT_OTHER_TAB_AND_GO_TO_FIRST_STEP';
    static EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP = 'EDIT_OTHER_TAB_AND_GO_TO_SECOND_STEP';
    static EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW = 'EDIT_MAIN_TAB_AND_CHANGE_BUSINESS_COST_ROW';
    static EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW = 'EDIT_OTHER_TAB_AND_CHANGE_BUSINESS_COST_ROW';
    static BEFORE_EDIT_SIMPLE_TAB = 'BEFORE_EDIT_SIMPLE_TAB';
    static BEFORE_CLONE_SIMPLE_TAB = 'BEFORE_CLONE_SIMPLE_TAB';
    static EDIT_SIMPLE_TAB = 'EDIT_SIMPLE_TAB';
    static CLONE_SIMPLE_TAB = 'CLONE_SIMPLE_TAB';
    static EDIT_AND_SAVE_AND_CLOSE_SIMPLE_TAB = 'EDIT_AND_SAVE_AND_CLOSE_SIMPLE_TAB';
    static REFRESH_TAB = 'REFRESH_TAB';

    static SAVE_AND_NEXT_STEP_SELECT_PROJECT = 'SAVE_AND_NEXT_STEP_SELECT_PROJECT';
    static SAVE_AND_NEXT_STEP_COUNTRY = 'SAVE_AND_NEXT_STEP_COUNTRY';
    static SAVE_AND_NEXT_STEP_DATABASE = 'SAVE_AND_NEXT_STEP_DATABASE';
    static SAVE_AND_NEXT_STEP_LOGIC_BLACKLIST = 'SAVE_AND_NEXT_STEP_LOGIC_BLACKLIST';
    static SAVE_AND_NEXT_STEP_LOGIC_AGE_FILTER = 'SAVE_AND_NEXT_STEP_LOGIC_AGE_FILTER';
    static SAVE_AND_NEXT_STEP_LOGIC_EXTENDED_FILTER = 'SAVE_AND_NEXT_STEP_LOGIC_EXTENDED_FILTER';
    static SAVE_AND_NEXT_STEP_LOGIC_GROUP_PRIORITY = 'SAVE_AND_NEXT_STEP_LOGIC_GROUP_PRIORITY';
    static SAVE_AND_NEXT_STEP_FREQUENCIES = 'SAVE_AND_NEXT_STEP_FREQUENCIES';
    static SAVE_AND_NEXT_STEP_EXPORT = 'SAVE_AND_NEXT_STEP_EXPORT';
    static SAVE_AND_NEXT_STEP_FINALIZE = 'SAVE_AND_NEXT_STEP_FINALIZE';

    static EDIT_MAIN_TAB_AND_OP_STORE_TEMPORARILY = 'EDIT_MAIN_TAB_AND_OP_STORE_TEMPORARILY';
    static NEW_MAIN_TAB_AND_OP_STORE_TEMPORARILY = 'NEW_MAIN_TAB_AND_OP_STORE_TEMPORARILY';
    static EDIT_OTHER_TAB_AND_OP_STORE_TEMPORARILY = 'EDIT_OTHER_TAB_AND_OP_STORE_TEMPORARILY';
    static NEW_OTHER_TAB_AND_OP_STORE_TEMPORARILY = 'NEW_OTHER_TAB_AND_OP_STORE_TEMPORARILY';

    static EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT = 'EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT';
    static NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT = 'NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT';
    static EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT = 'EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT';
    static NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT = 'NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_PRINT';

    static EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL = 'EDIT_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL';
    static NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL = 'NEW_MAIN_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL';
    static EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL = 'EDIT_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL';
    static NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL = 'NEW_OTHER_TAB_AND_OP_SAVE_AND_RUN_AS_EMAIL';
}

@Injectable()
export class PaymentMethod {
    static CHECK = 2;
    static CREDIT_CARD = 3;
}

@Injectable()
export class OrderSummaryFilterConst {
    static DAY = 'Day';
    static WEEK = 'Week';
    static MONTH = 'Month';
    static BY_DATE = 'ByDate';
    static SEND_TO_ADMIN = 'SendToAdmin';
}

@Injectable()
export class DateConfiguration {
    static FILTERDATA = [
        {
            type: OrderSummaryFilterConst.DAY,
            title: 'Today',
            subTitle: null,
            icon: 'fa-calendar-o',
            count: 0,
            loading: false,
            selected: false,
        },
        {
            type: OrderSummaryFilterConst.WEEK,
            title: 'This week',
            subTitle: null,
            icon: 'fa-calendar-check-o',
            count: 0,
            loading: false,
            selected: false,
        },
        {
            type: OrderSummaryFilterConst.MONTH,
            title: 'This month',
            subTitle: null,
            icon: 'fa-calendar',
            count: 0,
            loading: false,
            selected: false,
        },
        {
            type: OrderSummaryFilterConst.BY_DATE,
            title: 'By date',
            icon: 'fa-calendar-minus-o',
            count: 0,
            loading: false,
            selected: false,
        },
        {
            type: OrderSummaryFilterConst.SEND_TO_ADMIN,
            title: 'Send to admin',
            icon: 'fa-share-square-o',
            count: 0,
            loading: false,
            selected: false,
        },
    ];
    static WEEK_DAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    static SCHEDULE_TYPE = ['OneTime', 'Daily', 'Weekly', 'Monthly', 'Annual'];
    static SCHEDULE_JSON_NAME = ['JHours', 'JDays', 'JWeeks', 'JMonths', 'JYears'];
}

@Injectable()
// TODO: must re-render Id list from database when go live
export class RepWidgetAppIdEnum {
    static CustomerDetail = 2;
    static ContactTable = 5;
    static CustomerContactDetail = 7;
    static CustomerCommunitionTable = 10;
    static AdministrationDetail = 13;
    static PersonDetail = 14;
    static AdministrationContactDetail = 15;
    // static ContactTable = 16;
    static MainCommunitionTable = 17;
    static TestEditTable = 19;
    static CashProviderDetail = 20;
    static CashProviderTable = 22;
    static CCPRNTable = 23;
    static CCPRNDetail = 24;
    static ProviderCostDetail = 25;
    static ProviderCostTable = 26;
    static MainArticleDetail = 27;
    static TranslationWidget = 28;
    static MainInvolvedCampaignTable = 29;
    static ArticleSet = 30;
    static ArticleSetDetail = 31;
    // static TranslationWidget = 32;
    static ContactCommunitionTable = 33;
    static ArticlePurchasingTable = 34;
    static CountryWidgetDetail = 35;
    // static ContactCommunitionTable = 36;
    static ArticleWarehouses = 37;
    static ArticleWarehousesmovement = 38;
    static ArticleJournal = 39;
    static UploadWidget = 40;
    static ArticleMediaWidget = 41;
    static ArticleCategories = 42;
    static ArticleMeasurement = 43;
    static CampaignCountriesTable = 44;
    static MediaCodeMain = 45;
    static MediaCodeDetail = 46;
    static CampaignArticle = 47;
    static CampaignArticleCountries = 48;
    static MediaCodeAdvertising = 49;
    static CampaignTracks = 50;
    static CampaignTracksCountries = 51;
    static CampaignCatalog = 52;
    static BusinessCostDetail = 53;
    static RowDetail = 54;
    static CustomerOrder = 55;
    // static CustomerDetail = 56;
    // static CustomerCommunitionTable = 57;
    static ArticleSetInvolvedCampaignTable = 58;
    static FileAttachement = 59;
    static CustomerDataEntry = 60;
    static OrderDataEntry = 61;
    static CustomerCommunicationDataEntry = 62;
    static ArticleGrid = 63;
    static CustomerAddress = 64;
    static OrderTotalSummary = 65;
    static ImageZoomer = 66;
    static ScanningStatus = 67;
    static PaymentType = 68;
    // static TranslationWidget = 69;
    // static TranslationWidget = 70;
    // static TranslationWidget = 71;
    // static TranslationWidget = 72;
    static CustomerHistory = 73;
    static NewInvoice = 74;
    // static CustomerOrder = 75;
    static OrderByCategory = 76;
    static ReturnPaymentWidget = 77;
    static GetInvoiceNumber = 78;
    static PaymentDetails = 79;
    static ArticleDetails = 80;
    static ArticleOrder = 81;
    static BlockOderbyCategory = 84;
    static RefundInfo = 85;
    static BlockOder = 86;
    static OrderDetail = 87;
    static PaymentDetail = 88;
    static ArticleDetail = 89;
    static TableWarehouseMovement = 90;
    static WarehouseMovementDetail = 91;
    static MovedArticle = 92;
    static ArrivedArticle = 93;
    static StockArticle = 94;
    static Cost = 95;
    static FileExplorer = 96;
    static ArticleHistory = 97;
    static Doublette = 98;
    static StockCorrectionDetail = 99;
    static StockCorrectionTable = 100;
    static OrderSummary = 101;
    static OrderListSummary = 102;
    static ArticleSalesTable = 103;
    static UserList = 104;
    static RepositoryDetail = 107;

    static MailingParameters = 111;
    static ProductParameter = 112;
    static GlobalParameter = 113;
    static PostShippingCosts = 114;

    static FilterCondition = 121;
    static RecentStatistic = 123;
    static CustomerDoublette = 124;
    static OrderDetailDataEntry = 125;
    static PrinterControl = 126;
    static CountryCustomerDoublette = 144;
    static EditCustomerDetail = 152;
    static DocumentAssignment = 153;
    static ArticleOrderDetail = 155;
    static ChartWidget = 170;
}

@Injectable()
export class UpdatePasswordResultMessageEnum {
    static INVALID = 'Invalid Password';
    static FAILED = 'Failed';
    static SUCCESS = 'Successfully';
}

@Injectable()
export class LocalStorageKey {
    static OrderDataEntry_FormControlValue: string = 'ODE-FormValue';
    static LocalStorageGSTabKey = '__gs.tab';
    static LocalStorageGSModuleKey = '__gs.module';
    static LocalStorageGSStepKey = '__gs.step';
    static LocalStorageGSParkedItemsKey = '__gs.parkedItems';
    static LocalStorageGSModuleSettingKey = '__gs.moduleSetting';
    static LocalStorageGSFields = '__gs.fields';
    static LocalStorageGSFieldCondition = '__gs.fieldCondition';
    static LocalStorageGSProcessDataKey = '__gs.processData';
    static LocalStorageWidgetActionKey = '__widget.action';
    static LocalStorageWidgetContentDetailKey = '__widget.widgetContentDetail';
    static LocalStorageWidgetPropertyKey = '__widget.widgetProperty';
    static LocalStorageWidgetTempPropertyKey = '__widget.widgetTempProperty';
    static LocalStorageWidgetOriginalPropertyKey = '__widget.widgetOriginalProperty';
    static LocalStorageWidgetRowDataFromPopup = '__widget.rowDataFromPopup';

    static LocalStorageGSCaptureSearchText = '__gs.captureSearchText';
    static LocalStorageGSCaptureSearchModule = '__gs.captureSearchModule';
    static LocalStorageActiveModule = '__gs.activeModule';

    static LocalStorageOneDriveToken = 'oneDrive.token';

    static LocalStorageContextMenuClipBoard = '__contextmenu.clipboard';

    static buildKey(key1: string, key2: string) {
        return key1 + ':' + key2;
    }
}

export enum AccessRightTypeEnum {
    Module = 'Module',
    SubModule = 'SubModule',
    Tab = 'Tab',
    Widget = 'Widget',
    WidgetMenuStatus = 'WidgetMenuStatus',
    AdditionalInfo = 'AdditionalInfo',
    ParkedItem = 'ParkedItem',
    TabButton = 'TabButton',
    WidgetButton = 'WidgetButton',
}

export enum AccessRightKeyEnum {
    SettingMenu__Menu_Skin = 'AR__SettingMenu__Menu_Skin',
    SettingMenu__Menu_GlobalSetting = 'AR__SettingMenu__Menu_GlobalSetting',
    SettingMenu__Menu_WidgetCustomization = 'AR__SettingMenu__Menu_WidgetCustomization',
    SettingMenu__Menu_DesignPageLayout = 'AR__SettingMenu__Menu_DesignPageLayout',
    SettingMenu__Menu_ApplyWidgetSetting = 'AR__SettingMenu__Menu_ApplyWidgetSetting',
}

export enum AccessRightWidgetCommandButtonEnum {
    ToolbarButton = 'ToolbarButton',
    // ToolbarButton__EditButton = 'ToolbarButton__EditButton',
    ToolbarButton__TranslateButton = 'ToolbarButton__TranslateButton',
    ToolbarButton__PrintButton = 'ToolbarButton__PrintButton',
    ToolbarButton__UploadButton = 'ToolbarButton__UploadButton',
    ToolbarButton__EditTemplateButton = 'ToolbarButton__EditTemplateButton',
    // ToolbarButton__DeleteFileButton = 'ToolbarButton__DeleteFileButton',
    SettingButton = 'SettingButton',
    SettingButton__ShowDataSettingMenu = 'SettingButton__ShowDataSettingMenu',
    SettingButton__SettingMenu = 'SettingButton__SettingMenu',
    SettingButton__DetailMenu = 'SettingButton__DetailMenu',
    SettingButton__DetailMenu__ShowDataSettingMenu = 'SettingButton__DetailMenu__ShowDataSettingMenu',
    SettingButton__DetailMenu__SettingMenu = 'SettingButton__DetailMenu__SettingMenu',
    SettingButton__TableMenu = 'SettingButton__TableMenu',
    SettingButton__TableMenu__ShowDataSettingMenu = 'SettingButton__TableMenu__ShowDataSettingMenu',
    SettingButton__TableMenu__SettingMenu = 'SettingButton__TableMenu__SettingMenu',
}

export enum AccessRightParkedItemActionEnum {
    DisplayFieldPanel = 'DisplayFieldPanel',
    DisplayFieldPanel__DeleteAllButton = 'DisplayFieldPanel__DeleteAllButton',
    Edit = 'Edit', //Inluces: Draggable, Droppable, Delete, AddFromGlobalSearch, RemoveFromGlobalSearch

    Draggable = 'Draggable', //change position between items in list
    Droppable = 'Droppable', //drag from Global search into ParkedPanel
    Delete = 'Delete',
    AddFromGlobalSearch = 'AddFromGlobalSearch', //context menu of Global search
    RemoveFromGlobalSearch = 'RemoveFromGlobalSearch', //context menu of Global search
}

export enum PaymentTypeGroupEnum {
    Cash = 1,
    CheQue = 2,
    CreditCard = 3,
}

export enum KeyCode {
    Enter = 13,
    Escape = 27,
}

export enum OrderFailedDataEnum {
    ScanningData = 1,
    Order = 2,
    CustomerData = 3,
    TotalSummaryData = 4,
    PaymentType = 5,
    ArticleGrid = 6, //ArticleGridExportData & ArticleGridCampaignData: Articles used in this campaign
    CommunicationData = 7,
}

export enum QueryObject {
    OrdersRules = 1,
    ExtendRules = 2,
}

@Injectable()
export class RuleEnum {
    static Blacklist = 1;
    static Orders = 2;
    static OrdersGroup = 3;
    static ExtendedRules = 4;
}

@Injectable()
/*
Checking data follow database id with
idRepWidgetApp = 503: Age Filter widget
idRepWidgetApp = 504: Black List widget
idRepWidgetApp = 506: Extended Filter widget
idRepWidgetApp = 507: Group Priority widget

If database change those id that must be updated


Black list = 1
Age Filter = 2
OrdersGroup = 3
ExtendedRules = 4
*/
export class MapFromWidgetAppToFilterId {
    static 503 = 2;
    static 509 = 2;
    static 504 = 1;
    static 506 = 4;
    static 510 = 4;
    static 507 = 3;
}

// When change Id from Database need to change these Items in WidgetApp table.
export enum LogicItemsId {
    AgeFilter = 503,
    CountryBlackList = 504,
    DatabaseCombine = 505,
    ExtendedFilter = 506,
    GroupPriority = 507,
    AgeFilter_Extend = 509,
    ExtendedFilter_Extend = 510,
}

export enum SystemScheduleServiceName {
    OrdersSummary = 1,
    ArticleResidueStatistic = 2,
    WarehouseStatistic = 3,
    PrintingService = 4,
    DoubletService = 5,
    ElasticSearchSyncService = 6,
    RunSchedulerService = 7,
    MediaCodeStatistic = 8,
    MissingWordReport = 9,
    CallStoreProcedureService = 10,
}

export enum PersonTypeIdEnum {
    None = 0,
    Customer = 28,
    Contact = 29,
    Broker = 4,
    CashProvider = 5,
    DesktopProvider = 24,
    FreightProvider = 22,
    Mandant = 1,
    Principal = 2,
    PostProvider = 21,
    PrintProvider = 10,
    Provider = 3,
    ScanCenter = 27,
    ServiceProvider = 6,
    Supplier = 19,
    Warehouse = 7,
}

export enum SignalRTypenEnum {
    WidgetForm = 'WidgetForm',
    ES = 'ES',
    DocumentProcessing = 'DocumentProcessing',
    DocumentProcessingGetList = 'DocumentProcessingGetList',
    Approval = 'Approval',
}

export enum SignalRJobEnum {
    // Wigdet Form Detail
    Editing = 'Editing',
    Disconnected = 'Disconnected',
    DocumentProcessingGetList = 'DocumentProcessingGetList',
    // ES
    ES_ReIndex = 'ES_ReIndex',
    //Approval
    Approval_Invite = 'Approval_Invite',
}

export enum SignalRActionEnum {
    //Wigdet Form Detail
    ConnectEditing = 'ConnectEditing',
    StopEditing = 'StopEditing',
    DisconnectEditing = 'DisconnectEditing',
    IsThereAnyoneEditing = 'IsThereAnyoneEditing',
    SavedSuccessfully = 'SavedSuccessfully',

    //#region [ES_ReIndex]
    ES_ReIndex_Ping = 'ES_ReIndex_Ping', // Call to ping
    ES_ReIndex_ServiceAlive = 'ES_ReIndex_ServiceAlive', // Service keep live
    ES_ReIndex_Start = 'ES_ReIndex_Start', // Call start processing
    ES_ReIndex_StartSuccessfully = 'ES_ReIndex_StartSuccessfully', // Get all indexes that need to process
    ES_ReIndex_Stop = 'ES_ReIndex_Stop', // Call stop processing
    ES_ReIndex_StopSuccessfully = 'ES_ReIndex_StopSuccessfully', // Stop processing and return all indexes
    ES_ReIndex_GetStateOfSyncList = 'ES_ReIndex_GetStateOfSyncList', // Return all indexes
    ES_ReIndex_SyncCompleted = 'ES_ReIndex_SyncCompleted', // Synchronize successfully: Return all indexes
    ES_ReIndex_ShowMessage = 'ES_ReIndex_ShowMessage', // Only show message

    //Actions when synchronizing each Index
    ES_ReIndex_DBProcess = 'ES_ReIndex_DBProcess', // Repair get data from DB each of Index
    ES_ReIndex_DBDisconnect = 'ES_ReIndex_DBDisconnect', // Get data fail
    ES_ReIndex_SyncProcess = 'ES_ReIndex_SyncProcess', // Get data success and start to synchronize
    ES_ReIndex_SyncProcessState = 'ES_ReIndex_SyncProcessState', // Return percent when synchronizing
    ES_ReIndex_SyncProcessFinished = 'ES_ReIndex_SyncProcessFinished', // Synchronization is completed
    //#endregion [ES_ReIndex]

    //region DocumentProcessing
    DocumentProcessing_Ping = 'DocumentProcessing_Ping', // Call to ping
    DocumentProcessing_ServiceAlive = 'DocumentProcessing_ServiceAlive', // Service keep live
    DocumentProcessing_Stop = 'DocumentProcessing_Stop', // Stop
    DocumentProcessing_StopSuccessfully = 'DocumentProcessing_StopSuccessfully', // Stop the process successfully
    DocumentProcessing_GetProcessingList = 'DocumentProcessing_GetProcessingList', // Get processing list
    DocumentProcessing_ProcesssingItem = 'DocumentProcessing_ProcesssingItem', // Processing data
    DocumentProcessing_FailItem = 'DocumentProcessing_FailItem', // Processing data is fail
    DocumentProcessing_SuccessItem = 'DocumentProcessing_SuccessItem', // Processing data is successfully
    DocumentProcessing_Finish = 'DocumentProcessing_Finish', // Processing data is finished
    //#endregion

    //#region Approval
    Approval_Invite_Request = 'Approval_Invite_Request',
    Approval_Invite_Approve = 'Approval_Invite_Approve',
    //#endregion
}

export enum PropertyNameOfWidgetProperty {
    ComboboxStoreObject = 'comboboxStoreObject',
    LinkWidgetTitleId = 'LinkWidgetTitle',
}

export class GridId {
    static MainModuleGlobalSearch = [
        'f254cd5a-da85-4a39-be83-454f1e2beca4',
        'd594c5ae-d43f-4e0a-8e40-61e066bab837',
        'bfdf42aa-81a6-4aa6-bd16-a2ea779de3d0',
        '415f0a43-bd3a-4046-86a0-552a42320e73',
        '307a35a6-5906-467f-8dd6-b2e645dfb62d',
        '326a40b1-136d-4797-97dc-bb826e99c2bd',
        'd42f77a7-10a9-4f9b-8284-806ac55201bb',
        '40f0ba43-183e-4328-b6f6-68d1ec42ee7a',
        'a1e4d2ae-1947-4059-9070-bcea6a0757f2',
        '2713c60d-5164-4813-a55e-84166bb9cd3f',
        '9cacf7e2-3ae7-4f89-9237-1eb4a8dad240',
        'b9cdd041-0a34-476b-a52a-767e62d93f94',
        '29442b0b-39e7-424c-b94b-75deee7a9262',
    ];
    static SubAdminModuleGlobalSearch = [
        '4e0e0a1f-a66f-4d59-827a-965987d006b9',
        'b775746d-0352-4cce-af00-8c201dc45fc1',
        '1a1cbff9-0895-4dc1-a400-c552519f53d1',
        '91226f42-fdaf-4494-88c9-5c1b5104e646',
        '0dfcf9bd-b747-4a40-870c-b8760b2e4298',
        'be6242df-fb85-4399-ba25-702630555664',
        '662295a8-920f-4842-95c8-12850582ef8f',
        '1427a6a6-a1ea-4439-b184-8a5a9239de58',
        '679169ce-5c6c-4b9d-a58e-dd9374b6d156',
        'd419044d-fd2f-46fb-8f44-7141164d68a9',
        'ff800217-fa30-4d6e-9b17-5825a6d35c95',
        'f16c2cc5-9442-4202-a5a5-652a30ca347a',
        'bc217e42-ca1e-4cb7-b828-f33b834eb276',
    ];
    static SelectionCampaignModuleGlobalSearch = [
        '46581465-78a1-4735-8013-2006b52d3493',
        '51bb854d-8b91-47e7-82f1-ff0cde5ad1df',
    ];
    static SelectionBrokerModuleGlobalSearch = [
        'cdd647ed-a7e7-4b0f-b4c7-2cf1d3759d71',
        '8d8bc02c-86ef-425e-a2fc-777ac0c0f24a',
    ];
    static SelectionCollectModuleGlobalSearch = [
        'b964a7b6-f220-44ff-a02c-f233b29609a3',
        'bc95edb9-ef40-4059-a436-8113c7630b62',
    ];
}

export enum RepProcessingTypeEnum {
    Offer = 1,
    Order = 2,
    Invoice = 3,
    AllDocuments = 6,
}

export enum FileViewerType {
    /**
     * Image files
     * * TIFF: Tagged Image File Format
     */
    JPEG = 1,
    JPG,
    PNG,
    GIF,
    TIFF,
    BMP,

    /**
     * Video files
     */
    MP4,
    WebM,
    MPEG4,
    Three3GPP,
    MOV,
    AVI,
    MPEGPS,
    WMV,
    FLV,

    /**
     * Audio files
     */
    MP3,
    WAV,

    /**
     * Text file
     */
    TXT,

    /**
     * Markup/Code
     */
    CSS,
    HTML,
    PHP,
    C,
    CPP,
    H,
    HPP,
    JS,

    /**
     * Microsoft Word
     */
    DOC,
    DOCX,

    /**
     * Microsoft Excel
     */
    XLS,
    XLSX,

    /**
     * Microsoft PowerPoint
     */
    PPT,
    PPTX,

    // Adobe Portable Document Format
    PDF,

    // Apple Pages
    PAGES,

    // Adobe Illustrator
    AI,

    // Adobe Photoshop
    PSD,

    // Autodesk AutoCad
    DXF,

    // Scalable Vector Graphics
    SVG,

    // PostScript
    EPS,
    PS,

    // TrueType
    TFF,

    // XML Paper Specification
    XPS,

    // Archive file types
    ZIP,
    RAR,
}

export enum MimeFileType {
    PDF = 'application/pdf',
    PNG = 'image/png',
    TIFF = 'image/tiff',
    ZIP = 'application/x-zip-compressed',
    JPEG = 'image/jpeg',
    MSG = 'application/vnd.ms-outlook',
    EML = 'message/rfc822',
    MP4 = 'media/*',
    Empty = '',
}

export enum FileGroupType {
    IMAGE = 1,
    VIDEO,
    AUDIO,
    TEXT,
    MARKUP_CODE,
    WORD,
    EXCEL,
    POWERPOINT,
    PDF,
    ARCHIVE,
}

export enum DocumentProcessingTypeEnum {
    INVOICE = 'DOCUMENT_PROCESSING_INVOICE',
    CONTRACT = 'DOCUMENT_PROCESSING_CONTRACT',
    OTHER_DOCUMENT = 'DOCUMENT_PROCESSING_OTHER_DOCUMENT',
    UNKNOWN = 'Unknow',
}

export enum DocumentMyDMType {
    Invoice = 1,
    Contract,
    OtherDocuments,
}

export enum DocumentFormNameEnum {
    WIDGET_INVOICE = 'WidgetInvoice',
    WIDGET_CONTACT = 'WidgetContact',
    WIDGET_NOTES = 'WidgetNotes',
    WIDGET_BANK = 'WidgetBank',
    WIDGET_CONTRACT = 'WidgetContract',
}

export enum DocumentFormContactName {
    MAIN_CONTACT = 'COMPANY',
    SUB_CONTACT = 'PERSONAL',
}

export enum DocumentGroupFieldEnum {
    INVOICE = 'Invoice',
    CONTACT = 'Contact',
    NOTES = 'Notes',
    BANK = 'Bank',
    CONTRACT = 'Contract',
}

export enum DocumentTabIddEnum {
    INVOICE = 'Rechnungsinformationen',
    CONTACT = 'Kontakt',
    NOTES = 'NotizenTags',
    BANK = 'Bank',
    CONTRACT = 'Contract',
}

export enum RepScanDeviceType {
    Scan = 1,
    SmartPhone,
    Upload,
    Email,
}

export enum TreeFolderStructModeEnum {
    VIEW_FOLDER = 1,
    SELECTABLE_FOLDER,
    MANAGE_FOLDER,
}

export class DocumentTreeParams {
    id: string;
    name: string;
}
export const DocumentTreeTypeDisplayName = {
    FAVOURITE: {
        id: 'idRepMyFavorites',
        name: 'myFavorites',
    } as DocumentTreeParams,
    TREE_FOLDER: {
        id: 'idDocumentTree',
        name: 'groupName',
    } as DocumentTreeParams,
};

export const HistoryWidget = {
    COLUMN_NAME: {
        SYNC_STATUS: 'SyncStatus',
        DEVICES: 'Devices',
        CLOUD: 'Cloud',
    },
    SYNC_STATUS: {
        LOADING: 'progres..',
        DONE: 'Ok',
        ERROR: null,
    },
    DEVICES: {
        MOBILE: 'Mobile',
        EMAIL: 'Email',
        WEBSITE: 'Website',
    },
    CLOUD: {
        MY_CLOUD: 'MyCloud',
        GOOGLE_DRIVE: 'GoogleDrive',
        DROP_BOX: 'DropBox',
        ONE_DRIVE: 'OneDrive',
    },
};

export enum ErrorMessageTypeEnum {
    REQUIRED,
    PATTERN_EMAIL,
    PATTERN_PASSWORD,
    PATTERN_FOLDER,
    PASSWORD_NOT_MATCH,
    ERROR_LOGIN,
    CUSTOM_MESSAGE,
}

export const PasswordDisplay = {
    PASSWORD: 'password',
    TEXT: 'text',
};

export enum AuthenType {
    SIGN_IN = 1,
    NEW_PASSWORD = 2,
    RESEND_NEW_PASSWORD = 3,
    RESET_PASSWORD_SUCCESS = 4,
    FORGOT_PASSWORD = 5,
    UPDATE_PASSWORD = 6,
    SIGN_UP = 7,
}

export enum UserRoles {
    PersonalUser = '0',
    MasterAdministration = '1',
    CustomerAdministration = '2',
    User = '3',
}

export const UserRolesDisplayName = {
    PersonalUser: 'Personal User',
    MasterAdministration: 'Main Administrator',
    CustomerAdministration: 'Administrator',
    User: 'User',
};

export const UserStatusConstant = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    FORCE_ACTIVE: 'force Active',
};

export enum FilterOptionsUserEnum {
    Company = 1,
    FullName = 2,
    Email = 3,
    CompanySubmitForm = 4,
    EmailSubmitForm = 5,
}

export enum UpdationUserTab {
    UserInfo = 1,
    Permission = 2,
}

export const CompanyMasterAdminConst = {
    XOONIT: '1',
};

export enum DocumentTypeEnum {
    INVOICE_APPROVAL = 4,
    INVOICE_APPROVAL_PROCESSING = 99,
}

export enum AddonOriginalColumnName {
    IS_TODO = 'IsToDo',
    IS_GUARANTEE = 'IsGuarantee',
    TODO_NOTES = 'ToDoNotes',
    B07MAINDOCUMENT_TODO_NOTES = 'B07MainDocument_ToDoNotes',
    GUARANTEEE_EXPIRY_DATE = 'GuranteeExpiryDate',
}

export const TypeDataSet = {
    DYNAMIC_FORM: 'DynamicForm',
    DATA_TABLE: 'DataTable',
    JSON: 'Json',
};

export const ExtractedMasterDataWidgetType = {
    INVOICE_INFO: 'InvoiceInfo',
    MANDANT: 'Mandant',
    SUPPLIER: 'Supplier',
    CONTACT: 'Contacts',
};

export const ExtractedMasterDataPersonType = {
    MANDANT: 'Mandants',
    SUPPLIER: 'Supplier',
};

export const RoleIdsDisableEdit = [0, 1, 2];

export const IdDocumentTreeConstant = {
    EMAIL: 2,
    INDEXING: 3,
};
export const IdRepDocumentGuiTypeConstant = {
    INDEXING: '5',
    EMAIL: '6',
};
