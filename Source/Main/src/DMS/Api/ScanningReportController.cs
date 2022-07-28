using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using DMS.Models;
using Microsoft.AspNetCore.Authorization;
using DMS.Business;
using NPOI.SS.Converter;
using NPOI.HSSF.UserModel;
using System;
using NPOI.XSSF.UserModel;
using NPOI.SS.UserModel;
using System.Xml;
using System.IO;
using NPOI.XSSF.Extractor;

// For more information on enabling Web API for empty projects, visit http://go.microsoft.com/fwlink/?LinkID=397860

namespace DMS.Api
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ScanningReportController : BaseController
    {
        private readonly IScanningReportBusiness _stockCorrectionBusiness;

        public ScanningReportController(IScanningReportBusiness stockCorrectionBusiness)
        {
            _stockCorrectionBusiness = stockCorrectionBusiness;
        }

        // GET: api/StockCorrection/GetStockCorrection
        [HttpGet]
        [Route("GetScanningReport")]
        public async Task<object> GetScanningReport(string UID, string email)
        {
            var result = await _stockCorrectionBusiness.GetScanningResult(UID, email);
            try
            {
                if (result == null)
                {
                    return null;
                }
                FileStream fileTemplate = new FileStream(result.ToString(), FileMode.Open, FileAccess.Read);
                IWorkbook workbook = WorkbookFactory.Create(fileTemplate);
                //IWorkbook workbook = (IWorkbook)ExcelToHtmlUtils.LoadXls(result.ToString());
                ExcelToHtmlConverter excelToHtmlConverter = new ExcelToHtmlConverter();

                // Set output parameters
                excelToHtmlConverter.OutputColumnHeaders = false;
                //excelToHtmlConverter.OutputHiddenColumns = false;
                //excelToHtmlConverter.OutputHiddenRows = false;
                excelToHtmlConverter.OutputLeadingSpacesAsNonBreaking = true;
                excelToHtmlConverter.OutputRowNumbers = false;
                excelToHtmlConverter.UseDivsToSpan = true;
                
                //XSSFExportToXml a = new XSSFExportToXml();
                //a.ExportToXML() 
                // Process the Excel file
                excelToHtmlConverter.ProcessWorkbook(workbook);
                StringWriter sw = new StringWriter();
                //XmlWriter wx = XmlWriter.Create(sw);
                XmlTextWriter xw = new XmlTextWriter(sw);
                excelToHtmlConverter.Document.WriteTo(xw);//.WriteContentTo(wx);

                return new ScanningReportForMailing { ExcelPath = "D:\\Projects\\DMS\\ScanningReport_HL_22.05.2020.xlsx", ContentXML = sw.ToString() };
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex);
                return ex.Message;
            }
        }
        [HttpGet]
        [Route("GetScanningReportEmail")]
        public async Task<object> GetScanningReportEmail(string UID, string email)
        {
            return await _stockCorrectionBusiness.GetScanningResultForSendMail(UID, email);
        }
        [HttpGet]
        [Route("SendEmailReport")]
        [AllowAnonymous]
        public async Task<object> SendEmailReport(string groupUid)
        {
            // BackgroundJob.Enqueue<IEmailBusiness>(x => x.SendEmailReport(groupUid,true));
            return await _stockCorrectionBusiness.SendEmailReport(groupUid, true);
            //  return await _emailBusiness.SendEmail(model);
            // return Ok();
        }
    }
}
