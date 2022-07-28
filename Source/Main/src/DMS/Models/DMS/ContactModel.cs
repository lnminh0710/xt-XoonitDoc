using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class SaveContactModel
    {
        public List<CustomerData> CustomerData { get; set; }
        public List<Communications> Communications { get; set; }
    }

    public class CustomerData
    {
        public string B00Person_IdPerson { get; set; }
        public string B00Person_IsMatch { get; set; }
        public string B00Person_IsActive { get; set; }
        public string B00PersonTypeGw_IdRepPersonType { get; set; }
        public string B00PersonTypeGw_IsShortCut { get; set; }
        public string B00PersonTypeGw_IsBlocked { get; set; }
        public string B00PersonInterface_IdRepAddressType { get; set; }
        public string B00PersonInterface_IsMainRecord { get; set; }
        public string B00PersonMasterData_DateOfBirth { get; set; }
        public string B00PersonMasterData_IsActive { get; set; }
        public string B00PersonStatus_IsActive { get; set; }
        public string B00PersonAlias_PersonAliasNr { get; set; }
        public string B00SharingName_IdRepTitle { get; set; }
        public string B00SharingName_FirstName { get; set; }
        public string B00SharingName_LastName { get; set; }
        public string B00SharingAddress_IdRepLanguage { get; set; }
        public string B00SharingAddress_IdRepIsoCountryCode { get; set; }
        public string B00SharingAddress_IdRepPoBox { get; set; }
        public string B00SharingAddress_Street { get; set; }
        public string B00SharingAddress_StreetAddition1 { get; set; }
        public string B00SharingAddress_Zip { get; set; }
        public string B00SharingAddress_PoboxLabel { get; set; }
        public string B00SharingAddress_Place { get; set; }
        public string B00SharingAddress_Area { get; set; }
        public string B00PersonUnwanted_Description { get; set; }
        public string B00PersonRelationshipToPerson_SlaveIdPerson { get; set; }
        public string B00PersonBusinessTitlesGW_IdRepPersonBusinessTitle { get; set; }
        public string B00SharingCompany_Company { get; set; }
        // Id List
        public string B00PersonTypeGw_IdPersonTypeGw { get; set; }
        public string B00SharingName_IdSharingName { get; set; }
        public string B00SharingAddress_IdSharingAddress { get; set; }
        public string B00SharingCompany_IdSharingCompany { get; set; }
        public string B00PersonInterface_IdPersonInterface { get; set; }
        public string B00PersonMasterData_IdPersonMasterData { get; set; }
        public string B00PersonStatus_IdRepPersonStatus { get; set; }
        public string B00PersonStatus_IdPersonUnwanted { get; set; }
        public string B00PersonAlias_IdPersonAlias { get; set; }
        public string B00PersonRelationshipToPerson_IdPersonRelationshipToPerson { get; set; }
        public string B00PersonRelationshipToPerson_IdPersonBusinessTitlesGw { get; set; }
    }

    public class Communications
    {
        public string IdSharingCommunication { get; set; }
        public string IdRepCommunicationType { get; set; }
        public string CommValue1 { get; set; }
        public string Notes { get; set; }
    }

    public class CommunicationData
    {
        public string IdSharingCommunication { get; set; }
        public string DefaultValue { get; set; }
        public string CommValue1 { get; set; }
        public string IsMainCommunication { get; set; }
    }


    public class RefCommunicationsSetting
    {
        public string DataType { get; set; }
        public string IdValue { get; set; }
        public string TextValue { get; set; }
    }
}
