using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.Property
{
    public class BaseProperty
    {
        public BaseProperty(JProperty token)
        {
            if (token != null)
            {
                DisplayValue = token.Name;
                Value = token.Value.ToString().Replace("{", string.Empty).Replace("}", string.Empty);
            }
        }
        [JsonProperty(PropertyName = "displayValue")]
        public string DisplayValue { get; set; }

        [JsonProperty(PropertyName = "value")]
        public string Value { get; set; }

        [JsonProperty(PropertyName = "originalComlumnName")]
        public string OriginalColumnName { get; set; } = string.Empty;

        [JsonProperty(PropertyName = "setting")]
        public string Setting { get; set; } = string.Empty;

    }

    /// <summary>
    /// IdPerson
    /// </summary>
    public class IdPerson : BaseProperty
    {
        public IdPerson(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdPersonToPrincipal
    /// </summary>
    public class IdPersonToPrincipal : BaseProperty
    {
        public IdPersonToPrincipal(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// PersonType
    /// </summary>
    public class PersonType : BaseProperty
    {
        public PersonType(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// PersonNr
    /// </summary>
    public class PersonNr : BaseProperty
    {
        public PersonNr(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Notes
    /// </summary>
    public class Notes : BaseProperty
    {
        public Notes(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsMatch
    /// </summary>
    public class IsMatch : BaseProperty
    {
        public IsMatch(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsActive
    /// </summary>
    public class IsActive : BaseProperty
    {
        public IsActive(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsDeleted
    /// </summary>
    public class IsDeleted : BaseProperty
    {
        public IsDeleted(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdPersonTypeGw
    /// </summary>
    public class IdPersonTypeGw : BaseProperty
    {
        public IdPersonTypeGw(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdPersonTypeGw
    /// </summary>
    public class IdRepPersonType : BaseProperty
    {
        public IdRepPersonType(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdSettingsGUI
    /// </summary>
    public class IdSettingsGUI : BaseProperty
    {
        public IdSettingsGUI(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsShortCut
    /// </summary>
    public class IsShortCut : BaseProperty
    {
        public IsShortCut(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsBlocked
    /// </summary>
    public class IsBlocked : BaseProperty
    {
        public IsBlocked(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdSharingName
    /// </summary>
    public class IdSharingName : BaseProperty
    {
        public IdSharingName(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepTitleOfCourtesy
    /// </summary>
    public class IdRepTitleOfCourtesy : BaseProperty
    {
        public IdRepTitleOfCourtesy(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepTitle
    /// </summary>
    public class IdRepTitle : BaseProperty
    {
        public IdRepTitle(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// CreateDate
    /// </summary>
    public class CreateDate : BaseProperty
    {
        public CreateDate(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// UpdateDate
    /// </summary>
    public class UpdateDate : BaseProperty
    {
        public UpdateDate(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Street
    /// </summary>
    public class Street : BaseProperty
    {
        public Street(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// StreetNr
    /// </summary>
    public class StreetNr : BaseProperty
    {
        public StreetNr(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// StreetAddition1
    /// </summary>
    public class StreetAddition1 : BaseProperty
    {
        public StreetAddition1(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// StreetAddition2
    /// </summary>
    public class StreetAddition2 : BaseProperty
    {
        public StreetAddition2(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Streetaddition3
    /// </summary>
    public class StreetAddition3 : BaseProperty
    {
        public StreetAddition3(JProperty token) : base(token)
        {
        }
    }


    /// <summary>
    /// Addition
    /// </summary>
    public class Addition : BaseProperty
    {
        public Addition(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// PoboxLabel
    /// </summary>
    public class PoboxLabel : BaseProperty
    {
        public PoboxLabel(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Zip
    /// </summary>
    public class Zip : BaseProperty
    {
        public Zip(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Zip2
    /// </summary>
    public class Zip2 : BaseProperty
    {
        public Zip2(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Place
    /// </summary>
    public class Place : BaseProperty
    {
        public Place(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Area
    /// </summary>
    public class Area : BaseProperty
    {
        public Area(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// CountryAddition
    /// </summary>
    public class CountryAddition : BaseProperty
    {
        public CountryAddition(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdPersonInterface
    /// </summary>
    public class IdPersonInterface : BaseProperty
    {
        public IdPersonInterface(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepAddressType
    /// </summary>
    public class IdRepAddressType : BaseProperty
    {
        public IdRepAddressType(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsMainRecord
    /// </summary>
    public class IsMainRecord : BaseProperty
    {
        public IsMainRecord(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdPersonMasterData
    /// </summary>
    public class IdPersonMasterData : BaseProperty
    {
        public IdPersonMasterData(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// DateOfBirth
    /// </summary>
    public class DateOfBirth : BaseProperty
    {
        public DateOfBirth(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// PersonalId
    /// </summary>
    public class PersonalId : BaseProperty
    {
        public PersonalId(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// BirthHours
    /// </summary>
    public class BirthHours : BaseProperty
    {
        public BirthHours(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// BirthMinutes
    /// </summary>
    public class BirthMinutes : BaseProperty
    {
        public BirthMinutes(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdPersonStatus
    /// </summary>
    public class IdPersonStatus : BaseProperty
    {
        public IdPersonStatus(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdPersonStatus
    /// </summary>
    public class IdRepPersonStatus : BaseProperty
    {
        public IdRepPersonStatus(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdPersonAlias
    /// </summary>
    public class IdPersonAlias : BaseProperty
    {
        public IdPersonAlias(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// PersonAliasNr
    /// </summary>
    public class PersonAliasNr : BaseProperty
    {
        public PersonAliasNr(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// PlaceOfBirth
    /// </summary>
    public class PlaceOfBirth : BaseProperty
    {
        public PlaceOfBirth(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// AddressNotes
    /// </summary>
    public class AddressNotes : BaseProperty
    {
        public AddressNotes(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Last-Name
    /// </summary>
    public class LastName : BaseProperty
    {
        public LastName(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// First-Name
    /// </summary>
    public class FirstName : BaseProperty
    {
        public FirstName(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// COName
    /// </summary>
    public class COName : BaseProperty
    {
        public COName(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Middlename
    /// </summary>
    public class Middlename : BaseProperty
    {
        public Middlename(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// SuffixName
    /// </summary>
    public class SuffixName : BaseProperty
    {
        public SuffixName(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// NameAddition
    /// </summary>
    public class NameAddition : BaseProperty
    {
        public NameAddition(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// City
    /// </summary>
    public class City : BaseProperty
    {
        public City(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdSharingAddress
    /// </summary>
    public class IdSharingAddress : BaseProperty
    {
        public IdSharingAddress(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Company
    /// </summary>
    public class Company : BaseProperty
    {
        public Company(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Department
    /// </summary>
    public class Department : BaseProperty
    {
        public Department(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Position
    /// </summary>
    public class Position : BaseProperty
    {
        public Position(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepLanguage
    /// </summary>
    public class IdRepLanguage : BaseProperty
    {
        public IdRepLanguage(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepIsoCountryCode
    /// </summary>
    public class IdRepIsoCountryCode : BaseProperty
    {
        public IdRepIsoCountryCode(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepPoBox
    /// </summary>
    public class IdRepPoBox : BaseProperty
    {
        public IdRepPoBox(JProperty token) : base(token)
        {
        }
    }


    /// <summary>
    /// Country
    /// </summary>
    public class Country : BaseProperty
    {
        public Country(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Status
    /// </summary>
    public class Status : BaseProperty
    {
        public Status(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Alias
    /// </summary>
    public class Alias : BaseProperty
    {
        public Alias(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// ContactType
    /// </summary>
    public class ContactType : BaseProperty
    {
        public ContactType(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdArticle
    /// </summary>
    public class IdArticle : BaseProperty
    {
        public IdArticle(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepArticleStatus
    /// </summary>
    public class IdRepArticleStatus : BaseProperty
    {
        public IdRepArticleStatus(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// ArticleNr
    /// </summary>
    public class ArticleNr : BaseProperty
    {
        public ArticleNr(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// ArticleManufacturersNr
    /// </summary>
    public class ArticleManufacturersNr : BaseProperty
    {
        public ArticleManufacturersNr(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// ArticleDescriptionShort
    /// </summary>
    public class ArticleDescriptionShort : BaseProperty
    {
        public ArticleDescriptionShort(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// ArticleDescriptionLong
    /// </summary>
    public class ArticleDescriptionLong : BaseProperty
    {
        public ArticleDescriptionLong(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// ArticleNameShort
    /// </summary>
    public class ArticleNameShort : BaseProperty
    {
        public ArticleNameShort(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsWarehouseControl
    /// </summary>
    public class IsWarehouseControl : BaseProperty
    {
        public IsWarehouseControl(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsSetArticle
    /// </summary>
    public class IsSetArticle : BaseProperty
    {
        public IsSetArticle(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsVirtual
    /// </summary>
    public class IsVirtual : BaseProperty
    {
        public IsVirtual(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsPrintProduct
    /// </summary>
    public class IsPrintProduct : BaseProperty
    {
        public IsPrintProduct(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IsService
    /// </summary>
    public class IsService : BaseProperty
    {
        public IsService(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdArticleDescription
    /// </summary>
    public class IdArticleDescription : BaseProperty
    {
        public IdArticleDescription(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdArticleName
    /// </summary>
    public class IdArticleName : BaseProperty
    {
        public IdArticleName(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// CountryCode
    /// </summary>
    public class DefaultValue : BaseProperty
    {
        public DefaultValue(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// InvoiceNr
    /// </summary>
    public class InvoiceNr : BaseProperty
    {
        public InvoiceNr(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepVat1
    /// </summary>
    public class IdRepVat1 : BaseProperty
    {
        public IdRepVat1(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepVat2
    /// </summary>
    public class IdRepVat2 : BaseProperty
    {
        public IdRepVat2(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// VatAmount2
    /// </summary>
    public class VatAmount2 : BaseProperty
    {
        public VatAmount2(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// DoneDate
    /// </summary>
    public class DoneDate : BaseProperty
    {
        public DoneDate(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Attachment
    /// </summary>
    public class Attachment : BaseProperty
    {
        public Attachment(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdBusinessCosts
    /// </summary>
    public class IdBusinessCosts : BaseProperty
    {
        public IdBusinessCosts(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepCurrencyCode
    /// </summary>
    public class IdRepCurrencyCode : BaseProperty
    {
        public IdRepCurrencyCode(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepBusinessCosts
    /// </summary>
    public class IdRepBusinessCosts : BaseProperty
    {
        public IdRepBusinessCosts(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// InvoiceDate
    /// </summary>
    public class InvoiceDate : BaseProperty
    {
        public InvoiceDate(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// CurrencyCode
    /// </summary>
    public class CurrencyCode : BaseProperty
    {
        public CurrencyCode(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// Amount
    /// </summary>
    public class Amount : BaseProperty
    {
        public Amount(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// VatAmount1
    /// </summary>
    public class VatAmount1 : BaseProperty
    {
        public VatAmount1(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// SharingAddressHiddenFields
    /// </summary>
    public class SharingAddressHiddenFields : BaseProperty
    {
        public SharingAddressHiddenFields(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// AddressFormat
    /// </summary>
    public class AddressFormat : BaseProperty
    {
        public AddressFormat(JProperty token) : base(token)
        {
        }
    }

    /// <summary>
    /// IdRepPersonBusinessTitle
    /// </summary>
    public class IdRepPersonBusinessTitle : BaseProperty
    {
        public IdRepPersonBusinessTitle(JProperty token) : base(token)
        {
        }
    }
}
