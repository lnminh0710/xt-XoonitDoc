using System;
using System.Threading.Tasks;
using DMS.Models;
using DMS.Utils;

namespace DMS.Business
{
    public interface IBaseBusiness
    {
        Data ServiceDataRequest { get;}
        string AccessToken { get;}
        UserFromService UserFromService { get;}

        User GetUserInfoFromToken();

        Task<bool> Execute(Func<Task<bool>> action);

        void ReInit(string authorization);
    }
}
