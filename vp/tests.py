from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import Client, TestCase, override_settings
from rest_framework.test import APIClient

from vp.ai import AssistantConfigurationError, AssistantRuntimeError, invalidate_assistant_cache
from vp.models import Assignment, ImportantLink


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


@override_settings(
    STORAGES={
        "default": {
            "BACKEND": "vp.storage.MediaStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }
)
class AdminIntegrationTests(TestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.password = "AdminSmokePass123!"
        self.superuser = get_user_model().objects.create_superuser(
            username="admin-smoke",
            email="",
            password=self.password,
        )

    def login_to_admin(self):
        response = self.client.get("/admin/login/")
        self.assertEqual(response.status_code, 200)

        csrf_token = self.client.cookies["csrftoken"].value
        response = self.client.post(
            "/admin/login/?next=/admin/",
            {
                "username": self.superuser.username,
                "password": self.password,
                "csrfmiddlewaretoken": csrf_token,
                "next": "/admin/",
            },
            HTTP_REFERER="http://testserver/admin/login/",
            follow=True,
        )

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Site administration")

    def test_admin_dashboard_lists_registered_models(self):
        self.login_to_admin()

        response = self.client.get("/admin/")

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Assignments")
        self.assertContains(response, "Important links")

    def test_admin_can_create_update_and_delete_important_link(self):
        self.login_to_admin()
        self.client.get("/admin/vp/importantlink/add/")
        csrf_token = self.client.cookies["csrftoken"].value

        response = self.client.post(
            "/admin/vp/importantlink/add/",
            {
                "link_title": "Smoke Link",
                "link_url": "https://example.com",
                "link_description": "Created in admin test",
                "csrfmiddlewaretoken": csrf_token,
                "_save": "Save",
            },
            HTTP_REFERER="http://testserver/admin/vp/importantlink/add/",
            follow=True,
        )

        self.assertEqual(response.status_code, 200)
        important_link = ImportantLink.objects.get(link_title="Smoke Link")

        csrf_token = self.client.cookies["csrftoken"].value
        response = self.client.post(
            f"/admin/vp/importantlink/{important_link.pk}/change/",
            {
                "link_title": "Smoke Link Updated",
                "link_url": "https://example.org",
                "link_description": "Updated in admin test",
                "csrfmiddlewaretoken": csrf_token,
                "_save": "Save",
            },
            HTTP_REFERER=f"http://testserver/admin/vp/importantlink/{important_link.pk}/change/",
            follow=True,
        )

        self.assertEqual(response.status_code, 200)
        important_link.refresh_from_db()
        self.assertEqual(important_link.link_title, "Smoke Link Updated")

        csrf_token = self.client.cookies["csrftoken"].value
        response = self.client.post(
            f"/admin/vp/importantlink/{important_link.pk}/delete/",
            {
                "csrfmiddlewaretoken": csrf_token,
                "post": "yes",
            },
            HTTP_REFERER=f"http://testserver/admin/vp/importantlink/{important_link.pk}/delete/",
            follow=True,
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(ImportantLink.objects.filter(pk=important_link.pk).exists())
