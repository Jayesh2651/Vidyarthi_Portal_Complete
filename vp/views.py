import logging
import mimetypes
import re
from io import BytesIO
from pathlib import Path

# import pdfkit
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import SuspiciousFileOperation
from django.db import connection
from django.http import FileResponse, Http404, HttpResponse, HttpResponseRedirect
from django.middleware.csrf import get_token
from django.utils._os import safe_join
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from reportlab.pdfgen import canvas

from .ai import (
    AssistantConfigurationError,
    AssistantRuntimeError,
    build_assistant_reply,
    invalidate_assistant_cache,
)
from .models import Assignment, ImportantLink, NewsEvent, QuestionPaper, Syllabus, UnitTestUpload
from .serializers import (
    AssignmentSerializer,
    ImportantLinkSerializer,
    NewsEventSerializer,
    NewsLinksSubmissionSerializer,
    QuestionPaperSerializer,
    SyllabusSerializer,
    UnitTestSerializer,
)


LOGGER = logging.getLogger(__name__)


def get_choice_payload(choices):
    return [{"value": value, "label": label} for value, label in choices]


# def build_pdf_configuration():
#     wkhtmltopdf_path = (
#         Path(r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe")
#         if platform.system() == "Windows"
#         else Path("/usr/bin/wkhtmltopdf")
#     )

#     if not wkhtmltopdf_path.exists():
#         raise FileNotFoundError(f"wkhtmltopdf was not found at {wkhtmltopdf_path}")

#     return pdfkit.configuration(wkhtmltopdf=str(wkhtmltopdf_path))


@ensure_csrf_cookie
def serve_spa(request):
    for candidate in (
        getattr(settings, "FRONTEND_STATIC_INDEX", None),
        getattr(settings, "COLLECTED_STATIC_INDEX", None),
    ):
        if candidate and Path(candidate).exists():
            return HttpResponse(Path(candidate).read_text(encoding="utf-8"))

    frontend_public_url = getattr(settings, "FRONTEND_PUBLIC_URL", "").rstrip("/")
    if frontend_public_url:
        return HttpResponseRedirect(f"{frontend_public_url}{request.get_full_path()}")

    return HttpResponse(
        "React frontend is deployed separately. Set FRONTEND_PUBLIC_URL or build the SPA inside `frontend/`.",
        status=503,
    )


