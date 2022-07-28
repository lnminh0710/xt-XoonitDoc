import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/document_tree_response.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/dash_board/drawer/structure_tree_item.dart';
import 'package:xoonit/app/ui/screen/home_screen/home_page/home_enum.dart';
import 'package:xoonit/core/bloc_base.dart';

class DashBoardDrawer extends StatefulWidget {
  DashBoardDrawer({Key key}) : super(key: key);

  @override
  _DashBoardDrawerState createState() => _DashBoardDrawerState();
}

class _DashBoardDrawerState extends State<DashBoardDrawer> {
  DashBoardBloc dashBoardBloc;
  bool isShowAll = true;
  @override
  Widget build(BuildContext context) {
    dashBoardBloc = BlocProvider.of(context);
    return Container(
      color: Colors.white,
      child: FutureBuilder<List<DocumentTreeItem>>(
        future: dashBoardBloc.checkGetDocumentTree(),
        builder: (context, snapshot) {
          if (snapshot.hasData) {
            return Container(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Padding(
                    padding:
                        const EdgeInsets.only(top: 24, bottom: 8, left: 16),
                    child: Image.asset(
                      Resources.xoonitLogoSmall,
                      width: 70,
                      height: 20,
                    ),
                  ),
                  Divider(
                    color: MyColors.lightBlue,
                    thickness: 2,
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(left: 16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Row(
                            children: <Widget>[
                              Text(
                                'STRUCTURE TREE',
                                style: MyStyleText.black14Bold,
                              ),
                              Expanded(
                                child: Container(),
                              ),
                              // Switch(
                              //     activeColor: MyColors.textLink,
                              //     activeTrackColor:
                              //         MyColors.textLink.withOpacity(0.3),
                              //     inactiveThumbColor: MyColors.greenSpinerColor,
                              //     inactiveTrackColor:
                              //         MyColors.textLink.withOpacity(0.3),
                              //     value: true,
                              //     onChanged: (value) {}),
                              IconButton(
                                icon: isShowAll
                                    ? Icon(Icons.keyboard_arrow_up)
                                    : Icon(Icons.keyboard_arrow_down),
                                onPressed: () {
                                  setState(() {
                                    isShowAll = !isShowAll;
                                  });
                                },
                              ),
                            ],
                          ),
                          Divider(
                            color: MyColors.lightBlue,
                          ),
                          Expanded(
                            child: SingleChildScrollView(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: <Widget>[
                                  Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: List<Widget>.generate(
                                          snapshot.data.length, (index) {
                                        return Container(
                                          child: StructureTreeItem(
                                            folderPath: snapshot
                                                .data[index].data.groupName,
                                            folder: snapshot.data[index],
                                            isShowAll: isShowAll,
                                            onItemClick: (docItem) {
                                              Navigator.of(context).pop();
                                              dashBoardBloc.jumpToScreen(
                                                  EHomeScreenChild.document,
                                                  args: docItem
                                                      .data.idDocumentTree);
                                            },
                                          ),
                                        );
                                      })),
                                  GestureDetector(
                                    onTap: () {
                                      dashBoardBloc
                                          .showCreateFolderPopup(context);
                                      // Navigator.of(context).pop();
                                    },
                                    child: Container(
                                      color: Colors.transparent,
                                      alignment: Alignment.centerLeft,
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 8),
                                      child: Row(
                                        children: <Widget>[
                                          Image.asset(
                                            Resources.icNewFolder,
                                            width: 28,
                                            height: 28,
                                          ),
                                          Text(
                                            'New Folder',
                                            style: MyStyleText.black14Bold,
                                            overflow: TextOverflow.ellipsis,
                                            maxLines: 2,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            );
          } else {
            return Center(child: CircularProgressIndicator());
          }
        },
      ),
    );
  }
}
