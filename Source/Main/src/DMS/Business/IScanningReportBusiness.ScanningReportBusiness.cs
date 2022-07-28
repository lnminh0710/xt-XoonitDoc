using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using DMS.Service;
using DMS.Utils;
using System;
using Newtonsoft.Json;
using System.Linq;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System.IO;
using NPOI.HSSF.UserModel;
using DMS.Utils.RestServiceHelper;
using NPOI.SS.Converter;
using System.Xml;
using System.Text;
using Microsoft.AspNetCore.Html;
using MimeKit;
using Microsoft.Extensions.Options;
using MimeKit.Utils;
using MailKit.Security;

namespace DMS.Business
{
    public class ScanningReportBusiness : BaseBusiness, IScanningReportBusiness
    {
        private IPathProvider _pathProvider;
        private readonly IScanningReportService _campaignService;
        private readonly AppSettings _appSettings;
        public ScanningReportBusiness(IHttpContextAccessor context, IScanningReportService campaignService, IPathProvider pathProvider, IOptions<AppSettings> appSettings) : base(context)
        {
            _pathProvider = pathProvider;
            _campaignService = campaignService;
            _appSettings = appSettings.Value;
        }

        public async Task<object> GetScanningResult(string GroupUuid, string userEmail)
        {
            ScanningReportDataModel data = (ScanningReportDataModel)ServiceDataRequest.ConvertToRelatedType(typeof(ScanningReportDataModel));
            data.GroupUuid = GroupUuid;
            object rs = await _campaignService.GetScanningReport(data);
            if (rs == null)
            {
                return null;
            }
            List<string> strs = (List<string>)rs;

            ScanningReportResultModel dataReport = new ScanningReportResultModel()
            {
                MainData = JsonConvert.DeserializeObject<ScanningReportMainDataModel>(strs.First()),
                DocumentScan = JsonConvert.DeserializeObject<List<ScanningResultModel>>(strs.ElementAt(1))
            };
            return ExportWithTemplateXLSX(dataReport);
        }

        public async Task<ScanningReportForMailing> GetScanningResultForSendMail(string GroupUuid, string userEmail)
        {
            try { 
            ScanningReportDataModel data = (ScanningReportDataModel)ServiceDataRequest.ConvertToRelatedType(typeof(ScanningReportDataModel));
            data.GroupUuid = GroupUuid;
            object rs = await _campaignService.GetScanningReport(data);
            if (rs == null)
            {
                return null;
            }
            List<string> strs = (List<string>)rs;

            ScanningReportResultModel dataReport = new ScanningReportResultModel()
            {
                MainData = JsonConvert.DeserializeObject<ScanningReportMainDataModel>(strs.First()),
                DocumentScan = JsonConvert.DeserializeObject<List<ScanningResultModel>>(strs.ElementAt(1))
            };
            string excelFile = ExportWithTemplateXLSX(dataReport);
            StringWriter sw = Excel2HTML(excelFile);
            StringBuilder stringBuilder = sw.GetStringBuilder();
            
            return new ScanningReportForMailing { ExcelPath = excelFile, ContentExcelHTMLString = new HtmlString(stringBuilder.ToString()), MainData = dataReport.MainData };
            }catch(Exception e) {
                throw new Exception("GetScanningResultForSendMail "+e);
            }
        }

