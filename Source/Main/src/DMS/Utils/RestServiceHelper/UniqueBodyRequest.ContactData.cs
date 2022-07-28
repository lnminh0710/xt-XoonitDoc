using DMS.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class SaveContactData : Data
    {
        public string JSONPersonData { get; set; }
        public string JSONPersonComms { get; set; }
        public string CallAppModus { get; set; }
        public string IdPerson { get; set; }
    }

    public class GetContactData : Data
    {
    }

    public class GetCommunicationData : Data
    {
    }

    public class GetCapturedContactDocumentDetail : Data
    {
        public int IdPerson { get; set; }
    }

    public class SaveNewContactData
    {
        public IList<string> IgnoredKeys { get; set; }
        public Data BaseData { get; set; }
        public Dictionary<string, object> Data { get; set; }

        public PersonContactModel SharingContact { get; set; }

        public SaveNewContactData()
        {
            IgnoredKeys = new List<string>();
        }

        public PersonContactFormModel PersonRemitter { get; set; }
        public PersonContactFormModel PersonBeneficiary { get; set; }

        [JsonIgnore]
        public object PersonBeneficiaryComm { get; internal set; }

        [JsonIgnore]
        public object PersonRemitterComm { get; internal set; }
    }
}
