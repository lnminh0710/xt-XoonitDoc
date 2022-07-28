using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    #region Customer Data
    public class CustomData : Data
    {
        public string mediaCode = string.Empty;
    }

    public class CustomerData : Data
    {
        private string idPerson = string.Empty;
        /// <summary>
        /// B00Person_PersonNr
        /// </summary>
        public string B00Person_IdPerson { get { return idPerson; } set { if (value != "0") idPerson = value; } }
    }

    public class PersonData : Data
    {
        private string idPerson = string.Empty;
        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get { return idPerson; } set { if (value != "0") idPerson = value; } }

        /// <summary>
        /// IdPersonInterface
        /// </summary>
        public string IdPersonInterface { get; set; }

        /// <summary>
        /// WidgetTitle
        /// </summary>
        public string WidgetTitle { get; set; }

        /// <summary>
        /// PageIndex
        /// </summary>
        public int? PageIndex { get; set; }

        /// <summary>
        /// PageSize
        /// </summary>
        public int? PageSize { get; set; }
    }

    public class CustomerCreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

        private string jSONCountryText = "{}";
        /// <summary>
        /// JSONCountryText
        /// </summary>
        public string JSONCountryText { get { return jSONCountryText; } set { if (!string.IsNullOrEmpty(value)) jSONCountryText = value; } }

        private string iSONPersonContactAddressType = "{}";
        /// <summary>
        /// JSONPersonContactAddressType
        /// </summary>
        public string JSONPersonContactAddressType { get { return iSONPersonContactAddressType; } set { if (!string.IsNullOrEmpty(value)) iSONPersonContactAddressType = value; } }

        private string jSONPersonType = "{}";
        /// <summary>
        /// JSONPersonType
        /// </summary>
        public string JSONPersonType { get { return jSONPersonType; } set { if (!string.IsNullOrEmpty(value)) jSONPersonType = value; } }

        /// <summary>
        /// B00Person_PersonNr
        /// </summary>
        public string B00Person_PersonNr { get; set; }

        /// <summary>
        /// B00Person_Notes
        /// </summary>
        public string B00Person_Notes { get; set; }

        /// <summary>
        /// B00Person_IsMatch
        /// </summary>
        public string B00Person_IsMatch { get; set; }

        /// <summary>
        /// B00Person_IsActive
        /// </summary>
        public string B00Person_IsActive { get; set; }

        /// <summary>
        /// B00Person_IdRepPersonBusinessTitle
        /// </summary>
        public string B00Person_IdRepPersonBusinessTitle { get; set; }

        /// <summary>
        /// B00PersonTypeGw_IdRepPersonType
        /// </summary>
        public string B00PersonTypeGw_IdRepPersonType { get; set; }

        /// <summary>
        /// B00PersonTypeGw_IsShortCut
        /// </summary>
        public string B00PersonTypeGw_IsShortCut { get; set; }

        /// <summary>
        /// B00PersonTypeGw_IsBlocked
        /// </summary>
        public string B00PersonTypeGw_IsBlocked { get; set; }

        /// <summary>
        /// B00SharingName_IdRepTitleOfCourtesy
        /// </summary>
        public string B00SharingName_IdRepTitleOfCourtesy { get; set; }

        /// <summary>
        /// B00SharingName_IdRepTitle
        /// </summary>
        public string B00SharingName_IdRepTitle { get; set; }

        /// <summary>
        /// B00SharingName_LastName
        /// </summary>
        public string B00SharingName_LastName { get; set; }

        /// <summary>
        /// B00SharingName_FirstName
        /// </summary>
        public string B00SharingName_FirstName { get; set; }

        /// <summary>
        /// B00SharingName_LastName2
        /// </summary>
        public string B00SharingName_LastName2 { get; set; }

        /// <summary>
        /// B00SharingName_FirstName2
        /// </summary>
        public string B00SharingName_FirstName2 { get; set; }

        /// <summary>
        /// B00SharingName_COName
        /// </summary>
        public string B00SharingName_COName { get; set; }

        /// <summary>
        /// B00Person_PersonNr
        /// </summary>
        public string B00SharingName_Middlename { get; set; }

        /// <summary>
        /// B00SharingName_SuffixName
        /// </summary>
        public string B00SharingName_SuffixName { get; set; }

        /// <summary>
        /// B00SharingName_NameAddition
        /// </summary>
        public string B00SharingName_NameAddition { get; set; }

        /// <summary>
        /// B00SharingName_Notes
        /// </summary>
        public string B00SharingName_Notes { get; set; }

        /// <summary>
        /// B00SharingAddress_IdRepLanguage
        /// </summary>
        public string B00SharingAddress_IdRepLanguage { get; set; }

        /// <summary>
        /// B00SharingAddress_IdRepIsoCountryCode
        /// </summary>
        public string B00SharingAddress_IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// B00SharingAddress_IdRepPoBox
        /// </summary>
        public string B00SharingAddress_IdRepPoBox { get; set; }

        /// <summary>
        /// B00SharingAddress_Street
        /// </summary>
        public string B00SharingAddress_Street { get; set; }

        /// <summary>
        /// B00SharingAddress_StreetNr
        /// </summary>
        public string B00SharingAddress_StreetNr { get; set; }

        /// <summary>
        /// B00SharingAddress_StreetAddition1
        /// </summary>
        public string B00SharingAddress_StreetAddition1 { get; set; }

        /// <summary>
        /// B00SharingAddress_StreetAddition2
        /// </summary>
        public string B00SharingAddress_StreetAddition2 { get; set; }

        /// <summary>
        /// B00SharingAddress_Streetaddition3
        /// </summary>
        public string B00SharingAddress_Streetaddition3 { get; set; }

        /// <summary>
        /// B00SharingAddress_Addition
        /// </summary>
        public string B00SharingAddress_Addition { get; set; }

        /// <summary>
        /// B00SharingAddress_PoboxLabel
        /// </summary>
        public string B00SharingAddress_PoboxLabel { get; set; }

        /// <summary>
        /// B00SharingAddress_Zip
        /// </summary>
        public string B00SharingAddress_Zip { get; set; }

        /// <summary>
        /// B00SharingAddress_Zip2
        /// </summary>
        public string B00SharingAddress_Zip2 { get; set; }

        /// <summary>
        /// B00SharingAddress_Place
        /// </summary>
        public string B00SharingAddress_Place { get; set; }

        /// <summary>
        /// B00SharingAddress_Area
        /// </summary>
        public string B00SharingAddress_Area { get; set; }

        /// <summary>
        /// B00SharingAddress_CountryAddition
        /// </summary>
        public string B00SharingAddress_CountryAddition { get; set; }

        /// <summary>
        /// B00SharingAddress_Notes
        /// </summary>
        public string B00SharingAddress_Notes { get; set; }

        /// <summary>
        /// B00PersonInterface_IdSharingCompany
        /// </summary>
        public string B00PersonInterface_IdSharingCompany { get; set; }

        /// <summary>
        /// B00PersonInterface_IdRepAddressType
        /// </summary>
        public string B00PersonInterface_IdRepAddressType { get; set; }

        /// <summary>
        /// B00PersonInterface_IsMainRecord
        /// </summary>
        public string B00PersonInterface_IsMainRecord { get; set; }

        /// <summary>
        /// B00SharingAddress_StreetNr
        /// </summary>
        public string B00PersonMasterData_DateOfBirth { get; set; }

        /// <summary>
        /// B00PersonMasterData_PersonalId
        /// </summary>
        public string B00PersonMasterData_PersonalId { get; set; }

        /// <summary>
        /// B00PersonMasterData_BirthHours
        /// </summary>
        public string B00PersonMasterData_BirthHours { get; set; }

        /// <summary>
        /// B00PersonMasterData_BirthMinutes
        /// </summary>
        public string B00PersonMasterData_BirthMinutes { get; set; }

        /// <summary>
        /// B00PersonMasterData_PlaceOfBirth
        /// </summary>
        public string B00PersonMasterData_PlaceOfBirth { get; set; }

        /// <summary>
        /// B00SharingAddress_PoboxLabel
        /// </summary>
        public string B00PersonMasterData_IsActive { get; set; }

        /// <summary>
        /// B00PersonStatus_IdRepPersonStatus
        /// </summary>
        public string B00PersonStatus_IdRepPersonStatus { get; set; }

        /// <summary>
        /// B00PersonStatus_Notes
        /// </summary>
        public string B00PersonStatus_Notes { get; set; }

        /// <summary>
        /// B00PersonStatus_IsActive
        /// </summary>
        public string B00PersonStatus_IsActive { get; set; }

        /// <summary>
        /// B00PersonAlias_PersonAliasNr
        /// </summary>
        public string B00PersonAlias_PersonAliasNr { get; set; }

        /// <summary>
        /// B00SharingCompany_Company
        /// </summary>
        public string B00SharingCompany_Company { get; set; }

        /// <summary>
        /// B00SharingCompany_Department
        /// </summary>
        public string B00SharingCompany_Department { get; set; }

        /// <summary>
        /// B00SharingCompany_Position
        /// </summary>
        public string B00SharingCompany_Position { get; set; }

    }
    public class CustomerUpdateData : CustomerCreateData
    {
        /// <summary>
        /// B00Person_IdPerson
        /// </summary>
        public string B00Person_IdPerson { get; set; }

        /// <summary>
        /// B00PersonTypeGw_IdPersonTypeGw
        /// </summary>
        public string B00PersonTypeGw_IdPersonTypeGw { get; set; }

        /// <summary>
        /// B00PersonInterface_IdPersonInterface
        /// </summary>
        public string B00PersonInterface_IdPersonInterface { get; set; }

        /// <summary>
        /// B00PersonMasterData_IdPersonMasterData
        /// </summary>
        public string B00PersonMasterData_IdPersonMasterData { get; set; }

        /// <summary>
        /// B00PersonAlias_IdPersonAlias
        /// </summary>
        public string B00PersonAlias_IdPersonAlias { get; set; }

        /// <summary>
        /// B00SharingName_IdSharingName
        /// </summary>
        public string B00SharingName_IdSharingName { get; set; }

        /// <summary>
        /// B00SharingAddress_IdSharingAddress
        /// </summary>
        public string B00SharingAddress_IdSharingAddress { get; set; }

        /// <summary>
        /// B00PersonStatus_IdPersonStatus
        /// </summary>
        public string B00PersonStatus_IdPersonStatus { get; set; }
    }

    public class CustomerDeleteData : Data
    {
        public int PersonId { get; set; }
    }

    #endregion

    #region Contact Data
    public class ContactCreateData : CustomerCreateData
    {
        /// <summary>
        /// B00PersonInterfaceContactAddressGw_IdRepContactAddressType
        /// </summary>
        public string B00PersonInterfaceContactAddressGw_IdRepContactAddressType { get; set; }

        /// <summary>
        /// B00PersonInterfaceContactAddressGw_IdPersonInterface
        /// </summary>
        public string B00PersonInterfaceContactAddressGw_IdPersonInterface { get; set; }
    }
    #endregion

    #region Person
    public class PersonCreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

        /// <summary>
        /// B00Person_PersonNr
        /// </summary>
        public string B00Person_PersonNr { get; set; }

        /// <summary>
        /// B00Person_Notes
        /// </summary>
        public string B00Person_Notes { get; set; }

        /// <summary>
        /// B00Person_IsMatch
        /// </summary>
        public string B00Person_IsMatch { get; set; }

        /// <summary>
        /// B00Person_IsActive
        /// </summary>
        public string B00Person_IsActive { get; set; }

        /// <summary>
        /// B00Person_IdRepPersonBusinessTitle
        /// </summary>
        public string B00Person_IdRepPersonBusinessTitle { get; set; }

        /// <summary>
        /// B00PersonTypeGw_IdRepPersonType
        /// </summary>
        public string B00PersonTypeGw_IdRepPersonType { get; set; }

        /// <summary>
        /// B00PersonTypeGw_IsShortCut
        /// </summary>
        public string B00PersonTypeGw_IsShortCut { get; set; }

        /// <summary>
        /// B00PersonTypeGw_IsBlocked
        /// </summary>
        public string B00PersonTypeGw_IsBlocked { get; set; }

        /// <summary>
        /// B00SharingName_IdRepTitleOfCourtesy
        /// </summary>
        public string B00SharingName_IdRepTitleOfCourtesy { get; set; }

        /// <summary>
        /// B00SharingName_IdRepTitle
        /// </summary>
        public string B00SharingName_IdRepTitle { get; set; }

        /// <summary>
        /// B00SharingName_LastName
        /// </summary>
        public string B00SharingName_LastName { get; set; }

        /// <summary>
        /// B00SharingName_FirstName
        /// </summary>
        public string B00SharingName_FirstName { get; set; }

        /// <summary>
        /// B00SharingName_LastName2
        /// </summary>
        public string B00SharingName_LastName2 { get; set; }

        /// <summary>
        /// B00SharingName_FirstName2
        /// </summary>
        public string B00SharingName_FirstName2 { get; set; }

        /// <summary>
        /// B00SharingName_COName
        /// </summary>
        public string B00SharingName_COName { get; set; }

        /// <summary>
        /// B00Person_PersonNr
        /// </summary>
        public string B00SharingName_Middlename { get; set; }

        /// <summary>
        /// B00SharingName_SuffixName
        /// </summary>
        public string B00SharingName_SuffixName { get; set; }

        /// <summary>
        /// B00SharingName_NameAddition
        /// </summary>
        public string B00SharingName_NameAddition { get; set; }

        /// <summary>
        /// B00SharingName_Notes
        /// </summary>
        public string B00SharingName_Notes { get; set; }

        /// <summary>
        /// B00SharingAddress_IdRepLanguage
        /// </summary>
        public string B00SharingAddress_IdRepLanguage { get; set; }

        /// <summary>
        /// B00SharingAddress_IdRepIsoCountryCode
        /// </summary>
        public string B00SharingAddress_IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// B00SharingAddress_IdRepPoBox
        /// </summary>
        public string B00SharingAddress_IdRepPoBox { get; set; }

        /// <summary>
        /// B00SharingAddress_Street
        /// </summary>
        public string B00SharingAddress_Street { get; set; }

        /// <summary>
        /// B00SharingAddress_StreetNr
        /// </summary>
        public string B00SharingAddress_StreetNr { get; set; }

        /// <summary>
        /// B00SharingAddress_StreetAddition1
        /// </summary>
        public string B00SharingAddress_StreetAddition1 { get; set; }

        /// <summary>
        /// B00SharingAddress_StreetAddition2
        /// </summary>
        public string B00SharingAddress_StreetAddition2 { get; set; }

        /// <summary>
        /// B00SharingAddress_Streetaddition3
        /// </summary>
        public string B00SharingAddress_Streetaddition3 { get; set; }

        /// <summary>
        /// B00SharingAddress_Addition
        /// </summary>
        public string B00SharingAddress_Addition { get; set; }

        /// <summary>
        /// B00SharingAddress_PoboxLabel
        /// </summary>
        public string B00SharingAddress_PoboxLabel { get; set; }

        /// <summary>
        /// B00SharingAddress_Zip
        /// </summary>
        public string B00SharingAddress_Zip { get; set; }

        /// <summary>
        /// B00SharingAddress_Zip2
        /// </summary>
        public string B00SharingAddress_Zip2 { get; set; }

        /// <summary>
        /// B00SharingAddress_Place
        /// </summary>
        public string B00SharingAddress_Place { get; set; }

        /// <summary>
        /// B00SharingAddress_Area
        /// </summary>
        public string B00SharingAddress_Area { get; set; }

        /// <summary>
        /// B00SharingAddress_CountryAddition
        /// </summary>
        public string B00SharingAddress_CountryAddition { get; set; }

        /// <summary>
        /// B00SharingAddress_Notes
        /// </summary>
        public string B00SharingAddress_Notes { get; set; }

        /// <summary>
        /// B00PersonInterface_IdSharingCompany
        /// </summary>
        public string B00PersonInterface_IdSharingCompany { get; set; }

        /// <summary>
        /// B00PersonInterface_IdRepAddressType
        /// </summary>
        public string B00PersonInterface_IdRepAddressType { get; set; }

        /// <summary>
        /// B00PersonInterface_IsMainRecord
        /// </summary>
        public string B00PersonInterface_IsMainRecord { get; set; }

        /// <summary>
        /// B00SharingAddress_StreetNr
        /// </summary>
        public string B00PersonMasterData_DateOfBirth { get; set; }

        /// <summary>
        /// B00PersonMasterData_PersonalId
        /// </summary>
        public string B00PersonMasterData_PersonalId { get; set; }

        /// <summary>
        /// B00PersonMasterData_BirthHours
        /// </summary>
        public string B00PersonMasterData_BirthHours { get; set; }

        /// <summary>
        /// B00PersonMasterData_BirthMinutes
        /// </summary>
        public string B00PersonMasterData_BirthMinutes { get; set; }

        /// <summary>
        /// B00PersonMasterData_PlaceOfBirth
        /// </summary>
        public string B00PersonMasterData_PlaceOfBirth { get; set; }

        /// <summary>
        /// B00SharingAddress_PoboxLabel
        /// </summary>
        public string B00PersonMasterData_IsActive { get; set; }

        /// <summary>
        /// B00PersonStatus_IdRepPersonStatus
        /// </summary>
        public string B00PersonStatus_IdRepPersonStatus { get; set; }

        /// <summary>
        /// B00PersonStatus_Notes
        /// </summary>
        public string B00PersonStatus_Notes { get; set; }

        /// <summary>
        /// B00PersonStatus_IsActive
        /// </summary>
        public string B00PersonStatus_IsActive { get; set; }

        /// <summary>
        /// B00PersonAlias_PersonAliasNr
        /// </summary>
        public string B00PersonAlias_PersonAliasNr { get; set; }

        /// <summary>
        /// B00PersonRelationshipToPerson_MasterIdPerson
        /// </summary>
        public string B00PersonRelationshipToPerson_MasterIdPerson { get; set; }

        /// <summary>
        /// B00PersonRelationshipToPerson_SlaveIdPerson
        /// </summary>
        public string B00PersonRelationshipToPerson_SlaveIdPerson { get; set; }

        /// <summary>
        /// B00PersonRelationshipToPerson_IsBlocked
        /// </summary>
        public string B00PersonRelationshipToPerson_IsBlocked { get; set; }

        /// <summary>
        /// B00SharingCompany_Company
        /// </summary>
        public string B00SharingCompany_Company { get; set; }

        /// <summary>
        /// B00SharingCompany_Department
        /// </summary>
        public string B00SharingCompany_Department { get; set; }

        /// <summary>
        /// B00SharingCompany_Position
        /// </summary>
        public string B00SharingCompany_Position { get; set; }

    }

    public class PersonUpdateData : PersonCreateData
    {
        /// <summary>
        /// B00Person_IdPerson
        /// </summary>
        public string B00Person_IdPerson { get; set; }
        /// <summary>
        /// B00PersonTypeGw_IdPersonTypeGw
        /// </summary>
        public string B00PersonTypeGw_IdPersonTypeGw { get; set; }
        /// <summary>
        /// B00SharingName_IdSharingName
        /// </summary>
        public string B00SharingName_IdSharingName { get; set; }
        /// <summary>
        /// B00SharingAddress_IdSharingAddress
        /// </summary>
        public string B00SharingAddress_IdSharingAddress { get; set; }
        /// <summary>
        /// B00PersonInterface_IdPersonInterface
        /// </summary>
        public string B00PersonInterface_IdPersonInterface { get; set; }
        /// <summary>
        /// B00PersonMasterData_IdPersonMasterData
        /// </summary>
        public string B00PersonMasterData_IdPersonMasterData { get; set; }
        /// <summary>
        /// B00SharingCompany_IdSharingCompany
        /// </summary>
        public string B00SharingCompany_IdSharingCompany { get; set; }

    }
    #endregion

    #region Save Customer
    public class SaveCustomerData
    {
        public IList<string> IgnoredKeys { get; set; }
        public string IdPerson { get; set; }
        public Data BaseData { get; set; }
        public Dictionary<string, object> Data { get; set; }

        public SaveCustomerData()
        {
            IgnoredKeys = new List<string>();
        }
    }

    public class SaveCustomerResult
    {
        /*
        {
          "Data": [
            [
              {
                "": [
                  {
                    "Index": "b05b05customer",
                    "Id": 194599
                  }
                ]
              }
            ],
            [
              {
                "ReturnID": 1,
                "StoredName": "SpB05CallCustomer",
                "EventType": "Successfully"
              }
            ]
          ]
        }
        */
        public string Index { get; set; }
        public string Id { get; set; }
        public string ReturnID { get; set; }
        public string StoredName { get; set; }
        public string EventType { get; set; }

        public bool IsSuccess
        {
            get
            {
                return !string.IsNullOrEmpty(Id) && EventType == "Successfully";
            }
        }

        public SaveCustomerResult()
        {
        }

        public void BuilData(JArray data)
        {
            try
            {
                JArray jArray = data;
                //Array 0: [{"":[{"Index":"b05b05customer","Id":194599}]}]
                JArray jArray1 = JArray.Parse(jArray[0][0][""] + string.Empty);
                JObject jObject1 = (JObject)jArray1[0];
                Index = jObject1["Index"] + string.Empty;
                Id = jObject1["Id"] + string.Empty;

                //Array 1: [{"ReturnID":1,"StoredName":"SpB05CallCustomer","EventType":"Successfully"}]
                JObject jObject2 = (JObject)jArray[1][0];
                ReturnID = jObject2["ReturnID"] + string.Empty;
                StoredName = jObject2["StoredName"] + string.Empty;
                EventType = jObject2["EventType"] + string.Empty;
            }
            catch { }
        }
    }
    #endregion
}
