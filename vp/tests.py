from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from vp.ai import AssistantConfigurationError, AssistantRuntimeError, invalidate_assistant_cache
from vp.models import Assignment


class AssistantIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        invalidate_assistant_cache()

    def test_ai_chat_returns_503_for_configuration_errors(self):
        with patch("vp.views.build_assistant_reply", side_effect=AssistantConfigurationError("missing key")):
            response = self.client.post("/api/ai/chat/", {"message": "Explain DBMS"}, format="json")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.data["message"], "missing key")

    def test_ai_chat_returns_502_for_unexpected_errors(self):
        with patch("vp.views.build_assistant_reply", side_effect=Exception("boom")):
            response = self.client.post("/api/ai/chat/", {"message": "Explain DBMS"}, format="json")

        self.assertEqual(response.status_code, 502)
        self.assertIn("temporarily unavailable", response.data["message"].lower())

    def test_invalidate_assistant_cache_does_not_break_when_assistant_is_unavailable(self):
        with patch("vp.ai._load_assistant_module", side_effect=AssistantRuntimeError("assistant offline")):
            invalidate_assistant_cache()

    def test_ai_chat_can_build_a_reply_when_legacy_columns_are_present(self):
        Assignment.objects.create(
            class_name="fy",
            year="2025",
            semester="sem1",
            subject="DBMS",
        )

        with patch("vp.ai.assistant.ChatClient") as mock_chat_client:
            mock_chat_client.return_value.generate_reply.return_value = "Normalized reply"
            response = self.client.post("/api/ai/chat/", {"message": "Explain DBMS"}, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["reply"], "Normalized reply")
