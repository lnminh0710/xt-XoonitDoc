import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:xoonit/app/app.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/contact_response.dart';
import 'package:xoonit/app/routes/routes.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/app/ui/screen/contact/contact_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_widget.dart';
import 'package:xoonit/app/ui/screen/home/home_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

class ContactScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    ContactBloc contactBloc = BlocProvider.of(context);
    HomeBloc homeBloc = BlocProvider.of(context);
    homeBloc.searchDelegate.add(contactBloc);
    TextEditingController controllerPageSize = new TextEditingController();
    TextEditingController controllerPageIndex = new TextEditingController();
    return StreamBuilder<bool>(
      stream: contactBloc.isShowingKeyBoard,
      initialData: false,
      builder: (context, isShowing) {
        if (isShowing.hasData) {
          return Scaffold(
            resizeToAvoidBottomInset: isShowing.data,
            backgroundColor: MyColors.primaryColor,
            body: Container(
              padding: EdgeInsets.only(left: 12, right: 12),
              child: Column(
                children: <Widget>[
                  Container(
                    margin: EdgeInsets.only(top: 8, bottom: 8),
                    child: Row(
                      children: <Widget>[
                        Text(
                          " Page Size",
                          style: MyStyleText.grey14Regular2,
                        ),
                        StreamBuilder<int>(
                            stream: contactBloc.currentPageSize,
                            builder: (context, pageSize) {
                              controllerPageSize.text =
                                  pageSize.data.toString();
                              controllerPageSize.selection = TextSelection(
                                  baseOffset: controllerPageSize.text.length,
                                  extentOffset: controllerPageSize.text.length);
                              return CustomTextFieldInputPages(
                                enabled: true,
                                width: 50,
                                height: 30,
                                padding: EdgeInsets.only(bottom: 4, top: 4),
                                autoFocus: false,
                                textAlign: TextAlign.center,
                                controller: controllerPageSize,
                                textInputType: TextInputType.number,
                                styleText: MyStyleText.white14Regular,
                                onChangeValue: (value) {
                                  contactBloc.onGetContactWithPageSize(
                                      int.parse(controllerPageSize.text));
                                },
                                onTap: () {
                                  contactBloc.onShowingKeyBoard(true);
                                },
                                onCompleted: (value){
                                  contactBloc.onShowingKeyBoard(false);
                                },
                              );
                            }),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Stack(
                      children: <Widget>[
                        StreamBuilder<List<Contact>>(
                            stream: contactBloc.contactsList,
                            initialData: null,
                            builder: (context, snapShot) {
                              if (snapShot.hasData) {
                                return ListView.builder(
                                    reverse: false,
                                    shrinkWrap: true,
                                    itemCount: snapShot.data.length,
                                    itemBuilder: (context, index) {
                                      Contact contactDetails =
                                          snapShot.data[index];
                                      return ItemListSearchContact(
                                        width: Dimension.getWidth(1),
                                        height: 144,
                                        contactDetails: contactDetails,
                                        searchKey: contactBloc.onSearchChanged
                                                        .value ==
                                                    null ||
                                                contactBloc.onSearchChanged
                                                        .value ==
                                                    ""
                                            ? "*"
                                            : contactBloc.onSearchChanged.value,
                                        onItemClick: () {
                                          AppMaster.navigatorKey.currentState
                                              .pushNamed(
                                              RoutesName
                                                  .CONTACT_DETAILS_SCREEN,
                                              arguments: contactDetails);
                                        },
                                      );
                                    });
                              } else {
                                return Container();
                              }
                            }),
                        StreamBuilder<AppState>(
                            stream: contactBloc.appState,
                            initialData: AppState.Idle,
                            builder: (context, snapShot) {
                              if (snapShot.hasData &&
                                  snapShot.data == AppState.Loading) {
                                return Container(
                                  color: MyColors.primaryColor,
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
                  ),
                  StreamBuilder<int>(
                      stream: contactBloc.currentPageIndex,
                      initialData: 1,
                      builder: (context, currentPageIndex) {
                        if (currentPageIndex.hasData) {
                          controllerPageIndex.value = new TextEditingValue(
                              text: currentPageIndex.data.toString());
                          controllerPageIndex.selection = TextSelection(
                              baseOffset: controllerPageIndex.text.length,
                              extentOffset: controllerPageIndex.text.length);
                          return Container(
                              margin: EdgeInsets.only(top: 8, bottom: 8),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: <Widget>[
                                  Text(
                                    "Page",
                                    style: MyStyleText.grey14Regular2,
                                  ),
                                  CustomTextFieldInputPages(
                                    enabled: true,
                                    width: 50,
                                    height: 30,
                                    padding: EdgeInsets.only(bottom: 3, top: 3),
                                    textAlign: TextAlign.center,
                                    controller: controllerPageIndex,
                                    textInputType: TextInputType.number,
                                    styleText: MyStyleText.white14Regular,
                                    onTap: () {
                                      contactBloc.onShowingKeyBoard(true);
                                    },
                                    onChangeValue: (value) {
                                      contactBloc.getContactAtPage(
                                          int.parse(controllerPageIndex.text));
                                    },
                                    onCompleted: (value) {
                                      contactBloc.onShowingKeyBoard(false);
                                    },
                                  ),
                                  StreamBuilder<int>(
                                      stream: contactBloc.maxPageIndex,
                                      initialData: null,
                                      builder: (context, maxPage) {
                                        if (maxPage.hasData) {
                                          return Text(
                                            "of " + maxPage.data.toString(),
                                            style: MyStyleText.grey14Regular2,
                                          );
                                        } else
                                          return Text(
                                            "of 2",
                                            style: MyStyleText.grey14Regular2,
                                          );
                                      }),
                                  CustomTextFieldInputPages(
                                    enabled: true,
                                    width: 30,
                                    height: 30,
                                    readOnly: true,
                                    padding: EdgeInsets.only(left: 2),
                                    textAlign: TextAlign.center,
                                    styleText: MyStyleText.white14Regular,
                                    icon: Icon(Icons.arrow_back_ios,
                                        color: MyColors.whiteColor),
                                    onTap: () {
                                      contactBloc.onPreviousPage();
                                    },
                                  ),
                                  CustomTextFieldInputPages(
                                    enabled: true,
                                    width: 30,
                                    height: 30,
                                    readOnly: true,
                                    padding: EdgeInsets.only(left: 4),
                                    textAlign: TextAlign.center,
                                    styleText: MyStyleText.white14Regular,
                                    icon: Icon(
                                      Icons.arrow_forward_ios,
                                      color: MyColors.whiteColor,
                                    ),
                                    onTap: () {
                                      contactBloc.onNextPage();
                                    },
                                  )
                                ],
                              ));
                        } else {
                          return Container();
                        }
                      }),
                ],
              ),
            ),
          );
        } else {
          return CircularProgressIndicator();
        }
      },
    );
  }
}
