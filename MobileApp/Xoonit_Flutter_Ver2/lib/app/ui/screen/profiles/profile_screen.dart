import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:package_info/package_info.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/screen/profiles/profile_bloc.dart';
import 'package:xoonit/app/ui/screen/profiles/widget/item_list_profile.dart';
import 'package:xoonit/core/bloc_base.dart';

class ProfilesScreen extends StatefulWidget {
  const ProfilesScreen({Key key}) : super(key: key);

  @override
  _ProfilesScreenState createState() => _ProfilesScreenState();
}

class _ProfilesScreenState extends State<ProfilesScreen> {
  String version = "";
  @override
  void initState() {
    super.initState();
    getPackageInfo();
  }

  Future<void> getPackageInfo() async {
    await PackageInfo.fromPlatform().then((value) {
      setState(() {
        version = value.version;
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    ProfilesBloc profileBloc = BlocProvider.of(context);
    return Container(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          ItemListProfiles(
            iconPath: Resources.iconChangeProfile,
            title: "Change Profile",
            callback: () {
              profileBloc.changProfile();
            },
          ),
          Divider(
            indent: 20.0,
            height: 1,
            color: Colors.grey,
          ),
          ItemListProfiles(
            iconPath: Resources.iconChangePassword,
            title: "Change Password",
            callback: () {
              profileBloc.changPassword();
            },
          ),
          Divider(
            indent: 20.0,
            height: 1,
            color: Colors.grey,
          ),
          ItemListProfiles(
            iconPath: Resources.iconChangeAppearance,
            title: "Appearance",
            callback: () {
              profileBloc.changeAppearance();
            },
          ),
          Divider(
            indent: 20.0,
            height: 1,
            color: Colors.grey,
          ),
          ItemListProfiles(
            iconPath: Resources.iconChangeLanguage,
            title: "Language",
            callback: () {
              profileBloc.changeLanguage();
            },
          ),
          Divider(
            indent: 20.0,
            height: 1,
            color: Colors.grey,
          ),
          ItemListProfiles(
            iconPath: Resources.iconLogOut,
            title: "Log Out",
            isHasArrow: false,
            callback: () {
              profileBloc.logOut(context);
            },
          ),
          Container(
            margin: EdgeInsets.only(left: 20.0),
            child: Text(
              "Ver: $version",
              style: MyStyleText.grey14Regular,
            ),
          )
        ],
      ),
    );
  }
}
