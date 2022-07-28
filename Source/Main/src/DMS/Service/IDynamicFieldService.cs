using DMS.Models.DMS;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DMS.Service
{
    public interface IDynamicFieldService
    {
        JObject TransformDynamicFieldModelToParametersStored(IEnumerable<DynamicFieldModel> dynamicFields);
    }
}
