import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'jd_provider.dart';

class JdInputScreen extends ConsumerStatefulWidget {
  const JdInputScreen({super.key});

  @override
  ConsumerState<JdInputScreen> createState() => _JdInputScreenState();
}

class _JdInputScreenState extends ConsumerState<JdInputScreen> {
  final _titleController = TextEditingController();
  final _companyController = TextEditingController();
  final _rawTextController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _companyController.dispose();
    _rawTextController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final jdState = ref.watch(jdProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Job Descriptions'),
        backgroundColor: const Color(0xFF0F172A),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Add Job Description', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 16),
              TextField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Job Title (e.g. Flutter Developer)'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _companyController,
                decoration: const InputDecoration(labelText: 'Company (e.g. Acme Tech)'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _rawTextController,
                maxLines: 5,
                decoration: const InputDecoration(labelText: 'Full Job Description Text...'),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: jdState.isLoading
                      ? null
                      : () async {
                          if (_titleController.text.trim().isEmpty || _rawTextController.text.trim().isEmpty) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Please enter Title and Job Description text')),
                            );
                            return;
                          }
                          final ok = await ref.read(jdProvider.notifier).createJd(
                            _titleController.text.trim(),
                            _companyController.text.trim(),
                            _rawTextController.text.trim(),
                          );
                          if (ok) {
                            _titleController.clear();
                            _companyController.clear();
                            _rawTextController.clear();
                          }
                        },
                  icon: const Icon(Icons.add),
                  label: const Text('Save Job Description', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),

              const SizedBox(height: 28),
              const Text('Saved Job Descriptions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
              const SizedBox(height: 12),

              jdState.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: jdState.jds.length,
                      itemBuilder: (context, index) {
                        final jd = jdState.jds[index];
                        return Card(
                          color: const Color(0xFF1E293B),
                          margin: const EdgeInsets.only(bottom: 10),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            leading: const Icon(Icons.work_outline, color: Colors.lightBlueAccent),
                            title: Text(jd.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            subtitle: Text(jd.company.isNotEmpty ? jd.company : 'Company not specified', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                          ),
                        );
                      },
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
