using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models
{
    public class PersonContactModel
    {
        public string IdPerson { get; set; }
        public string PersonNr { get; set; }
        public string B00SharingAddress_Place { get; set; }
        public string B00SharingAddress_PoboxLabel { get; set; }
        public string B00SharingAddress_Street { get; set; }
        public string B00SharingAddress_Zip { get; set; }
        public string B00SharingCommunication_Email { get; set; }
        public string B00SharingCommunication_Internet { get; set; }
        public string B00SharingCommunication_TelOffice { get; set; }
        public string B00SharingCompany_Company { get; set; }

        [JsonIgnore]
        public string B00SharingCommunication_InternetIdSharingCommunication { get; set; }
        [JsonIgnore]
        public string B00SharingCommunication_EmailIdSharingCommunication { get; set; }
        [JsonIgnore]
        public string B00SharingCommunication_TelOfficeIdSharingCommunication { get; set; }
        [JsonIgnore]
        public string B00PersonInterface_IdPersonInterface { get; set; }
        [JsonIgnore]
        public string B00SharingName_IdSharingName { get; set; }
        [JsonIgnore]
        public string B00SharingAddress_IdSharingAddress { get; set; }
        [JsonIgnore]
        public string B00SharingCompany_IdSharingCompany { get; set; }
        [JsonIgnore]
        public string B00PersonTypeGw_IdPersonTypeGw { get; set; }
        [JsonIgnore]
        public string B00PersonMasterData_IdPersonMasterData { get; set; }
        [JsonIgnore]
        public string IdMainDocumentPerson { get; set; }
    }

    public class PersonContactFormModel : PersonContactModel
    {
        public string B00SharingName_FirstName { get; set; }
        public string B00SharingName_LastName { get; set; }
    }

    public class PersonBankFormModel : PersonContactModel
    {
        public string ContoNr { get; set; }
        public string Iban { get; set; }
        public string Swiftbic { get; set; }
    }

    public class ContactDetailModel : PersonContactFormModel
    {
        public string B00Person_IdPerson { get; set; }

        public string IdMainDocument { get; set; }
    }
}
