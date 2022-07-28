using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Models.DMS;

namespace DMS.Business
{
    public interface IOCRDocumentBusiness
    {
        Task<object> ManuallyOCRForDocuments(RequestOCRMauallyModel ocr_ids);

    }
}

