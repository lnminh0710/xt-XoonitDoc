import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:rxdart/subjects.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xoonit/app/constants/constants_value.dart';
import 'package:xoonit/app/model/language_response.dart';
import 'package:xoonit/app/model/signup_request.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/dialog/dialog_message.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../difinition.dart';

class SignupBloc extends BlocBase {
  final BehaviorSubject<List<String>> _listLanguage =
      BehaviorSubject.seeded(null);
  Stream<List<String>> get listLanguage => _listLanguage.stream;

  final BehaviorSubject<String> _selectedValue = BehaviorSubject.seeded(null);
  Stream<String> get selectedValue => _selectedValue.stream;
  final BehaviorSubject<AppState> _screenState =
      BehaviorSubject<AppState>.seeded(AppState.Idle);
  Stream<AppState> get screenState => _screenState.stream;

  List<Language> _languages = new List();
  @override
  void dispose() {}

  void closeStream() {
    _listLanguage.close();
    _selectedValue.close();
    _screenState.close();
  }

  SignupBloc() {
    getAllLanguage();
  }

  SharedPreferences sharedPreferences;
  void signupAccount(SingupRequest signupRequest, BuildContext context) async {
    sharedPreferences = await SharedPreferences.getInstance();
    buildFlavor = sharedPreferences
        .getString(ConstantValues.buildFavorMode)
        .toBuildFlavorMode;
    _screenState.sink.add(AppState.Loading);
    if (signupRequest != null) {
      signupRequest.idRepLanguage =
          onGetIdRepLanguage(_selectedValue.value, _languages);
      await appApiService.client
          .postSignup(signupRequest.toJson())
          .then((value) {
        if (value != null && value.item.statusCode == 1) {
          _screenState.sink.add(AppState.Idle);
          Navigator.of(context).pushNamed(RoutesName.CONGRATULATION_SCREEN);
        } else {
          showDialog(
              context: context,
              builder: (BuildContext context) {
                return DialogMessage(
                  title: 'Failed!',
                  message: 'Sorry, we can\'t use this Email for create a new account !',
                  onOKButtonPressed: () {
                    Navigator.of(context).pop();
                  
                  },
                );
              });
         
        }
           _screenState.sink.add(AppState.Idle);
      });
    }
  }

  getAllLanguage() async {
    List<String> listMainLanguage = new List();
    await appApiService.client.getAllLanguage().then((onValue) {
      if (onValue != null &&
          onValue.language != null &&
          onValue.language.length > 0) {
        onValue.language.forEach((element) {
          listMainLanguage.add(element.defaultValue);
          _languages.add(element);
        });
      }
    }).timeout(Duration(seconds: 30));
    _listLanguage.sink.add(listMainLanguage);
  }

  onChangSelectedLanguage(String selectedvalue) {
    _selectedValue.sink.add(selectedvalue);
  }

  int onGetIdRepLanguage(String language, List<Language> listLanguage) {
    int _id = 0;
    listLanguage.forEach((element) {
      if (element.defaultValue.contains(language)) {
        _id = int.tryParse(element.idRepLanguage);
      }
    });
    return _id;
  }
}
