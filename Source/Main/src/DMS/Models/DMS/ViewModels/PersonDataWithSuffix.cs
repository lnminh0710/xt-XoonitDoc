using System.Collections.Generic;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels
{
    public class PersonDataWithSuffix
    {
        public int IdPerson { get; set; }
        public string ObjectMode { get; set; }
        public string Suffix { get; set; }
        public Task<IEnumerable<DocumentColumnSettingViewModel>> PersonData{ get; set; }
    }
}
