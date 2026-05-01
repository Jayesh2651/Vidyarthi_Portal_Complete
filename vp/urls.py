from django.contrib import admin
from django.urls import path, re_path

from . import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/csrf/", views.csrf, name="csrf"),
    path("api/health/", views.health_check, name="api_health"),
    path("api/auth/debug/", views.auth_debug_view, name="api_auth_debug"),
    path("api/auth/csrf/", views.csrf, name="api_csrf"),
    path("api/auth/login/", views.login_view, name="api_login"),
    path("api/auth/logout/", views.logout_view, name="api_logout"),
    path("api/auth/session/", views.session_view, name="api_session"),
    path("api/ai/chat/", views.ai_chat_view, name="api_ai_chat"),
    path("api/options/", views.portal_options, name="api_options"),
    path("api/home/", views.home_view, name="api_home"),
    path("api/dashboard/summary/", views.dashboard_summary, name="api_dashboard_summary"),
    path("api/assignments/", views.assignments_view, name="api_assignments"),
    path("api/syllabus/", views.syllabus_view, name="api_syllabus"),
    path("api/unit-tests/", views.unit_tests_view, name="api_unit_tests"),
    path("api/question-papers/", views.question_papers_view, name="api_question_papers"),
    path("api/news-links/", views.news_links_view, name="api_news_links"),
    path("api/download-pdf/", views.download_pdf, name="api_download_pdf"),
    path("media/<path:path>", views.serve_media_file, name="media_file"),
]
urlpatterns += [
    re_path(r"^(?!api/|admin/|media/|static/).*$", views.serve_spa, name="spa"),
]
