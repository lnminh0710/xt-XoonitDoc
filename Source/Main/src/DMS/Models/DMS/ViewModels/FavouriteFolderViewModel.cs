using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS.ViewModels
{
    public class FavouriteFolderViewModel
    {
        public int? IdRepMyFavorites { get; set; }
        public string DefaultValue { get; set; }
        public string IsReadOnly { get; set; }
        public string IsBlocked { get; set; }
        public string IsDeleted { get; set; }
    }
}
