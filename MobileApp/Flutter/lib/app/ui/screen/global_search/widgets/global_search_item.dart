import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/global_search/get_module_response.dart';
import 'package:xoonit/app/ui/screen/home/home_bloc.dart';
import 'package:xoonit/app/ui/screen/home/home_enum.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../global_search_bloc.dart';

class GlobalSearchItem extends StatelessWidget {
  final GlobalSearchModule _module;

  GlobalSearchItem(this._module);

  HomeBloc _homeBloc;
  GlobalSearchBloc _bloc;

  @override
  Widget build(BuildContext context) {
    _bloc = BlocProvider.of(context);
    _homeBloc = BlocProvider.of(context);
    return GestureDetector(
      onTap: _module.count != 0
          ? () {
        _navigateTo();
      }
          : null,
      child: Card(
        color: MyColors.bluedarkColor,
        child: Container(
          padding: EdgeInsets.all(8),
          child: Column(
            children: <Widget>[
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  Text(
                    _module.moduleName,
                    style: MyStyleText.grey14Regular,
                  ),
                  StreamBuilder(
                      stream: _bloc.isSearching,
                      builder: (_, snapShot) {
                        return snapShot?.data == true
                            ? Container(
                                width: 12,
                                height: 12,
                                child: CircularProgressIndicator(
                                  strokeWidth: 1,
                                ),
                              )
                            : Container(
                                padding: EdgeInsets.fromLTRB(8, 0, 8, 0),
                                child: Text("${_module.count}"),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(100),
                                  shape: BoxShape.rectangle,
                                ));
                      })
                ],
              ),
              Divider(color: MyColors.greyBoldColor),
              SizedBox(height: 40)
            ],
          ),
        ),
      ),
    );
  }

  _navigateTo() {
    // document,contact,maindocument,invoicepdm,contract,otherdocuments
    switch (_module.moduleName.toLowerCase()) {
      case "capture":
        _homeBloc.jumpToScreen(EHomeScreenChild.capture,
            args: _bloc.searchOnChanedvalue.value);
        break;
      case "document":
        _homeBloc.jumpToScreen(EHomeScreenChild.capture,
            args: _bloc.searchOnChanedvalue.value);
        break;
      case "contact":
        _homeBloc.jumpToScreen(EHomeScreenChild.contact,
            args: _bloc.searchOnChanedvalue.value);
        break;
      case "maindocument":
        _homeBloc.jumpToScreen(EHomeScreenChild.capture,
            args: _bloc.searchOnChanedvalue.value);
        break;
      case "contract":
        _homeBloc.jumpToScreen(EHomeScreenChild.capture,
            args: _bloc.searchOnChanedvalue.value);
        break;
      case "otherdocuments":
        _homeBloc.jumpToScreen(EHomeScreenChild.capture,
            args: _bloc.searchOnChanedvalue.value);
        break;
    }
  }
}
