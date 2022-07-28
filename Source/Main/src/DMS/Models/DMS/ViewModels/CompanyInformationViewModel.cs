using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace DMS.Models.DMS.ViewModels
{
    [JsonObject(NamingStrategyType = typeof(DefaultNamingStrategy))]
    public class SharingContactInformationViewModel
    {
        public string PersonNr { get; set; }
        public string B00SharingCompany_Company { get; set; }
        public string B00SharingAddress_Street { get; set; }
        public string B00SharingAddress_Zip { get; set; }
        public string B00SharingAddress_Place { get; set; }
        public string B00SharingCommunication_TelOffice { get; set; }
        public string B00SharingName_LastName { get; set; }
        public string B00SharingName_FirstName { get; set; }

        public string IdPerson { get; set; }
        [JsonIgnore]
        public string IdPersonTypeGw { get; set; }
        [JsonIgnore]
        public string IdSharingName { get; set; }
        [JsonIgnore]
        public string IdSharingAddress { get; set; }
        [JsonIgnore]
        public string IdSharingCompany { get; set; }
        [JsonIgnore]
        public string IdPersonInterface { get; set; }
        [JsonIgnore]
        public string IdPersonMasterData { get; set; }
        [JsonIgnore]
        public string TelOffice_IdSharingCommunication { get; set; }
    }
}
