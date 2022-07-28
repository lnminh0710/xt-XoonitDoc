import 'package:flutter/material.dart';
import 'package:xoonit/app/model/AttachmentContact.dart';
import 'package:xoonit/app/model/remote/global_search/column_search_settings.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_attachment/contact_attachment_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_widget.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';

class ContactAttachmentPage extends StatefulWidget {
  const ContactAttachmentPage({Key key}) : super(key: key);

  @override
  _ContactAttachmentPageState createState() => _ContactAttachmentPageState();
}

class _ContactAttachmentPageState extends State<ContactAttachmentPage> {
  ScrollController _controller;
  ContactAttachmentBloc _contactAttachmentBloc;

  @override
  void initState() {
    super.initState();
    _controller = ScrollController();
    _controller.addListener(_scrollListener);
  }

  _scrollListener() {
    if (_controller.offset >= _controller.position.maxScrollExtent &&
        !_controller.position.outOfRange) {
      // message = "reach the bottom";
      _contactAttachmentBloc.loadmoreListAttachmentContacts();
    }
    if (_controller.offset <= _controller.position.minScrollExtent &&
        !_controller.position.outOfRange) {
      // message = "reach the top";
    }
  }

  @override
  Widget build(BuildContext context) {
    _contactAttachmentBloc = BlocProvider.of(context);
    return Container(
      child: StreamBuilder<AttachmentContactItem>(
        stream: _contactAttachmentBloc.attachmentContact,
        initialData: null,
        builder: (context, snapshot) {
          return snapshot.hasData
              ? Container(
                  padding: EdgeInsets.only(
                    top: 8,
                  ),
                  child: RefreshIndicator(
                    onRefresh: _contactAttachmentBloc.refresh,
                    child: SingleChildScrollView(
                      controller: _controller,
                      child: Column(
                        children: <Widget>[
                          Column(
                            children: List<Widget>.generate(
                                snapshot.data.results.length, (int index) {
                              return CustomItemAttachmentContacts(
                                onItemClicked: () {
                                  GeneralMethod.reviewDocument(
                                      context,
                                      snapshot.data.results[index]
                                          .idDocumentContainerScans
                                          .toString());
                                },
                                attachmentContactItemResult:
                                    snapshot.data.results[index],
                                columnSearchSettings:
                                    columnSearchSettingsFromJson(snapshot
                                        .data.setting[0][0].settingColumnName),
                              );
                            }),
                          ),
                          StreamBuilder<bool>(
                              stream: _contactAttachmentBloc.loadingMoreStream,
                              builder: (context, snapshot) {
                                return snapshot.hasData && snapshot.data
                                    ? Padding(
                                        padding: const EdgeInsets.only(
                                            bottom: 30, top: 8.0),
                                        child: CircularProgressIndicator(),
                                      )
                                    : Container();
                              }),
                        ],
                      ),
                    ),
                  ),
                )
              : Center(
                  child: CircularProgressIndicator(),
                );
        },
      ),
    );
  }
}
