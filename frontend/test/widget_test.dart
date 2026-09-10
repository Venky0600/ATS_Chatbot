import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ats_chatbot/main.dart';

void main() {
  testWidgets('App renders ATSChatbotApp successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: ATSChatbotApp()));
    expect(find.byType(ATSChatbotApp), findsOneWidget);
  });
}
