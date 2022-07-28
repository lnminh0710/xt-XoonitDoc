using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.DTO.B00Sharing
{
    public class SharingContactInformationDto
    {
        public string IdPerson { get; set; }
        public string IdPersonTypeGw { get; set; }
        public string IdSharingName { get; set; }
        public string IdSharingAddress { get; set; }
        public string IdSharingCompany { get; set; }
        public string IdPersonInterface { get; set; }
        public string IdPersonMasterData { get; set; }
        public string PersonNr { get; set; }
        public string Company { get; set; }
        public string Street { get; set; }
        public string Zip { get; set; }
        public string Place { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string TelOffice { get; set; }
        public string TelOffice_IdSharingCommunication { get; set; }
    }
}
