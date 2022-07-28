
using DMS.Models.DMS;
using System.Collections.Generic;

namespace DMS.Business
{
    public interface IDynamicFieldsBusiness
    {
        void SetIdsForDynamicFields(IEnumerable<DynamicFieldModel> updatedDynamicFields, string value);
    }
}
