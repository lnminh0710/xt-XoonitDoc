namespace DMS.Models.DMS
{
    public class FavouriteFolderModel
    {
        public int IdRepMyFavorites { get; set; }
        public int IdApplicationOwner { get; set; }
        public string MyFavorites { get; set; }
        public int Quantity { get; set; }

        public int? IdDocumentTreeParent { get; set; }
    }
}
