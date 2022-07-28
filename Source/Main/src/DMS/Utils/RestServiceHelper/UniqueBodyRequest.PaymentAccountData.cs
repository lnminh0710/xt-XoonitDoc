using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class PaymentData : Data
    {
        /// <summary>
        /// IdCashProviderPaymentTerms
        /// </summary>
        public string IdCashProviderPaymentTerms { get; set; }
    }

    public class PaymentCreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

        /// <summary>
        /// B00CashProviderPaymentTerms_PaymentsTermsName
        /// </summary>
        public string B00CashProviderPaymentTerms_PaymentsTermsName { get; set; }

        /// <summary>
        /// B00CashProviderPaymentTerms_IdRepCashProviderPaymentTermsType
        /// </summary>
        public string B00CashProviderPaymentTerms_IdRepCashProviderPaymentTermsType { get; set; }

        /// <summary>
        /// B00CashProviderPaymentTerms_IdRepIsoCountryCode
        /// </summary>
        public string B00CashProviderPaymentTerms_IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// B00CashProviderPaymentTerms_IsActive
        /// </summary>
        public string B00CashProviderPaymentTerms_IsActive { get; set; }

        /// <summary>
        /// B00CashProviderPaymentTermsCurrency_IdRepCurrencyCode
        /// </summary>
        public string B00CashProviderPaymentTermsCurrency_IdRepCurrencyCode { get; set; }

        /// <summary>
        /// B00CashProviderPaymentTermsCurrency_IsActive
        /// </summary>
        public string B00CashProviderPaymentTermsCurrency_IsActive { get; set; }

        /// <summary>
        /// B00PersonCashProviderPaymentTermsGw_IdPerson
        /// </summary>
        public string B00PersonCashProviderPaymentTermsGw_IdPerson { get; set; }

    }

    public class CCPRNData : Data
    {
        /// <summary>
        /// IdCashProviderContract
        /// </summary>
        public string IdCashProviderContract { get; set; }
    }

    public class CCPRNCreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

        /// <summary>
        /// B00CashProviderContract_IdPerson
        /// </summary>
        public string B00CashProviderContract_IdPerson { get; set; }

        /// <summary>
        /// B00CashProviderContract_IdRepIsoCountryCode
        /// </summary>
        public string B00CashProviderContract_IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// B00CashProviderContract_IdRepPaymentsMethods
        /// </summary>
        public string B00CashProviderContract_IdRepPaymentsMethods { get; set; }

        /// <summary>
        /// B00CashProviderContract_ContractNr
        /// </summary>
        public string B00CashProviderContract_ContractNr { get; set; }

        /// <summary>
        /// B00CashProviderContract_IsActive
        /// </summary>
        public string B00CashProviderContract_IsActive { get; set; }

        /// <summary>
        /// B00CashProviderContractCurrencyContainer_IdRepCurrencyCode
        /// </summary>
        public string B00CashProviderContractCurrencyContainer_IdRepCurrencyCode { get; set; }

        /// <summary>
        /// B00CashProviderContractCurrencyContainer_IsActive
        /// </summary>
        public string B00CashProviderContractCurrencyContainer_IsActive { get; set; }

        /// <summary>
        /// B00CashProviderContractPerson_IdPersonMandant
        /// </summary>
        public string B00CashProviderContractPerson_IdPersonMandant { get; set; }

        /// <summary>
        /// B00CashProviderContractPerson_IdPersonPrincipal
        /// </summary>
        public string B00CashProviderContractPerson_IdPersonPrincipal { get; set; }

        /// <summary>
        /// B00CashProviderContractPerson_IsActive
        /// </summary>
        public string B00CashProviderContractPerson_IsActive { get; set; }

    }

    public class CostProviderCreateData : Data
    {
        private string jSONText = "{}";
        /// <summary>
        /// JSONText
        /// </summary>
        public string JSONText { get { return jSONText; } set { if (!string.IsNullOrEmpty(value)) jSONText = value; } }

        /// <summary>
        /// B00ProviderCosts_IdPerson
        /// </summary>
        public string B00ProviderCosts_IdPerson { get; set; }

        /// <summary>
        /// B00ProviderCosts_IdRepPaymentsMethods
        /// </summary>
        public string B00ProviderCosts_IdRepPaymentsMethods { get; set; }

        /// <summary>
        /// B00ProviderCosts_Notes
        /// </summary>
        public string B00ProviderCosts_Notes { get; set; }

        /// <summary>
        /// B00ProviderCosts_IsActive
        /// </summary>
        public string B00ProviderCosts_IsActive { get; set; }
    }
}
