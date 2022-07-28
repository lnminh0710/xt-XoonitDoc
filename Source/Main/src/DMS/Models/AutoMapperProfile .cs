using AutoMapper;
using DMS.Constants;
using DMS.Models.DMS;
using DMS.Models.DMS.ViewModels;
using DMS.Utils;
using System;
using System.Globalization;

namespace DMS.Models
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            //TSource, TDestination
            CreateMap<NotificationGetModel, NotificationGetData>();
            CreateMap<NotificationForCreateModel, NotificationForCreateData>();
            CreateMap<NotificationItemsForCreateModel, NotificationItemsForCreateData>();
            CreateMap<NotificationSetArchivedItem, NotificationSetArchivedItemModel>();
            CreateMap<AttachmentModel, AttachmentViewModel>()
                .ForMember(viewModel => viewModel.LocalFileName, model => model.MapFrom(x => x.ScannedFilename))
                .ForMember(viewModel => viewModel.CloudMediaPath, model => model.MapFrom(x => x.DocumentType))
                .ForMember(viewModel => viewModel.GroupName, model => model.MapFrom(x => x.ContactType))
                .ForMember(viewModel => viewModel.CreateDate, model => model.MapFrom(x => !string.IsNullOrWhiteSpace(x.CreateDocument)
                                                                ? DateTime.Parse(x.CreateDocument).ToString("MM.dd.yyyy", CultureInfo.InvariantCulture) : x.CreateDocument))
                .ForMember(viewModel => viewModel.IdPerson, model => model.MapFrom(x => x.IdPerson.ToString()))
                .ForMember(viewModel => viewModel.IdDocumentContainerScans, model => model.MapFrom(x => x.IdDocumentContainerScans.ToString()))
                .ForMember(viewModel => viewModel.IdDocumentTree, model => model.MapFrom(x => x.IdDocumentTree.ToString()));
            CreateMap<HistoryColumnPropertiesModel, ControlGridColumnViewModel>()
                .ForMember(viewModel => viewModel.Title, model => model.MapFrom(x => x.ColumnHeader))
                .ForMember(viewModel => viewModel.Data, model => model.MapFrom(x => x.ColumnName))
                .ForMember(viewModel => viewModel.Setting, model => model.MapFrom(x => x));
            CreateMap<HistoryModel, HistoryViewModel>()
                .ForMember(viewModel => viewModel.FileName, model => model.MapFrom(x => x.ScannedFilename))
                .ForMember(viewModel => viewModel.ScanDate, model => model.MapFrom(x => !string.IsNullOrWhiteSpace(x.ScanDate)
                                                                ? DateTime.Parse(x.ScanDate).ToString("MM.dd.yyyy", CultureInfo.InvariantCulture) : x.ScanDate))
                .ForMember(viewModel => viewModel.Devices, model => model.MapFrom(x => RepScanDeviceType.ConvertDisplayDevice(x.FromDevice)));
            // .ForMember(viewModel => viewModel.SyncStatus, model => model.MapFrom(x => x.SyncStatus == null ? "Error" : SyncStatus.ConvertDisplayStatus(x.SyncStatus)));
            CreateMap<PersonContactFormModel, ContactDetailModel>().ReverseMap();
            CreateMap<SignUpAccount, NewAccount>().ReverseMap();
            CreateMap<UserFromService, UserInfo>().ReverseMap();
        }
    }
}
