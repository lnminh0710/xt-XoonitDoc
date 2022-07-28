import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/model/remote/company_list_response.dart';
import 'package:caminada/app/model/remote/filter_users_response.dart';
import 'package:caminada/app/ui/component/search_widget.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../../../difinition.dart';
import 'history_bloc.dart';

class CustomFilterUserComponent extends StatelessWidget {
  final HistoryBloc historyBloc;
  CustomFilterUserComponent({Key key, this.historyBloc}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    List<UserItem> listUser = List<UserItem>();
    FocusNode searchUserFocus = FocusNode();
    return StreamBuilder<IdLoginRoles>(
        stream: historyBloc.loginRoles,
        builder: (context, loginRoles) {
          if (loginRoles.hasData && loginRoles.data != IdLoginRoles.User) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                //Component search Company, only display for Master Admin
                (loginRoles.hasData &&
                        loginRoles.data == IdLoginRoles.MainAdministrator)
                    ? Column(
                        children: <Widget>[
                          Container(
                            alignment: Alignment.centerLeft,
                            padding: EdgeInsets.only(top: 20, left: 24),
                            child: Text(
                              "Company",
                              style: MyStyleText.grey12Regular,
                            ),
                          ),
                          StreamBuilder<List<CompanyItem>>(
                              stream: historyBloc.listCompany,
                              builder: (context, listCompany) {
                                return StreamBuilder<CompanyItem>(
                                    stream: historyBloc.companyItem,
                                    builder: (context, companyItem) {
                                      return Container(
                                          margin: EdgeInsets.only(
                                              left: 24, right: 30, top: 5),
                                          padding: EdgeInsets.only(
                                              left: 24, right: 10),
                                          color: MyColors.backgroundDatepicker,
                                          child: DropdownButtonHideUnderline(
                                              child:
                                                  DropdownButton<CompanyItem>(
                                            hint: Text('Select Company'),
                                            isExpanded: true,
                                            value: companyItem.data,
                                            dropdownColor: MyColors.whiteColor,
                                            style: MyStyleText.white16Medium,
                                            iconDisabledColor:
                                                MyColors.blackColor,
                                            iconEnabledColor:
                                                MyColors.blackColor,
                                            onChanged:
                                                (CompanyItem companyItem) {
                                              historyBloc
                                                  .selectedCompanyToFilter(
                                                      companyItem);
                                            },
                                            items: listCompany.data == null
                                                ? new List<
                                                    DropdownMenuItem<
                                                        CompanyItem>>()
                                                : listCompany.data
                                                    .map((CompanyItem value) {
                                                    return DropdownMenuItem<
                                                        CompanyItem>(
                                                      value: value,
                                                      child: Text(
                                                        value.textValue,
                                                        style: MyStyleText
                                                            .black14Regular,
                                                      ),
                                                    );
                                                  }).toList(),
                                          )));
                                    });
                              }),
                        ],
                      )
                    : Container(),
                // Component search user, display for Master Admin and Company Admin
                Container(
                  padding: EdgeInsets.only(top: 20, left: 24),
                  child: Text(
                    "Users",
                    style: MyStyleText.grey12Regular,
                  ),
                ),
                StreamBuilder<String>(
                    stream: historyBloc.selectedUser,
                    builder: (context, selectedUser) {
                      TextEditingController searchUserController =
                          TextEditingController(
                              text: selectedUser.data);
                      return Container(
                        margin: EdgeInsets.only(
                          left: 8,
                          right: 14,
                        ),
                        child: SearchWidget(
                          dataList: listUser,
                          hideSearchBoxWhenItemSelected: true,
                          popupListItemBuilder: (UserItem item) =>
                              PopupListItemWidget(item),
                          selectedItemBuilder:
                              (selectedItem, deleteSelectedItem) {
                            return SelectedItemWidget(selectedItem, () {
                              historyBloc.resetFilterUser();
                              searchUserController.text = '';
                              deleteSelectedItem();
                            });
                          },
                          onItemSelected: (UserItem userItem) {
                            historyBloc.selectUserToFilter(userItem);
                          },
                          textController: searchUserController,
                          focusNode: searchUserFocus,
                          queryBuilder: historyBloc.filterUserByKeyWords,
                          textFieldBuilder: (controller, focusNode,
                                  onTextChange) =>
                              MySearchDelegate(searchUserController, focusNode,
                                  historyBloc, onTextChange, () {
                            historyBloc.resetFilterUser();
                            searchUserController.text = '';
                          }),
                          noItemsFoundWidget: Text(
                            "No Results",
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.grey[900].withOpacity(0.7),
                            ),
                          ),
                        ),
                      );
                    }),
              ],
            );
          } else {
            return Container();
          }
        });
  }
}

class SelectedItemWidget extends StatelessWidget {
  const SelectedItemWidget(this.selectedItem, this.deleteSelectedItem);

  final UserItem selectedItem;
  final VoidCallback deleteSelectedItem;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          Text(
            selectedItem.fullName,
            style: TextStyle(fontSize: 14),
          ),
          IconButton(
            icon: Icon(Icons.close, size: 18),
            color: Colors.grey[700],
            onPressed: deleteSelectedItem,
          ),
        ],
      ),
    );
  }
}

class MySearchDelegate extends StatelessWidget {
  MySearchDelegate(this.controller, this.focusNode, this.historyBloc,
      this.onTextChange, this.deleteSelectedItem);

  final TextEditingController controller;
  final FocusNode focusNode;
  final HistoryBloc historyBloc;
  final Function(String) onTextChange;
  final Function deleteSelectedItem;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(left: 16, right: 16),
      child: TextField(
        onTap: () {
          if (controller.text != "") {
            FocusScope.of(context).requestFocus(new FocusNode());
          }
        },
        autofocus: false,
        autocorrect: false,
        controller: controller,
        focusNode: focusNode,
        onChanged: onTextChange,
        style: TextStyle(fontSize: 16, color: Colors.grey[600]),
        decoration: InputDecoration(
          enabledBorder: const OutlineInputBorder(
            borderSide: BorderSide(
              color: Color(0x4437474F),
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(color: Color(0x4437474F)),
          ),
          hintText: "Search user...",
          hintStyle: MyStyleText.grey14Regular,
          contentPadding: const EdgeInsets.only(
            left: 24,
            right: 20,
            top: 14,
            bottom: 14,
          ),
          suffixIcon: controller.text != ""
              ? IconButton(
                  icon: Icon(Icons.close, size: 18),
                  color: Colors.grey[700],
                  onPressed: deleteSelectedItem,
                )
              : SizedBox.shrink(),
        ),
      ),
    );
  }
}

class PopupListItemWidget extends StatelessWidget {
  const PopupListItemWidget(this.item);
  final UserItem item;
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      child: Text(
        item.fullName,
        style: const TextStyle(fontSize: 16),
      ),
    );
  }
}
