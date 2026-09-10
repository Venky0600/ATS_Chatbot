import 'package:dio/dio.dart';
import 'auth_storage.dart';

class ApiClient {
  final Dio dio;
  final AuthStorage authStorage;
  final Dio _authDio;

  ApiClient({required this.authStorage})
      : dio = Dio(BaseOptions(
          baseUrl: 'http://127.0.0.1:5000/api/v1',
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
        )),
        _authDio = Dio(BaseOptions(
          baseUrl: 'http://127.0.0.1:5000/api/v1',
          connectTimeout: const Duration(seconds: 10),
          receiveTimeout: const Duration(seconds: 10),
        )) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          var token = await authStorage.getToken();
          if ((token == null || token.isEmpty) && !options.path.contains('/auth/')) {
            try {
              final authRes = await _authDio.post('/auth/google', data: {'idToken': 'default_guest_user_token'});
              if (authRes.data != null && authRes.data['success'] == true) {
                token = authRes.data['data']['accessToken'];
                if (token != null && token.isNotEmpty) {
                  await authStorage.saveToken(token);
                }
              }
            } catch (e) {
              print('[ApiClient Auto-Auth Failed]: $e');
            }
          }
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
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
