import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../resume/resume_provider.dart';
import '../jd/jd_provider.dart';
import 'analysis_provider.dart';
import 'analysis_result_screen.dart';

class AnalysisSetupScreen extends ConsumerWidget {
  const AnalysisSetupScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resumeState = ref.watch(resumeProvider);
    final jdState = ref.watch(jdProvider);
    final analysisState = ref.watch(analysisProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resume ↔ JD Matching'),
        backgroundColor: const Color(0xFF0F172A),
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF4F46E5), Color(0xFF0EA5E9)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('AI ATS Match Engine', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
                    SizedBox(height: 6),
                    Text('Select a uploaded Resume and target Job Description to generate full match scores, skill gap breakdown, and truthful improvements.',
                      style: TextStyle(color: Colors.white70, fontSize: 14),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Resume Selector
              const Text('1. Select Resume', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 10),
              if (resumeState.resumes.isEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('No resumes found. Please upload a resume in the Resumes tab first.', style: TextStyle(color: Colors.amber)),
                )
              else
                DropdownButtonFormField<String>(
                  isExpanded: true,
                  value: resumeState.selectedResumeId,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.description)),
                  selectedItemBuilder: (context) {
                    return resumeState.resumes.map((r) {
                      return Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          r.fileName,
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                        ),
                      );
                    }).toList();
                  },
                  items: resumeState.resumes.map((r) => DropdownMenuItem(
                    value: r.id,
                    child: Text(r.fileName, overflow: TextOverflow.ellipsis, maxLines: 1),
                  )).toList(),
                  onChanged: (val) {
                    if (val != null) ref.read(resumeProvider.notifier).selectResume(val);
                  },
                ),

              const SizedBox(height: 24),

              // JD Selector
              const Text('2. Select Job Description', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 10),
              if (jdState.jds.isEmpty)
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('No job descriptions found. Please add a JD in the JDs tab first.', style: TextStyle(color: Colors.amber)),
                )
              else
                DropdownButtonFormField<String>(
                  isExpanded: true,
                  value: jdState.selectedJdId,
                  decoration: const InputDecoration(prefixIcon: Icon(Icons.work)),
                  selectedItemBuilder: (context) {
                    return jdState.jds.map((j) {
                      return Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          '${j.title} (${j.company})',
                          overflow: TextOverflow.ellipsis,
                          maxLines: 1,
                        ),
                      );
                    }).toList();
                  },
                  items: jdState.jds.map((j) => DropdownMenuItem(
                    value: j.id,
                    child: Text('${j.title} (${j.company})', overflow: TextOverflow.ellipsis, maxLines: 1),
                  )).toList(),
                  onChanged: (val) {
                    if (val != null) ref.read(jdProvider.notifier).selectJd(val);
                  },
                ),

              const SizedBox(height: 40),

              if (analysisState.errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Text(analysisState.errorMessage!, style: const TextStyle(color: Colors.redAccent)),
                ),

              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton.icon(
                  onPressed: (resumeState.selectedResumeId == null || jdState.selectedJdId == null || analysisState.isAnalyzing)
                      ? null
                      : () async {
                          final success = await ref.read(analysisProvider.notifier).startAnalysis(
                            resumeState.selectedResumeId!,
                            jdState.selectedJdId!,
                          );
                          if (success && context.mounted) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const AnalysisResultScreen()),
                            );
                          }
                        },
                  icon: analysisState.isAnalyzing
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.analytics_rounded),
                  label: Text(analysisState.isAnalyzing ? 'Analyzing Documents...' : 'Run Match Analysis', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
