import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/global_search/get_module_response.dart';

class GlobalSearchFolderItemListView extends StatelessWidget {
  final GlobalSearchModule module;
  final Function onTap;
  GlobalSearchFolderItemListView({@required this.module, @required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        GestureDetector(
          onTap: module.count != 0
              ? () {
                  onTap();
                }
              : null,
          child: Card(
            elevation: 6,
            shadowColor: Colors.grey.withOpacity(0.3),
            color: MyColors.whiteColor,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10.0),
            ),
            child: Container(
              padding: EdgeInsets.all(16),
              child: Row(
                children: <Widget>[
                  Image.asset(
                    Resources.iconFolderYellow,
                    width: 42,
                    height: 42,
                    fit: BoxFit.fitWidth,
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 16),
                    child:
                        // Column(
                        //   crossAxisAlignment: CrossAxisAlignment.start,
                        //   children: <Widget>[
                        Text(
                      module.moduleName,
                      style: MyStyleText.black14Bold,
                      overflow: TextOverflow.ellipsis,
                    ),
                    // Padding(
                    //   padding: const EdgeInsets.only(top: 4.0),
                    //   child: Text(
                    //     _module.moduleName,
                    //     style: MyStyleText.grey12Regular,
                    //     overflow: TextOverflow.ellipsis,
                    //   ),
                    // ),
                    //   ],
                    // ),
                  ),
                  Expanded(
                    child: Container(),
                  ),
                  CircleAvatar(
                    maxRadius: 12,
                    backgroundColor: MyColors.blueLightBackground,
                    child: Text(
                      "${module.count}",
                      style: MyStyleText.blue12Bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        module.count > 0
            ? Container()
            : Container(
                decoration: BoxDecoration(
                  color: MyColors.whiteColor.withOpacity(0.6),
                  borderRadius: BorderRadius.all(Radius.circular(10)),
                ),
                margin: EdgeInsets.all(6),
              ),
      ],
    );
  }
}
