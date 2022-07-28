import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/get_main_language_response.dart';
import 'package:xoonit/app/ui/screen/profiles/language/edit_language_bloc.dart';
import 'package:xoonit/app/utils/flag/countries.dart';
import 'package:xoonit/app/utils/flag/country.dart';
import 'package:xoonit/app/utils/flag/utils.dart';
import 'package:xoonit/app/utils/xoonit_application.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

class ChangeLanguageScreen extends StatefulWidget {
  ChangeLanguageScreen({Key key}) : super(key: key);

  @override
  _ChangeLanguageScreenState createState() => _ChangeLanguageScreenState();
}

class _ChangeLanguageScreenState extends State<ChangeLanguageScreen> {
  EditLanguageBloc bloc;
  String _isoCodeLanguage;
  Country country;
  @override
  void initState() {
    super.initState();
    bloc = BlocProvider.of(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        elevation: 1.0,
        leading: IconButton(
            icon: Icon(Icons.arrow_back_ios, size: 18),
            onPressed: () {
              Navigator.of(context).pop();
            }),
        title: Text(
          "Language",
          style: MyStyleText.blueDarkColor16Medium,
        ),
        centerTitle: true,
      ),
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    return Container(
      width: Dimension.getWidth(1),
      height: Dimension.getHeight(1),
      color: MyColors.whiteBackground,
      child: StreamBuilder<List<MainLanguage>>(
        stream: bloc.lsLanguage,
        builder: (context, lsLanguage) {
          return lsLanguage.hasData && lsLanguage.data != null
              ? ListView.builder(
                  itemCount: lsLanguage.data.length,
                  physics: NeverScrollableScrollPhysics(),
                  itemBuilder: (context, index) {
                    return _buildItemlsLanguage(
                      lsLanguage.data[index].defaultValue,
                      lsLanguage.data[index].idRepLanguage.toString(),
                      lsLanguage.data[index].languageCode,
                    );
                  },
                )
              : Center(
                  child: CircularProgressIndicator(),
                );
        },
      ),
    );
  }

  Widget _buildItemlsLanguage(
      String language, String idRepLanguage, String idCodeLanguage) {
    return Container(
      child: Column(
        children: <Widget>[
          ListTile(
            leading: getDefaultFlagImage(country, idCodeLanguage),
            onTap: () {
              setState(() {
                bloc.selectNewLanguage(idRepLanguage);
              });
            },
            title: Text(
              language,
              style: MyStyleText.dark14Regular,
            ),
            dense: true,
            trailing: checkMainLanguageUsing(idRepLanguage)
                ? Icon(
                    Icons.check,
                    color: MyColors.blueColor,
                  )
                : null,
          ),
          Divider(
            height: 2,
            indent: 12,
            color: MyColors.greyColor,
          )
        ],
      ),
    );
  }

  bool checkMainLanguageUsing(String idReplanguage) {
    return XoonitApplication.instance.getUserInfor().idRepLanguage ==
            idReplanguage
        ? true
        : false;
  }

  static Widget getDefaultFlagImage(Country country, String idCodeLanguage) {
    return Image.asset(
      getFlagImageAssetPath(idCodeLanguage),
      height: 20.0,
      width: 30.0,
      fit: BoxFit.fill,
    );
  }

  static String getFlagImageAssetPath(String idCodeLanguage) {
    return "assets/flag/${idCodeLanguage.toLowerCase()}.png";
  }
}
