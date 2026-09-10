import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../resume/resume_upload_screen.dart';
import '../jd/jd_input_screen.dart';
import '../analysis/analysis_setup_screen.dart';
import '../history/history_screen.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    AnalysisSetupScreen(),
    ResumeUploadScreen(),
    JdInputScreen(),
    HistoryScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: Color(0xFF334155), width: 0.5)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: const Color(0xFF0F172A),
          selectedItemColor: const Color(0xFF6366F1),
          unselectedItemColor: const Color(0xFF64748B),
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.auto_awesome_rounded), label: 'Analyze'),
            BottomNavigationBarItem(icon: Icon(Icons.description_rounded), label: 'Resumes'),
            BottomNavigationBarItem(icon: Icon(Icons.work_rounded), label: 'JDs'),
            BottomNavigationBarItem(icon: Icon(Icons.history_rounded), label: 'History'),
          ],
        ),
      ),
    );
  }
}
