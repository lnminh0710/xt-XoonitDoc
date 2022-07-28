import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/search_document_response.dart';
import 'package:xoonit/app/ui/screen/dash_board/dash_board_bloc.dart';
import 'package:xoonit/app/ui/screen/mydm/component/document_item.dart';
import 'package:xoonit/app/ui/screen/mydm/mydm_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

class MyDMScreen extends StatefulWidget {
  const MyDMScreen({Key key}) : super(key: key);

  @override
  _MyDMScreenState createState() => _MyDMScreenState();
}

class _MyDMScreenState extends State<MyDMScreen> {
  ScrollController _controller;
  DashBoardBloc _dashBoardBloc;
  MyDMBloc _myDMBloc;
  _scrollListener() {
    if (_controller.offset >= _controller.position.maxScrollExtent &&
        !_controller.position.outOfRange) {
      // message = "reach the bottom";
      _myDMBloc.loadMoreDocument();
    }
    if (_controller.offset <= _controller.position.minScrollExtent &&
        !_controller.position.outOfRange) {
      // message = "reach the top";
    }
  }

  @override
  void initState() {
    super.initState();
    _controller = ScrollController();
    _controller.addListener(_scrollListener);
  }

  @override
  Widget build(BuildContext context) {
    _myDMBloc = BlocProvider.of(context);
    _dashBoardBloc = BlocProvider.of(context);
    return Column(
      children: <Widget>[
        craeteHeader(),
        Expanded(
          child: createMainScrollView(context),
        ),
      ],
    );
  }

  Widget createMainScrollView(BuildContext context) {
    return Container(
      alignment: Alignment.center,
      child: StreamBuilder<List<SearchDocumentResult>>(
          stream: _myDMBloc.searchDocumentResultList,
          builder: (context, searchDocumentResultSnapshot) {
            if (searchDocumentResultSnapshot.hasData) {
              return SingleChildScrollView(
                controller: _controller,
                child: Column(
                  children: <Widget>[
                    SizedBox(
                      height: 16,
                      width: Dimension.width,
                    ),
                    Wrap(
                      children: List<Widget>.generate(
                          searchDocumentResultSnapshot.data.length, (index) {
                        return DocumentItem(
                            reviewDocument: () {
                              _myDMBloc.onReviewDocumentInMyDM(
                                  context,
                                  searchDocumentResultSnapshot
                                      .data[index].idDocumentContainerScans,
                                  _dashBoardBloc);
                            },
                            searchDocumentResult:
                                searchDocumentResultSnapshot.data[index]);
                      }),
                      alignment: WrapAlignment.start,
                      spacing: 10,
                    ),
                    StreamBuilder<bool>(
                        stream: _myDMBloc.loadingStream,
                        builder: (context, loadingSnapshot) {
                          if (loadingSnapshot.hasData && loadingSnapshot.data) {
                            return Container(
                              margin: const EdgeInsets.only(bottom: 60),
                              child: Center(child: CircularProgressIndicator()),
                            );
                          } else {
                            return SizedBox(
                              height: 40,
                            );
                          }
                        }),
                  ],
                ),
              );
            } else {
              return Center(
                child: CircularProgressIndicator(),
              );
            }
          }),
    );
  }

  Widget craeteHeader() {
    return Container(
        child: Row(
      children: <Widget>[
        Container(
          margin: EdgeInsets.only(left: 12),
          child: Text(
            'Document',
            style: MyStyleText.grey14Regular2,
          ),
        ),
        Container(
            margin: EdgeInsets.only(left: 12),
            padding: EdgeInsets.only(left: 16, right: 16, top: 3, bottom: 3),
            decoration: BoxDecoration(
              color: MyColors.greyText2,
              borderRadius: BorderRadius.all(Radius.circular(10)),
            ),
            child: StreamBuilder<int>(
                stream: _myDMBloc.totalDocumentStream,
                builder: (context, snapshot) {
                  return Text(
                    snapshot.hasData && snapshot.data != null
                        ? snapshot.data.toString()
                        : '',
                    style: MyStyleText.white14Regular,
                  );
                })),
        Expanded(child: Container()),
        IconButton(
          onPressed: () {},
          icon: Image(
            height: 18,
            width: 18,
            image: AssetImage(Resources.iconGroup),
          ),
        ),
      ],
    ));
  }
}
