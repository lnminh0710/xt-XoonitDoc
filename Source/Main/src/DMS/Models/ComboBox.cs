using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.Property;

namespace DMS.Models
{
    /// <summary>
    /// BaseComboBox
    /// </summary>
    public class BaseComboBox
    {
        /// <summary>
        /// IdValue
        /// </summary>
        public int IdValue { get; set; }

        /// <summary>
        /// TextValue
        /// </summary>
        public string TextValue { get; set; }
    }

    /// <summary>
    /// TitleComboBox
    /// </summary>
    public class TitleComboBox: BaseComboBox
    {
    }

    /// <summary>
    /// CurrencyComboBox
    /// </summary>
    public class CurrencyComboBox : BaseComboBox
    {
    }

    /// <summary>
    /// CashProviderTypeComboBox
    /// </summary>
    public class CashProviderTypeComboBox : BaseComboBox
    {
    }

    /// <summary>
    /// PrincipalComboBox
    /// </summary>
    public class PrincipalComboBox : BaseComboBox
    {
    }

    /// <summary>
    /// IdentifierCodeComboBox
    /// </summary>
    public class IdentifierCodeComboBox : BaseComboBox
    {
    }

    /// <summary>
    /// PaymentTypeComboBox
    /// </summary>
    public class PaymentTypeComboBox : BaseComboBox
    {
    }

    /// <summary>
    /// CountryCodeComboBox
    /// </summary>
    public class CountryCodeComboBox : BaseComboBox
    {
        /// <summary>
        /// IsoCode
        /// </summary>
        public string IsoCode { get; set; }

        /// <summary>
        /// IsMain
        /// </summary>
        public string IsMain { get; set; }
    }

    /// <summary>
    /// CountryCodeComboBox
    /// </summary>
    public class LanguageComboBox: BaseComboBox
    {
        /// <summary>
        /// IsoCode
        /// </LanguageCode>
        public string LanguageCode { get; set; }
    }

    /// <summary>
    /// CountryCodeComboBox
    /// </summary>
    public class POBoxComboBox: BaseComboBox
    {
        /// <summary>
        /// IdPOBox
        /// </summary>
        public int IdPOBox { get; set; }

        /// <summary>
        /// POBox
        /// </LanguageCode>
        public string POBox { get; set; }
    }

    /// <summary>
    /// MandantComboBox
    /// </summary>
    public class MandantComboBox : BaseComboBox
    {
    }

    public class CreditCardTypeComboBox : BaseComboBox
    {
        /// <summary>
        /// CreditCardCode
        /// </summary>
        public string CreditCardCode { get; set; }

        /// <summary>
        /// IconFileName
        /// </LanguageCode>
        public string IconFileName { get; set; }
    }

    /// <summary>
    /// ProviderCostTypeComboBox
    /// </summary>
    public class ProviderCostTypeComboBox : BaseComboBox
    {
    }

    public class VATComboBox : BaseComboBox
    {
        /// <summary>
        /// CreditCardCode
        /// </summary>
        public string VatRate { get; set; }
    }

    /// <summary>
    /// CustomerStatusComboBox
    /// </summary>
    public class CustomerStatusComboBox: BaseComboBox
    {
        /// <summary>
        /// IdRepPersonStatus
        /// </summary>
        public int IdRepPersonStatus { get; set; }

        private string _customer_Status;
        /// <summary>
        /// Customer Status
        /// </LanguageCode>
        [JsonProperty(PropertyName = "Customer Status")]
        public string Customer_Status {
            get { return _customer_Status; }
            set {
                if (string.IsNullOrEmpty(_customerStatus))
                    _customerStatus = value;
                _customer_Status = value;
            }
        }

        private string _customerStatus;
        /// <summary>
        /// CustomerStatus
        /// </summary>
        public string CustomerStatus { get { return _customerStatus; } set {  } }
    }

    /// <summary>
    /// CommunicationTypeType
    /// </summary>
    public class CommunicationTypeTypeComboBox: BaseComboBox
    {
    }

    /// <summary>
    /// TitleOfCourtesy
    /// </summary>
    public class TitleOfCourtesyComboBox: BaseComboBox
    {
    }

    /// <summary>
    /// ContactType
    /// </summary>
    public class ContactTypeComboBox: BaseComboBox
    {
    }

    /// <summary>
    /// ArticleStatus
    /// </summary>
    public class ArticleStatusComboBox : BaseComboBox
    {
    }

    public class ComboBoxModel
    {
        public IList<TitleComboBox> Title { get; set; }
        public IList<CountryCodeComboBox> CountryCode { get; set; }
        public IList<LanguageComboBox> Language { get; set; }
        public IList<CustomerStatusComboBox> CustomerStatus { get; set; }
        public IList<POBoxComboBox> POBox { get; set; }
        public IList<CommunicationTypeTypeComboBox> CommunicationTypeType { get; set; }
        public IList<TitleOfCourtesyComboBox> TitleOfCourtesy { get; set; }
        public IList<ContactTypeComboBox> ContactType { get; set; }
        public IList<CurrencyComboBox> Currency { get; set; }
        public IList<CashProviderTypeComboBox> CashProviderType { get; set; }
        public IList<PaymentTypeComboBox> PaymentType { get; set; }
        public IList<PrincipalComboBox> Principal { get; set; }
        public IList<IdentifierCodeComboBox> IdentifierCode { get; set; }
        public IList<MandantComboBox> Mandant { get; set; }
        public IList<CreditCardTypeComboBox> CreditCardType { get; set; }
        public IList<ProviderCostTypeComboBox> ProviderCostType { get; set; }
        public IList<ArticleStatusComboBox> ArticleStatus { get; set; }
        public IList<VATComboBox> VAT { get; set; }
        
    }
}
