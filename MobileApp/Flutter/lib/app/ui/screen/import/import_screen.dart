import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:xoonit/app/app_state_bloc.dart';
import 'package:xoonit/app/constants/colors.dart';
import 'package:xoonit/app/constants/resources.dart';
import 'package:xoonit/app/constants/styles.dart';
import 'package:xoonit/app/model/local/import_file/import_file_table.dart';
import 'package:xoonit/app/ui/component/common_component.dart';
import 'package:xoonit/app/ui/dialog/dialog_review_image.dart';
import 'package:xoonit/app/ui/screen/home/home_bloc.dart';
import 'package:xoonit/app/ui/screen/import/import_bloc.dart';
import 'package:xoonit/core/bloc_base.dart';

import '../../../difinition.dart';

class ImportScreen extends StatelessWidget {

  ImportBloc bloc;
  HomeBloc homeBloc;
  AppStateBloc appBloc;

  @override
  Widget build(BuildContext context) {
    bloc = BlocProvider.of(context);
    homeBloc = BlocProvider.of(context);
    appBloc = BlocProvider.of(context);
    return Stack(children: <Widget>[
      Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[_topBar, _gridBody]),
      loading
    ]);
  }

  get loading => StreamBuilder<AppState>(
        stream: appBloc.apiState,
        builder: (_, snapShot) {
          return snapShot?.data == AppState.Loading
              ? Container(
                  color: Colors.black54,
                  child: Center(
                    child: CircularProgressIndicator(),
                  ),
                )
              : SizedBox.shrink();
        },
      );

  get _topBar => Container(
        width: double.infinity,
        color: MyColors.blueDark3,
        child: Wrap(
          alignment: WrapAlignment.center,
          spacing: 16,
          children: <Widget>[
            IconButton(
                icon: Image.asset(Resources.iconFolder, height: 24),
                onPressed: () => bloc.openFileExplorer()),
            IconButton(
              icon: Image.asset(Resources.iconUpload, height: 24),
              onPressed: () => bloc.uploadFile(),
            ),
            IconButton(
              icon: Image.asset(Resources.iconDelete, height: 24),
              onPressed: () => bloc.deleteMultiFile(),
            ),
            StreamBuilder<Mode>(
              stream: bloc.mode,
              initialData: Mode.normal,
              builder: (_, snapshot) {
                return snapshot.data == Mode.select
                    ? IconButton(
                        icon: Icon(Icons.cancel, color: Colors.red),
                        onPressed: () => bloc.cancelSelectMode(),
                      )
                    : SizedBox.shrink();
              },
            )
          ],
        ),
      );

  get _gridBody => StreamBuilder(
      stream: bloc.lsFile,
      builder: (_, AsyncSnapshot<List<TImportFile>> snapshot) {
        var lsFile = snapshot?.data ?? [];
        return lsFile.isNotEmpty
            ? Expanded(
                child: GridView.builder(
                    padding: EdgeInsets.all(16),
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        childAspectRatio: 3 / 4,
                        crossAxisCount: 3,
                        crossAxisSpacing: 4,
                        mainAxisSpacing: 4),
                    itemCount: lsFile.length,
                    itemBuilder: (context, index) {
                      return Stack(fit: StackFit.expand, children: <Widget>[
                        _girdItem(lsFile[index]),
                        _overlayWidget(index)
                      ]);
                    }))
            : SizedBox.fromSize();
      });

  _girdItem(TImportFile file) => Card(
      color: MyColors.bluedarkColor,
      child: GestureDetector(
        onTap: () {
          showDialog(
              context: homeBloc.homeNavigatorKey.currentContext,
              builder: (BuildContext context) {
                return ReviewImageDialog(
                  isLocalImage: true,
                  listDocumentName: [file.name],
                  listDocumentURL: [file.path],
                );
              });
        },
        child: Padding(
          padding: EdgeInsets.all(8),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Flexible(
                flex: 7,
                child: Image.asset(Resources.iconPicture),
              ),
              Flexible(
                flex: 2,
                child: Text("${file.name}",
                    style: MyStyleText.white12Regular,
                    overflow: TextOverflow.ellipsis),
              ),
              Text("${file.type}", style: MyStyleText.white12Regular)
            ],
          ),
        ),
      ));

  _overlayWidget(int index) {
    return StreamBuilder(
      stream: bloc.mode,
      builder: (contet, snapshot) {
        return snapshot?.data == Mode.select
            ? GestureDetector(
                onTap: () {
                  bloc.select(index);
                },
                child: Card(
                    color: Colors.black26,
                    child: StreamBuilder<List<int>>(
                      stream: bloc.lsSelectedIndex,
                      initialData: [],
                      builder: (_, AsyncSnapshot<List<int>> snapshot) {
                        return Align(
                          alignment: Alignment(0.8, -0.8),
                          child: CommonCheckbox(
                              isChecked: snapshot.data.contains(index) ?? false,
                              description: "",
                              onChanged: (v) {
                                bloc.select(index);
                              }),
                        );
                      },
                    )),
              )
            : SizedBox.shrink();
      },
    );
  }
}
