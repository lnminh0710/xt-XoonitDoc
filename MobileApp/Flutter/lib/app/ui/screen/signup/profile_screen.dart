import 'package:datetime_picker_formfield/datetime_picker_formfield.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/signup_request.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/app/ui/screen/signup/component/signup_component.dart';
import 'package:xoonit/app/ui/screen/signup/signup_bloc.dart';
import 'package:xoonit/app/utils/flag/country.dart';
import 'package:xoonit/app/utils/flag/utils.dart';
import 'package:xoonit/app/ui/screen/signup/component/profile_component.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';
import '../../../../core/bloc_base.dart';
import '../../../model/language_response.dart';
import 'signup_bloc.dart';

class ProfileScreen extends StatefulWidget {
  final SignupRequest signupRequest;
  const ProfileScreen({Key key, this.signupRequest}) : super(key: key);
  @override
  State<StatefulWidget> createState() {
    return _ProfileScreen();
  }
}

class _ProfileScreen extends State<ProfileScreen> {
  final _telnumberFieldKey = GlobalKey<FormFieldState<String>>();
  final languageKey = new GlobalKey<FormState>();
  final formKey = new GlobalKey<FormState>();
  String _telnumber;
  List<Country> countries;
  Country selectedCountry;
  bool filtered = false;
  bool sortedByIsoCode = false;
  bool hasPriorityList = false;
  String datetime;
  List<Language> language = new List();
  @override
  Widget build(BuildContext context) {
    SignupBloc signupBloc = BlocProvider.of(context);
    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: MyColors.primaryColor,
      body: Container(
          padding: EdgeInsets.only(left: 50, right: 50),
          width: Dimension.getWidth(1),
          height: Dimension.getHeight(1),
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(Resources.splashBackground),
              fit: BoxFit.cover,
            ),
          ),
          child: SingleChildScrollView(
              child: Container(
            child: Column(children: <Widget>[
              Row(
                children: <Widget>[
                  Container(
                    padding: EdgeInsets.only(bottom: 90),
                    alignment: Alignment.topLeft,
                    child: GestureDetector(
                        onTap: () {
                          Navigator.of(context).pop();
                        },
                        child: Image.asset(Resources.buttonback)),
                  ),
                  Container(
                    margin: EdgeInsets.only(top: 40),
                    alignment: Alignment.topCenter,
                    child: Image(
                      width: 228,
                      height: 207,
                      image: AssetImage(Resources.signupLogo),
                      fit: BoxFit.scaleDown,
                    ),
                  ),
                ],
              ),
              Column(
                children: <Widget>[
                  Container(
                      alignment: Alignment.topLeft,
                      margin: EdgeInsets.only(top: 20),
                      child: Text(
                        'Next Step',
                        style: MyStyleText.white20Medium,
                      )),
                  Row(
                    children: <Widget>[
                      Container(
                          margin: EdgeInsets.only(top: 25),
                          width: 140,
                          height: 50,
                          child: CountryPickerDropdown(
                              initialValue: 'AR',
                              itemFilter: filtered
                                  ? (c) => ['AR', 'DE', 'GB', 'CN']
                                      .contains(c.isoCode)
                                  : null,
                              priorityList: hasPriorityList
                                  ? [
                                      CountryPickerUtils.getCountryByIsoCode(
                                          'GB'),
                                      CountryPickerUtils.getCountryByIsoCode(
                                          'CN'),
                                    ]
                                  : null,
                              sortComparator: sortedByIsoCode
                                  ? (Country a, Country b) =>
                                      a.isoCode.compareTo(b.isoCode)
                                  : null,
                              onValuePicked: (Country country) {
                                print("${country.name}");
                                Expanded(
                                  child: TextField(
                                    decoration:
                                        InputDecoration(labelText: "Phone"),
                                  ),
                                );
                              })),
                      Expanded(
                        child: Form(
                          child: CommonTextFormField(
                            labelText: 'Tel Number',
                            fieldKey: _telnumberFieldKey,
                            keyboardType: TextInputType.phone,
                            onChange: (value) {
                              _telnumber = value;
                            },
                          ),
                        ),
                      ),
                    ],
                  )
                ],
              ),
              Container(
                child: DateTimePickerFormField(
                    inputType: InputType.date,
                    firstDate: DateTime(1850),
                    lastDate: DateTime(2021),
                    format: DateFormat("MM/dd/yyyy"),
                    dateOnly: true,
                    editable: true,
                    autocorrect: true,
                    autofocus: false,
                    initialDate: DateTime(2021),
                    style: MyStyleText.white14Medium,
                    decoration: InputDecoration(
                      labelText: 'Date',
                      labelStyle: MyStyleText.white14Medium,
                      fillColor: MyColors.whiteColor,
                      isDense: true,
                      enabledBorder: UnderlineInputBorder(
                        borderSide:
                            BorderSide(color: MyColors.greyHintTextColor),
                      ),
                      focusedBorder: UnderlineInputBorder(
                        borderSide: BorderSide(color: MyColors.greyLowColor),
                      ),
                      border: UnderlineInputBorder(),
                    ),
                    onChanged: (dt) {
                      datetime = DateFormat("MM/dd/yyyy").format(dt);
                    }
                    // ),
                    ),
              ),
              Container(
                  alignment: Alignment.topLeft,
                  margin: EdgeInsets.only(top: 20),
                  child: Text(
                    'Your Birthday',
                    style: MyStyleText.textLink14Medium,
                  )),
              StreamBuilder<List<String>>(
                  stream: signupBloc.listLanguage,
                  builder: (context, snapshot) {
                    if (snapshot.data != null && snapshot.hasData) {
                      return Container(
                          height: 50,
                          width: 300,
                          margin: EdgeInsets.only(top: 10),
                          child: StreamBuilder<String>(
                              stream: signupBloc.selectedValue,
                              builder: (context, languageValue) {
                                return DropdownButton<String>(
                                  isExpanded: true,
                                  value: languageValue.data,
                                  dropdownColor: MyColors.primaryColor,
                                  hint: Text(
                                    'Language',
                                    style: MyStyleText.hintColor16Medium,
                                  ),
                                  style: MyStyleText.white16Medium,
                                  iconDisabledColor: MyColors.greenlight,
                                  iconEnabledColor: MyColors.greenlight,
                                  onChanged: (String itemlist) {
                                    signupBloc
                                        .onChangSelectedLanguage(itemlist);
                                  },
                                  items: snapshot.data
                                      .map<DropdownMenuItem<String>>(
                                          (itemlist) {
                                    return DropdownMenuItem<String>(
                                      value: itemlist,
                                      child: Text(itemlist),
                                    );
                                  }).toList(),
                                );
                              }));
                    } else {
                      return Container();
                    }
                  }),
              Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  Container(
                    margin: EdgeInsets.only(top: 32),
                    child: Expanded(
                      child: CommonCheckbox(
                        onChanged: (bool isChecked) {},
                        description:
                            'By creating an account your aggree to our',
                        isChecked: true,
                        textLink: 'Term and Conditions',
                      ),
                    ),
                  ),
                  Container(
                    margin: EdgeInsets.only(top: 32),
                    width: Dimension.getHeight(1),
                    height: 40,
                    child: CommonButton(
                        borderColor: MyColors.blueColor,
                        bgColor: MyColors.blueColor,
                        title: 'SIGN UP',
                        titleStyle: MyStyleText.white14Bold,
                        onTap: () {
                          widget.signupRequest.dateOfBirth = datetime;
                          widget.signupRequest.phoneNr = _telnumber;
                          signupBloc.signupAccount(
                              widget.signupRequest, context);
                        }),
                  ),
                  Container(
                      margin: EdgeInsets.only(top: 113, bottom: 20),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          Text(
                            ' Have an account?',
                            style: MyStyleText.hintColor14Medium,
                          ),
                          Container(
                            width: 8,
                          ),
                          GestureDetector(
                            onTap: () {
                              Navigator.of(context)
                                  .pushNamed(RoutesName.LOGIN_SCREEN);
                            },
                            child: Text(
                              'Sign In',
                              style: MyStyleText.textLink16Bold,
                            ),
                          )
                        ],
                      )),
                ],
              )
            ]),
          ))),
    );
  }
}
