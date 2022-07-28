import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:caminada/app/constants/colors.dart';
import 'package:caminada/app/constants/styles.dart';
import 'package:caminada/app/ui/component/common_component.dart';

class RootFolderHeader extends StatelessWidget {
  final bool isStructureTree;
  final Function(bool) onStructureSwitchChange;
  const RootFolderHeader(
      {Key key,
      this.isStructureTree = true,
      @required this.onStructureSwitchChange})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      color: MyColors.blueDark2,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Container(
            padding: EdgeInsets.only(left: 16, right: 16),
            child: Row(
              children: <Widget>[
                Text(
                  'STRUCTURE TREE',
                  style: MyStyleText.white14Medium,
                ),
                Expanded(
                  child: Container(),
                ),
                Switch(
                    activeColor: MyColors.greenSpinerColor,
                    inactiveThumbColor: MyColors.greenSpinerColor,
                    inactiveTrackColor: MyColors.greenWithOpacity,
                    value: isStructureTree,
                    onChanged: (value) {
                      onStructureSwitchChange(value);
                    }),
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.only(left: 16, right: 16, top: 10, bottom: 10),
            color: MyColors.blueDark3,
            child: Row(
              children: <Widget>[
                Expanded(
                  child: Container(
                    margin: EdgeInsets.only(right: 10),
                    child: CommonButton(
                      bgColor: MyColors.greenlight,
                      borderColor: MyColors.greenlight,
                      titleStyle: MyStyleText.black14Bold,
                      title: 'TREE',
                    ),
                  ),
                ),
                Expanded(
                  child: Container(
                    margin: EdgeInsets.only(left: 10),
                    child: CommonButton(
                      bgColor: MyColors.greenDark,
                      title: 'FAVORITE',
                      borderColor: MyColors.greenDark,
                      titleStyle: MyStyleText.black14Regular,
                    ),
                  ),
                )
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 12),
            child: CustomTextField(
              height: 36,
              backgroundColor: MyColors.backgroundSearchBarColor,
              hintText: "Search",
              styleHintText: MyStyleText.textHintSearchBar,
              borderRadius: 10.0,
              styleText: MyStyleText.white14Medium,
              prefixIcon: Icon(
                Icons.search,
                color: MyColors.whiteColor,
              ),
            ),
          )
        ],
      ),
    );
  }
}