def serve_media_file(request, path):
    try:
        file_path = Path(safe_join(settings.MEDIA_ROOT, path))
    except (SuspiciousFileOperation, ValueError):
        raise Http404("File not found.")

    if not file_path.is_file():
        raise Http404("File not found.")

    content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
    response = FileResponse(file_path.open("rb"), content_type=content_type)
    response["Cache-Control"] = "public, max-age=3600"
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_cookie(request):
    return Response({"detail": "CSRF cookie set.", "csrfToken": get_token(request)})


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        return Response(
            {"status": "error", "database": "unavailable"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response({"status": "ok", "database": "connected"})


@api_view(["GET"])
@permission_classes([AllowAny])
def portal_options(request):
    return Response(
        {
            "assignment_classes": get_choice_payload(Assignment.CLASS_CHOICES),
            "assignment_years": get_choice_payload(Assignment.YEAR_CHOICES),
            "assignment_semesters": get_choice_payload(Assignment.SEMESTER_CHOICES),
            "syllabus_classes": get_choice_payload(Syllabus.CLASS_CHOICES),
            "syllabus_years": get_choice_payload(Syllabus.YEAR_CHOICES),
            "unit_test_classes": get_choice_payload(UnitTestUpload.CLASS_CHOICES),
            "unit_test_years": get_choice_payload(UnitTestUpload.YEAR_CHOICES),
            "unit_test_semesters": get_choice_payload(UnitTestUpload.SEM_CHOICES),
            "question_paper_classes": get_choice_payload(QuestionPaper.CLASS_CHOICES),
            "question_paper_exams": get_choice_payload(QuestionPaper.EXAM_CHOICES),
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([JSONParser])
def login_view(request):
    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    user = authenticate(request, username=username, password=password)
    if not user:
        return Response(
            {"message": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    login(request, user)
    return Response(
        {
            "message": "Login successful.",
            "user": {
                "id": user.id,
                "username": user.username,
                "full_name": user.get_full_name(),
            },
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    logout(request)
    return Response({"message": "Logged out successfully."})


@api_view(["GET"])
@permission_classes([AllowAny])
def session_view(request):
    if not request.user.is_authenticated:
        return Response({"authenticated": False, "user": None})

    return Response(
        {
            "authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "full_name": request.user.get_full_name(),
            },
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def home_view(request):
    news_events = NewsEvent.objects.all().order_by("-news_date", "-id")[:5]
    links = ImportantLink.objects.all().order_by("link_title")

    return Response(
        {
            "news_events": NewsEventSerializer(
                news_events,
                many=True,
                context={"request": request},
            ).data,
            "important_links": ImportantLinkSerializer(links, many=True).data,
        }
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def assignments_view(request):
    if request.method == "GET":
        assignments = Assignment.objects.all().order_by("-uploaded_at")
        class_name = request.query_params.get("class_name")
        year = request.query_params.get("year")
        semester = request.query_params.get("semester")
        subject = request.query_params.get("subject")

        if class_name:
            assignments = assignments.filter(class_name=class_name)
        if year:
            assignments = assignments.filter(year=year)
        if semester:
            assignments = assignments.filter(semester=semester)
        if subject:
            assignments = assignments.filter(subject__icontains=subject.strip())

        latest_year = (
            Assignment.objects.values_list("year", flat=True).distinct().order_by("-year").first()
        )
        latest_assignment = assignments.first()

        return Response(
            {
                "latest_year": latest_year,
                "latest_assignment": AssignmentSerializer(
                    latest_assignment,
                    context={"request": request},
                ).data
                if latest_assignment
                else None,
                "options": {
                    "years": sorted(
                        Assignment.objects.values_list("year", flat=True).distinct(),
                        reverse=True,
                    ),
                    "semesters": sorted(
                        Assignment.objects.values_list("semester", flat=True).distinct()
                    ),
                    "subjects": sorted(
                        Assignment.objects.values_list("subject", flat=True).distinct()
                    ),
                },
                "items": AssignmentSerializer(
                    assignments,
                    many=True,
                    context={"request": request},
                ).data,
            }
        )

    if not request.user.is_authenticated:
        return Response(
            {"message": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    serializer = AssignmentSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    assignment = serializer.save()
    invalidate_assistant_cache()

    return Response(
        {
            "message": "Assignment uploaded successfully.",
            "item": AssignmentSerializer(assignment, context={"request": request}).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def syllabus_view(request):
    if request.method == "GET":
        syllabi = Syllabus.objects.all().order_by("-uploaded_at")
        return Response(
            {"items": SyllabusSerializer(syllabi, many=True, context={"request": request}).data}
        )

    if not request.user.is_authenticated:
        return Response(
            {"message": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    serializer = SyllabusSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    syllabus = serializer.save()
    invalidate_assistant_cache()

    return Response(
        {
            "message": "Syllabus uploaded successfully.",
            "item": SyllabusSerializer(syllabus, context={"request": request}).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def unit_tests_view(request):
    if request.method == "GET":
        unit_tests = UnitTestUpload.objects.all().order_by("-uploaded_at")
        class_name = request.query_params.get("class_name")
        year = request.query_params.get("year")
        semester = request.query_params.get("semester")
        subject = request.query_params.get("subject")

        if class_name:
            unit_tests = unit_tests.filter(class_name=class_name)
        if year:
            unit_tests = unit_tests.filter(year=year)
        if semester:
            unit_tests = unit_tests.filter(semester=semester)
        if subject:
            unit_tests = unit_tests.filter(subject__icontains=subject.strip())

        latest_year = (
            UnitTestUpload.objects.values_list("year", flat=True).distinct().order_by("-year").first()
        )
        if not any([class_name, year, semester, subject]) and latest_year:
            unit_tests = unit_tests.filter(year=latest_year)

        return Response(
            {
                "latest_year": latest_year,
                "options": {
                    "years": sorted(
                        UnitTestUpload.objects.values_list("year", flat=True).distinct(),
                        reverse=True,
                    ),
                    "subjects": sorted(
                        UnitTestUpload.objects.values_list("subject", flat=True).distinct()
                    ),
                },
                "items": UnitTestSerializer(
                    unit_tests,
                    many=True,
                    context={"request": request},
                ).data,
            }
        )

    if not request.user.is_authenticated:
        return Response(
            {"message": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    serializer = UnitTestSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    unit_test = serializer.save()
    invalidate_assistant_cache()

    return Response(
        {
            "message": "Unit test uploaded successfully.",
            "item": UnitTestSerializer(unit_test, context={"request": request}).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser, FormParser])
def question_papers_view(request):
    if request.method == "GET":
        papers = QuestionPaper.objects.all().order_by("-upload_date", "-uploaded_at")
        class_name = request.query_params.get("class_name")
        exam = request.query_params.get("exam")
        year = request.query_params.get("year")

        if class_name:
            papers = papers.filter(class_name=class_name)
        if exam:
            papers = papers.filter(exam=exam)
        if year:
            papers = papers.filter(exam__icontains=year)

        years = set()
        for paper in QuestionPaper.objects.all():
            match = re.search(r"(20\d{2})", paper.exam)
            if match:
                years.add(match.group(1))

        return Response(
            {
                "years": sorted(years, reverse=True),
                "items": QuestionPaperSerializer(
                    papers,
                    many=True,
                    context={"request": request},
                ).data,
            }
        )

    if not request.user.is_authenticated:
        return Response(
            {"message": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    serializer = QuestionPaperSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)
    paper = serializer.save()
    invalidate_assistant_cache()

    return Response(
        {
            "message": "Question paper uploaded successfully.",
            "item": QuestionPaperSerializer(paper, context={"request": request}).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def news_links_view(request):
    serializer = NewsLinksSubmissionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    created = serializer.save()
    invalidate_assistant_cache()

    payload = {"message": "Content uploaded successfully."}
    if "news_event" in created:
        payload["news_event"] = NewsEventSerializer(
            created["news_event"],
            context={"request": request},
        ).data
    if "important_link" in created:
        payload["important_link"] = ImportantLinkSerializer(created["important_link"]).data

    return Response(payload, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
@parser_classes([JSONParser])
def ai_chat_view(request):
    message = (request.data.get("message") or "").strip()
    if not message:
        return Response(
            {"message": "Message is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    history = request.data.get("history") or []
    if not isinstance(history, list):
        history = []

    try:
        payload = build_assistant_reply(
            message=message,
            history=history,
            mode=(request.data.get("mode") or "default").strip().lower(),
            page_path=(request.data.get("page_path") or "").strip(),
            page_title=(request.data.get("page_title") or "").strip(),
        )
    except AssistantConfigurationError as error:
        return Response(
            {"message": str(error)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    except AssistantRuntimeError as error:
        return Response(
            {"message": str(error)},
            status=status.HTTP_502_BAD_GATEWAY,
        )
    except Exception as error:  # pragma: no cover - defensive production guard
        LOGGER.exception("Unexpected AI chat view failure: %s", error)
        return Response(
            {"message": "The assistant is temporarily unavailable. Please try again shortly."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    return Response(payload)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    latest_items = {
        "assignment": Assignment.objects.order_by("-uploaded_at").first(),
        "syllabus": Syllabus.objects.order_by("-uploaded_at").first(),
        "unit_test": UnitTestUpload.objects.order_by("-uploaded_at").first(),
        "question_paper": QuestionPaper.objects.order_by("-uploaded_at").first(),
        "news_event": NewsEvent.objects.order_by("-news_date", "-id").first(),
    }

    return Response(
        {
            "counts": {
                "assignments": Assignment.objects.count(),
                "syllabi": Syllabus.objects.count(),
                "unit_tests": UnitTestUpload.objects.count(),
                "question_papers": QuestionPaper.objects.count(),
                "news_events": NewsEvent.objects.count(),
                "important_links": ImportantLink.objects.count(),
            },
            "latest": {
                "assignment": AssignmentSerializer(
                    latest_items["assignment"],
                    context={"request": request},
                ).data
                if latest_items["assignment"]
                else None,
                "syllabus": SyllabusSerializer(
                    latest_items["syllabus"],
                    context={"request": request},
                ).data
                if latest_items["syllabus"]
                else None,
                "unit_test": UnitTestSerializer(
                    latest_items["unit_test"],
                    context={"request": request},
                ).data
                if latest_items["unit_test"]
                else None,
                "question_paper": QuestionPaperSerializer(
                    latest_items["question_paper"],
                    context={"request": request},
                ).data
                if latest_items["question_paper"]
                else None,
                "news_event": NewsEventSerializer(
                    latest_items["news_event"],
                    context={"request": request},
                ).data
                if latest_items["news_event"]
                else None,
            },
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@parser_classes([JSONParser, FormParser])
def download_pdf(request):
    content = request.data.get("content")

    if not content:
        return Response(
            {"message": "No content received."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        buffer = BytesIO()
        p = canvas.Canvas(buffer)

        # Simple text rendering (you can improve later)
        y = 800
        for line in content.split("\n"):
            p.drawString(50, y, line[:100])  # prevent overflow
            y -= 20

        p.save()
        buffer.seek(0)

        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = 'attachment; filename="document.pdf"'

        return response

    except Exception as error:
        return Response(
            {"message": f"PDF generation failed: {error}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
