import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../analysis/analysis_provider.dart';
import '../analysis/analysis_result_screen.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(analysisProvider).history;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Analysis History'),
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: history.isEmpty
              ? const Center(child: Text('No analysis history found.', style: TextStyle(color: Colors.white54)))
              : ListView.builder(
                  itemCount: history.length,
                  itemBuilder: (context, index) {
                    final item = history[index];
                    final overall = item['overallMatch'] ?? 0;
                    final ats = item['atsCompatibility'] ?? 0;
                    final id = item['id'] ?? '';

                    return Card(
                      color: const Color(0xFF1E293B),
                      margin: const EdgeInsets.only(bottom: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      child: ListTile(
                        onTap: () async {
                          await ref.read(analysisProvider.notifier).fetchAnalysisDetails(id);
                          if (context.mounted) {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => const AnalysisResultScreen()),
                            );
                          }
                        },
                        leading: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0xFF6366F1).withOpacity(0.15),
                            shape: BoxShape.circle,
                          ),
                          child: Text('$overall%', style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF6366F1))),
                        ),
                        title: Text('Match Analysis #${index + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        subtitle: Text('Overall Match: $overall% | ATS: $ats%', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                        trailing: const Icon(Icons.arrow_forward_ios_rounded, color: Colors.white38, size: 16),
                      ),
                    );
                  },
                ),
        ),
      ),
    );
  }
}
