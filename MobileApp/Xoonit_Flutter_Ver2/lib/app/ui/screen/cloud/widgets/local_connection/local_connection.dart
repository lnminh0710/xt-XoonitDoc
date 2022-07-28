import 'package:flutter/material.dart';

class LocalConnection extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _LocalConnection();
}

class _LocalConnection extends State<LocalConnection> {
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(16),
      child: Wrap(
        runSpacing: 8,
        children: <Widget>[
          Text('Folder'),
          TextField(
              decoration: InputDecoration(
                  contentPadding:
                      const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
                  border: OutlineInputBorder())),
        ],
      ),
    );
  }
}