        private string ExportWithTemplateXLSX(ScanningReportResultModel dataReport)
        {
            List<ScanningResultModel> list = dataReport.DocumentScan;

            string sWebRootFolder = _pathProvider.MapContentRootPath("reports");
            string sFileName = @"template_report.xlsx";

            FileStream fileTemplate = new FileStream(Path.Combine(sWebRootFolder, sFileName), FileMode.Open, FileAccess.Read);

            XSSFWorkbook xhssf = new XSSFWorkbook(fileTemplate);
            XSSFSheet sheet = (XSSFSheet)xhssf.GetSheetAt(0);
            ICellStyle xssfCellStyle = CreateBorderCellStyleXLSX(xhssf, sheet);

            int rowNr = sheet.LastRowNum;
            bool existCN = false;
            bool existDateScan = false;
            bool existEmail = false;

            for (int r = 0; r < rowNr; r++)
            {
                XSSFRow row = (XSSFRow)sheet.GetRow(r);
                if (row == null) continue;
                if (row.Count() == 0) continue;
                foreach (ICell cell in row.Cells)
                {
                    if (string.IsNullOrEmpty(cell.StringCellValue)) continue;
                    if (!existCN && cell.StringCellValue == "[Company Name]")
                    {
                        existCN = true;
                        cell.SetCellValue(dataReport.MainData.Company);
                    }
                    if (!existDateScan && cell.StringCellValue == "[dd.mm.yyyy]")
                    {
                        existDateScan = true;
                        cell.SetCellValue(dataReport.MainData.Date);
                    }
                    if (!existEmail && cell.StringCellValue == "[email]")
                    {
                        existEmail = true;
                        cell.SetCellValue(dataReport.MainData.Email);
                    }
                }
                if (existCN && existDateScan && existEmail) break;
            }

            rowNr++;

            foreach (ScanningResultModel fileScan in list)
            {
                XSSFRow row = (XSSFRow)sheet.CreateRow(rowNr);

                row.CreateCell(0).SetCellValue(fileScan.Nb);
                row.Cells[0].CellStyle = xssfCellStyle;
                row.CreateCell(1).SetCellValue(fileScan.ScanDate.ToString("dd.MM.yyyy HH:mm:ss"));
                row.Cells[1].CellStyle = xssfCellStyle;
                row.CreateCell(2).SetCellValue(fileScan.DocumentType);
                row.Cells[2].CellStyle = xssfCellStyle;

                row.CreateCell(3).SetCellValue(string.IsNullOrEmpty(fileScan.Initial) ? "" : fileScan.Initial.ToUpper());
                row.Cells[3].CellStyle = xssfCellStyle;

                row.CreateCell(4).SetCellValue(fileScan.PagesNr);
                row.Cells[4].CellStyle = xssfCellStyle;

                row.CreateCell(5).SetCellValue(fileScan.Status == "true" ? "OK" : "NOT OK");
                row.Cells[5].CellStyle = xssfCellStyle;
                row.CreateCell(6).SetCellValue(fileScan.UploadFileName);
                row.Cells[6].CellStyle = xssfCellStyle;

                rowNr++;
            }

            /* Create empry ROW */
            XSSFRow rowx = (XSSFRow)sheet.CreateRow(rowNr);
            rowx.CreateCell(0).SetCellValue(" ");
            /*****/
            string prefix_file = dataReport.MainData.ReportName.ToUpper();

            string write2File = Path.Combine(sWebRootFolder, prefix_file + ".xlsx");
            using (var fileResult = new FileStream(write2File, FileMode.Create, FileAccess.Write))
            {
                xhssf.Write(fileResult);
                fileResult.Close();
            }

            xhssf.Close();
            fileTemplate.Close();

            return write2File;
        }

        private StringWriter Excel2HTML(string excelFile)
        {
            FileStream fileTemplate = new FileStream(excelFile, FileMode.Open, FileAccess.Read);
            IWorkbook workbook = WorkbookFactory.Create(fileTemplate);
            ExcelToHtmlConverter excelToHtmlConverter = new ExcelToHtmlConverter();

            // Set output parameters
            excelToHtmlConverter.OutputColumnHeaders = false;
            //excelToHtmlConverter.OutputHiddenColumns = false;
            //excelToHtmlConverter.OutputHiddenRows = false;
            excelToHtmlConverter.OutputLeadingSpacesAsNonBreaking = false;
            excelToHtmlConverter.OutputRowNumbers = false;
            excelToHtmlConverter.UseDivsToSpan = false;

            excelToHtmlConverter.ProcessWorkbook(workbook);
            StringWriter sw = new StringWriter();
            XmlTextWriter xw = new XmlTextWriter(sw);
            excelToHtmlConverter.Document.WriteTo(xw);
            fileTemplate.Close();
            return sw;
        }

        private HSSFCellStyle CreateBorderCellStyleXLS(HSSFWorkbook hssfwb)
        {
            // create font style
            HSSFFont myFont = (HSSFFont)hssfwb.CreateFont();
            myFont.FontHeightInPoints = (short)11;
            myFont.FontName = "Tahoma";

            HSSFCellStyle borderedCellStyle = (HSSFCellStyle)hssfwb.CreateCellStyle();
            borderedCellStyle.SetFont(myFont);
            borderedCellStyle.BorderLeft = NPOI.SS.UserModel.BorderStyle.Medium;
            borderedCellStyle.BorderTop = NPOI.SS.UserModel.BorderStyle.Medium;
            borderedCellStyle.BorderRight = NPOI.SS.UserModel.BorderStyle.Medium;
            borderedCellStyle.BorderBottom = NPOI.SS.UserModel.BorderStyle.Medium;

            return borderedCellStyle;
        }

