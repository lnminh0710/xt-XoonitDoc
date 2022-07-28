import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/screen/cloud/cloud_share_folder_dialog.dart';

class CloudScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text('THIRD-PARTY SERVICE INTEGRATION',
              style: MyStyleText.white16Light),
          Expanded(
            child: ListView.builder(
              itemBuilder: (_, index) {
                return Card(
                    color: MyColors.bluedarkColor,
                    child: ListTile(
                      contentPadding: EdgeInsets.all(8),
                      title: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            '${ECloud.values[index].name}',
                            style: MyStyleText.white17Bold,
                          ),
                          SizedBox(
                            height: 8,
                          ),
                          Text('${ECloud.values[index].description}',
                              style: MyStyleText.white10Regular),
                        ],
                      ),
                      leading: CircleAvatar(),
                      trailing: Wrap(
                        children: <Widget>[
                          CupertinoSwitch(
                              value: true,
                              onChanged: (value) {}),
                          IconButton(
                            icon: Icon(Icons.more_horiz, color: Colors.white),
                            onPressed: () {
                              showDialog(
                                  context: context,
                                  builder: (_) {
                                    return CloudShareFolderDialog();
                                  });
                            },
                          )
                        ],
                      ),
                    ));
              },
              itemCount: ECloud.values.length,
            ),
          ),
        ],
      ),
    );
  }
}

enum ECloud { one_drive, google_drive, my_cloud, drop_box }

extension ECloudExtension on ECloud {
  get name {
    switch (this) {
      case ECloud.one_drive:
        return 'ONEDRIVE';
      case ECloud.google_drive:
        return 'GOOGLEDRIVE';
      case ECloud.my_cloud:
        return 'MYCLOUD';
      case ECloud.drop_box:
        return 'DROPBOX';
    }
  }

  get description {
    switch (this) {
      case ECloud.one_drive:
        return 'Connect the application to manage OneDrive files and folders';
      case ECloud.google_drive:
        return 'Connect the project to sign in to the portal using a Google account and manage Google Drive files and folders';
      case ECloud.my_cloud:
        return 'Connect the application to manage MyCloud files and folders';
      case ECloud.drop_box:
        return 'Connect the application to manage Dropbox files and folders';
    }
  }

  get urlImage {
    switch (this) {
      case ECloud.one_drive:
        return 'Connect the application to manage OneDrive files and folders';
      case ECloud.google_drive:
        return 'Connect the project to sign in to the portal using a Google account and manage Google Drive files and folders';
      case ECloud.my_cloud:
        return 'Connect the application to manage MyCloud files and folders';
      case ECloud.drop_box:
        return 'Connect the application to manage Dropbox files and folders';
    }
  }
}
