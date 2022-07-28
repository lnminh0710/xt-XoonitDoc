namespace DMS.Utils.RestServiceHelper
{
    public class B00Person
    {
        public string IdPerson { get; set; }
        public string IdApplicationOwner { get; set; }
        public string PersonNr { get; set; }
        public string LogoName { get; set; }
        public string GUID { get; set; }
        public string Notes { get; set; }
        public string IsMatch { get; set; }
        public string IsMatchMaster { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B00SharingName
    {
        public string IdSharingName { get; set; }
        public string IdRepTitleOfCourtesy { get; set; }
        public string IdRepTitle { get; set; }
        public string IdApplicationOwner { get; set; }
        public string GUID { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string LastName2 { get; set; }
        public string FirstName2 { get; set; }
        public string COName { get; set; }
        public string Middlename { get; set; }
        public string SuffixName { get; set; }
        public string NameAddition { get; set; }
        public string Notes { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B00SharingAddress
    {
        public string IdSharingAddress { get; set; }
        public string IdRepLanguage { get; set; }
        public string IdRepIsoCountryCode { get; set; }
        public string IdRepPoBox { get; set; }
        public string IdApplicationOwner { get; set; }
        public string GUID { get; set; }
        public string Street { get; set; }
        public string StreetNr { get; set; }
        public string StreetAddition1 { get; set; }
        public string StreetAddition2 { get; set; }
        public string Streetaddition3 { get; set; }
        public string Addition { get; set; }
        public string PoboxLabel { get; set; }
        public string Zip { get; set; }
        public string Zip2 { get; set; }
        public string Place { get; set; }
        public string Area { get; set; }
        public string CountryAddition { get; set; }
        public string Notes { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B00SharingCompany
    {
        public string IdSharingCompany { get; set; }
        public string IdApplicationOwner { get; set; }
        public string GUID { get; set; }
        public string Company { get; set; }
        public string Position { get; set; }
        public string Department { get; set; }
        public string Notes { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }

    public class B00PersonInterface
    {
        public string IdPersonInterface { get; set; }
        public string IdSharingName { get; set; }
        public string IdSharingCompany { get; set; }
        public string IdRepAddressType { get; set; }
        public string IdSharingAddress { get; set; }
        public string IdPerson { get; set; }
        public string GUID { get; set; }
        public string IsMainRecord { get; set; }
        public string IsDeleted { get; set; }
        public string CreateDate { get; set; }
        public string UpdateDate { get; set; }
    }
}
