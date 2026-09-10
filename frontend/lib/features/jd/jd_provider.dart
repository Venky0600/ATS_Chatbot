import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';
import '../auth/auth_provider.dart';

class JdItem {
  final String id;
  final String title;
  final String company;
  final DateTime createdAt;

  JdItem({required this.id, required this.title, required this.company, required this.createdAt});

  factory JdItem.fromJson(Map<String, dynamic> json) {
    return JdItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      company: json['company'] ?? '',
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
    );
  }
}

class JdState {
  final List<JdItem> jds;
  final bool isLoading;
  final String? selectedJdId;
  final String? errorMessage;

  JdState({this.jds = const [], this.isLoading = false, this.selectedJdId, this.errorMessage});

  JdState copyWith({List<JdItem>? jds, bool? isLoading, String? selectedJdId, String? errorMessage}) {
    return JdState(
      jds: jds ?? this.jds,
      isLoading: isLoading ?? this.isLoading,
      selectedJdId: selectedJdId ?? this.selectedJdId,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class JdNotifier extends StateNotifier<JdState> {
  final ApiClient apiClient;

  JdNotifier(this.apiClient) : super(JdState()) {
    fetchJds();
  }

  Future<void> fetchJds() async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final res = await apiClient.get('/job-descriptions');
      if (res.data['success'] == true) {
        final items = (res.data['data']['items'] as List)
            .map((e) => JdItem.fromJson(e))
            .toList();
        state = state.copyWith(
          jds: items,
          isLoading: false,
          selectedJdId: items.isNotEmpty ? items.first.id : null,
        );
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Failed to load JDs: ${e.toString()}');
    }
  }

  void selectJd(String id) {
    state = state.copyWith(selectedJdId: id);
  }

  Future<bool> createJd(String title, String company, String rawText) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final res = await apiClient.post('/job-descriptions', data: {
        'title': title,
        'company': company,
        'rawText': rawText,
      });
      if (res.data['success'] == true) {
        await fetchJds();
        return true;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Failed to create JD: ${e.toString()}');
    }
    return false;
  }
}

final jdProvider = StateNotifierProvider<JdNotifier, JdState>((ref) {
  return JdNotifier(ref.watch(apiClientProvider));
});
