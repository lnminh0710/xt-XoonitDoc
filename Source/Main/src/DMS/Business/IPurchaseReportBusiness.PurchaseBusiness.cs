using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using iTextSharp.text;
using iTextSharp.text.pdf;
using System.IO;

namespace DMS.Business
{
    /// <summary>
    /// PurchaseReportBusiness
    /// </summary>
    public class PurchaseReportBusiness : BaseBusiness, IPurchaseReportBusiness
    {
        private Document doc { get; set; }
        private PdfContentByte cb { get; set; }
        private PdfWriter writer { get; set; }
        private float offsetX { get; set; }
        private float offsetY { get; set; }

        private float borderWidth = 0.25f;

        private float paddingBottom = 5;

        public PurchaseReportBusiness(IHttpContextAccessor context) : base(context)
        {
        }

        /// <summary>
        /// CreateReport
        /// </summary>
        public void CreateReport()
        {
            doc = new Document(PageSize.A4, 60, 60, 25, 25);
            var stream = new FileStream("D:\\Report.pdf", FileMode.Create);
            writer = PdfWriter.GetInstance(this.doc, stream);

            doc.Open();

            this.offsetX = 0;
            this.offsetY = 0;

            WriteHeaderLine();
            WriteAddressHeaderAtLeft();
            WriteAddressHeaderAtRight();
            WriteOrderTitle();
            WriteBillingShippingAddress();
            WriteOrderTable();
            WriteArticleTable();
            WriteSummaryTable();

            doc.Close();
            stream.Dispose();
        }


        /// <summary>
        /// WriteHeaderLine
        /// </summary>
        private void WriteHeaderLine()
        {
            PdfPTable t = new PdfPTable(new float[] { 100 });
            var c = new PdfPCell();
            c.BorderWidth = 0;
            c.BorderWidthBottom = borderWidth;
            t.WidthPercentage = 100;
            t.AddCell(c);
            t.SpacingAfter = 20;
            doc.Add(t);
        }

        /// <summary>
        /// WriteAddressHeaderAtLeft
        /// </summary>
        private void WriteAddressHeaderAtLeft()
        {
            PdfPTable t = new PdfPTable(new float[] { 40, 60 });
            PdfPCell c;

            c = new PdfPCell(new Phrase(5, "Mailing Force PTE Ltd.", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 9, Font.BOLD)));
            c.HorizontalAlignment = Element.ALIGN_LEFT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            c.PaddingBottom = paddingBottom;
            t.AddCell(c);

            c = new PdfPCell();
            c.BorderWidth = 0;
            t.AddCell(c);

            c = new PdfPCell(new Phrase(5, "33 Ubi Avenue", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 9, Font.NORMAL)));
            c.HorizontalAlignment = Element.ALIGN_LEFT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            c.PaddingBottom = paddingBottom;
            t.AddCell(c);

            c = new PdfPCell();
            c.BorderWidth = 0;
            t.AddCell(c);

