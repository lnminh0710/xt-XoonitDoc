using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Utils
{
    public class B00RepCommunicationType
    {
        public int IdRepCommunicationType { get; set; }
        public string DefaultValue { get; set; }
    }

    public class B00SharingCommunication
    {
        public int IdSharingCommunication { get; set; }
        public int IdRepCommunicationType { get; set; }
        public string CommValue1 { get; set; }
        public string CommValue2 { get; set; }
        public string CommValue3 { get; set; }
        public string Notes { get; set; }
    }
}
