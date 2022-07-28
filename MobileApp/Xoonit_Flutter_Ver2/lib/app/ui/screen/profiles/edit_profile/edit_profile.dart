import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/screen/profiles/edit_profile/edit_profile_bloc.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';

class ChangeProfileScreen extends StatefulWidget {
  ChangeProfileScreen({Key key}) : super(key: key);

  @override
  _ChangeProfileScreenState createState() => _ChangeProfileScreenState();
}

class _ChangeProfileScreenState extends State<ChangeProfileScreen> {
  String avatarURL;

  @override
  void initState() {
    super.initState();
    avatarURL = XoonitApplication.instance.getUserInfor().avatarUrl ?? "";
  }

  @override
  Widget build(BuildContext context) {
    EditProfileBloc editProfileBloc = BlocProvider.of(context);
    return Scaffold(
      appBar: AppBar(
        elevation: 1.0,
        leading: IconButton(
            icon: Icon(Icons.arrow_back_ios, size: 18),
            onPressed: () {
              Navigator.of(context).pop();
            }),
        title: Text(
          "Profile",
          style: MyStyleText.blueDarkColor16Medium,
        ),
        centerTitle: true,
      ),
      body: Container(
          padding: EdgeInsets.only(top: 45),
          child: Column(
            children: <Widget>[
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: Colors.blue,
                  borderRadius: BorderRadius.circular(60),
                  image: DecorationImage(
                    image: avatarURL != ''
                        ? NetworkImage(avatarURL)
                        : AssetImage(Resources.iconDefaultAvatar),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              FlatButton(
                onPressed: () {
                  editProfileBloc.openGallery(context).then((value) {
                    if (value != null && value != '') {
                      setState(() {
                        avatarURL = value;
                      });
                    }
                  });
                },
                child: Text(
                  "Change profile photo",
                  style: MyStyleText.textLink14Regular,
                ),
              ),
              Divider(
                height: 2,
                color: MyColors.greyColor,
                indent: 16,
              ),
              _buildProfileInfor(),
            ],
          )),
    );
  }

  Widget _buildProfileInfor() => Container(
        padding: EdgeInsets.only(left: 16),
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  Expanded(
                      flex: 1,
                      child: Text(
                        "First Name:",
                        style: MyStyleText.dark16Regular,
                      )),
                  Expanded(
                    flex: 2,
                    child: Text(
                      XoonitApplication.instance.getUserInfor().firstName ?? "",
                      style: MyStyleText.dark16Regular,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.start,
                      softWrap: true,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  Expanded(
                      flex: 1,
                      child: Text(
                        "Last Name:",
                        style: MyStyleText.dark16Regular,
                      )),
                  Expanded(
                    flex: 2,
                    child: Text(
                      XoonitApplication.instance.getUserInfor().lastName ?? "",
                      style: MyStyleText.dark16Regular,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.start,
                      softWrap: true,
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Row(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: <Widget>[
                  Expanded(
                      flex: 1,
                      child: Text(
                        "Email:",
                        style: MyStyleText.dark16Regular,
                      )),
                  Expanded(
                    flex: 2,
                    child: Text(
                      XoonitApplication.instance.getUserInfor().email ?? "",
                      style: MyStyleText.dark16Regular,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      textAlign: TextAlign.start,
                      softWrap: true,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
}
