import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/signup_request.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/component/loading_checking_cloud_connection.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/app/ui/screen/signup/component/signup_component.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/app/ui/screen/signup/signup_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';
import 'package:xoonit/app/ui/screen/signup/component/profile_component.dart';
import 'package:xoonit/app/utils/flag/country.dart';
import 'package:xoonit/app/utils/flag/utils.dart';

import '../../../difinition.dart';

class SignupScreen extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return _SignupScreen();
  }
}

class _SignupScreen extends State<SignupScreen> {
  String _fristname = "";
  String _lastname = "";
  String _email = "";
  String _telnumber = '';
  bool isChecked = false;
  bool isCheckFirstname = false;
  bool isCheckLastname = false;
  bool isShowErrorText = false;
  bool isCheckEmail = false;
  bool isShowCheckBoxError = false;
  bool isCheckLanguage = false;

  bool isCheckBox = false;

  List<bool> isDisable = new List();
  List<Country> countries;
  Country selectedCountry;
  bool filtered = false;
  bool sortedByIsoCode = false;
  bool hasPriorityList = false;
  final _firstnameFieldKey = GlobalKey<FormFieldState<String>>();
  final _lastnameFieldKey = GlobalKey<FormFieldState<String>>();
  final _emailaddressFieldKey = GlobalKey<FormFieldState<String>>();
  final _telnumberFieldKey = GlobalKey<FormFieldState<String>>();

  final languageKey = new GlobalKey<FormState>();
  final formKey = new GlobalKey<FormState>();
  final FocusNode focusFirstName = FocusNode();
  final FocusNode focusLastName = FocusNode();
  final FocusNode focusEmail = FocusNode();
  DateTime selectedDate = DateTime.now();
  DateTime _pickDate;

  Future<void> _selectDate(BuildContext context, bool pickDate) async {
    final DateTime picked = await showDatePicker(
        context: context,
        initialDate:
            pickDate == true ? _pickDate ?? selectedDate : _pickDate == null,
        firstDate: DateTime(1870),
        lastDate: pickDate ? selectedDate : DateTime(2200));
    if (picked != null && picked != _pickDate)
      setState(() {
        _pickDate = picked;
      });
  }

  sampleFunction() {
    print('Clicked');
  }

