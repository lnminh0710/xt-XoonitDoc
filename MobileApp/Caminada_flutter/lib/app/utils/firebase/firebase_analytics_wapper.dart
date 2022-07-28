import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:firebase_analytics/observer.dart';
import 'package:firebase_crashlytics/firebase_crashlytics.dart';
import 'package:flutter/material.dart';

abstract class FirebaseAnalyticsAbs {
  init() {}
  getMNavigatorObservers() { return const <NavigatorObserver>[]; }
}

class FirebaseAnalyticsWapper extends FirebaseAnalyticsAbs {
  FirebaseAnalytics analytics;
  FirebaseAnalyticsObserver observer;
  @override
  init() {
    analytics = FirebaseAnalytics();
    observer = FirebaseAnalyticsObserver(analytics: analytics);
    Crashlytics.instance.enableInDevMode = true;
    // Pass all uncaught errors from the framework to Crashlytics.
    FlutterError.onError = Crashlytics.instance.recordFlutterError;

    return super.init();
  }

  @override
  getMNavigatorObservers() {
    return <NavigatorObserver>[observer];
  }
}
