using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DMS.Models.Property;

namespace DMS.Models
{
    /// <summary>
    /// ParkedItem
    /// </summary>
    public class ParkedItemModel
    {
        /// <summary>
        /// IdPerson
        /// </summary>
        public IdPerson IdPerson { get; set; }

        /// <summary>
        /// PersonNr
        /// </summary>
        public PersonNr PersonNr { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public Notes Notes { get; set; }

        /// <summary>
        /// IsMatch
        /// </summary>
        public IsMatch IsMatch { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public IsActive IsActive { get; set; }

        /// <summary>
        /// CreateDate
        /// </summary>
        public CreateDate CreateDate { get; set; }

        /// <summary>
        /// UpdateDate
        /// </summary>
        public UpdateDate UpdateDate { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public Street Street { get; set; }

        /// <summary>
        /// StreetNr
        /// </summary>
        public StreetNr StreetNr { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public StreetAddition1 StreetAddition1 { get; set; }

        /// <summary>
        /// StreetAddition2
        /// </summary>
        public StreetAddition2 StreetAddition2 { get; set; }

        /// <summary>
        /// Streetaddition3
        /// </summary>
        public StreetAddition3 StreetAddition3 { get; set; }

        /// <summary>
        /// Addition
        /// </summary>
        public Addition Addition { get; set; }

        /// <summary>
        /// PoboxLabel
        /// </summary>
        public PoboxLabel PoboxLabel { get; set; }

        /// <summary>
        /// Zip
        /// </summary>
        public Zip Zip { get; set; }

        /// <summary>
        /// Zip2
        /// </summary>
        public Zip2 Zip2 { get; set; }

        /// <summary>
        /// Place
        /// </summary>
        public Place Place { get; set; }

        /// <summary>
        /// Area
        /// </summary>
        public Area Area { get; set; }

        /// <summary>
        /// CountryAddition
        /// </summary>
        public CountryAddition CountryAddition { get; set; }

        /// <summary>
        /// AddressNotes
        /// </summary>
        public AddressNotes AddressNotes { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public IsDeleted IsDeleted { get; set; }

        /// <summary>
        /// Last-Name
        /// </summary>
        public LastName LastName { get; set; }

        /// <summary>
        /// First-Name
        /// </summary>
        public FirstName FirstName { get; set; }

        /// <summary>
        /// COName
        /// </summary>
        public COName COName { get; set; }

        /// <summary>
        /// Middlename
        /// </summary>
        public Middlename Middlename { get; set; }

        /// <summary>
        /// SuffixName
        /// </summary>
        public SuffixName SuffixName { get; set; }

        /// <summary>
        /// NameAddition
        /// </summary>
        public NameAddition NameAddition { get; set; }

        /// <summary>
        /// IdPersonInterface IdRepPersonType
        /// </summary>
        public IdPersonInterface IdPersonInterface { get; set; }

        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public IdRepPersonType IdRepPersonType { get; set; }

        /// <summary>
        /// IdSettingsGUI
        /// </summary>
        public IdSettingsGUI IdSettingsGUI { get; set; }

        /// <summary>
        /// Company
        /// </summary>
        public Company Company { get; set; }
    }

    /// <summary>
    /// CollectionParkedMenuItem
    /// </summary>
    public class CollectionParkedItemModel
    {
        /// <summary>
        /// CollectionParkedMenuItems
        /// </summary>
        public IList<object> CollectionParkedtems { get; set; }

        /// <summary>
        /// IdSettingsModule
        /// </summary>
        public string IdSettingsModule { get; set; }

        /// <summary>
        /// ParkedItemKey
        /// </summary>
        public string ParkedItemKey { get; set; }

        /// <summary>
        /// KeyName
        /// </summary>
        public string KeyName { get; set; }

        /// <summary>
        /// WidgetTitle
        /// </summary>
        public string WidgetTitle { get; set; }
    }
}
