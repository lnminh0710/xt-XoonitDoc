import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/model/history_response.dart';
import 'package:xoonit/app/ui/screen/history/history_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';

import 'history_widget/custom_item_list_history.dart';

class HistoryScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return RenderHistoryScreen();
  }
}

class RenderHistoryScreen extends StatefulWidget {
  RenderHistoryScreen({Key key}) : super(key: key);

  @override
  _RenderHistoryScreenState createState() => _RenderHistoryScreenState();
}

class _RenderHistoryScreenState extends State<RenderHistoryScreen> {
  @override
  Widget build(BuildContext context) {
    HistoryBloc historyBloc = BlocProvider.of(context);
    return Container(
      decoration: BoxDecoration(color: MyColors.colorBackgroundScreen),
      child: FutureBuilder(
          future: historyBloc.loadHistory(),
          builder: (BuildContext context, AsyncSnapshot snapShot) {
            switch (snapShot.connectionState) {
              case ConnectionState.none:
                return Container();
                break;
              case ConnectionState.waiting:
                return Center(
                  child: CircularProgressIndicator(
                    backgroundColor: MyColors.bluedarkColor,
                  ),
                );
                break;
              case ConnectionState.active:
                return Center(
                  child: CircularProgressIndicator(
                    backgroundColor: MyColors.bluedarkColor,
                  ),
                );
                break;
              case ConnectionState.done:
                if (snapShot != null) {
                  return _buildListItem(context, snapShot.data);
                } else
                  return Container();
                break;
              default:
                return Center(
                  child: CircularProgressIndicator(
                    backgroundColor: MyColors.bluedarkColor,
                  ),
                );
            }
          }),
    );
  }

  Widget _buildListItem(BuildContext context, List<HistoryItem> listData) {
    return ListView.builder(
        itemCount: listData?.length ?? 0,
        itemBuilder: (context, index) {
          return CustomCardViewHistory(item: listData[index]);
        });
  }
}
