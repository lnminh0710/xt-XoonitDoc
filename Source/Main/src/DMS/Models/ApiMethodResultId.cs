namespace DMS.Models
{
    /// <summary>
    /// ApiMethodResultId
    /// </summary>
    public enum ApiMethodResultId
    {
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
        InvaldRequest = 400
    }
}
