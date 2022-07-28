using DMS.Constants;
using DMS.ServiceModels;
using DMS.Utils;
using System.Threading.Tasks;

namespace DMS.Service
{
    /// <summary>
    /// IDynamicDataService
    /// </summary>
    public interface IDynamicDataService
    {
        /// <summary>
        /// Get Data
        /// </summary>
        /// <param name="dynamicData"></param>
        /// <param name="mappingType"></param>
        /// <param name="returnType"></param>
        /// <returns></returns>
        Task<object> GetData(DynamicData dynamicData, EExecuteMappingType mappingType = EExecuteMappingType.None, EDynamicDataGetReturnType returnType = EDynamicDataGetReturnType.None);

        Task<object> GetDynamicDataFormTable(DynamicData dynamicData, EExecuteMappingType mappingType = EExecuteMappingType.None, EDynamicDataGetReturnType returnType = EDynamicDataGetReturnType.None);
        
        /// <summary>
        /// Save Data
        /// </summary>
        /// <param name="dynamicData"></param>
        /// <returns></returns>
        Task<WSEditReturn> SaveData(DynamicData dynamicData);

        Task<WSEditReturn> SaveFormData(SaveDynamicData dynamicData);
    }
}
