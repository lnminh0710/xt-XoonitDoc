using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public class InventoryBusiness : BaseBusiness, IInventoryBusiness
    {
        public InventoryBusiness(IHttpContextAccessor context) : base(context)
        {
        }

        public async Task<object> ImportFileInventory(InventoryImportFileModel model)
        {
            var result = new InventoryImportFileResult();

            using (var package = new ExcelPackage(model.File))
            {
                var workbook = package.Workbook;
                var ws = workbook.Worksheets.First();

                var endColumn = ws.Dimension.End.Column;

                #region Column Names
                var headerRowIndex = 4;
                //FromRow, FromCol, ToRow, ToCol
                //ws.Cells[?, ?, ?, ?]

                //A: Name1, B: Name2
                Dictionary<string, string> dicColumnNames = new Dictionary<string, string>();
                var columnNames = new List<string>();// contains only column name
                foreach (ExcelRangeBase headerRowCell in ws.Cells[headerRowIndex, 1, headerRowIndex, endColumn])
                {
                    var cellAddress = Regex.Replace(headerRowCell.Address, @"[0-9]+", "");//B5 -> B
                    dicColumnNames[cellAddress] = headerRowCell.Text;
                    columnNames.Add(headerRowCell.Text);
                }
                #endregion

                #region Check missing Header Columns
                if (model.ColumnNames == null || model.ColumnNames.Count == 0)
                {
                    model.ColumnNames = new List<string>() { "Artikel-Nr.", "stock" };
                }

                var missingColumnNames = new List<string>();
                foreach (var columnName in model.ColumnNames)
                {
                    if (!columnNames.Contains(columnName))
                    {
                        missingColumnNames.Add(columnName);
                    }
                }

                if (missingColumnNames.Count > 0)
                {
                    result.Message = string.Format("Missing the columns: ", string.Join(", ", missingColumnNames));
                    return result;
                }
                #endregion

                #region Data
                //var listImport = new List<object>();
                var listImport = new List<InventoryImportItem>();
                var dataStartRowIndex = 5;
                for (int rowNum = dataStartRowIndex; rowNum <= ws.Dimension.End.Row; rowNum++)
                {
                    //FromRow, FromCol, ToRow, ToCol
                    var wsRow = ws.Cells[rowNum, 1, rowNum, endColumn];

                    //bool addedArticleNr = false;
                    //bool addedQty = false;
                    //Dictionary<string, object> item = new Dictionary<string, object>();
                    var item = new InventoryImportItem();
                    foreach (var cell in wsRow)
                    {
                        var cellText = (cell.Text + string.Empty).Trim();
                        if (cellText == string.Empty) continue;

                        var cellAddress = Regex.Replace(cell.Address, @"[0-9]+", "");//B5 -> B

                        string columnName;
                        if (dicColumnNames.TryGetValue(cellAddress, out columnName))
                        {
                            switch (columnName)
                            {
                                case "Artikel-Nr.":
                                    columnName = "ArticleNr";
                                    item.ArticleNr = cellText;
                                    //item[columnName] = cellText;
                                    //addedArticleNr = true;
                                    break;
                                case "stock":
                                    columnName = "Qty";
                                    item.Qty = ConverterUtils.ToInt(cellText);
                                    //item[columnName] = ConverterUtils.ToLong(cellText);
                                    //addedQty = true;
                                    break;
                            }
                        }
                    }//for colunm of each row

                    //if (addedArticleNr && addedQty)
                    //    listImport.Add(item);
                    if (!string.IsNullOrEmpty(item.ArticleNr) && item.Qty > 0)
                        listImport.Add(item);

                }//for

                var list = listImport.GroupBy(x => x.ArticleNr)
                      .Select(y => new InventoryImportItem
                      {
                          ArticleNr = y.Key,
                          Qty = y.Sum(x => x.Qty)
                      }).ToList();

                result.Data = list;
                #endregion

                workbook.Dispose();
                package.Dispose();
            }//ExcelPackage

            return await Task.FromResult(result);
        }
    }
}
