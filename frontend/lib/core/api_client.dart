import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'auth_storage.dart';

String get _defaultBaseUrl {
  if (kIsWeb) {
    return 'http://localhost:5000/api/v1';
  }
  return 'http://127.0.0.1:5000/api/v1';
}

class ApiClient {
  final Dio dio;
  final AuthStorage authStorage;
  final Dio _authDio;
  Future<String?>? _authInFlight;

  ApiClient({required this.authStorage})
      : dio = Dio(BaseOptions(
          baseUrl: _defaultBaseUrl,
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
        )),
        _authDio = Dio(BaseOptions(
          baseUrl: _defaultBaseUrl,
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        )) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          if (!options.path.contains('/auth/')) {
            final token = await _getOrFetchToken();
            if (token != null && token.isNotEmpty) {
              options.headers['Authorization'] = 'Bearer $token';
            }
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          print('[ApiClient Error]: ${error.message} (${error.response?.statusCode})');
          return handler.next(error);
        },
      ),
    );
  }

  Future<String?> _getOrFetchToken() async {
    var token = await authStorage.getToken();
    if (token != null && token.isNotEmpty) return token;

    if (_authInFlight != null) {
      return await _authInFlight;
    }

    _authInFlight = (() async {
      try {
        final authRes = await _authDio.post('/auth/google', data: {'idToken': 'default_guest_user_token'});
        if (authRes.data != null && authRes.data['success'] == true) {
          final newToken = authRes.data['data']['accessToken'] as String?;
          if (newToken != null && newToken.isNotEmpty) {
            await authStorage.saveToken(newToken);
            return newToken;
          }
        }
      } catch (e) {
        print('[ApiClient Auto-Auth Failed]: $e');
      } finally {
        _authInFlight = null;
      }
      return null;
    })();

    return await _authInFlight;
  }

  Future<Response> post(String path, {dynamic data, Options? options}) async {
    return await dio.post(path, data: data, options: options);
  }

  Future<Response> get(String path, {Map<String, dynamic>? queryParameters}) async {
    return await dio.get(path, queryParameters: queryParameters);
  }

  Future<Response> delete(String path) async {
    return await dio.delete(path);
  }
}
