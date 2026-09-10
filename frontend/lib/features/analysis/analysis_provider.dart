import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';
import '../auth/auth_provider.dart';

class AnalysisState {
  final bool isAnalyzing;
  final Map<String, dynamic>? currentAnalysis;
  final List<Map<String, dynamic>> history;
  final String? errorMessage;

  AnalysisState({this.isAnalyzing = false, this.currentAnalysis, this.history = const [], this.errorMessage});

  AnalysisState copyWith({bool? isAnalyzing, Map<String, dynamic>? currentAnalysis, List<Map<String, dynamic>>? history, String? errorMessage}) {
    return AnalysisState(
      isAnalyzing: isAnalyzing ?? this.isAnalyzing,
      currentAnalysis: currentAnalysis ?? this.currentAnalysis,
      history: history ?? this.history,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class AnalysisNotifier extends StateNotifier<AnalysisState> {
  final ApiClient apiClient;

  AnalysisNotifier(this.apiClient) : super(AnalysisState()) {
    fetchHistory();
  }

  Future<void> fetchHistory() async {
    try {
      final res = await apiClient.get('/analyses');
      if (res.data['success'] == true) {
        final items = List<Map<String, dynamic>>.from(res.data['data']['items'] ?? []);
        state = state.copyWith(history: items);
      }
    } catch (_) {}
  }

  Future<bool> startAnalysis(String resumeId, String jdId) async {
    state = state.copyWith(isAnalyzing: true, errorMessage: null);
    try {
      final res = await apiClient.post('/analyses', data: {
        'resumeId': resumeId,
        'jobDescriptionId': jdId,
      });

      if (res.data['success'] == true) {
        final analysisId = res.data['data']['analysis']['id'];
        await fetchAnalysisDetails(analysisId);
        await fetchHistory();
        return true;
      }
    } catch (e) {
      state = state.copyWith(isAnalyzing: false, errorMessage: 'Analysis failed: ${e.toString()}');
    }
    return false;
  }

  Future<void> fetchAnalysisDetails(String id) async {
    state = state.copyWith(isAnalyzing: true, errorMessage: null);
    try {
      final res = await apiClient.get('/analyses/$id');
      if (res.data['success'] == true) {
        state = state.copyWith(
          currentAnalysis: res.data['data']['analysis'],
          isAnalyzing: false,
        );
      }
    } catch (e) {
      state = state.copyWith(isAnalyzing: false, errorMessage: 'Failed to fetch details: ${e.toString()}');
    }
  }
}

final analysisProvider = StateNotifierProvider<AnalysisNotifier, AnalysisState>((ref) {
  return AnalysisNotifier(ref.watch(apiClientProvider));
});
