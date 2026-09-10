import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api_client.dart';
import '../../core/auth_storage.dart';

final authStorageProvider = Provider((ref) => AuthStorage());
final apiClientProvider = Provider((ref) => ApiClient(authStorage: ref.watch(authStorageProvider)));

class UserModel {
  final String id;
  final String name;
  final String email;
  final String profileImage;

  UserModel({required this.id, required this.name, required this.email, required this.profileImage});

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      profileImage: json['profileImage'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'name': name, 'email': email, 'profileImage': profileImage};
}

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final UserModel? user;
  final String? errorMessage;

  AuthState({this.isAuthenticated = false, this.isLoading = false, this.user, this.errorMessage});

  AuthState copyWith({bool? isAuthenticated, bool? isLoading, UserModel? user, String? errorMessage}) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient apiClient;
  final AuthStorage authStorage;

  AuthNotifier(this.apiClient, this.authStorage) : super(AuthState()) {
    checkInitialAuth();
  }

  Future<void> checkInitialAuth() async {
    state = state.copyWith(isLoading: true);
    try {
      final token = await authStorage.getToken();
      if (token != null && token.isNotEmpty) {
        final res = await apiClient.get('/auth/me');
        if (res.data['success'] == true) {
          final user = UserModel.fromJson(res.data['data']['user']);
          state = state.copyWith(isAuthenticated: true, user: user, isLoading: false);
          return;
        }
      }
    } catch (_) {}
    
    // Automatically auto-authenticate as default user without showing sign-in screen
    await loginGoogle('default_guest_user_token');
  }

  Future<bool> loginGoogle(String idToken) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final res = await apiClient.post('/auth/google', data: {'idToken': idToken});
      if (res.data['success'] == true) {
        final token = res.data['data']['accessToken'];
        final user = UserModel.fromJson(res.data['data']['user']);
        await authStorage.saveToken(token);
        await authStorage.saveUser(jsonEncode(user.toJson()));
        state = state.copyWith(isAuthenticated: true, user: user, isLoading: false);
        return true;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Google authentication failed: ${e.toString()}');
    }
    return false;
  }

  Future<bool> loginDiscord(String credential) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final res = await apiClient.post('/auth/discord', data: {'credential': credential});
      if (res.data['success'] == true) {
        final token = res.data['data']['accessToken'];
        final user = UserModel.fromJson(res.data['data']['user']);
        await authStorage.saveToken(token);
        await authStorage.saveUser(jsonEncode(user.toJson()));
        state = state.copyWith(isAuthenticated: true, user: user, isLoading: false);
        return true;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, errorMessage: 'Discord authentication failed: ${e.toString()}');
    }
    return false;
  }

  Future<void> logout() async {
    try {
      await apiClient.post('/auth/logout');
    } catch (_) {}
    await authStorage.clearAll();
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(apiClientProvider), ref.watch(authStorageProvider));
});
