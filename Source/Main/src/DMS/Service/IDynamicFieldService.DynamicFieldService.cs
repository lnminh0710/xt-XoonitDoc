using DMS.Models.DMS;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Linq;

namespace DMS.Service
{
    public class DynamicFieldService : IDynamicFieldService
    {
        public JObject TransformDynamicFieldModelToParametersStored(IEnumerable<DynamicFieldModel> dynamicFields)
        {
            if (dynamicFields == null || !dynamicFields.Any()) return null;

            JObject jDynamicField = null;
            JArray jArray = new JArray();
            JObject jDynamicFieldsContainer = new JObject
            (
                new JProperty("DynamicFields", jArray)
            );
            
            foreach (var dynamicField in dynamicFields)
            {
                jDynamicField = new JObject();
                if (dynamicField.IdDynamicFields != null && !string.IsNullOrWhiteSpace(dynamicField.IdDynamicFields))
                {
                    jDynamicField.Add(nameof(DynamicFieldModel.IdDynamicFields), new JValue(dynamicField.IdDynamicFields));
                }

                if (dynamicField.IdDynamicFieldsEntityName != null && !string.IsNullOrWhiteSpace(dynamicField.IdDynamicFieldsEntityName))
                {
                    jDynamicField.Add(nameof(DynamicFieldModel.IdDynamicFieldsEntityName), new JValue(dynamicField.IdDynamicFieldsEntityName));
                }

                if (dynamicField.IdDocumentTree != null && !string.IsNullOrWhiteSpace(dynamicField.IdDocumentTree))
                {
                    jDynamicField.Add(nameof(DynamicFieldModel.IdDocumentTree), new JValue(dynamicField.IdDocumentTree));
                }

                jDynamicField.Add(nameof(DynamicFieldModel.FieldName), new JValue(dynamicField.FieldName));
                jDynamicField.Add(nameof(DynamicFieldModel.FieldValue), new JValue(dynamicField.FieldValue));
                jDynamicField.Add(nameof(DynamicFieldModel.IsActive), new JValue(string.IsNullOrWhiteSpace(dynamicField.IsActive) ? "1" : dynamicField.IsActive));
                jDynamicField.Add(nameof(DynamicFieldModel.IsDeleted), new JValue(string.IsNullOrWhiteSpace(dynamicField.IsDeleted) ? "0" : dynamicField.IsDeleted));

                jArray.Add(jDynamicField);
            }

            return jDynamicFieldsContainer;

        }
    }
}
