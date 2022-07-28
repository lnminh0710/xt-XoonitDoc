using DMS.Models.DMS;
using DMS.Models.DMS.Capture;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;

namespace DMS.Models
{
    public class SaveInvoiceModel : CapturedBaseDocumentModel
    {
        public InvoiceFormViewModel Invoice { get; set; }
        public JObject TaxAmount { get; set; }
        public PersonContactFormModel PersonRemitter { get; set; }
        public PersonContactFormModel PersonBeneficiary { get; set; }
        public PersonBankFormModel PersonBank { get; set; }

        [JsonIgnore]
        public object PersonBeneficiaryComm { get; internal set; }

        [JsonIgnore]
        public object PersonRemitterComm { get; internal set; }

        [JsonIgnore]
        public object PersonBankComm { get; internal set; }


    }

    public class InvoiceFormViewModel
    {
        private string _idInvoicePdm;

        [JsonIgnore]
        public string IdInvoicePdm
        {
            get
            {
                return _idInvoicePdm;
            }
            set
            {
                _idInvoicePdm = value;
            }
        }

        public string CustomerNr { get; set; }
        public string GuaranteeDateOfExpiry { get; set; }
        public string Currency { get; set; }
        public string IdRepMeansOfPayment { get; set; }
        public string InvoiceAmount { get; set; }
        public string InvoiceDate { get; set; }
        public string InvoiceNr { get; set; }
        public string IsGuarantee { get; set; }
        public string IsPaid { get; set; }
        public string IsTaxRelevant { get; set; }
        public string PayableWithinDays { get; set; }
        public string PurposeOfPayment { get; set; }
        public string VatNr { get; set; }
        public string InvoiceExpirydDate { get; set; }
        public string GuranteeExpiryDate { get; set; }
        public string Notes { get; set; }
        public string ESRNr { get; set; }

        public string ContoNr { get; set; }
        public string SWIFTBIC { get; set; }
        public string IBAN { get; set; }
    }
}
