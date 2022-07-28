namespace XenaSignalR
{
    public class SignalRMessageModel
    {
        public string IpAddress { get; set; }
        public string Message { get; set; }
        public string UserName { get; set; }
        public object Data { get; set; }
        public string Type { get; set; }
        public string Job { get; set; }
        public string Action { get; set; }
    }

    public enum SignalRActionEnum
    {
        #region ES_ReIndex
        //ES_ReIndex
        ES_ReIndex_Ping, // Call to ping
        ES_ReIndex_ServiceAlive, // Service keep live

        ES_ReIndex_Start, // Call start processing
        ES_ReIndex_StartSuccessfully, // Get all indexes that need to process
        ES_ReIndex_Stop, // Call stop processing
        ES_ReIndex_StopSuccessfully,// Stop processing and return all indexes
        ES_ReIndex_GetStateOfSyncList,// Return all indexes
        ES_ReIndex_SyncCompleted,// Synchronize successfully: Return all indexes
        ES_ReIndex_ShowMessage,

        // Actions when synchronizing each Index
        ES_ReIndex_DBProcess,// Repair get data from DB each of Index
        ES_ReIndex_DBDisconnect,  // Get data fail
        ES_ReIndex_SyncProcess,// Get data success and start to synchronize
        ES_ReIndex_SyncProcessState,// Return percent when synchronizing
        ES_ReIndex_SyncProcessFinished,// Sync one Index Finished
        #endregion

        #region MatchingData
        MatchingData_Ping, // Call to ping
        MatchingData_ServiceAlive, // Service keep live

        MatchingData_Start, // Start the matching data
        MatchingData_StartSuccessfully, // Start the matching data successfully
        MatchingData_Stop, // Start the matching data
        MatchingData_StopSuccessfully, // Stop the process successfully
        MatchingData_GetProcessingList, // Get processing list

        MatchingData_Processsing, // Processing data
        //MatchingData_Disconnect, // Disconect processing
        MatchingData_Fail, // Processing data is fail
        MatchingData_Success, // Processing data is successfully
        MatchingData_Finish, // Processing data is finished
        #endregion

        #region Import Data Matrix
        ImportDataMatrix_Ping, // Call to ping
        ImportDataMatrix_ServiceAlive, // Service keep live
        ImportDataMatrix_Start, // Start the matching data
        ImportDataMatrix_StartSuccessfully, // Start successfully the matching data
        ImportDataMatrix_Stop, // Start the matching data
        ImportDataMatrix_StopSuccessfully, // Stop the process successfully
        ImportDataMatrix_GetProcessingList, // Get processing list
        ImportDataMatrix_Processsing, // Processing data
        ImportDataMatrix_Fail, // Processing data is fail
        ImportDataMatrix_Success, // Processing data is successfully
        ImportDataMatrix_Finish, // Processing data is finished    
        #endregion

        #region Approval
        Approval_Invite_Request, // Request
        Approval_Invite_Approve, // Approve
        #endregion
    }

    public class ESignalRMessageType
    {
        public const string ES = "ES";
        public const string OCR = "OCR";
        public const string Import = "Import";
        public const string Approval = "Approval";
    }

    public class ESignalRMessageJob
    {
        public const string ES_ReIndex = "ES_ReIndex";
        public const string MatchingData = "MatchingData";
        public const string ImportDataMatrix = "ImportDataMatrix";
        public const string Approval_Invite = "Approval_Invite";
    }
}
