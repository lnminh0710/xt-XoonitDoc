namespace DMS.Models
{
    /// <summary>
    /// MatchingPerson
    /// </summary>
    public class MatchingPerson
    {
        /// <summary>
        /// IdPerson
        /// </summary>
        public long? IdPerson { get; set; }

        /// <summary>
        /// PersonNr
        /// </summary>
        public string PersonNr { get; set; }

        /// <summary>
        /// LastName
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// FirstName
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// MiddleName
        /// </summary>
        public string MiddleName { get; set; }

        /// <summary>
        /// Street
        /// </summary>
        public string Street { get; set; }

        /// <summary>
        /// Zip
        /// </summary>
        public string Zip { get; set; }

        /// <summary>
        /// Zip2
        /// </summary>
        public string Zip2 { get; set; }

        /// <summary>
        /// IdRepIsoCountryCode
        /// </summary>
        public int? IdRepIsoCountryCode { get; set; }

        /// <summary>
        /// Place
        /// </summary>
        public string Place { get; set; }

        /// <summary>
        /// Area 
        /// </summary>
        public string Area { get; set; }

    }

    /// <summary>
    /// Xoontec Match Filed
    /// </summary>
    public class XMatchField
    {
        /// <summary>
        /// type
        /// </summary>
        public string type { get; set; }

        /// <summary>
        /// name
        /// </summary>
        public string name { get; set; }

        /// <summary>
        /// threshold
        /// </summary>
        public double threshold { get; set; }

        public XMatchField()
        {
            type = "string";
        }
    }
}
