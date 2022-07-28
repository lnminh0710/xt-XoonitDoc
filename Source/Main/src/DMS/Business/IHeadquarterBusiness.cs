using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Business
{
    public interface IHeadquarterBusiness
    {
        Task<object> CreateHeadquarter(Dictionary<string, object> hd);
        Task<object> GetDetailsHeadquarter(string idPerson);
        Task<object> UpdateHeadquarter(Dictionary<string, object> values);

        Task<object> CreateBranch(Dictionary<string, object> hd);
        Task<object> GetBranches(string idBranch);
        Task<object> UpdateBranch(Dictionary<string, object> values);

    }
}
