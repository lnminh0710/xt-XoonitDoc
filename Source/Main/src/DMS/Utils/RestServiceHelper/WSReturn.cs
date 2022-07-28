using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace DMS.Utils
{
    public class WSReturn
    {
        private int? _returnID = -1;
        /// <summary>
        /// ReturnID
        /// </summary>
        public int? ReturnValue { get { return _returnID; } set { if (value != null) _returnID = value; } }

        /// <summary>
        /// SQLMessage
        /// </summary>
        [JsonProperty(PropertyName = "SQL Message")]
        public string SQLMessage { get; set; }

        /// <summary>
        /// Message
        /// </summary>
        public string Message { get; set; }
    }

    public class WSDataReturn
    {
        /// <summary>
        /// Data
        /// </summary>
        public JArray Data { get; set; }

        public WSDataReturn() { }

        public WSDataReturn(JArray data) { Data = data; }
    }

    public class WSCustomerEditReturn
    {
        private string _returnID = "";
        /// <summary>
        /// ReturnID
        /// </summary>
        public string ReturnID
        {
            get
            {
                return _returnID;
            }

            set
            {
                if (!string.IsNullOrEmpty(value))
                    _returnID = value;
            }
        }

        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get; set; }

        /// <summary>
        /// StoredName
        /// </summary>
        public string StoredName { get; set; }

        /// <summary>
        /// Message
        /// </summary>
        public string EventType { get; set; }
    }

    public class WSContactEditReturn
    {
        private string _returnID = "";
        /// <summary>
        /// ReturnID
        /// </summary>
        public string ReturnID
        {
            get
            {
                return _returnID;
            }

            set
            {
                if (!string.IsNullOrEmpty(value))
                    _returnID = value;
            }
        }

        /// <summary>
        /// StoredName
        /// </summary>
        public string StoredName { get; set; }

        /// <summary>
        /// Message
        /// </summary>
        public string EventType { get; set; }
    }

    public class WSEditReturn
    {
        private string _returnID = "";
        /// <summary>
        /// ReturnID
        /// </summary>
        public string ReturnID
        {
            get
            {
                return _returnID;
            }
            set
            {
                if (!string.IsNullOrEmpty(value))
                    _returnID = value;
            }
        }

        /// <summary>
        /// StoredName
        /// </summary>
        public string StoredName { get; set; }

        /// <summary>
        /// Message 
        /// </summary>
        public string EventType { get; set; }

        /// <summary>
        /// SQLStoredMessage
        /// </summary>
        public string SQLStoredMessage { get; set; }

        public string UserErrorMessage { get; set; }

        /// <summary>
        /// ErrorMessage
        /// </summary>
        public string ErrorMessage { get; set; }

        public bool IsSuccess
        {
            get
            {
                return EventType == "Successfully";
            }
        }

        public object Payload { get; set; }

        public string JsonReturnIds { get; set; }

        public bool ShouldSerializeJsonReturnIds()
        {
            return false;
        }

        public bool ShouldSerializeStoredName()
        {
            return false;
        }

        public bool Success()
        {
            if (!IsSuccess || string.IsNullOrEmpty(ReturnID) || ReturnID == "-1")
                return false;

            return true;
        }
    }

    public class WSDataReturnValue
    {
        public string ReturnID { get; set; }
        public string StoredName { get; set; }

        /// <summary>
        /// Message 
        /// </summary>
        public string EventType { get; set; }

        /// <summary>
        /// SQLStoredMessage
        /// </summary>
        public string SQLStoredMessage { get; set; }

        public string TableName { get; set; }

        public bool IsSuccess
        {
            get
            {
                return EventType == "Successfully";
            }
        }
    }


    public class WSNewReturnValue
    {
        public string ReturnID { get; set; }
        public string StoredName { get; set; }

        /// <summary>
        /// Message 
        /// </summary>
        public string EventType { get; set; }

        /// <summary>
        /// SQLStoredMessage
        /// </summary>
        public string UserErrorMessage { get; set; }

        public string WindownMessageType { get; set; }

        public string ForDeveloper { get; set; }
    }

    public class WSAvatarReturnValue : WSNewReturnValue
    {
        public string LoginPicture { get; set; }
    }
}