  @override
  Widget build(BuildContext context) {
    SignupBloc signupBloc = BlocProvider.of(context);
return GestureDetector(
          onTap: () {
            FocusScopeNode currentFocus = FocusScope.of(context);
            if (!currentFocus.hasPrimaryFocus) {
              currentFocus.unfocus();
            }
          },
    child: Scaffold(
      resizeToAvoidBottomInset: false,
      backgroundColor: MyColors.primaryColor,
      body: StreamBuilder<AppState>(
          stream: signupBloc.screenState,
          builder: (context, snapshot) {
            return Stack(children: <Widget>[
              Container(
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
                            margin:
                                EdgeInsets.only(top: 72, left: 50, right: 50),
                            alignment: Alignment.topCenter,
                            child: Image(
                              width: 70,
                              height: 20,
                              image: AssetImage(Resources.xoonitLogoSmall),
                              fit: BoxFit.scaleDown,
                            ),
                          ),
                        ],
                      ),
                      Column(
                        children: <Widget>[
                          Container(
                              alignment: Alignment.topLeft,
                              margin:
                                  EdgeInsets.only(top: 30, left: 50, right: 50),
                              child: Text(
                                'Create new account',
                                style: TextStyle(
                                    fontSize: 24,
                                    color: MyColors.blackColor,
                                    fontFamily: FontFamily.robotoMedium),
                              )),
                          Container(
                            alignment: Alignment.topLeft,
                            margin:
                                EdgeInsets.only(top: 5, left: 50, right: 50),
                            child: Text(
                              'Use your work email to create new account... its free.',
                              style: MyStyleText.hintColor12Medium,
                            ),
                          ),
                          SizedBox(
                            height: 40,
                          ),
                          Container(
                            child: Column(
                              children: <Widget>[
                                Container(
                                  margin: EdgeInsets.only(
                                      top: 12, left: 50, right: 50),
                                  height: 80,
                                  child: CommonTextFormField(
                                    labelText: 'First Name*',
                                    focusNode: focusFirstName,
                                    fieldKey: _firstnameFieldKey,
                                    onTap: () {
                                      _firstnameFieldKey.currentState
                                          .validate();
                                    },
                                    onSaved: (String value) {
                                      _fristname = value;
                                    },
                                    onChange: (value) {
                                      _fristname = value;
                                      _firstnameFieldKey.currentState
                                          .didChange(value);
                                      _firstnameFieldKey.currentState
                                          .validate();
                                      if (_fristname != null &&
                                          _fristname != '') {
                                        isCheckFirstname = true;
                                      } else {
                                        isCheckFirstname = false;
                                      }
                                    },
                                    onFieldSubmitted: (String value) {
                                      _firstnameFieldKey.currentState
                                          .validate();
                                      FocusScope.of(context)
                                          .requestFocus(focusLastName);
                                      _lastnameFieldKey.currentState.validate();
                                      if (_fristname != null &&
                                          _fristname != '') {
                                        isCheckFirstname = true;
                                      } else {
                                        isCheckFirstname = false;
                                      }
                                    },
                                    validator: (String value) {
                                      if (value.isEmpty) {
                                        return 'First name is required';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                                Container(
                                  margin: EdgeInsets.only(
                                      top: 12, left: 50, right: 50),
                                  height: 80,
                                  child: CommonTextFormField(
                                    labelText: 'Last Name*',
                                    focusNode: focusLastName,
                                    fieldKey: _lastnameFieldKey,
                                    onTap: () {
                                      _lastnameFieldKey.currentState.validate();
                                    },
                                    onSaved: (String value) {
                                      _lastname = value;
                                    },
                                    onChange: (value) {
                                      _lastname = value;
                                      _lastnameFieldKey.currentState
                                          .didChange(value);
                                      _lastnameFieldKey.currentState.validate();
                                      if (_lastname != null &&
                                          _lastname != '') {
                                        isCheckLastname = true;
                                      } else {
                                        isCheckLastname = false;
                                      }
                                    },
                                    onFieldSubmitted: (String value) {
                                      _lastnameFieldKey.currentState.validate();
                                      FocusScope.of(context)
                                          .requestFocus(focusEmail);
                                      _emailaddressFieldKey.currentState
                                          .validate();
                                    },
                                    validator: (String value) {
                                      if (value.isEmpty) {
                                        return 'Last name is required';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                                Container(
                                  height: 80,
                                  margin: EdgeInsets.only(
                                      top: 12, left: 50, right: 50),
                                  child: CommonTextFormField(
                                    labelText: 'Email Address*',
                                    fieldKey: _emailaddressFieldKey,
                                    focusNode: focusEmail,
                                    onTap: () {
                                      _emailaddressFieldKey.currentState
                                          .validate();
                                    },
                                    onSaved: (String value) {
                                      _email = value;
                                    },
                                    onChange: (value) {
                                      _email = value;
                                      _emailaddressFieldKey.currentState
                                          .didChange(value);
                                      _emailaddressFieldKey.currentState
                                          .validate();
                                      if (_email != null && _email != '') {
                                        isCheckEmail = true;
                                      } else {
                                        isCheckEmail = false;
                                      }
                                    },
                                    onFieldSubmitted: (String value) {
                                      _emailaddressFieldKey.currentState
                                          .validate();
                                    },
                                    validator: (String value) {
                                      Pattern pattern =
                                          r'^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$';
                                      RegExp regex = new RegExp(pattern);
                                      if (value.isEmpty) {
                                        return 'Email is required';
                                      } else {
                                        if (!regex.hasMatch(value))
                                          return 'Format email is wrong';
                                        else
                                          return null;
                                      }
                                    },
                                  ),
                                ),
                                StreamBuilder<List<String>>(
                                    stream: signupBloc.listLanguage,
                                    builder: (context, snapshot) {
                                      if (snapshot.data != null &&
                                          snapshot.hasData) {
                                        return Container(
                                            margin: EdgeInsets.only(
                                                top: 12, left: 50, right: 50),
                                            height: 85,
                                            child: StreamBuilder<String>(
                                                stream:
                                                    signupBloc.selectedValue,
                                                builder:
                                                    (context, languageValue) {
                                                  return Column(
                                                    children: [
                                                      DropdownButtonFormField<
                                                          String>(
                                                        isExpanded: true,
                                                        onTap: () {
                                                          setState(() {
                                                            isShowErrorText =
                                                                !isCheckLanguage;
                                                          });
                                                        },
                                                        value:
                                                            languageValue.data,
                                                        decoration: isShowErrorText ==
                                                                false
                                                            ? InputDecoration(
                                                                border:
                                                                    OutlineInputBorder(
                                                                borderRadius:
                                                                    BorderRadius
                                                                        .circular(
                                                                            5.0),
                                                              ))
                                                            : InputDecoration(
                                                                enabledBorder:
                                                                    OutlineInputBorder(
                                                                  borderRadius:
                                                                      BorderRadius
                                                                          .circular(
                                                                              5.0),
                                                                  borderSide: BorderSide(
                                                                      width: 1,
                                                                      color: Colors
                                                                              .red[
                                                                          600]),
                                                                ),
                                                              ),
                                                        hint: Text(
                                                          'Language',
                                                          style: MyStyleText
                                                              .textLink14Medium,
                                                          textAlign:
                                                              TextAlign.center,
                                                        ),
                                                        style: MyStyleText
                                                            .black14Medium,
                                                        iconDisabledColor:
                                                            MyColors
                                                                .blueDropdown,
                                                        iconEnabledColor:
                                                            MyColors
                                                                .blueDropdown,
                                                        onChanged: (value) {
                                                          signupBloc
                                                              .onChangSelectedLanguage(
                                                                  value);
                                                          if (value != null &&
                                                              value
                                                                  .isNotEmpty) {
                                                            isCheckLanguage =
                                                                true;
                                                            isShowErrorText =
                                                                false;
                                                          }
                                                        },
                                                        items: snapshot.data.map<
                                                                DropdownMenuItem<
                                                                    String>>(
                                                            (itemlist) {
                                                          return DropdownMenuItem<
                                                              String>(
                                                            value: itemlist,
                                                            child: Text(
                                                              itemlist,
                                                              style: MyStyleText
                                                                  .black14Medium,
                                                            ),
                                                          );
                                                        }).toList(),
                                                      ),
                                                      isShowErrorText == true
                                                          ? Container(
                                                              margin: EdgeInsets
                                                                  .only(
                                                                      top: 6,
                                                                      left: 8),
                                                              alignment:
                                                                  Alignment
                                                                      .topLeft,
                                                              child: Text(
                                                                'Choose Language is required',
                                                                style: TextStyle(
                                                                    color: Colors
                                                                            .red[
                                                                        600],
                                                                    fontSize:
                                                                        12),
                                                              ),
                                                            )
                                                          : Container(),
                                                    ],
                                                  );
                                                }));
                                      } else {
                                        return Container();
                                      }
                                    }),
                                Row(
                                  children: <Widget>[
                                    Container(
                                        margin:
                                            EdgeInsets.only(top: 10, left: 50),
                                        height: 60,
                                        child: CountryPickerDropdown(
                                            initialValue: 'DE',
                                            itemFilter: filtered
                                                ? (c) => [
                                                      'EN',
                                                      'DE',
                                                      'GB',
                                                      'CN'
                                                    ].contains(c.isoCode)
                                                : null,
                                            priorityList: hasPriorityList
                                                ? [
                                                    CountryPickerUtils
                                                        .getCountryByIsoCode(
                                                            'GB'),
                                                    CountryPickerUtils
                                                        .getCountryByIsoCode(
                                                            'CN'),
                                                  ]
                                                : null,
                                            sortComparator: sortedByIsoCode
                                                ? (Country a, Country b) => a
                                                    .isoCode
                                                    .compareTo(b.isoCode)
                                                : null,
                                            onValuePicked: (Country country) {
                                              print("${country.name}");
                                              Expanded(
                                                child: TextField(
                                                  decoration: InputDecoration(
                                                      labelText: "Phone"),
                                                ),
                                              );
                                            })),
                                    Expanded(
                                      child: Padding(
                                        padding: const EdgeInsets.only(
                                            top: 15, right: 50),
                                        child: Container(
                                          height: 50,
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
                                    ),
                                  ],
                                ),
                                Container(
                                    margin: EdgeInsets.only(
                                        top: 12, left: 50, right: 50),
                                    decoration: BoxDecoration(
                                        border: Border.all(),
                                        borderRadius:
                                            BorderRadius.circular(5.0)),
                                    height: 50,
                                    child: GestureDetector(
                                      onTap: () {
                                        _selectDate(context, true);
                                      },
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        mainAxisSize: MainAxisSize.max,
                                        children: <Widget>[
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                left: 8.0),
                                            child: Text(
                                              _pickDate == null
                                                  ? ('Your Birthday')
                                                  : DateFormat("MM/dd/yyyy")
                                                      .format(_pickDate),
                                              style: MyStyleText.black14Medium,
                                              textAlign: TextAlign.start,
                                            ),
                                          ),
                                          Padding(
                                            padding: const EdgeInsets.only(
                                                right: 8.0),
                                            child: Icon(Icons.calendar_today),
                                          ),
                                        ],
                                      ),
                                    )),
                               
                                Container(
                                  alignment: Alignment.topLeft,
                                  margin: EdgeInsets.only(
                                      top: 12, left: 50, right: 50),
                                  child: Text(
                                    'Privacy and Terms',
                                    style: TextStyle(
                                        fontSize: 14,
                                        fontFamily: FontFamily.robotoMedium,
                                        color: MyColors.blueDarkText),
                                  ),
                                ),
                                Container(
                                  height: 200,
                                  margin: EdgeInsets.only(
                                      top: 12, left: 50, right: 50),
                                  decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(5.0)),
                                  child: SingleChildScrollView(
                                    child: Text(
                                        '•    When you set up a Xoonit Account, we store information you give us like your name, email address, and telephone number.\n•    We also combine this data among our services and across your devices for these purposes. For example, depending on your account settings, we show you ads based on information about your interests, which we can derive from your use of Search and we use data from trillions of search queries to build spell-correction models that we use across all of our services.\n•    Depending on your account settings, some of this data may be associated with your Xoonit Account and we treat this data as personal information. You can control how we collect and use this data now by clicking “More Options” below.'),
                                  ),
                                ),
                                Container(
                                    margin: EdgeInsets.only(
                                        top: 12, left: 50, right: 50),
                                    child: Column(
                                      children: [
                                        CommonCheckbox(
                                          description:
                                              'I have read and agree to the terms of use',
                                          textStyle: MyStyleText.black14Medium,
                                          onChanged: (bool value) {
                                            setState(() {
                                              isChecked = !isChecked;
                                              if (value = isChecked) {
                                                isCheckBox = true;
                                              } else {
                                                isCheckBox = false;
                                              }
                                              isShowCheckBoxError = !isCheckBox;
                                            });
                                          },
                                          isChecked: isChecked,
                                        ),
                                        isShowCheckBoxError == true
                                            ? Container(
                                                margin: EdgeInsets.only(
                                                  top: 10,
                                                  left: 8,
                                                ),
                                                alignment: Alignment.topLeft,
                                                child: Text(
                                                  'The terms of use is required',
                                                  style: TextStyle(
                                                      color: Colors.red[600],
                                                      fontSize: 12),
                                                ),
                                              )
                                            : Container(),
                                      ],
                                    )),
                                Container(
                                  margin: EdgeInsets.only(
                                    top: 56,
                                    left: 50,
                                    right: 50,
                                  ),
                                  height: 44,
                                  child: CommonButton(
                                      borderColor: MyColors.blueColor,
                                      bgColor: MyColors.blueColor,
                                      title: 'SIGNUP',
                                      titleStyle: MyStyleText.white14Bold,
                                      onTap: () {
                                        setState(() {
                                          isShowErrorText = !isCheckLanguage;
                                          isShowCheckBoxError = !isCheckBox;
                                        });
                                        _firstnameFieldKey.currentState
                                            .validate();
                                        _lastnameFieldKey.currentState
                                            .validate();
                                        _emailaddressFieldKey.currentState
                                            .validate();

                                        isCheckFirstname == true &&
                                                isCheckLastname == true &&
                                                isCheckEmail == true &&
                                                isCheckLanguage == true &&
                                                isCheckBox == true
                                            ? signupBloc.signupAccount(
                                                new SingupRequest(
                                                  firstName: _fristname,
                                                  lastName: _lastname,
                                                  email: _email,
                                                  phoneNr: _telnumber == ''
                                                      ? _telnumber
                                                      : '',
                                                  currentDateTime:
                                                      DateTime.now().toString(),
                                                  dateOfBirth: _pickDate != null
                                                      ? _pickDate.toString()
                                                      : null,
                                                ),
                                                context)
                                            : () {};
                                      }),
                                ),
                                Container(
                                  margin: EdgeInsets.only(
                                      top: 12, bottom: 20, left: 50, right: 50),
                                  child: Row(
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
                                          Navigator.of(context).pushNamed(
                                              RoutesName.LOGIN_SCREEN);
                                        },
                                        child: Text(
                                          'Sign In',
                                          style: MyStyleText.textLink16Bold,
                                        ),
                                      )
                                    ],
                                  ),
                                )
                              ],
                            ),
                          ),
                        ],
                      ),
                    ]),
                  ),
                ),
              ),
              snapshot.hasData && snapshot.data == AppState.Loading
                  ? Container(
                      color: Colors.black54,
                      width: Dimension.getWidth(1),
                      height: Dimension.getHeight(1),
                      child: Center(
                        child: CustomLoading(),
                      ),
                    )
                  : Container()
            ]);
          }),
    ));
  }
}
