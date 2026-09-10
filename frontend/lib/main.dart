import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/app_theme.dart';
import 'features/home/home_screen.dart';

void main() {
  runApp(const ProviderScope(child: ATSChatbotApp()));
}

class ATSChatbotApp extends StatelessWidget {
  const ATSChatbotApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ATS Resume Matcher',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const HomeScreen(),
    );
  }
}
