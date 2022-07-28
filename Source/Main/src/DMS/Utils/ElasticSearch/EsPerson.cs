using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DMS.Utils.ElasticSearch
{
    /// <summary>
    /// Person business object
    /// </summary>
    public class EsPerson
    {
        /// <summary>
        /// Id
        /// </summary>
        public int Id
        {
            get
            {
                return IdPerson;
            }
        }

        /// <summary>
        /// IdApplicationOwner
        /// </summary>
        public int IdApplicationOwner { get; set; }

        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public int IdPerson { get; set; }

        /// <summary>
        /// IdPersonInterface
        /// </summary>
        public int IdPersonInterface { get; set; }

        /// <summary>
        /// Unique identifier for this customer.
        /// </summary>
        public string PersonNr { get; set; }

        /// <summary>
        /// Notes
        /// </summary>
        public string Notes { get; set; }

        /// <summary>
        /// IsMatch
        /// </summary>
        public bool IsMatch { get; set; }

        /// <summary>
        /// IsActive
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// CreateDate
        /// </summary>
        public string CreateDate { get; set; }

        /// <summary>
        /// UpdateDate
        /// </summary>
        public string UpdateDate { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public string Street { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public string StreetNr { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public string StreetAddition1 { get; set; }

        /// <summary>
        /// StreetAddition1
        /// </summary>
        public string StreetAddition2 { get; set; }

        /// <summary>
        /// StreetAddition3
        /// </summary>
        public string StreetAddition3 { get; set; }

        /// <summary>
        /// Addition
        /// </summary>
        public string Addition { get; set; }

        /// <summary>
        /// Pobox
        /// </summary>
        public string PoboxLabel { get; set; }

        /// <summary>
        /// Zip
        /// </summary>
        public string Zip { get; set; }

        /// <summary>
        /// Zip2
        /// </summary>
        public string Zip2 { get; set; }

        /// <summary>
        /// Place
        /// </summary>
        public string Place { get; set; }

        /// <summary>
        /// Area
        /// </summary>
        public string Area { get; set; }

        /// <summary>
        /// CountryAddition
        /// </summary>
        public string CountryAddition { get; set; }

        /// <summary>
        /// AddressNotes
        /// </summary>
        public string AddressNotes { get; set; }

        /// <summary>
        /// IsDeleted
        /// </summary>
        public string IsDeleted { get; set; }

        /// <summary>
        /// The customer's surname(s)
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// The customer's preferred given name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// COName
        /// </summary>
        public string COName { get; set; }

        /// <summary>
        /// Middlename
        /// </summary>
        public string Middlename { get; set; }

        /// <summary>
        /// SuffixName
        /// </summary>
        public string SuffixName { get; set; }

        /// <summary>
        /// NameAddition
        /// </summary>
        public string NameAddition { get; set; }

        /// <summary>
        /// Alias identifier for this customer.
        /// </summary>
        public string Alias { get; set; }

        /// <summary>
        /// Company
        /// </summary>
        public string Company { get; set; }

        /// <summary>
        /// IdRepPersonType
        /// </summary>
        public int IdRepPersonType { get; set; }

    }
}
