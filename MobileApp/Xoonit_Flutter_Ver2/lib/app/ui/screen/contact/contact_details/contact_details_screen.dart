import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/contact/contact_detail_response.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_attachment/contact_attachment_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_attachment/contact_attachment_page.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

enum EnumContactTab { DETAIL, ATTACHMENT }

class ContactDetailsScreen extends StatefulWidget {
  ContactDetailsScreen(
      {Key key, @required this.idPerson, @required this.idPersonType})
      : super(key: key);
  final String idPerson;
  final String idPersonType;
  @override
  _ContactDetailsScreenState createState() => _ContactDetailsScreenState();
}

class _ContactDetailsScreenState extends State<ContactDetailsScreen> {
  ContactDetailsBloc _contactDetailsBloc;
  ContactDetailResponse _currentContactDetail;
  EnumContactTab _currentTab = EnumContactTab.DETAIL;
  List<TextEditingController> _listTextController = [];

  @override
  void initState() {
    super.initState();
    _contactDetailsBloc = BlocProvider.of(context);
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([]);

    return Scaffold(
      // appBar: _renderAppbar(),
      backgroundColor: MyColors.whiteColor,
      body: Container(
        child: Stack(
          children: <Widget>[
            Column(
              children: <Widget>[
                _renderContactTab(),
                Expanded(
                  child: _renderBodyPage(),
                ),
              ],
            ),
            StreamBuilder<AppState>(
                stream: _contactDetailsBloc.screenState,
                initialData: AppState.Idle,
                builder: (context, snapShot) {
                  if (snapShot.hasData && snapShot.data == AppState.Loading) {
                    return Container(
                      color: Colors.black54,
                      width: Dimension.getWidth(1),
                      height: Dimension.getHeight(1),
                      child: Center(
                        child: CircularProgressIndicator(),
                      ),
                    );
                  } else {
                    return Container();
                  }
                }),
          ],
        ),
      ),
    );
  }

  Widget _renderBodyPage() {
    return StreamBuilder<ContactDetailResponse>(
        stream: _contactDetailsBloc.contactDetail,
        initialData: null,
        builder: (context, contactDetailSnapshot) {
          if (contactDetailSnapshot.hasData &&
              contactDetailSnapshot.data != null) {
            _currentContactDetail = contactDetailSnapshot.data;
            return SingleChildScrollView(
              child: Container(
                padding: EdgeInsets.only(top: 8),
                child: contactDetailSnapshot.data?.contactDetailItems != null
                    ? _renderContactDetail(_currentContactDetail)
                    : Container(),
              ),
            );
          } else {
            return Container();
          }
        });
  }

  Widget _renderContactTab() {
    return Container(
      color: MyColors.whiteBackground,
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Container(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            FlatButton(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.all(Radius.circular(10))),
                onPressed: () {
                  if (_currentTab != EnumContactTab.DETAIL) {
                    setState(() {
                      _currentTab = EnumContactTab.DETAIL;
                    });
                  }
                },
                child: Container(
                    alignment: Alignment.center,
                    width: Dimension.getWidth(0.4),
                    child: Text('Contact Detail')),
                textColor: _currentTab == EnumContactTab.DETAIL
                    ? MyColors.whiteColor
                    : MyColors.greyColor,
                color: _currentTab == EnumContactTab.DETAIL
                    ? MyColors.blueColor
                    : MyColors.whiteColor),
            // Container(width: 1, height: 10, color: MyColors.darkColor),
            FlatButton(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.all(Radius.circular(10))),
              onPressed: () {
                if (_currentTab != EnumContactTab.ATTACHMENT) {
                  setState(() {
                    _currentTab = EnumContactTab.ATTACHMENT;
                  });
                }
              },
              child: Container(
                  alignment: Alignment.center,
                  width: Dimension.getWidth(0.4),
                  child: Text('Attachment')),
              textColor: _currentTab == EnumContactTab.ATTACHMENT
                  ? MyColors.whiteColor
                  : MyColors.greyColor,
              color: _currentTab == EnumContactTab.ATTACHMENT
                  ? MyColors.blueColor
                  : MyColors.whiteColor,
            ),
          ],
        ),
      ),
    );
  }

  Widget _renderAppbar() {
    return PreferredSize(
      preferredSize: Size(Dimension.getWidth(1), 50),
      child: AppBar(
        backgroundColor: MyColors.whiteColor,
        leading: IconButton(
            icon: Icon(
              Icons.arrow_back_ios,
              color: MyColors.blackColor,
            ),
            onPressed: () {
              Navigator.pop(context);
            }),
        centerTitle: true,
        title: Text(
          'Contact Detail',
          style: MyStyleText.black16Medium,
          textAlign: TextAlign.center,
        ),
        actions: <Widget>[
          IconButton(
              icon: Image.asset(Resources.iconSave),
              onPressed: () {
                _contactDetailsBloc.saveContactDetails(
                    context, _currentContactDetail);
              })
        ],
      ),
    );
  }

  bool _checkVisibleText(ContactDetailColumnSetting settings) {
    if ((settings?.displayField?.hidden != null &&
            settings.displayField.hidden == '1') ||
        (settings?.displayField?.groupHeader != null &&
            settings.displayField.groupHeader == '1')) {
      return false;
    }
    return true;
  }

  Widget _renderContactInfo(ContactDetailResponse contactDetailResponse) {
    if (_listTextController == null ||
        _listTextController.length == 0 ||
        _listTextController.length !=
            contactDetailResponse?.contactDetailItems?.length) {
      contactDetailResponse.contactDetailItems.forEach((element) {
        _listTextController.add(TextEditingController(text: element.value));
      });
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: <Widget>[
        IconButton(
            icon: Image.asset(
              Resources.iconSave,
              width: 24,
              height: 24,
            ),
            onPressed: () {
              _contactDetailsBloc.saveContactDetails(
                  context, _currentContactDetail);
            }),
        Column(
          children: List<Widget>.generate(
              contactDetailResponse.contactDetailItems.length, (index) {
            return _checkVisibleText(
                    contactDetailResponse.contactDetailItems[index].setting)
                ? TextFormField(
                    style: MyStyleText.black16Medium,
                    decoration: InputDecoration(
                      labelText: contactDetailResponse
                          .contactDetailItems[index].columnName,
                      alignLabelWithHint: true,
                      labelStyle: MyStyleText.grey16Regular,
                      enabledBorder: UnderlineInputBorder(
                        borderSide: BorderSide(
                          color: MyColors.blackColor,
                          style: BorderStyle.solid,
                        ),
                      ),
                    ),
                    controller: _listTextController[index],
                    onTap: () {},
                    onChanged: (text) {
                      contactDetailResponse.contactDetailItems[index].value =
                          text;
                    },
                  )
                : Container();
          }),
        ),
      ],
    );
  }

  _renderContactDetail(ContactDetailResponse contactDetailResponse) =>
      _currentTab == EnumContactTab.DETAIL
          ? Container(
              padding: EdgeInsets.only(left: 16.0, right: 16.0, bottom: 16),
              child: _renderContactInfo(contactDetailResponse),
            )
          : Padding(
              padding: EdgeInsets.only(left: 12.0, right: 12.0, bottom: 20),
              child: BlocProvider(
                bloc: ContactAttachmentBloc(idPerson: widget.idPerson),
                child: ContactAttachmentPage(),
              ));
}
