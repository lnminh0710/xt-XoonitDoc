import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/difinition.dart';
import 'package:xoonit/app/model/AttachmentContact.dart';
import 'package:xoonit/app/model/contact_response.dart';
import 'package:xoonit/app/model/remote/save_contact_request.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_bloc.dart';
import 'package:xoonit/app/ui/screen/contact/contact_details/contact_details_component.dart';
import 'package:xoonit/app/ui/screen/contact/contact_widget.dart';
import 'package:xoonit/app/utils/general_method.dart';
import 'package:xoonit/core/bloc_base.dart';
import 'package:xoonit/core/ultils.dart';

class ContactDetailsScreen extends StatelessWidget {
  final Contact contact;

  ContactDetailsScreen({Key key, this.contact}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    SystemChrome.setEnabledSystemUIOverlays([]);
    ContactDetailsBloc detailsBloc = BlocProvider.of(context);
    detailsBloc.initDataContact(contact);
    String idPerson = contact.idPerson;
    String idPersonType = contact.idPersonType;

    TextEditingController textCompanyController =
        new TextEditingController(text: contact.company);
    TextEditingController textFirstNameController =
        new TextEditingController(text: contact.firstName);
    TextEditingController textLastNameController =
        new TextEditingController(text: contact.lastName);
    TextEditingController textAddressController =
        new TextEditingController(text: contact.street);
    TextEditingController textPoBoxController =
        new TextEditingController(text: contact.pobox);
    TextEditingController textPlzController =
        new TextEditingController(text: contact.plz);
    TextEditingController textOrtController =
        new TextEditingController(text: contact.place);
    TextEditingController textPhoneNumberController = new TextEditingController(
        text: GeneralMethod.getCommunicateContactDetails(contact, "Phone"));
    TextEditingController textEmailController = new TextEditingController(
        text: GeneralMethod.getCommunicateContactDetails(contact, "E-Mails"));
    TextEditingController textInternetController = new TextEditingController(
        text: GeneralMethod.getCommunicateContactDetails(contact, "Internet"));

    return StreamBuilder<bool>(
      stream: detailsBloc.isShowingKeyBoard,
      builder: (context, isShowing) {
        if (isShowing.hasData) {
          return Scaffold(
            appBar: PreferredSize(
              preferredSize: Size(Dimension.getWidth(1), 50),
              child: AppBar(
                backgroundColor: MyColors.bluedarkColor,
                leading: IconButton(
                    icon: Icon(
                      Icons.arrow_back_ios,
                      color: MyColors.whiteColor,
                    ),
                    onPressed: () {
                      Navigator.pop(context);
                    }),
                centerTitle: true,
                title: contact?.groupName == null
                    ? Text("")
                    : Text(
                        contact?.groupName,
                        style: MyStyleText.white16Medium,
                        textAlign: TextAlign.center,
                      ),
                actions: <Widget>[
                  IconButton(
                      icon: Image.asset(Resources.iconSave),
                      onPressed: () {
                        detailsBloc.saveContactDetails(
                            context,
                            new SaveContactRequest(
                              idPerson: idPerson,
                              idPersonType: idPersonType,
                              company: textCompanyController.text,
                              firstName: textFirstNameController.text,
                              lastName: textLastNameController.text,
                              email: textEmailController.text,
                              street: textAddressController.text,
                              poboxLabel: textPoBoxController.text,
                              zip: textPlzController.text,
                              place: textOrtController.text,
                              phone: textPhoneNumberController.text,
                              internet: textInternetController.text,
                            ));
                      })
                ],
              ),
            ),
            resizeToAvoidBottomInset: isShowing.data,
            backgroundColor: MyColors.primaryColor,
            body: Container(
              child: Stack(
                children: <Widget>[
                  StreamBuilder(
                      stream: detailsBloc.contact,
                      initialData: null,
                      builder: (context, snapshot) {
                        if (snapshot.hasData && snapshot != null) {
                          idPerson = contact.idPerson;
                          idPersonType = contact.idPersonType;
                        }
                        return snapshot.hasData && snapshot != null
                            ? StreamBuilder(
                                stream: detailsBloc.disableEditing,
                                initialData: true,
                                builder: (context, snapshot) {
                                  bool disableEditing = snapshot.data;
                                  return SingleChildScrollView(
                                    child: Container(
                                      padding: EdgeInsets.only(top: 8),
                                      child: Column(
                                        children: <Widget>[
                                          _buildAttachmentList(
                                            contact,
                                            detailsBloc,
                                            disableEditing,
                                            textCompanyController,
                                            textFirstNameController,
                                            textLastNameController,
                                            textAddressController,
                                            textPoBoxController,
                                            textPlzController,
                                            textOrtController,
                                            textPhoneNumberController,
                                            textEmailController,
                                            textInternetController,
                                          )
                                        ],
                                      ),
                                    ),
                                  );
                                },
                              )
                            : Container();
                      }),
                  Positioned(
                    bottom: 0,
                    child: StreamBuilder(
                      stream: detailsBloc.disableEditing,
                      initialData: true,
                      builder: (context, snapshot) {
                        return snapshot.hasData && !snapshot.data
                            ? Container(
                                height: 50,
                                width: Dimension.getWidth(1),
                                child: CommonButton(
                                  bgColor: MyColors.yellowColor2,
                                  title: 'SAVE',
                                  titleStyle: MyStyleText.white17Bold,
                                  onTap: () {
                                  },
                                  borderColor: MyColors.yellowColor2,
                                ),
                              )
                            : Container();
                      },
                    ),
                  ),
                  StreamBuilder<AppState>(
                      stream: detailsBloc.screenState,
                      initialData: AppState.Idle,
                      builder: (context, snapShot) {
                        if (snapShot.hasData &&
                            snapShot.data == AppState.Loading) {
                          return Container(
                            color: Colors.black54,
                            width: Dimension.getWidth(1),
                            height: Dimension.getHeight(1),
                            child: Center(
                              child: CircularProgressIndicator(),
                            ),
                          );
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

_buildAttachmentList(
  Contact contact,
  ContactDetailsBloc detailsBloc,
  bool disableEditing,
  textCompanyController,
  textFirstNameController,
  textLastNameController,
  textAddressController,
  textPoBoxController,
  textPlzController,
  textOrtController,
  textPhoneNumberController,
  textEmailController,
  textInternetController,
) =>
    Column(
      children: <Widget>[
        Padding(
          padding: EdgeInsets.only(left: 16.0, right: 16.0),
          child: ContactDetailsCommon(
            contact: contact,
            textCompanyController: textCompanyController,
            textFirstNameController: textFirstNameController,
            textLastNameController: textLastNameController,
            textAddressController: textAddressController,
            textPoBoxController: textPoBoxController,
            textPlzController: textPlzController,
            textOrtController: textOrtController,
            textPhoneNumberController: textPhoneNumberController,
            textEmailController: textEmailController,
            textInternetController: textInternetController,
            onTap: () {
              detailsBloc.onShowingKeyBoard(true);
            },
            onComplete: (value) {
              detailsBloc.onShowingKeyBoard(false);
            },
          ),
        ),
        Container(
          alignment: Alignment.center,
          margin: EdgeInsets.only(top: 26),
          padding: EdgeInsets.only(top: 18, bottom: 18),
          child: Text(
            "ATTACHMENT",
            style: MyStyleText.white14Medium,
          ),
          color: MyColors.bluedarkColor,
        ),
        Padding(
          padding: EdgeInsets.only(left: 12.0, right: 12.0),
          child: StreamBuilder<List<AttachmentContactItem>>(
            stream: detailsBloc.listAttachmentContact,
            initialData: null,
            builder: (context, snapshot) {
              return snapshot.hasData
                  ? Container(
                      padding: EdgeInsets.only(
                          top: 8, bottom: disableEditing ? 0 : 50),
                      child: Column(
                        children: List<Widget>.generate(snapshot.data.length,
                            (int index) {
                          return CustomItemAttachmentContacts(
                            height: 105,
                            width: Dimension.getWidth(1),
                            onItemClick: () {
                              GeneralMethod.reviewDocument(
                                  context,
                                  snapshot
                                      .data[index].idDocumentContainerScans);
                            },
                            itemAttachment: snapshot.data[index],
                          );
                        }),
                      ),
                    )
                  : Container();
            },
          ),
        ),
      ],
    );
