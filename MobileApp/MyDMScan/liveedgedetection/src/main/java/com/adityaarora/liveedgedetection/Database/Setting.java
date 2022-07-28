package com.adityaarora.liveedgedetection.Database;

public class Setting {


    public Setting() {
    }

    public Setting(int idSetting, String settingName, boolean settingValues) {
        IdSetting = idSetting;
        SettingName = settingName;
        SettingValues = settingValues;
    }

    private int IdSetting;
    private String SettingName;
    private boolean SettingValues;

    public int getIdSetting() {
        return IdSetting;
    }

    public void setIdSetting(int idSetting) {
        IdSetting = idSetting;
    }

    public String getSettingName() {
        return SettingName;
    }

    public void setSettingName(String settingName) {
        SettingName = settingName;
    }

    public boolean isSettingValues() {
        return SettingValues;
    }

    public void setSettingValues(boolean settingValues) {
        SettingValues = settingValues;
    }
}
