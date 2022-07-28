import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/ui/screen/cloud/widgets/cloud_connection/cloud_connection.dart';
import 'package:xoonit/app/ui/screen/cloud/widgets/cloud_connection/cloud_connection_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';

class CloudScreen extends StatelessWidget {
  PageController _pageCtrl = PageController(keepPage: true, initialPage: 0);
  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([]);
    return Container(
      color: MyColors.whiteBackground,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Container(
            decoration: BoxDecoration(boxShadow: [
              BoxShadow(color: Colors.grey, blurRadius: 5, spreadRadius: 1)
            ], color: Colors.white, borderRadius: BorderRadius.circular(10)),
            margin: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            child: DefaultTabController(
              initialIndex: 2,
              length: 3,
              child: IgnorePointer(
                child: TabBar(
                    onTap: (value) {
                      // _pageCtrl.animateToPage(value,
                      //     duration: Duration(milliseconds: 200),
                      //     curve: Curves.ease);
                    },
                    unselectedLabelColor: Colors.grey,
                    unselectedLabelStyle: MyStyleText.grey14Regular,
                    labelColor: Colors.white,
                    labelStyle: MyStyleText.white14Regular,
                    labelPadding:
                        EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                    indicator: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: Colors.blue[900]),
                    tabs: [
                      Tab(
                          child: Text(
                        "Local\nConnection",
                        textAlign: TextAlign.center,
                      )),
                      Tab(
                        child: Text("Remote\nConnection",
                            textAlign: TextAlign.center),
                      ),
                      Tab(
                        child: Text("Cloud\nConnection",
                            textAlign: TextAlign.center),
                      ),
                    ]),
              ),
            ),
          ),
          Expanded(
            child: PageView(
              physics: NeverScrollableScrollPhysics(),
              controller: _pageCtrl,
              children: <Widget>[
                // LocalConnection(),
                // RemoteConnection(),
                BlocProvider(
                  bloc: CloudConnectionBloc(),
                  child: CloudConnectionWidget(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
