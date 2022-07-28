using DMS.Models;
using DMS.Models.DMS;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace DMS.Business
{
    public interface IConvertImageBusiness
    {
        ConvertImageResult ConvertImageByBase64(List<ImageModel> images);
        Task UpdateImages(UpdateImage model);
        [DisplayName("UpdateImages for IdDocumentContainerScans {0}")]
        Task UpdateImagesJob(string IdDocumentContainerScansList);

        void HandleImageBeforeMergeDb(List<DocumentContainerPageScanModel> models);
        ConvertImageResult ConvertImages(string filePath);

        
        string ReadQrCode(ConvertImageResult convertImageResult);

      

    }
}