            c = new PdfPCell(new Phrase(5, "408868 - Singapore", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 9, Font.NORMAL)));
            c.HorizontalAlignment = Element.ALIGN_LEFT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            c.PaddingBottom = paddingBottom;
            t.AddCell(c);

            c = new PdfPCell();
            c.BorderWidth = 0;
            t.AddCell(c);

            t.WidthPercentage = 100;
            t.SpacingAfter = 5;
            doc.Add(t);
        }

        /// <summary>
        /// WriteAddressHeaderAtRight
        /// </summary>
        private void WriteAddressHeaderAtRight()
        {
            PdfPTable t = new PdfPTable(new float[] { 50, 50 });
            PdfPCell c;

            c = new PdfPCell();
            c.BorderWidth = 0;
            t.AddCell(c);

            c = new PdfPCell(new Phrase(5, "Mailing Order Business Int'l Pte Ltd", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 9, Font.BOLD)));
            c.HorizontalAlignment = Element.ALIGN_LEFT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            t.AddCell(c);

            c = new PdfPCell();
            c.BorderWidth = 0;
            t.AddCell(c);

            c = new PdfPCell(new Phrase(5, "Sample_Lastname Supplier", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 9, Font.NORMAL)));
            c.HorizontalAlignment = Element.ALIGN_LEFT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            t.AddCell(c);


            c = new PdfPCell();
            c.BorderWidth = 0;
            t.AddCell(c);


            c = new PdfPCell(new Phrase(5, "33 Ubi Avenue 3", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 9, Font.NORMAL)));
            c.HorizontalAlignment = Element.ALIGN_LEFT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            c.PaddingBottom = paddingBottom;
            t.AddCell(c);

            c = new PdfPCell();
            c.BorderWidth = 0;
            t.AddCell(c);

            c = new PdfPCell(new Phrase(5, "408868 - Singapore", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 9, Font.NORMAL)));
            c.HorizontalAlignment = Element.ALIGN_LEFT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            c.PaddingBottom = paddingBottom;
            t.AddCell(c);

            t.WidthPercentage = 100;
            t.SpacingAfter = 5;
            doc.Add(t);
        }

        /// <summary>
        /// WriteOrderTitle
        /// </summary>
        private void WriteOrderTitle()
        {
            PdfPTable t = new PdfPTable(new float[] { 50, 50 });
            PdfPCell c;

            c = new PdfPCell(new Phrase(5, "Order 2191", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 18, Font.BOLD)));
            c.HorizontalAlignment = Element.ALIGN_LEFT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            t.AddCell(c);

            c = new PdfPCell();
            c.BorderWidth = 0;
            t.AddCell(c);

            t.WidthPercentage = 100;
            t.SpacingAfter = 25;
            doc.Add(t);
        }

        /// <summary>
        /// WriteBillingShippingAddress
        /// </summary>
        private void WriteBillingShippingAddress()
        {
            PdfPTable tm = new PdfPTable(new float[] { 47, 6, 47 });
            PdfPCell cm;

            #region Title Header

            cm = new PdfPCell(new Phrase(5, "Billing Address:", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_LEFT;
            cm.VerticalAlignment = Element.ALIGN_TOP;
            cm.BorderWidth = 0;
            tm.AddCell(cm);

            cm = new PdfPCell();
            cm.BorderWidth = 0;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Shipping Address:", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_LEFT;
            cm.VerticalAlignment = Element.ALIGN_TOP;
            cm.BorderWidth = 0;
            tm.AddCell(cm);

            tm.WidthPercentage = 100;
            tm.SpacingAfter = 15;

            doc.Add(tm);

            #endregion
            tm = new PdfPTable(new float[] { 47, 6, 47 });

            PdfPTable t;
            PdfPCell c;

            {
                #region Billing Address

                t = new PdfPTable(new float[] { 100 });

                c = new PdfPCell(new Phrase(5, "MAILING FORCE PTE Ltd", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.PaddingBottom = paddingBottom;
                c.BorderWidth = 0;
                t.AddCell(c);              

                c = new PdfPCell(new Phrase(5, "33 Ubi Avenue 3", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.BorderWidth = 0;
                t.AddCell(c);              

                c = new PdfPCell(new Phrase(5, "#08-04 Vertex Tower B", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.BorderWidth = 0;
                t.AddCell(c);

                c = new PdfPCell(new Phrase(5, "408868 - Singapore,", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.BorderWidth = 0;
                t.AddCell(c);

                c = new PdfPCell(new Phrase(5, "Singapore", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.BorderWidth = 0;
                c.PaddingBottom = paddingBottom;
                t.AddCell(c);

                t.WidthPercentage = 100;

                cm = new PdfPCell(t);
                cm.HorizontalAlignment = Element.ALIGN_LEFT;
                cm.VerticalAlignment = Element.ALIGN_TOP;
                //cm.BorderWidth = 0;
                tm.AddCell(cm);

                #endregion
            }

            cm = new PdfPCell();
            cm.BorderWidth = 0;
            tm.AddCell(cm);

            {
                #region Shipping Address

                t = new PdfPTable(new float[] { 100 });

                c = new PdfPCell(new Phrase(5, "MAILING FORCE PTE Ltd", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.PaddingBottom = paddingBottom;
                c.BorderWidth = 0;
                t.AddCell(c);

                c = new PdfPCell(new Phrase(5, "33 Ubi Avenue 3", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.BorderWidth = 0;
                t.AddCell(c);

                c = new PdfPCell(new Phrase(5, "#08-04 Vertex Tower B", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.BorderWidth = 0;
                t.AddCell(c);

                c = new PdfPCell(new Phrase(5, "408868 - Singapore,", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.BorderWidth = 0;
                t.AddCell(c);

                c = new PdfPCell(new Phrase(5, "Singapore", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                c.HorizontalAlignment = Element.ALIGN_LEFT;
                c.VerticalAlignment = Element.ALIGN_TOP;
                c.BorderWidth = 0;
                c.PaddingBottom = paddingBottom;
                t.AddCell(c);

                t.WidthPercentage = 100;

                cm = new PdfPCell(t);
                cm.HorizontalAlignment = Element.ALIGN_LEFT;
                cm.VerticalAlignment = Element.ALIGN_TOP;
                //cm.BorderWidth = 0;
                tm.AddCell(cm);

                #endregion
            }

            tm.WidthPercentage = 100;
            tm.SpacingAfter = 30;
            doc.Add(tm);
        }

        /// <summary>
        /// WriteOrderTable
        /// </summary>
        private void WriteOrderTable()
        {
            BaseColor cellBackgroundColor = new BaseColor(0xE0, 0xE0, 0xE0);
            PdfPTable tm = new PdfPTable(new float[] { 20, 20, 20, 20, 20 });
            PdfPCell cm;

            cm = new PdfPCell(new Phrase(5, "Ver.", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Date", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Order Nr.", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Needed delivery date", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Created by", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            #region Data
            {
                cm = new PdfPCell(new Phrase(5, "1", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_CENTER;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "05.23.2016", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_CENTER;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "2191", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_CENTER;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "05.23.2016", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_CENTER;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "Roberto", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_CENTER;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);
            }
            #endregion
            tm.WidthPercentage = 100;
            tm.SpacingAfter = 30;
            doc.Add(tm);
        }

        /// <summary>
        /// WriteArticleTable
        /// </summary>
        private void WriteArticleTable()
        {
            BaseColor cellBackgroundColor = new BaseColor(0xE0, 0xE0, 0xE0);
            PdfPTable tm = new PdfPTable(new float[] { 10, 20, 20, 10, 10, 10, 10, 10 });
            PdfPCell cm;

            cm = new PdfPCell(new Phrase(5, "#", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Artilce Nr", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Article Name", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Quantity", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Unit Price", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Discount", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "VAT(%)", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            cm = new PdfPCell(new Phrase(5, "Total", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            cm.HorizontalAlignment = Element.ALIGN_CENTER;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = borderWidth;
            cm.PaddingBottom = paddingBottom;
            tm.AddCell(cm);

            #region Data
            {
                cm = new PdfPCell(new Phrase(5, "1", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_CENTER;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "370010", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_CENTER;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "Talisda da sdsd sad", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_LEFT;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "2500", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_RIGHT;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "1.85", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_RIGHT;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "0.00", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_RIGHT;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "0.00", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_RIGHT;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);

                cm = new PdfPCell(new Phrase(5, "4,625.00", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
                cm.HorizontalAlignment = Element.ALIGN_RIGHT;
                cm.VerticalAlignment = Element.ALIGN_MIDDLE;
                cm.PaddingBottom = paddingBottom;
                cm.BorderWidth = borderWidth;
                cm.BackgroundColor = cellBackgroundColor;
                tm.AddCell(cm);
            }
            #endregion
            tm.WidthPercentage = 100;
            tm.SpacingAfter = 30;
            doc.Add(tm);
        }

        /// <summary>
        /// WriteSummaryTable
        /// </summary>
        private void WriteSummaryTable()
        {
            PdfPTable tm = new PdfPTable(new float[] { 30, 50, 20 });
            PdfPCell cm;

            cm = new PdfPCell();
            cm.BorderWidth = 0;
            tm.AddCell(cm);


            PdfPTable t = new PdfPTable(new float[] { 100 });
            PdfPCell c;

            c = new PdfPCell(new Phrase(5, "Total (Singapore Dollar)", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
            c.HorizontalAlignment = Element.ALIGN_RIGHT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            t.AddCell(c);

            c = new PdfPCell(new Phrase(5, "Total (Singapore Dollar) Included VAT", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            c.HorizontalAlignment = Element.ALIGN_RIGHT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            t.AddCell(c);

            cm = new PdfPCell(t);
            cm.HorizontalAlignment = Element.ALIGN_RIGHT;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            cm.BorderWidth = 0;
            tm.AddCell(cm);

            t = new PdfPTable(new float[] { 100 });

            c = new PdfPCell(new Phrase(5, "4.625,00", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.NORMAL)));
            c.HorizontalAlignment = Element.ALIGN_RIGHT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            t.AddCell(c);

            c = new PdfPCell(new Phrase(5, "4.625,00", FontFactory.GetFont(FontFactory.TIMES_ROMAN, 10, Font.BOLD)));
            c.HorizontalAlignment = Element.ALIGN_RIGHT;
            c.VerticalAlignment = Element.ALIGN_MIDDLE;
            c.BorderWidth = 0;
            t.AddCell(c);

            cm = new PdfPCell(t);
            cm.HorizontalAlignment = Element.ALIGN_RIGHT;
            cm.VerticalAlignment = Element.ALIGN_MIDDLE;
            tm.AddCell(cm);

            tm.WidthPercentage = 100;
            tm.SpacingAfter = 30;
            
            doc.Add(tm);
        }
    }
}
