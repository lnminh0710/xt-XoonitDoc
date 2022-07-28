using DMS.Models.DMS;
using DMS.Models.DMS.Capture;
using DMS.Utils.RestServiceHelper;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;

namespace DMS.Models
{
    public class SaveContractModel : CapturedBaseDocumentModel
    {
        public ContractFormViewModel Contract { get; set; }
        public PersonContactFormModel PersonContractor { get; set; }
        public PersonContactFormModel PersonContractingParty { get; set; }

        public List<OCRDocumentContainerTextPosition> OCRJsonTextPositions { get; set; }

        [JsonIgnore]
        public object PersonContractorComm { get; set; }
        [JsonIgnore]
        public object PersonContractingPartyComm { get; set; }
    }

    public class ContractFormViewModel
    {
        public string IdContract { get; set; }
        public string ContractNr { get; set; }
        public string NetAnnualPremium { get; set; }
        public string IdRepCurrencyCode { get; set; }
        public string CommencementOfInsurance { get; set; }
        public string TermOfContract { get; set; }
        public string MemeberNr { get; set; }
        public string ContractDate { get; set; }
        public string UntilDate { get; set; }
        public string DurationInMonths { get; set; }
        public string CancellationInMonths { get; set; }
        public string CancellationUntilDate { get; set; }
        public string Notes { get; set; }
    }

    
}