        private ICellStyle CreateBorderCellStyleXLSX(XSSFWorkbook wb, XSSFSheet sheet)
        {
            IFont font = wb.CreateFont();
            font.FontHeightInPoints = sheet.GetRow(sheet.LastRowNum).GetCell(0).CellStyle.GetFont(wb).FontHeightInPoints;
            font.FontName = sheet.GetRow(sheet.LastRowNum).GetCell(0).CellStyle.GetFont(wb).FontName;

            ICellStyle cellStyle = wb.CreateCellStyle();
            cellStyle.SetFont(font);
            cellStyle.WrapText = true;
            cellStyle.Alignment = HorizontalAlignment.Center;
            cellStyle.VerticalAlignment = VerticalAlignment.Center;
            cellStyle.BorderBottom = BorderStyle.Thin;
            cellStyle.BorderTop = BorderStyle.Thin;
            cellStyle.BorderLeft = BorderStyle.Thin;
            cellStyle.BorderRight = BorderStyle.Thin;

            //sheet.SetColumnWidth(colIndex, 100);
            //sheet.SetDefaultColumnStyle(colIndex, cellStyle);

            return cellStyle;
        }
        public async Task<bool> SendEmailReport(string GroupUuid, bool test = false)
        {
            var EmailTemplatePath = _pathProvider.MapContentRootPath("Email Template");
            ScanningReportForMailing reportModel = await GetScanningResultForSendMail(GroupUuid, "");
            var imageFolder = Path.Combine(EmailTemplatePath, _appSettings.ImageLogoEmailUrl);
            var templatePath = Path.Combine(EmailTemplatePath, _appSettings.EmailSending.Report.Template);
            string str = "";
            using (StreamReader SourceReader = System.IO.File.OpenText(templatePath))
            {
                str = SourceReader.ReadToEnd();
            }
            var builder = new BodyBuilder();
            var image = builder.LinkedResources.Add(imageFolder);
            image.ContentId = MimeUtils.GenerateMessageId();
            string reportContentHtml = reportModel.ContentExcelHTMLString.Value.Replace("<h2>Sheet1</h2>", "");
            string subject = String.Format("Report: {0}", reportModel.MainData.ReportName);
            builder.HtmlBody = string.Format(str,
                image.ContentId,
                      subject,
                        reportModel.MainData.FullName,
                       reportModel.MainData.ReportName,
                    reportContentHtml
                        );
            builder.Attachments.Add(reportModel.ExcelPath);
            if (test)
            {
                return await SendEmailWithHtml(subject, "dan.dang@xoontec.com", builder);
            }
            return await SendEmailWithHtml(subject, reportModel.MainData.Email, builder);
        }
        private async Task<bool> SendEmailWithHtml(string subject, string toEmail, BodyBuilder builder)
        {

            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress(
                _appSettings.EmailSending.Email.Split(new string[] { "@" }, StringSplitOptions.None)[0],
                _appSettings.EmailSending.Email));
            emailMessage.To.Add(new MailboxAddress(toEmail.Split(new string[] { "@" }, StringSplitOptions.None)[0], toEmail));
            emailMessage.Subject = subject;
            emailMessage.Body = builder.ToMessageBody();
            emailMessage.XPriority = XMessagePriority.High;
            using (var client = new MailKit.Net.Smtp.SmtpClient())
            {
                client.Connect(_appSettings.EmailSending.Domain, _appSettings.EmailSending.Port, SecureSocketOptions.StartTlsWhenAvailable);
                client.AuthenticationMechanisms.Remove("XOAUTH2"); // Must be removed for Gmail SMTP
                client.Authenticate(_appSettings.EmailSending.Email, _appSettings.EmailSending.Password);

                client.Send(emailMessage);
                client.Disconnect(true);
            }
            return await Task.FromResult(true);
        }
    }

    public class ScanningReportResultModel
    {
        public ScanningReportMainDataModel MainData { get; set; }
        public List<ScanningResultModel> DocumentScan { get; set; }
    }

    public class ScanningReportMainDataModel
    {
        public string ReportName { get; set; }
        public string FullName { get; set; }

        public string Company { get; set; }
        public string Date { get; set; }
        public string Email { get; set; }
        public int TotalDocuments { get; set; }
    }

    public class ScanningResultModel
    {
        [JsonProperty("Row#")]
        public string Nb { get; set; }
        [JsonProperty("Scan Date")]
        public DateTime ScanDate { get; set; }
        [JsonProperty("Document Type")]
        public string DocumentType { get; set; }

        public string Initial { get; set; }
        
        [JsonProperty("Pages #")]
        public int PagesNr { get; set; }

        public string Status { get; set; }
        public string UploadFileName { get; set; }
    }

    public class ScanningReportForMailing
    {
        public string ExcelPath { get; set; }
        public StringWriter ContentExcelHTML { get; set; }

        public string ContentXML { get; set; }
        public HtmlString ContentExcelHTMLString { get; set; }

        public ScanningReportMainDataModel MainData { get; set; }

    }
}
