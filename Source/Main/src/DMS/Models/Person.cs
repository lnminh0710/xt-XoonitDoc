using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.Property;

namespace DMS.Models
{
    #region Customer
    /// <summary>
    /// Customer business object
    /// </summary>
    public class Customer
    {
        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public IdPerson IdPerson { get; set; }

        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public PersonNr PersonNr { get; set; }

        /// <summary>
        /// The customer's preferred given name
        /// </summary>
        public FirstName FirstName { get; set; }

        /// <summary>
        /// The customer's surname(s)
        /// </summary>
        public LastName LastName { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public Street Street { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public StreetNr StreetNr { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public StreetAddition1 StreetAddition1 { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public StreetAddition2 StreetAddition2 { get; set; }

        /// <summary>
        /// StreetAddition3
        /// </summary>
        public StreetAddition3 StreetAddition3 { get; set; }

        /// <summary>
        /// Zip
        /// </summary>
        public Zip Zip { get; set; }

        /// <summary>
        /// Zip2
        /// </summary>
        public Zip2 Zip2 { get; set; }

        ///// <summary>
        ///// CreateDate
        ///// </summary>
        //public string CreateDate { get; set; }

        /// <summary>
        /// Pobox
        /// </summary>
        public PoboxLabel PoboxLabel { get; set; }

        /// <summary>
        /// Place
        /// </summary>
        public Place Place { get; set; }

        /// <summary>
        /// City
        /// </summary>
        public City City { get; set; }

        /// <summary>
        /// Area
        /// </summary>
        public Area Area { get; set; }

        /// <summary>
        /// Country
        /// </summary>
        public Country Country { get; set; }

        /// <summary>
        /// Status
        /// </summary>
        public Status Status { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public Notes Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public IsActive IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public IsDeleted IsDeleted { get; set; }

        /// <summary>
        /// IsMatch
        /// </summary>
        public IsMatch IsMatch { get; set; }

        /// <summary>
        /// IsMatch
        /// </summary>
        public IsMainRecord IsMainRecord { get; set; }

        /// <summary>
        /// IsShortCut
        /// </summary>
        public IsShortCut IsShortCut { get; set; }

        /// <summary>
        /// IdPersonAlias
        /// </summary>
        public IdPersonAlias IdPersonAlias { get; set; }

        /// <summary>
        /// IdPersonInterface
        /// </summary>
        public IdPersonInterface IdPersonInterface { get; set; }

        /// <summary>
        /// IdPersonMasterData
        /// </summary>
        public IdPersonMasterData IdPersonMasterData { get; set; }

        /// <summary>
        /// IdPersonStatus
        /// </summary>
        public IdPersonStatus IdPersonStatus { get; set; }

        /// <summary>
        /// IdPersonTypeGw
        /// </summary>
        public IdPersonTypeGw IdPersonTypeGw { get; set; }

        /// <summary>
        /// IdRepAddressType
        /// </summary>
        public IdRepAddressType IdRepAddressType { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public IdRepIsoCountryCode IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// IdRepLanguage
        /// </summary>
        public IdRepLanguage IdRepLanguage { get; set; }

        /// <summary>
        /// IdRepPersonStatus
        /// </summary>
        public IdRepPersonStatus IdRepPersonStatus { get; set; }

        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public IdRepPersonType IdRepPersonType { get; set; }

        /// <summary>
        /// IdRepPoBox
        /// </summary>
        public IdRepPoBox IdRepPoBox { get; set; }

        /// <summary>
        /// IdRepTitle
        /// </summary>
        public IdRepTitle IdRepTitle { get; set; }

        /// <summary>
        /// IdRepTitleOfCourtesy
        /// </summary>
        public IdRepTitleOfCourtesy IdRepTitleOfCourtesy { get; set; }

        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public IdSharingAddress IdSharingAddress { get; set; }

        /// <summary>
        /// IdSharingName
        /// </summary>
        public IdSharingName IdSharingName { get; set; }

        /// <summary>
        /// BirthHours
        /// </summary>
        public BirthHours BirthHours { get; set; }

        /// <summary>
        /// BirthMinutes
        /// </summary>
        public BirthMinutes BirthMinutes { get; set; }

        /// <summary>
        /// PlaceOfBirth
        /// </summary>
        public PlaceOfBirth PlaceOfBirth { get; set; }

        /// <summary>
        /// PersonStatus
        /// </summary>
        public PersonStatus PersonStatus { get; set; }

        /// <summary>
        /// PersonTypeGw
        /// </summary>
        public PersonTypeGw PersonTypeGw { get; set; }

        /// <summary>
        /// PersonAliasNr
        /// </summary>
        public PersonAliasNr PersonAliasNr { get; set; }

        /// <summary>
        /// PersonMasterData
        /// </summary>
        public PersonMasterData PersonMasterData { get; set; }

        /// <summary>
        /// SuffixName
        /// </summary>
        public SuffixName SuffixName { get; set; }

        /// <summary>
        /// COName
        /// </summary>
        public COName COName { get; set; }

        /// <summary>
        /// Middlename
        /// </summary>
        public Middlename Middlename { get; set; }

        /// <summary>
        /// NameAddition
        /// </summary>
        public NameAddition NameAddition { get; set; }

        /// <summary>
        /// NameAddition
        /// </summary>
        public CountryAddition CountryAddition { get; set; }

        /// <summary>
        /// DateOfBirth
        /// </summary>
        public DateOfBirth DateOfBirth { get; set; }

        /// <summary>
        /// ContactType
        /// </summary>
        public ContactType ContactType { get; set; }

    }

    public class CustomerCollection
    {
        public int? Total { get; set; }
        public IList<Customer> CollectionCustomers { get; set; }
        public string WidgetTitle { get; set; }
    }

    public class CustomerDynamicCollection
    {
        public int? Total { get; set; }
        public IList<object> CollectionData { get; set; }
        public string WidgetTitle { get; set; }
    }

    /// <summary>
    /// Customer business object
    /// </summary>
    public class CustomerGetModel
    {
        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public int IdPerson { get; set; }

        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public string PersonNr { get; set; }

        /// <summary>
        /// Alias identifier for this customer.
        /// </summary>
        public string Alias { get; set; }

        /// <summary>
        /// The customer's preferred given name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// The customer's surname(s)
        /// </summary>
        public string LastName { get; set; }


        /// <summary>
        /// The customer's preferred given name
        /// </summary>
        public string FirstName2 { get; set; }

        /// <summary>
        /// The customer's surname(s)
        /// </summary>
        public string LastName2 { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public string Street { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public string StreetNr { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public string StreetAddition1 { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public string StreetAddition2 { get; set; }

        /// <summary>
        /// StreetAddition3
        /// </summary>
        public string StreetAddition3 { get; set; }

        /// <summary>
        /// Zip
        /// </summary>
        public string Zip { get; set; }

        /// <summary>
        /// Zip2
        /// </summary>
        public string Zip2 { get; set; }

        ///// <summary>
        ///// CreateDate
        ///// </summary>
        //public string CreateDate { get; set; }

        /// <summary>
        /// Pobox
        /// </summary>
        public string PoboxLabel { get; set; }

        /// <summary>
        /// Place
        /// </summary>
        public string Place { get; set; }

        /// <summary>
        /// City
        /// </summary>
        public string City { get; set; }

        /// <summary>
        /// Area
        /// </summary>
        public string Area { get; set; }

        /// <summary>
        /// Country
        /// </summary>
        public string Country { get; set; }

        /// <summary>
        /// Status
        /// </summary>
        public string Status { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// SuffixName
        /// </summary>
        public string SuffixName { get; set; }

        /// <summary>
        /// COName
        /// </summary>
        public string COName { get; set; }

        /// <summary>
        /// Middlename
        /// </summary>
        public string Middlename { get; set; }

        /// <summary>
        /// Addition
        /// </summary>
        public string Addition { get; set; }

        /// <summary>
        /// NameAddition
        /// </summary>
        public string NameAddition { get; set; }


        /// <summary>
        /// NameAddition
        /// </summary>
        public string CountryAddition { get; set; }

        /// <summary>
        /// IsMatch
        /// </summary>
        public string IsMatch { get; set; }

        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public string IdRepPersonType { get; set; }

        /// <summary>
        /// IsShortCut
        /// </summary>
        public bool IsShortCut { get; set; }

        /// <summary>
        /// IsBlocked
        /// </summary>
        public bool IsBlocked { get; set; }

        /// <summary>
        /// IdRepTitleOfCourtesy
        /// </summary>
        public string IdRepTitleOfCourtesy { get; set; }

        /// <summary>
        /// IdRepTitle
        /// </summary>
        public string IdRepTitle { get; set; }

        /// <summary>
        /// IdRepLanguage
        /// </summary>
        public string IdRepLanguage { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public string IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// IdRepPoBox
        /// </summary>
        public string IdRepPoBox { get; set; }

        /// <summary>
        /// IdSharingCompany
        /// </summary>
        public string IdSharingCompany { get; set; }

        /// <summary>
        /// IdPersonMasterData
        /// </summary>
        public string IdPersonMasterData { get; set; }

        /// <summary>
        /// IdPersonInterface
        /// </summary>
        public string IdPersonInterface { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }

        /// <summary>
        /// IdPersonTypeGw
        /// </summary>
        public string IdPersonTypeGw { get; set; }

        /// <summary>
        /// IdSharingName
        /// </summary>
        public string IdSharingName { get; set; }

        /// <summary>
        /// IdPersonStatus
        /// </summary>
        public string IdPersonStatus { get; set; }

        /// <summary>
        /// IdRepPersonStatus
        /// </summary>
        public string IdRepPersonStatus { get; set; }

        /// <summary>
        /// PersonalId
        /// </summary>
        public string PersonalId { get; set; }

        /// <summary>
        /// BirthHours
        /// </summary>
        public string BirthHours { get; set; }

        /// <summary>
        /// BirthMinutes
        /// </summary>
        public string BirthMinutes { get; set; }

        /// <summary>
        /// PlaceOfBirth
        /// </summary>
        public string PlaceOfBirth { get; set; }

        /// <summary>
        /// PersonAliasNr
        /// </summary>
        public string PersonAliasNr { get; set; }

        /// <summary>
        /// IdRepAddressType
        /// </summary>
        public string IdRepAddressType { get; set; }

        /// <summary>
        /// IsMainRecord
        /// </summary>
        public bool IsMainRecord { get; set; }
    }

    /// <summary>
    /// 
    /// </summary>
    public class CustomerEditModel
    {
        public Person Person { get; set; }

        public PersonTypeGw PersonTypeGw { get; set; }

        public SharingName SharingName { get; set; }

        public SharingCompany SharingCompany { get; set; }

        public SharingAddress SharingAddress { get; set; }

        public PersonInterface PersonInterface { get; set; }

        public PersonMasterData PersonMasterData { get; set; }

        public PersonStatus PersonStatus { get; set; }

        public IList<PersonalType> PersonTypes { get; set; }

        public IList<ContactAddressType> ContactAddressTypes { get; set; }

        public PersonAlias PersonAlias { get; set; }

        public IList<Communication> Communications { get; set; }

        public IList<PersonInterfaceContactCountry> PersonInterfaceContactCountries { get; set; }
    }


    #endregion

    #region Contact Model
    public class ContactEditModel : CustomerEditModel
    {
        public PersonInterfaceContactAddressGw PersonInterfaceContactAddressGw { get; set; }
    }

    /// <summary>
    /// DataUpdateModel
    /// </summary>
    public class DataUpdateModel
    {
        /// <summary>
        /// Data
        /// </summary>
        public string Data { get; set; }

        /// <summary>
        /// Request
        /// </summary>
        public string Request { get; set; }

        /// <summary>
        /// updateKey
        /// </summary>
        public string UpdateKey { get; set; }

        /// <summary>
        /// Module
        /// </summary>
        public GlobalModule Module { get; set; }

        /// <summary>
        /// Mode
        /// </summary>
        public string Mode { get; set; }

        /// <summary>
        /// UsingReplaceString
        /// </summary>
        public bool UsingReplaceString { get; set; }
    }
    #endregion

    #region Edit Model
    /// <summary>
    /// Customer business object
    /// </summary>
    public class Person
    {
        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public string IdPerson { get; set; }

        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public string PersonNr { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsMatch
        /// </summary>
        public string IsMatch { get; set; }

        /// <summary>
        /// IsMatch
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// IdRepPersonBusinessTitle
        /// </summary>
        public string IdRepPersonBusinessTitle { get; set; }
    }

    /// <summary>
    /// PersonTypeModel
    /// </summary>
    public class PersonTypeGw
    {
        /// <summary>
        /// IdPersonTypeGw
        /// </summary>
        public string IdPersonTypeGw { get; set; }

        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public string IdRepPersonType { get; set; }

        /// <summary>
        /// IsShortCut
        /// </summary>
        public bool IsShortCut { get; set; }

        /// <summary>
        /// IsBlocked
        /// </summary>
        public bool IsBlocked { get; set; }
    }

    /// <summary>
    /// PersonTypeModel
    /// </summary>
    public class SharingName
    {
        /// <summary>
        /// IdSharingName
        /// </summary>
        public string IdSharingName { get; set; }

        /// <summary>
        /// IdRepTitleOfCourtesy
        /// </summary>
        public string IdRepTitleOfCourtesy { get; set; }

        /// <summary>
        /// IdRepTitle
        /// </summary>
        public string IdRepTitle { get; set; }

        /// <summary>
        /// The customer's preferred given name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// The customer's surname(s)
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// The customer's preferred given name
        /// </summary>
        public string FirstName2 { get; set; }

        /// <summary>
        /// The customer's surname(s)
        /// </summary>
        public string LastName2 { get; set; }

        /// <summary>
        /// COName
        /// </summary>
        public string COName { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string SuffixName { get; set; }

        /// <summary>
        /// Middlename
        /// </summary>
        public string Middlename { get; set; }

        /// <summary>
        /// Addition
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// NameAddition
        /// </summary>
        public string NameAddition { get; set; }
    }

    /// <summary>
    /// SharingAddress
    /// </summary>
    public class SharingAddress
    {
        /// <summary>
        /// IdSharingAddress
        /// </summary>
        public string IdSharingAddress { get; set; }

        /// <summary>
        /// IdRepLanguage
        /// </summary>
        public string IdRepLanguage { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public string IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// IdRepPoBox
        /// </summary>
        public string IdRepPoBox { get; set; }

        /// <summary>
        /// StreetAddition3
        /// </summary>
        public string Addition { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public string Street { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public string StreetNr { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public string StreetAddition1 { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public string StreetAddition2 { get; set; }

        /// <summary>
        /// StreetAddition3
        /// </summary>
        public string StreetAddition3 { get; set; }

        /// <summary>
        /// Zip
        /// </summary>
        public string Zip { get; set; }

        /// <summary>
        /// Zip2
        /// </summary>
        public string Zip2 { get; set; }

        /// <summary>
        /// Pobox
        /// </summary>
        public string PoboxLabel { get; set; }

        /// <summary>
        /// Place
        /// </summary>
        public string Place { get; set; }

        /// <summary>
        /// Area
        /// </summary>
        public string Area { get; set; }

        /// <summary>
        /// CountryAddition
        /// </summary>
        public string CountryAddition { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }
    }

    /// <summary>
    /// PersonInterface
    /// </summary>
    public class PersonInterface
    {
        /// <summary>
        /// IdPersonInterface
        /// </summary>
        public string IdPersonInterface { get; set; }

        /// <summary>
        /// IdSharingCompany
        /// </summary>
        public string IdSharingCompany { get; set; }

        /// <summary>
        /// IdRepAddressType
        /// </summary>
        public string IdRepAddressType { get; set; }

        /// <summary>
        /// IsMainRecord
        /// </summary>
        public bool IsMainRecord { get; set; }
    }

    /// <summary>
    /// PersonMasterData
    /// </summary>
    public class PersonMasterData
    {
        /// <summary>
        /// IdPersonMasterData
        /// </summary>
        public string IdPersonMasterData { get; set; }

        /// <summary>
        /// DateOfBirth
        /// </summary>
        public string DateOfBirth { get; set; }

        /// <summary>
        /// PersonalId
        /// </summary>
        public string PersonalId { get; set; }

        /// <summary>
        /// BirthHours
        /// </summary>
        public string BirthHours { get; set; }

        /// <summary>
        /// BirthMinutes
        /// </summary>
        public string BirthMinutes { get; set; }

        /// <summary>
        /// PlaceOfBirth
        /// </summary>
        public string PlaceOfBirth { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// PersonStatus
    /// </summary>
    public class PersonStatus
    {
        /// <summary>
        /// IdPersonStatus
        /// </summary>
        public string IdPersonStatus { get; set; }

        /// <summary>
        /// IdRepPersonStatus
        /// </summary>
        public string IdRepPersonStatus { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// ContactAddressType
    /// </summary>
    public class ContactAddressType
    {
        /// <summary>
        /// IdRepContactAddressType
        /// </summary>
        public string IdRepContactAddressType { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public bool IsDeleted { get; set; }
    }

    /// <summary>
    /// PersonalType
    /// </summary>
    public class PersonalType
    {
        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public string IdRepPersonType { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public bool IsDeleted { get; set; }
    }

    /// <summary>
    /// PersonAlias
    /// </summary>
    public class PersonAlias
    {
        /// <summary>
        /// IdPersonAlias
        /// </summary>
        public string IdPersonAlias { get; set; }

        /// <summary>
        /// PersonAliasNr
        /// </summary>
        public string PersonAliasNr { get; set; }
    }

    /// <summary>
    /// PersonInterfaceContactAddressGw
    /// </summary>
    public class PersonInterfaceContactAddressGw
    {
        /// <summary>
        /// IdRepContactAddressType
        /// </summary>
        public string IdRepContactAddressType { get; set; }

        /// <summary>
        /// IdPersonInterface
        /// </summary>
        public string IdPersonInterface { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public bool IsDeleted { get; set; }
    }

    /// <summary>
    /// PersonUnwanted
    /// </summary>
    public class PersonUnwanted
    {
        /// <summary>
        /// IdPersonUnwanted
        /// </summary>
        public string IdPersonUnwanted { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }
    }

    /// <summary>
    /// PersonUnwanted
    /// </summary>
    public class PersonRelationshipToPerson
    {
        /// <summary>
        /// MasterIdPerson
        /// </summary>
        public string MasterIdPerson { get; set; }

        /// <summary>
        /// SlaveIdPerson
        /// </summary>
        public string SlaveIdPerson { get; set; }

        /// <summary>
        /// SlaveIdPerson
        /// </summary>
        public bool IsBlocked { get; set; }
    }

    /// <summary>
    /// SharingCompany
    /// </summary>
    public class SharingCompany
    {
        /// <summary>
        /// IdSharingCompany
        /// </summary>
        public string IdSharingCompany { get; set; }

        /// <summary>
        /// Company
        /// </summary>
        public string Company { get; set; }

        /// <summary>
        /// Department
        /// </summary>
        public string Department { get; set; }

        /// <summary>
        /// Position
        /// </summary>
        public string Position { get; set; }
    }

    /// <summary>
    /// PersonStatus
    /// </summary>
    public class Communication
    {
        /// <summary>
        /// IdPersonInterface
        /// </summary>
        public string IdPersonInterface { get; set; }

        /// <summary>
        /// CommunicationType
        /// </summary>
        public string CommunicationType { get; set; }

        /// <summary>
        /// CommunicationValue
        /// </summary>
        public string CommunicationValue { get; set; }

        /// <summary>
        /// CommValue1
        /// </summary>
        public string CommValue1 { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// CommunicationNote
        /// </summary>
        public string CommunicationNote { get; set; }

        /// <summary>
        /// IdRepCommunicationType
        /// </summary>
        public string IdRepCommunicationType { get; set; }

        /// <summary>
        /// IdSharingCommunication
        /// </summary>
        public string IdSharingCommunication { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }
    }

    /// <summary>
    /// PersonInterfaceContactCountry
    /// </summary>
    public class PersonInterfaceContactCountry
    {
        /// <summary>
        /// IdCountrylanguage
        /// </summary>
        public string IdCountrylanguage { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// IdentiferCode
    /// </summary>
    public class IdentiferCode
    {
        /// <summary>
        /// IdRepCashProviderPaymentTermsColumns
        /// </summary>
        public string IdRepCashProviderPaymentTermsColumns { get; set; }

        /// <summary>
        /// IdentiferValue
        /// </summary>
        public string IdentiferValue { get; set; }
    }

    /// <summary>
    /// CashProviderPaymentTerms
    /// </summary>
    public class CashProviderPaymentTerms
    {
        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public string IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// IdRepCashProviderPaymentTermsType
        /// </summary>
        public string IdRepCashProviderPaymentTermsType { get; set; }

        /// <summary>
        /// PaymentsTermsName
        /// </summary>
        public string PaymentsTermsName { get; set; }
    }

    /// <summary>
    /// CashProviderPaymentTermsCurrency
    /// </summary>
    public class CashProviderPaymentTermsCurrency
    {
        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public string IdRepCurrencyCode { get; set; }
    }

    /// <summary>
    /// PersonCashProviderPaymentTermsGw
    /// </summary>
    public class PersonCashProviderPaymentTermsGw
    {
        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get; set; }
    }

    /// <summary>
    /// CashProviderContract
    /// </summary>
    public class CashProviderContract
    {
        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get; set; }

        /// <summary>
        /// IdRepPaymentsMethods
        /// </summary>
        public string IdRepPaymentsMethods { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public string IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// ContractNr
        /// </summary>
        public string ContractNr { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// CashProviderContractCurrencyContainer
    /// </summary>
    public class CashProviderContractCurrencyContainer
    {
        /// <summary>
        /// IdRepCurrencyCode
        /// </summary>
        public string IdRepCurrencyCode { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public string IsActive { get; set; }
    }

    /// <summary>
    /// CashProviderContractPerson
    /// </summary>
    public class CashProviderContractPerson
    {
        /// <summary>
        /// IdPersonMandant
        /// </summary>
        public string IdPersonMandant { get; set; }

        /// <summary>
        /// IdPersonPrincipal
        /// </summary>
        public string IdPersonPrincipal { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// CashProviderContractCreditcardTypeContainer
    /// </summary>
    public class CashProviderContractCreditcardTypeContainer
    {
        /// <summary>
        /// IdRepCreditCardType
        /// </summary>
        public string IdRepCreditCardType { get; set; }
    }

    /// <summary>
    /// ProviderCosts
    /// </summary>
    public class ProviderCosts
    {
        /// <summary>
        /// IdPerson
        /// </summary>
        public string IdPerson { get; set; }

        /// <summary>
        /// IdRepPaymentsMethods
        /// </summary>
        public string IdRepPaymentsMethods { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }
    }

    /// <summary>
    /// ProviderCostsItems
    /// </summary>
    public class ProviderCostsItems
    {
        /// <summary>
        /// IdRepCurrencyCode
        /// </summary>
        public string IdRepCurrencyCode { get; set; }

        /// <summary>
        /// IdRepProviderCostsType
        /// </summary>
        public string IdRepProviderCostsType { get; set; }

        /// <summary>
        /// Amount
        /// </summary>
        public string Amount { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }
    }

    #endregion

    #region Person Model
    /// <summary>
    /// PersonModel
    /// </summary>
    public class PersonModel
    {
        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public IdPerson IdPerson { get; set; }

        /// <summary>
        /// SlaveIdPerson
        /// </summary>
        public BaseProperty SlaveIdPerson { get; set; }

        /// <summary>
        /// IdSharingCompany
        /// </summary>
        public IdPerson IdSharingCompany { get; set; }

        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public PersonNr PersonNr { get; set; }

        /// <summary>
        /// Alias identifier for this customer.
        /// </summary>
        public Alias Alias { get { return new Alias(new JProperty("Alias", "0" + PersonNr ?? PersonNr.Value)); } set { } }

        /// <summary>
        /// The customer's preferred given name
        /// </summary>
        public FirstName FirstName { get; set; }

        /// <summary>
        /// The customer's surname(s)
        /// </summary>
        public LastName LastName { get; set; }

        /// <summary>
        /// PersonType
        /// </summary>
        public PersonType PersonType { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public Street Street { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public StreetNr StreetNr { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public StreetAddition1 StreetAddition1 { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public StreetAddition2 StreetAddition2 { get; set; }

        /// <summary>
        /// StreetAddition3
        /// </summary>
        public StreetAddition3 StreetAddition3 { get; set; }

        /// <summary>
        /// Zip
        /// </summary>
        public Zip Zip { get; set; }

        /// <summary>
        /// Zip2
        /// </summary>
        public Zip2 Zip2 { get; set; }

        ///// <summary>
        ///// CreateDate
        ///// </summary>
        //public string CreateDate { get; set; }

        /// <summary>
        /// Pobox
        /// </summary>
        public PoboxLabel PoboxLabel { get; set; }

        /// <summary>
        /// Place
        /// </summary>
        public Place Place { get; set; }

        /// <summary>
        /// City
        /// </summary>
        public City City { get; set; }

        /// <summary>
        /// Area
        /// </summary>
        public Area Area { get; set; }

        /// <summary>
        /// Country
        /// </summary>
        public Country Country { get; set; }

        /// <summary>
        /// Status
        /// </summary>
        public Status Status { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public Notes Notes { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public IsActive IsActive { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public IsDeleted IsDeleted { get; set; }

        /// <summary>
        /// IsMatch
        /// </summary>
        public IsMatch IsMatch { get; set; }

        /// <summary>
        /// IsMatch
        /// </summary>
        public IsMainRecord IsMainRecord { get; set; }

        /// <summary>
        /// IsShortCut
        /// </summary>
        public IsShortCut IsShortCut { get; set; }

        /// <summary>
        /// IdPersonAlias
        /// </summary>
        public IdPersonAlias IdPersonAlias { get; set; }

        /// <summary>
        /// IdPersonInterface
        /// </summary>
        public IdPersonInterface IdPersonInterface { get; set; }

        /// <summary>
        /// IdPersonMasterData
        /// </summary>
        public IdPersonMasterData IdPersonMasterData { get; set; }

        /// <summary>
        /// IdPersonStatus
        /// </summary>
        public IdPersonStatus IdPersonStatus { get; set; }

        /// <summary>
        /// IdPersonTypeGw
        /// </summary>
        public IdPersonTypeGw IdPersonTypeGw { get; set; }

        /// <summary>
        /// IdRepAddressType
        /// </summary>
        public IdRepAddressType IdRepAddressType { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public IdRepIsoCountryCode IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// IdRepLanguage
        /// </summary>
        public IdRepLanguage IdRepLanguage { get; set; }

        /// <summary>
        /// IdRepPersonStatus
        /// </summary>
        public IdRepPersonStatus IdRepPersonStatus { get; set; }

        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public IdRepPersonType IdRepPersonType { get; set; }

        /// <summary>
        /// IdRepPoBox
        /// </summary>
        public IdRepPoBox IdRepPoBox { get; set; }

        /// <summary>
        /// IdRepTitle
        /// </summary>
        public IdRepTitle IdRepTitle { get; set; }

        /// <summary>
        /// IdRepTitleOfCourtesy
        /// </summary>
        public IdRepTitleOfCourtesy IdRepTitleOfCourtesy { get; set; }

        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public IdSharingAddress IdSharingAddress { get; set; }

        /// <summary>
        /// IdSharingName
        /// </summary>
        public IdSharingName IdSharingName { get; set; }

        /// <summary>
        /// BirthHours
        /// </summary>
        public BirthHours BirthHours { get; set; }

        /// <summary>
        /// BirthMinutes
        /// </summary>
        public BirthMinutes BirthMinutes { get; set; }

        /// <summary>
        /// PlaceOfBirth
        /// </summary>
        public PlaceOfBirth PlaceOfBirth { get; set; }

        /// <summary>
        /// PersonStatus
        /// </summary>
        public PersonStatus PersonStatus { get; set; }

        /// <summary>
        /// PersonTypeGw
        /// </summary>
        public PersonTypeGw PersonTypeGw { get; set; }

        /// <summary>
        /// PersonAliasNr
        /// </summary>
        public PersonAliasNr PersonAliasNr { get; set; }

        /// <summary>
        /// PersonMasterData
        /// </summary>
        public PersonMasterData PersonMasterData { get; set; }

        /// <summary>
        /// SuffixName
        /// </summary>
        public SuffixName SuffixName { get; set; }

        /// <summary>
        /// COName
        /// </summary>
        public COName COName { get; set; }

        /// <summary>
        /// Middlename
        /// </summary>
        public Middlename Middlename { get; set; }

        /// <summary>
        /// NameAddition
        /// </summary>
        public NameAddition NameAddition { get; set; }

        /// <summary>
        /// NameAddition
        /// </summary>
        public CountryAddition CountryAddition { get; set; }

        /// <summary>
        /// DateOfBirth
        /// </summary>
        public DateOfBirth DateOfBirth { get; set; }

        /// <summary>
        /// ContactType
        /// </summary>
        public ContactType ContactType { get; set; }

        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public IdSettingsGUI IdSettingsGUI { get; set; }

        /// <summary>
        /// Company
        /// </summary>
        public Company Company { get; set; }

        /// <summary>
        /// Department
        /// </summary>
        public Department Department { get; set; }

        /// <summary>
        /// Position
        /// </summary>
        public Position Position { get; set; }

        /// <summary>
        /// SharingAddressHiddenFields
        /// </summary>
        public SharingAddressHiddenFields SharingAddressHiddenFields { get; set; }

        /// <summary>
        /// AddressFormat
        /// </summary>
        public AddressFormat AddressFormat { get; set; }

        /// <summary>
        /// IdRepPersonBusinessTitle
        /// </summary>
        public IdRepPersonBusinessTitle IdRepPersonBusinessTitle { get; set; }
    }

    /// <summary>
    /// PersonEditModel
    /// </summary>
    public class PersonEditModel
    {
        public Person Person { get; set; }

        public PersonTypeGw PersonTypeGw { get; set; }

        public PersonInterface PersonInterface { get; set; }

        public PersonMasterData PersonMasterData { get; set; }

        public PersonStatus PersonStatus { get; set; }

        public PersonAlias PersonAlias { get; set; }

        public SharingName SharingName { get; set; }

        public SharingAddress SharingAddress { get; set; }

        public PersonUnwanted PersonUnwanted { get; set; }

        public PersonRelationshipToPerson PersonRelationshipToPerson { get; set; }

        public SharingCompany SharingCompany { get; set; }

        public IList<Communication> Communications { get; set; }
    }

    /// <summary>
    /// PaymentEditModel
    /// </summary>
    public class PaymentEditModel
    {
        public CashProviderPaymentTerms CashProviderPaymentTerms { get; set; }

        public PersonCashProviderPaymentTermsGw PersonCashProviderPaymentTermsGw { get; set; }

        public CashProviderPaymentTermsCurrency CashProviderPaymentTermsCurrency { get; set; }

        public IList<IdentiferCode> IdentiferCodes { get; set; }
    }

    /// <summary>
    /// CCPRNEditModel
    /// </summary>
    public class CCPRNEditModel
    {
        public CashProviderContract CashProviderContract { get; set; }

        public CashProviderContractCurrencyContainer CashProviderContractCurrencyContainer { get; set; }

        public CashProviderContractPerson CashProviderContractPerson { get; set; }

        public IList<CashProviderContractCreditcardTypeContainer> CashProviderContractCreditcardTypeContainer { get; set; }
    }

    /// <summary>
    /// CostProviderEditModel
    /// </summary>
    public class CostProviderEditModel
    {
        public ProviderCosts ProviderCosts { get; set; }

        public IList<ProviderCostsItems> ProviderCostsItems { get; set; }
    }

    #endregion

    #region Save Customer
    public class SaveCustomerModel
    {
        public Dictionary<string, object> Data { get; set; }
    }
    #endregion
}
