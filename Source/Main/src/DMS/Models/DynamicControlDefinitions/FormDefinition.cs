using DMS.Models.DMS.ViewModels.DynamicControlDefinitions;
using DMS.Models.ViewModels.DynamicControlDefinitions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace DMS.Models.DynamicControlDefinitions
{
    public class FormDefinition : AbstractGroupControlDefinition
    {
        private string _title;
        private string _customStyle;
        private string _customClass;
        private List<ColumnDefinition> _columnDefinitions;

        public string Title => _title;
        public string CustomStyle => _customStyle;
        public string CustomClass => _customClass;
        public IEnumerable<ColumnDefinition> ColumnDefinitions => _columnDefinitions;

        public FormDefinition(ColumnDefaultValueDefinition columnDefaultValueDefinition, IEnumerable<ColumnDefinition> columnDefinitions)
        {
            _columnDefinitions = new List<ColumnDefinition>();
            var defaultValueColumnDef = _ExtractDefaultValue(columnDefaultValueDefinition);
            _columnDefinitions.AddRange(defaultValueColumnDef);
            _columnDefinitions.AddRange(columnDefinitions);

            
        }

        internal override AbstractGroupControlDefinitionViewModel ParseViewModel()
        {
            var formDef = new FormDefinitionViewModel();
            formDef.Title = _title;
            formDef.CustomStyle = _customStyle;
            formDef.CustomClass = _customClass;
            formDef.GroupSetting = this.GroupSetting;
            formDef.ColumnDefinitions = this.ColumnDefinitions.Select(column =>
            {
                var colDefView = new ColumnFieldDefinitionViewModel
                {
                    ColumnName = column.ColumnName,
                    OriginalColumnName = column.OriginalColumnName,
                    DataType = column.DataType,
                    DataLength = column.DataLength.HasValue ? column.DataLength.Value : 0,
                    Value = column.Value,
                };
                var setting = column.Setting == null ? null : column.Setting.FirstOrDefault();
                if (setting == null)
                {
                    return colDefView;
                }

                colDefView.Setting = new ColumnDefinitionSetting
                {
                    DisplayField = setting.DisplayField?.DisplayField,
                    ControlType = setting.ControlType?.ControlType,
                    CustomStyle = setting.CustomStyle,
                    CustomClass = setting.CustomClass,
                    Validators = setting.Validators?.Validators,
                    CallConfigs = setting.CallConfig?.CallConfig,
                };

                return colDefView;
            });

            return formDef;
        }

        private IEnumerable<ColumnDefinition> _ExtractDefaultValue(ColumnDefaultValueDefinition columnDefaultValueDefinitions)
        {
            var defaultValue = new List<ColumnDefinition>();

            if (columnDefaultValueDefinitions == null)
            {
                return defaultValue;
            }

            _title = columnDefaultValueDefinitions.TitleFormSection;

            this.GroupSetting = columnDefaultValueDefinitions.GroupSetting?.FirstOrDefault()?.GroupSettingFormDefinition;

            if (columnDefaultValueDefinitions.Setting == null || !columnDefaultValueDefinitions.Setting.Any())
            {
                return defaultValue;
            }


            var setting = columnDefaultValueDefinitions.Setting.FirstOrDefault();
            _customStyle = setting.CustomStyle;
            _customClass = setting.CustomClass;
            var callConfigWrapper = setting.CallConfig;

            if (callConfigWrapper == null || callConfigWrapper.CallConfig == null || !callConfigWrapper.CallConfig.Any())
            {
                return defaultValue;
            }

            ColumnDefinition columnDef = null;

            foreach (var callConfig in callConfigWrapper.CallConfig)
            {

                columnDef = new ColumnDefinition
                {
                    ColumnName = callConfig.Alias,
                    OriginalColumnName = callConfig.Alias,
                    Value = callConfig.Value,
                };
                columnDef.Setting = _InitSetting(setting, () => callConfig);

                defaultValue.Add(columnDef);
            }

            return defaultValue;
        }

        private IEnumerable<ColumnDefinitionSettingWrapper> _InitSetting(ColumnDefinitionSettingWrapper columnSetting, Func<CallConfigSetting> getCallConfig)
        {
            var settings = new List<ColumnDefinitionSettingWrapper>();
            settings.Add(new ColumnDefinitionSettingWrapper
            {
                DisplayField = columnSetting.DisplayField,
                CallConfig = _InitCallConfig(columnSetting, getCallConfig),
            });

            return settings;
        }

        private CallConfigSettingWrapper _InitCallConfig(ColumnDefinitionSettingWrapper columnSetting, Func<CallConfigSetting> getCallConfig)
        {
            var callConfigsWrapper = new CallConfigSettingWrapper()
            {
                CallConfig = new List<CallConfigSetting>(new CallConfigSetting[] { getCallConfig() }),
            };
            return callConfigsWrapper;
        }
    }
}
