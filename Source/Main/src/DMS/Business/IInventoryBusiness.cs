using System.Threading.Tasks;
using DMS.Models;

namespace DMS.Business
{
    public interface IInventoryBusiness
    {
        Task<object> ImportFileInventory(InventoryImportFileModel model);
    }
}
