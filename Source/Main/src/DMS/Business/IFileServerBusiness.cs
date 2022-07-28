using System.Collections.Generic;
using DMS.Models.DMS;

namespace DMS.Business
{
    public interface IFileServerBusiness
    {
        List<FileExplorerModel> ExplorerDirectory(string detailOfPath);

        List<FileExplorerModel> GetTreeDirectory(string pathRoot);

        int RenameDirectory(string fromFolder, string toFolder);

        int AddNewDirectory(string parentFolder, string newFolder);

        int RenameFile(string fromFile, string toFile);
    }
}

