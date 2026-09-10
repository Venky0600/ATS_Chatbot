import 'package:dio/dio.dart';
import 'auth_storage.dart';

class ApiClient {
  final Dio dio;
  final AuthStorage authStorage;

  ApiClient({required this.authStorage})
      : dio = Dio(BaseOptions(
          baseUrl: 'http://localhost:5000/api/v1',
          connectTimeout: const Duration(seconds: 15),
          receiveTimeout: const Duration(seconds: 15),
          headers: {'Content-Type': 'application/json'},
        )) {
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await authStorage.getToken();
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
