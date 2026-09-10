import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import 'analysis_provider.dart';

class AnalysisResultScreen extends ConsumerWidget {
  const AnalysisResultScreen({super.key});

  Widget _buildScoreBadge(String label, int score, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text('$score%', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 4),
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.white70)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final analysis = ref.watch(analysisProvider).currentAnalysis;

    if (analysis == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Analysis Result')),
        body: const Center(child: Text('No analysis loaded.')),
      );
    }

    final scores = analysis['scores'] ?? {};
    final matchedSkills = List<Map<String, dynamic>>.from(analysis['matchedSkills'] ?? []);
    final partialSkills = List<Map<String, dynamic>>.from(analysis['partialSkills'] ?? []);
    final missingSkills = List<Map<String, dynamic>>.from(analysis['missingSkills'] ?? []);
    final weakAreas = List<Map<String, dynamic>>.from(analysis['weakAreas'] ?? []);
    final atsAnalysis = analysis['atsAnalysis'] ?? {};
    final improvements = List<Map<String, dynamic>>.from(analysis['improvements'] ?? []);
    final recommendations = List<Map<String, dynamic>>.from(analysis['recommendations'] ?? []);

    final int overallMatch = scores['overallMatch'] ?? 0;
    final int atsCompatibility = scores['atsCompatibility'] ?? 0;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Match Analysis Details'),
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Overall & ATS Top Cards
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF6366F1), Color(0xFF4F46E5)]),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        const Text('Overall Match', style: TextStyle(color: Colors.white70, fontSize: 13)),
                        const SizedBox(height: 8),
                        Text('$overallMatch%', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF0EA5E9), Color(0xFF0284C7)]),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      children: [
                        const Text('ATS Score', style: TextStyle(color: Colors.white70, fontSize: 13)),
                        const SizedBox(height: 8),
                        Text('$atsCompatibility%', style: const TextStyle(color: Colors.white, fontSize: 36, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Detailed Breakdown Grid
            const Text('Score Breakdown', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 12),
            GridView.count(
              crossAxisCount: 3,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.2,
              children: [
                _buildScoreBadge('Skill Match', scores['skillMatch'] ?? 0, Colors.greenAccent),
                _buildScoreBadge('Keywords', scores['keywordMatch'] ?? 0, Colors.lightBlueAccent),
                _buildScoreBadge('Experience', scores['experienceMatch'] ?? 0, Colors.orangeAccent),
                _buildScoreBadge('Education', scores['educationMatch'] ?? 0, Colors.purpleAccent),
                _buildScoreBadge('Project Rel.', scores['projectRelevance'] ?? 0, Colors.tealAccent),
                _buildScoreBadge('Role Align.', scores['roleAlignment'] ?? 0, Colors.indigoAccent),
              ],
            ),
            const SizedBox(height: 28),

            // Matched Skills
            Row(
              children: [
                const Icon(Icons.check_circle_rounded, color: Colors.greenAccent, size: 20),
                const SizedBox(width: 8),
                Text('Matched Skills (${matchedSkills.length})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ],
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: matchedSkills.map((m) => Chip(
                avatar: const Icon(Icons.check, size: 14, color: Colors.white),
                label: Text(m['skill'] ?? ''),
                backgroundColor: const Color(0xFF064E3B),
                labelStyle: const TextStyle(color: Colors.white),
              )).toList(),
            ),
            const SizedBox(height: 24),

            // Missing Skills
            Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 20),
                const SizedBox(width: 8),
                Text('Missing Skills (${missingSkills.length})', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
              ],
            ),
            const SizedBox(height: 10),
            Column(
              children: missingSkills.map((m) => Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.red.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.cancel, color: Colors.redAccent, size: 18),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(m['skill'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                          if (m['reason'] != null)
                            Text(m['reason'], style: const TextStyle(fontSize: 12, color: Colors.white70)),
                        ],
                      ),
                    ),
                  ],
                ),
              )).toList(),
            ),
            const SizedBox(height: 24),

            // Truthful Resume Improvements
            const Text('Truthful Resume Improvements', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 10),
            Column(
              children: improvements.map((imp) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Section: ${imp['section']}', style: const TextStyle(color: Color(0xFF6366F1), fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    Text('Current: "${imp['currentText']}"', style: const TextStyle(color: Colors.white60, fontSize: 13)),
                    const SizedBox(height: 6),
                    Text('Suggested: "${imp['suggestedText']}"', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w500, fontSize: 13)),
                  ],
                ),
              )).toList(),
            ),
            const SizedBox(height: 24),

            // Learning Recommendations & Courses
            const Text('Skills to Learn & Recommended Courses', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white)),
            const SizedBox(height: 10),
            Column(
              children: recommendations.map((rec) {
                final courses = List<Map<String, dynamic>>.from(rec['courses'] ?? []);
                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Skill: ${rec['skill']}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.lightBlueAccent)),
                      const SizedBox(height: 8),
                      const Text('Recommended Courses:', style: TextStyle(fontSize: 13, color: Colors.white70)),
                      const SizedBox(height: 6),
                      ...courses.map((c) => ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.school, color: Colors.amber),
                        title: Text(c['title'] ?? '', style: const TextStyle(fontSize: 14, color: Colors.white)),
                        subtitle: Text(c['provider'] ?? '', style: const TextStyle(fontSize: 12, color: Colors.white54)),
                        trailing: IconButton(
                          icon: const Icon(Icons.open_in_new, color: Colors.lightBlueAccent, size: 20),
                          onPressed: () async {
                            final url = Uri.parse(c['url'] ?? '');
                            if (await canLaunchUrl(url)) {
                              await launchUrl(url);
                            }
                          },
                        ),
                      )),
                    ],
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
