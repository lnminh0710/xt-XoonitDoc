using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Models;

namespace DMS.Business
{
    public interface IFileBusiness
    {
        Task<UploadFileResult> UploadFile(IFormFileCollection files, UploadMode? mode = null, string subFolder = null);

        /// <summary>
        /// Upload File
        /// </summary>
        /// <param name="fileData">{name (1.jpg,...), size (in bytes), type (image/jpeg,...), result (base64)}</param>
        /// <param name="mode"></param>
        /// <param name="subFolder"></param>
        /// <returns></returns>
        Task<UploadFileResult> UploadFile(IDictionary<string, object> fileData, UploadMode? mode = null, string subFolder = null);

        /// <summary>
        /// Generate Pdf File
        /// </summary>
        /// <param name="values"></param>
        /// <param name="templateFullFileName"></param>
        /// <param name="saveFullFileName"></param>
        /// <returns></returns>
        Task<bool> GeneratePdfFile(IDictionary<string, string> values, string templateFullFileName, string saveFullFileName);

        /// <summary>
        /// Generate Pdf File
        /// </summary>
        /// <param name="model"></param>
        /// <param name="saveFullFileName"></param>
        /// <returns></returns>
        Task<bool> GeneratePdfFile(OrderProcessingPdf.OrderProcessingPdfModel model, string saveFullFileName);
    }
}

