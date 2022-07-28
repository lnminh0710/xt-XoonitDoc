import 'package:flutter/material.dart';
import 'package:xoonit/app/ui/screen/home/home_bloc.dart';
import 'package:xoonit/app/ui/screen/home/home_enum.dart';
import 'package:xoonit/app/ui/screen/scan/scan_bloc.dart';
import 'package:xoonit/app/utils/specific_method.dart';
import 'package:xoonit/core/bloc_base.dart';

class ScanScreen extends StatelessWidget {

  ScanBloc _bloc;

  @override
  Widget build(BuildContext context) {
    _bloc = BlocProvider.of(context);
    HomeBloc homeBloc = BlocProvider.of(context);
    SpecificMethod.showScanScreen().then((value) {
      _bloc.handleScanImages(value);
      homeBloc.jumpToScreen(EHomeScreenChild.photos);
    });

    return SizedBox.shrink();
  }
}
