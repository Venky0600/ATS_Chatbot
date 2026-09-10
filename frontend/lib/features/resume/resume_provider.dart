import 'package:file_picker/file_picker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../core/api_client.dart';
import '../auth/auth_provider.dart';

class ResumeItem {
  final String id;
  final String fileName;
  final String status;
  final DateTime createdAt;

  ResumeItem({required this.id, required this.fileName, required this.status, required this.createdAt});

  factory ResumeItem.fromJson(Map<String, dynamic> json) {
    return ResumeItem(
      id: json['id'] ?? '',
      fileName: json['fileName'] ?? '',
      status: json['status'] ?? 'uploaded',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}

class ResumeState {
  final List<ResumeItem> resumes;
  final bool isLoading;
  final String? selectedResumeId;
  final String? errorMessage;

  ResumeState({this.resumes = const [], this.isLoading = false, this.selectedResumeId, this.errorMessage});

  ResumeState copyWith({List<ResumeItem>? resumes, bool? isLoading, String? selectedResumeId, String? errorMessage}) {
    return ResumeState(
      resumes: resumes ?? this.resumes,
      isLoading: isLoading ?? this.isLoading,
      selectedResumeId: selectedResumeId ?? this.selectedResumeId,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class ResumeNotifier extends StateNotifier<ResumeState> {
  final ApiClient apiClient;

  ResumeNotifier(this.apiClient) : super(ResumeState()) {
    fetchResumes();
  }

  Future<void> fetchResumes() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final res = await apiClient.get('/resumes');
      if (res.data['success'] == true) {
        final items = (res.data['data']['items'] as List)
            .map((e) => ResumeItem.fromJson(e))
            .toList();
        state = state.copyWith(
          resumes: items,
          isLoading: false,
          selectedResumeId: items.isNotEmpty ? items.first.id : null,
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Failed to load resumes: ${e.toString()}');
    }
  }

  void selectResume(String id) {
    state = state.copyWith(selectedResumeId: id);
  }

  Future<bool> uploadResumeFile(PlatformFile file) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      FormData formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          file.bytes ?? [],
          filename: file.name,
        ),
      });

      final res = await apiClient.post('/resumes', data: formData);
      if (res.data['success'] == true) {
        await fetchResumes();
        return true;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Upload failed: ${e.toString()}');
    }
    return false;
  }
}

final resumeProvider = StateNotifierProvider<ResumeNotifier, ResumeState>((ref) {
  return ResumeNotifier(ref.watch(apiClientProvider));
});
