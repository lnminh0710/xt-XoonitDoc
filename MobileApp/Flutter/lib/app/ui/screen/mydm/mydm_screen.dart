import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/remote/search_document_response.dart';
import 'package:xoonit/app/ui/screen/mydm/component/document_item.dart';
import 'package:xoonit/app/ui/screen/mydm/mydm_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';

class MyDMScreen extends StatelessWidget {
  const MyDMScreen({Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    MyDMBloc myDMBloc = BlocProvider.of(context);
    return Column(
      children: <Widget>[
        craeteHeader(),
        Expanded(
          child: createMainScrollView(context, myDMBloc),
        ),
      ],
    );
  }

  Widget createMainScrollView(BuildContext context, MyDMBloc myDMBloc) {
    return Container(
      child: StreamBuilder<List<SearchDocumentResult>>(
          stream: myDMBloc.searchDocumentResultList,
          builder: (context, searchDocumentResultSnapshot) {
            if (searchDocumentResultSnapshot.hasData) {
              return SingleChildScrollView(
                child: Wrap(
                  children: List<Widget>.generate(
                      searchDocumentResultSnapshot.data.length, (index) {
                    return DocumentItem(
                        reviewDocument: () {
                          myDMBloc.onReviewDocumentInMyDM(
                              context,
                              searchDocumentResultSnapshot
                                  .data[index].idDocumentContainerScans);
                        },
                        searchDocumentResult:
                            searchDocumentResultSnapshot.data[index]);
                  }),
                  alignment: WrapAlignment.start,
                  spacing: 10,
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
            child: Text(
              '12',
              style: MyStyleText.white14Regular,
            )),
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
