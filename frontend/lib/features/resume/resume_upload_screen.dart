import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'resume_provider.dart';

class ResumeUploadScreen extends ConsumerWidget {
  const ResumeUploadScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resumeState = ref.watch(resumeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Resumes'),
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton.icon(
                  onPressed: resumeState.isLoading
                      ? null
                      : () async {
                          final result = await FilePicker.platform.pickFiles(
                            type: FileType.custom,
                            allowedExtensions: ['pdf', 'docx', 'txt'],
                            withData: true,
                          );
                          if (result != null && result.files.isNotEmpty) {
                            await ref.read(resumeProvider.notifier).uploadResumeFile(result.files.first);
                          }
                        },
                  icon: const Icon(Icons.upload_file_rounded),
                  label: const Text('Upload Resume (PDF, DOCX, TXT)', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
              const SizedBox(height: 20),

              if (resumeState.errorMessage != null)
                Text(resumeState.errorMessage!, style: const TextStyle(color: Colors.redAccent)),

              Expanded(
                child: resumeState.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : resumeState.resumes.isEmpty
                        ? const Center(child: Text('No resumes uploaded yet.', style: TextStyle(color: Colors.white54)))
                        : ListView.builder(
                            itemCount: resumeState.resumes.length,
                            itemBuilder: (context, index) {
                              final item = resumeState.resumes[index];
                              return Card(
                                color: const Color(0xFF1E293B),
                                margin: const EdgeInsets.only(bottom: 12),
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                child: ListTile(
                                  leading: const Icon(Icons.picture_as_pdf_rounded, color: Colors.indigoAccent),
                                  title: Text(item.fileName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                                  subtitle: Text('Status: ${item.status}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                                  trailing: const Icon(Icons.check_circle_outline, color: Color(0xFF10B981)),
                                ),
                              );
                            },
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
