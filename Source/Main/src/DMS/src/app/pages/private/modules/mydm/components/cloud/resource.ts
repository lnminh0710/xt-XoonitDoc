import { CloudModel, CloudTypeEnum } from '../../models/cloud-configuration.model';

const cloudConfigs: CloudModel[] = [
    {
        Title: 'OneDrive',
        Description: 'Connect the application to manage OneDrive files and folders',
        Image: 'one-drive',
        Link: 'https://onedrive.live.com/',
        cloudType: CloudTypeEnum.ONE_DRIVE,
    },
    {
        Title: 'GoogleDrive',
        Description:
            'Connect the project to sign in to the portal using a Google account and manage Google Drive files and folders',
        Image: 'google-drive',
        Link: 'http://drive.google.com/',
        cloudType: CloudTypeEnum.GG_DRIVE,
    },
    // {
    //   Title: 'iCloud',
    //   Description:
    //     'Connect the project to sign in to the portal using a iCloud account and manage iCloud files and folders',
    //   Image: 'icloud',
    // },
    {
        Title: 'MyCloud',
        Description: 'Connect the application to manage MyCloud files and folders',
        Image: 'my-cloud',
        Link: 'https://www.mycloud.swisscom.ch/',
        cloudType: CloudTypeEnum.MY_CLOUD,
    },
    {
        Title: 'Remote Connection',
        Description: 'Connect remotely to manage files and folders',
        Image: 'sftp-ftp',

        cloudType: CloudTypeEnum.SFTP_FTP,
    },
    //   {
    //     Title: 'DropBox',
    //     Description: 'Connect the application to manage Dropbox files and folders',
    //     Image: 'dropbox',
    //     Link: 'https://www.dropbox.com/',
    //   },
];

export { cloudConfigs };
