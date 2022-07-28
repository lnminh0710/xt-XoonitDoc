import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/remote/global_search/search_contact_detail_response.dart';
import 'package:xoonit/app/ui/screen/contact/contact_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_widget.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

class ContactScreen extends StatefulWidget {
  ContactScreen({Key key}) : super(key: key);

  @override
  _ContactScreenState createState() => _ContactScreenState();
}

class _ContactScreenState extends State<ContactScreen> {
  ContactBloc contactBloc;
  ScrollController _controller;

  @override
  void initState() {
    super.initState();
    _controller = ScrollController();
    _controller.addListener(() {
      if (_controller.offset >= _controller.position.maxScrollExtent &&
          !_controller.position.outOfRange) {
        printLog("Scroll to bottom");
        contactBloc.loadMoreContact();
      }
      if (_controller.offset <= _controller.position.minScrollExtent &&
          !_controller.position.outOfRange) {
        printLog("Scroll to top");
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    contactBloc = BlocProvider.of(context);

    return StreamBuilder<bool>(
      stream: contactBloc.isShowingKeyBoard,
      initialData: false,
      builder: (context, isShowing) {
        if (isShowing.hasData) {
          return Scaffold(
            resizeToAvoidBottomInset: isShowing.data,
            backgroundColor: MyColors.whiteBackground,
            body: Stack(
              children: <Widget>[
                Container(
                  padding: EdgeInsets.only(left: 12, right: 12),
                  child: Column(
                    children: <Widget>[
                      Container(
                        margin: EdgeInsets.only(top: 8, bottom: 8),
                        child: Padding(
                          padding: const EdgeInsets.only(left: 8.0, right: 8),
                          child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: <Widget>[
                                Text(
                                  " Document",
                                  style: MyStyleText.dark16Medium,
                                ),
                                StreamBuilder<int>(
                                    stream: contactBloc.totalContact,
                                    builder: (context, snapshot) {
                                      return Text(
                                          "Total: " + snapshot.data.toString());
                                    }),
                              ]),
                        ),
                      ),
                      Expanded(
                        child: StreamBuilder<List<ContactSearchResult>>(
                            stream: contactBloc.contactsList,
                            initialData: null,
                            builder: (context, snapShot) {
                              if (snapShot.hasData && snapShot != null) {
                                return Container(
                                  child: SingleChildScrollView(
                                    controller: _controller,
                                    child: Padding(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 8),
                                      child: Column(
                                        children: _listCardContact(
                                            contactBloc, snapShot.data),
                                      ),
                                    ),
                                  ),
                                );
                              } else {
                                return Container();
                              }
                            }),
                      ),
                    ],
                  ),
                ),
                StreamBuilder<AppState>(
                    stream: contactBloc.appState,
                    initialData: AppState.Idle,
                    builder: (context, snapShot) {
                      if (snapShot.hasData &&
                          snapShot.data == AppState.Loading) {
                        return Container(
                          color: MyColors.whiteBackground,
                          width: Dimension.getWidth(1),
                          height: Dimension.getHeight(1),
                          child: Center(
                            child: CircularProgressIndicator(),
                          ),
                        );
                      } else {
                        return Container();
                      }
                    })
              ],
            ),
          );
        } else {
          return CircularProgressIndicator();
        }
      },
    );
  }

  List<Widget> _listCardContact(
      ContactBloc contactBloc, List<ContactSearchResult> listContact) {
    List<Widget> result = List<Widget>.generate(
      listContact.length,
      (index) => ItemListSearchContact(
        width: Dimension.getWidth(1),
        height: 105,
        onItemClick: () {},
        searchKey: "*",
        contactDetails: listContact[index],
      ),
    );
    result.add(StreamBuilder<bool>(
        stream: contactBloc.isLoadingMore,
        builder: (context, snapshot) {
          if (snapshot.hasData && snapshot.data) {
            return Container(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: CircularProgressIndicator(),
            );
          } else {
            return Container();
          }
        }));
    return result;
  }
}
