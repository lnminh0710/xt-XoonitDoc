using DMS.Models;
using DMS.Utils;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace DMS.Business
{
    /// <summary>
    /// IPriceTagBusiness
    /// </summary>
    public interface IPriceTagBusiness
    {
        Task<object> GetPriceTag(Dictionary<string, object> values);
        Task<object> CRUDPriceTag(Dictionary<string, object> data);

        Task<WSEditReturn> SaveDocumentFile(ImportPriceTagDocumentSessionModel sess, List<IFormFile> files, CancellationToken cancellationToken);

        Task<object> GetAttachmentsOfPriceTag(Dictionary<string, object> values);
    }
}

