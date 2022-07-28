package com.adityaarora.liveedgedetection.Database;

import android.graphics.Region;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.TimeZone;

public class ScansContainer {
    //region Variables
    private int LotId;
    private int IdScansContainer;
    private String LotName;
    private int IdPerson = 192293;
    private String ClientOpenDateUTC;
    private String ClientCloseDateUTC;
    private String AbortDateUTC;
    private boolean IsSynced = false;
    private String IsActive = "1";
    private int ServerId = 4;
    private boolean IsLocalDeleted = false;
    private String IsOnlyGamer = "0";
    private boolean IsUserClicked = false;

//endregion

    //region Constructor
    public ScansContainer(){}

    public ScansContainer(int lotId, int idScansContainer, String lotName, int idPerson, String clientOpenDateUTC, String clientCloseDateUTC, String abortDateUTC, boolean isSynced, String isActive, int serverId, boolean isLocalDeleted, String isOnlyGamer) {
        LotId = lotId;
        IdScansContainer = idScansContainer;
        LotName = lotName;
        IdPerson = idPerson;
        ClientOpenDateUTC = clientOpenDateUTC;
        ClientCloseDateUTC = clientCloseDateUTC;
        AbortDateUTC = abortDateUTC;
        IsSynced = isSynced;
        IsActive = isActive;
        ServerId = serverId;
        IsLocalDeleted = isLocalDeleted;
        IsOnlyGamer = isOnlyGamer;
    }

    public ScansContainer(int LotId, String lotName) {
        this.setLotId(LotId);
        DateFormat df = new SimpleDateFormat("dd.MM.yyyy hh:mm");
        String date = df.format(Calendar.getInstance().getTime());
        this.setLotName(LotId + "-LOT-" + date + "-Mobile-" + lotName);

        df = new SimpleDateFormat("MM-dd-yyyy HH:mm:ss");
        df.setTimeZone(TimeZone.getTimeZone("gmt"));
        String dateClient = df.format(Calendar.getInstance().getTime());
        this.setClientOpenDateUTC(dateClient);
    }
    //endregion

    //region Properties
    public int getLotId() {
        return LotId;
    }

    public void setLotId(int lotId) {
        LotId = lotId;
    }

    public int getIdScansContainer() {
        return IdScansContainer;
    }

    public void setIdScansContainer(int idScansContainer) {
        IdScansContainer = idScansContainer;
    }

    public String getLotName() {
        return LotName;
    }

    public void setLotName(String lotName) {
        LotName = lotName;
    }

    public int getIdPerson() {
        return IdPerson;
    }

    public void setIdPerson(int idPerson) {
        IdPerson = idPerson;
    }

    public String getClientOpenDateUTC() {
        return ClientOpenDateUTC;
    }

    public void setClientOpenDateUTC(String clientOpenDateUTC) {
        ClientOpenDateUTC = clientOpenDateUTC;
    }

    public String getClientCloseDateUTC() {
        return ClientCloseDateUTC;
    }

    public void setClientCloseDateUTC(String clientCloseDateUTC) {
        ClientCloseDateUTC = clientCloseDateUTC;
    }

    public String getAbortDateUTC() {
        return AbortDateUTC;
    }

    public void setAbortDateUTC(String abortDateUTC) {
        AbortDateUTC = abortDateUTC;
    }

    public boolean isSynced() {
        return IsSynced;
    }

    public void setSynced(boolean synced) {
        IsSynced = synced;
    }

    public String getIsActive() {
        return IsActive;
    }

    public void setIsActive(String isActive) {
        IsActive = isActive;
    }

    public int getServerId() {
        return ServerId;
    }

    public void setServerId(int serverId) {
        ServerId = serverId;
    }

    public boolean isLocalDeleted() {
        return IsLocalDeleted;
    }

    public void setLocalDeleted(boolean localDeleted) {
        IsLocalDeleted = localDeleted;
    }

    public String getIsOnlyGamer() {
        return IsOnlyGamer;
    }

    public void setIsOnlyGamer(String isOnlyGamer) {
        IsOnlyGamer = isOnlyGamer;
    }

    public boolean isUserClicked() {
        return IsUserClicked;
    }

    public void setUserClicked(boolean userClicked) {
        IsUserClicked = userClicked;
    }
    //endregion
}
