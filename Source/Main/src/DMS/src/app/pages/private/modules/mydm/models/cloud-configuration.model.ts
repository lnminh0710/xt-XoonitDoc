import { EventEmitter } from '@angular/core';
export class CloudModel {
    public IdCloudProviders?: any;
    public IdCloudConnection?: any;
    public Title?: string;
    public Link?: string;
    public Image?: any;
    public Description?: string;
    public IsActive?: boolean;
    public UserName?: string;
    public UserEmail?: string;
    cloudType: CloudTypeEnum;

    public constructor(init?: Partial<CloudModel>) {
        Object.assign(this, init);
    }
}

export enum CloudTypeEnum {
    MY_CLOUD = 1,
    GG_DRIVE = 2,
    ONE_DRIVE = 3,
    DROP_BOX = 4,
    SFTP_FTP = 5,
}

export class GGDriveConfigurationModel {
    public MyDMEmail: string;
    public ClientId: string;
    public ApiKey: string;
    public DicoveryDocs: string[];
    public Scopes: string;
    public PermissionRole: string;
    public PermissionType: string;
}

export class OneDriveConfigurationModel {
    public MyDMEmail: string;
    public ClientId: string;
    public Authority: string;
    public ValidateAuthority: boolean;
    public NavigateToLoginRequestUrl: boolean;
    public RedirectUri: string;
    public PostLogoutRedirectUri: string;
    public CacheLocation: string;
    public ConsentScopes: string[];
    public ProtectedResourceMap: string[];
    public ExtraQueryParameters: string[];
    public UnprotectedResources: string[];
    public TenantId: string;
    //public RefreshToken: string;
    public AccessToken: string;

    constructor() {
        this.MyDMEmail = '';
        this.ClientId = '';
        this.Authority = '';
        this.ValidateAuthority = true;
        this.NavigateToLoginRequestUrl = false;
        this.RedirectUri = '';
        this.PostLogoutRedirectUri = '';
        this.CacheLocation = '';
        this.ConsentScopes = [];
        this.UnprotectedResources = [];
        this.ProtectedResourceMap = [];
        this.ExtraQueryParameters = [];
        this.TenantId = '';
        //   this.RefreshToken = '';
        this.AccessToken = '';
    }
}

export class RemoteConfigurationModel {
    public Type?: string;
    public HostName?: string;
    public PortNumber?: number;
    public UserName?: string;
    public Password?: string;
    public Folder?: string;
}
export class RemoteConfigurationDialogModel {
    public cloudModel: any;
    public cloudList: any[] = [];
    public callbackPush: any;
    public callbackClose: any;
    public oldItemActivate: any;
}
