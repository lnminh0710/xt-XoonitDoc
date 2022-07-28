
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CustomLoading extends StatefulWidget {
  CustomLoading({Key key}) : super(key: key);
  @override
  _CustomLoadingState createState() => _CustomLoadingState();
}

class _CustomLoadingState extends State<CustomLoading>
    with SingleTickerProviderStateMixin {
  Animation<double> _animation;
  AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller =
        AnimationController(duration: Duration(milliseconds: 500), vsync: this);
    _animation = Tween<double>(begin: 1.0, end: 0.0).animate(_controller)
      ..addListener(() {
        setState(() {
          if (_animation.isCompleted) {
            _controller.reverse();
          } else if (_animation.isDismissed) {
            _controller.forward();
          }
        });
      });
    _controller.forward();
  }

  @override
  void dispose() {
    _controller?.removeListener(() {});
    _controller?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: <Widget>[
        AnimatedOpacity(
          opacity: _animation.value,
          curve: Curves.fastLinearToSlowEaseIn,
          duration: Duration(milliseconds: 500),
          child: CustomPaint(
            painter: DotColorsAnim(
              colorFirst: Colors.yellow,
              colorMidle: Colors.blue,
              colorsLast: Colors.red,
            ),
          ),
        ),
      ],
    );
  }
}

class DotColorsAnim extends CustomPainter {
  Paint _colorDotFirst;
  Paint _colorDotMidle;
  Paint _colorDotLast;
  final Color colorFirst;
  final Color colorMidle;
  final Color colorsLast;
  DotColorsAnim({this.colorFirst, this.colorMidle, this.colorsLast}) {
    _colorDotFirst = Paint()
      ..color = colorFirst ?? Colors.yellow
      ..style = PaintingStyle.fill
      ..strokeWidth = 5.0;
    _colorDotMidle = Paint()
      ..color = colorMidle ?? Colors.blue
      ..style = PaintingStyle.fill
      ..strokeWidth = 5.0;
    _colorDotLast = Paint()
      ..color = colorsLast ?? Colors.red
      ..style = PaintingStyle.fill
      ..strokeWidth = 5.0;
  }
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawCircle(Offset(-20, 0), 5.0, _colorDotFirst);
    canvas.drawCircle(Offset(0, 0), 5.0, _colorDotMidle);
    canvas.drawCircle(Offset(20, 0), 5.0, _colorDotLast);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) {
    return false;
  }
}
