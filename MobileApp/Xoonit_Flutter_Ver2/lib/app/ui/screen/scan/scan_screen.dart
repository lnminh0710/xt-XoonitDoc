import 'package:flutter/material.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/scan/scan_bloc.dart';
import 'package:xoonit/app/utils/specific_method.dart';
import 'package:xoonit/core/bloc_base.dart';

class ScanScreen extends StatelessWidget {

  ScanBloc _bloc;

  @override
  Widget build(BuildContext context) {
    _bloc = BlocProvider.of(context);
    DashBoardBloc homeBloc = BlocProvider.of(context);
    SpecificMethod.showScanScreen().then((value) {
      _bloc.handleScanImages(value);
      // homeBloc.jumpToScreen(EHomeScreenChild.photos);
    });

    return SizedBox.shrink();
  }
}
