using DMS.Models.DMS;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace DMS.Business
{
    public class DynamicFieldsBusiness : IDynamicFieldsBusiness
    {

        public void SetIdsForDynamicFields(IEnumerable<DynamicFieldModel> updatedDynamicFields, string jsonDynamicFields)
        {
            var dynamicFieldsData = JsonConvert.DeserializeObject<IEnumerable<DynamicFieldModel>>(jsonDynamicFields);
            if (dynamicFieldsData == null || !dynamicFieldsData.Any()) return;

            foreach (var dynamicFieldData in dynamicFieldsData)
            {
                var found = updatedDynamicFields.FirstOrDefault(data => data.FieldName == dynamicFieldData.FieldName && data.IdDocumentTree == dynamicFieldData.IdDocumentTree);
                if (found == null)
                {
                    dynamicFieldData.IsActive = "0";
                    dynamicFieldData.IsDeleted = "1";
                    (updatedDynamicFields as List<DynamicFieldModel>).Add(dynamicFieldData);
                    continue;
                };
                found.IdDynamicFieldsEntityName = dynamicFieldData.IdDynamicFieldsEntityName;
                found.IdDynamicFields = dynamicFieldData.IdDynamicFields;
                found.IsActive = "1";
                found.IsDeleted = "0";
            }
        }
    }
}
