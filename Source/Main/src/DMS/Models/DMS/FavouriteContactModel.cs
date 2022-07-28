using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models.DMS
{
    public class FavouriteContactModel
    {
        public string IdMyFavorites { get; set; }
        public string IdPerson { get; set; }
        public string IdRepMyFavorites { get; set; }
        public string IsActive { get; set; }
        public string IsDeleted { get; set; }
    }
}
