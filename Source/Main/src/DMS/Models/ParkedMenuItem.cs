using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Models
{
    public class ParkedMenuItemModel
    {
        /// <summary>
        /// FieldName
        /// </summary>
        public string FieldName { get; set; }

        /// <summary>
        /// FieldValue
        /// </summary>
        public string FieldValue { get; set; }

        /// <summary>
        /// IsDefault
        /// </summary>
        public bool IsDefault { get; set; }

        /// <summary>
        /// isAvailable
        /// </summary>
        [JsonProperty(PropertyName = "isAvailable")]
        public bool IsAvailable { get; set; }

        /// <summary>
        /// IsChecked
        /// </summary>
        public bool IsChecked { get; set; }

        /// <summary>
        /// Icon
        /// </summary>
        public string Icon { get; set; }

        /// <summary>
        /// IdSettingsWidgetItems
        /// </summary>
        public int IdSettingsWidgetItems { get; set; }
    }
}
