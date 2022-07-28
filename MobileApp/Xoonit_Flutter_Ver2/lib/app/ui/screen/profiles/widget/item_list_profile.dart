import 'package:flutter/material.dart';
import 'package:xoonit/app/constants/styles.dart';

class ItemListProfiles extends StatefulWidget {
  ItemListProfiles({
    Key key,
    @required this.iconPath,
    @required this.title,
    @required this.callback,
    this.isHasArrow = true,
  })  : assert(iconPath != null, title != null),
        super(key: key);
  final String iconPath;
  final String title;
  final bool isHasArrow;
  final Function callback;

  @override
  _ItemListProfileState createState() => _ItemListProfileState();
}

class _ItemListProfileState extends State<ItemListProfiles> {
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        widget.callback();
      },
      child: Container(
        child: ListTile(
          leading: Image.asset(
            widget.iconPath,
            width: 32,
            height: 36,
          ),
          title: Text(
            widget.title,
            style: widget.isHasArrow
                ? MyStyleText.dark14Regular
                : MyStyleText.red14Medium,
          ),
          dense: true,
          trailing: widget.isHasArrow
              ? Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                )
              : null,
        ),
      ),
    );
  }
}
