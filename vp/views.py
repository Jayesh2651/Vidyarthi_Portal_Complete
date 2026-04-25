from django.shortcuts import render, redirect
from .forms import AssignmentUploadForm,Assignment
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from .models import Syllabus
# from .forms import SyllabusUploadForm
from .models import UnitTestUpload
from .forms import NewsEventForm, ImportantLinkForm
from .models import NewsEvent, ImportantLink
from .forms import QuestionPaperForm
from .models import QuestionPaper
# from .forms import TeacherCreateTestForm
from django.http import HttpResponse
# import tempfile
# import subprocess
# import os
# from pylatex import Document, NoEscape
# from django.template.loader import render_to_string
import pdfkit
from django.views.decorators.csrf import csrf_exempt
import platform


# for admin panel 
# def home(request):
#     return render(request, 'templates/index.html') 

def custom_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)  # not email, use username here
        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, 'Invalid username or password')
    return render(request, 'templates/teacher_login.html')

@login_required(login_url='/templates/teacher_login/')  # हा ठीक आहे, कारण custom_login आहे
def dashboard(request):
    return render(request, 'templates/teacher_dashboard.html')


def upload_assignment(request):
    success_message = None

    if request.method == 'POST':
        class_name = request.POST['class_name']
        year = request.POST['year']
        semester = request.POST['semester']
        subject = request.POST['subject']
        theory_pdf = request.FILES.get('theory_pdf')
        practical_pdf = request.FILES.get('practical_pdf')

        Assignment.objects.create(
            class_name=class_name,
            year=year,
            semester=semester,
            subject=subject,
            theory_pdf=theory_pdf,
            practical_pdf=practical_pdf
        )

        success_message = "Assignment uploaded successfully ✅"

    return render(request, 'templates/teacher_upload_assignment.html', {'success_message': success_message})

def upload_news_links(request):
    if request.method == 'POST':
        news_form = NewsEventForm(request.POST, request.FILES)
        link_form = ImportantLinkForm(request.POST)

        if news_form.is_valid():
            news_form.save()
            messages.success(request, "✅ ")

        if link_form.is_valid() and link_form.cleaned_data.get("link_title"):
            link_form.save()
            messages.success(request, "uploaded successfully!")

        return redirect('upload_news_links')  # Change name as per url name
    else:
        news_form = NewsEventForm()
        link_form = ImportantLinkForm()

    return render(request, 'templates/teacher_upload_news_links.html', {
        'news_form': news_form,
        'link_form': link_form,
    })

def upload_question_paper(request):
    if request.method == 'POST':
        form = QuestionPaperForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            messages.success(request, "✅ Question paper uploaded successfully!")
            return redirect('upload_question_paper')
        else:
            print(form.errors)
            messages.error(request, "❌ Something went wrong.")
    else:
        form = QuestionPaperForm()
    return render(request, 'templates/teacher_upload_question_paper.html', {'form': form})

def upload_syllabus(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        class_name = request.POST.get('class')
        subject = request.POST.get('subject')
        year = request.POST.get('year')
        file = request.FILES.get('file')

        if title and class_name and subject and year and file:
            Syllabus.objects.create(
                title=title,
                class_name=class_name,
                subject=subject,
                year=year,
                file=file
            )
            messages.success(request, "✅ Syllabus uploaded successfully!")  # ✅ ADD THIS LINE
            return redirect('upload_syllabus')  # same page reload

    return render(request, 'templates/teacher_upload_syllabus.html')


# wkhtmltopdf चा path set कर
# path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'  # Make sure 'bin' path is added
# config = pdfkit.configuration(wkhtmltopdf='/usr/bin/wkhtmltopdf')
if platform.system() == "Windows":
    path_wkhtmltopdf = r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe'
else:
    path_wkhtmltopdf = '/usr/bin/wkhtmltopdf'
config = pdfkit.configuration(wkhtmltopdf=path_wkhtmltopdf)
pdfkit.from_string("Hello World", "out.pdf", configuration=config)

@csrf_exempt
def download_pdf(request):
    if request.method == 'POST':
        html_content = request.POST.get('content')

        if not html_content:
            return HttpResponse("No content received", status=400)

        options = {
            'encoding': 'UTF-8',
            'enable-local-file-access': ''
        }

        try:
            pdf = pdfkit.from_string(html_content, False, options=options, configuration=config)
        except Exception as e:
            return HttpResponse(f"PDF generation failed: {str(e)}", status=500)

        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="question_paper.pdf"'
        return response

    return HttpResponse("Invalid request method", status=405)
# for student 
def index(request):
    news_events = NewsEvent.objects.all().order_by('-news_date')[:5]  # Show latest 5
    links = ImportantLink.objects.all()
    return render(request, 'templates/index.html', {
        'news_events': news_events,
        'links': links,
    })

def course(request):
    return render(request, 'templates/course.html')

# vp/views.py

def home_assignments(request):
    class_selected = request.GET.get('class')
    year_selected = request.GET.get('year')
    semester_selected = request.GET.get('semester')
    subject_selected = request.GET.get('subject')

    years = Assignment.objects.values_list('year', flat=True).distinct().order_by('-year')
    semesters = Assignment.objects.values_list('semester', flat=True).distinct()
    subjects = Assignment.objects.values_list('subject', flat=True).distinct()

    latest_year = years[0] if years else None

    assignments = Assignment.objects.all()

    # Prepare filtered queryset
    assignments_filtered = assignments
    if class_selected:
        assignments_filtered = assignments_filtered.filter(class_name=class_selected)
    if year_selected:
        assignments_filtered = assignments_filtered.filter(year=year_selected)
    if semester_selected:
        assignments_filtered = assignments_filtered.filter(semester=semester_selected)
    if subject_selected:
        assignments_filtered = assignments_filtered.filter(subject=subject_selected)

    # Latest year assignments (if no filter is applied)
    assignments_latest_year = None
    if not any([class_selected, year_selected, semester_selected, subject_selected]) and latest_year:
        assignments_latest_year = assignments.filter(year=latest_year)

    latest_assignment = assignments_filtered.order_by('-uploaded_at').first()

    return render(request, 'templates/home_assignments.html', {
        'assignments': assignments_filtered,
        'assignments_latest_year': assignments_latest_year,
        'selected_class': class_selected,
        'selected_year': year_selected,
        'selected_semester': semester_selected,
        'selected_subject': subject_selected,
        'years': years,
        'semesters': semesters,
        'subjects': subjects,
        'latest_assignment': latest_assignment,
        'latest_year': latest_year,
    })



def news_events(request):
    news_events = NewsEvent.objects.all().order_by('-news_date')
    links = ImportantLink.objects.all()
    return render(request, 'templates/news_events.html', {
        'news_events': news_events,
        'links': links
    })

def practicals(request):
    return render(request, 'templates/practicals.html')

def question_papers(request):
    class_filter = request.GET.get('class')
    exam_filter = request.GET.get('exam')
    year_filter = request.GET.get('year')

    papers = QuestionPaper.objects.all()

    # ✅ Correct regex: r'(20\d{2})' instead of r'(20\\d{2})'
    import re
    years = set()
    for paper in papers:
        match = re.search(r'(20\d{2})', paper.exam)
        if match:
            years.add(match.group(1))
    years = sorted(years, reverse=True)

    if class_filter:
        papers = papers.filter(class_name=class_filter)
    if exam_filter:
        papers = papers.filter(exam=exam_filter)
    if year_filter:
        papers = papers.filter(exam__icontains=year_filter)

    context = {
        'papers': papers,
        'years': years,
        'selected_year': year_filter,
    }
    return render(request, 'templates/question_papers.html', context)  # Removed 'templates/' prefix here


def syllabus(request):
    syllabi = Syllabus.objects.all().order_by('-uploaded_at')
    return render(request, 'templates/syllabus.html', {'syllabi': syllabi})

def unit_tests(request):
    unit_tests_filtered = []
    unit_tests_latest_year = []
    selected_year = request.GET.get('year')
    selected_class = request.GET.get('class')
    selected_semester = request.GET.get('semester')
    selected_subject = request.GET.get('subject')

    years = UnitTestUpload.objects.values_list('year', flat=True).distinct().order_by('-year')
    latest_year = years[0] if years else None

    # Default: show all unit tests from the latest year
    if not selected_year:
        selected_year = latest_year
        unit_tests_latest_year = UnitTestUpload.objects.filter(year=latest_year)

    # If filters are applied: fetch matching unit tests
    if selected_year and selected_class and selected_semester and selected_subject:
        unit_tests_filtered = UnitTestUpload.objects.filter(
            year=selected_year,
            class_name=selected_class,
            semester=selected_semester,
            subject__iexact=selected_subject
        )

    return render(request, 'templates/unit_tests.html', {
        'unit_tests_filtered': unit_tests_filtered,
        'unit_tests_latest_year': unit_tests_latest_year,
        'selected_year': selected_year,
        'selected_class': selected_class,
        'selected_semester': selected_semester,
        'selected_subject': selected_subject,
        'years': years,
        'latest_year': latest_year,
    })


def upload_unit_test(request):
    latest_unit_test = UnitTestUpload.objects.order_by('-id').first()
    queryset = UnitTestUpload.objects.all()

    if request.method == 'POST':
        class_name = request.POST.get('class')
        year = request.POST.get('year')
        semester = request.POST.get('semester')
        subject = request.POST.get('subject')
        theory_pdf = request.FILES.get('theory_pdf')
        practical_pdf = request.FILES.get('practical_pdf')

        # Upload new file
        if class_name and year and semester and subject and theory_pdf and practical_pdf:
            UnitTestUpload.objects.create(
                class_name=class_name,
                year=year,
                semester=semester,
                subject=subject,
                theory_pdf=theory_pdf,
                practical_pdf=practical_pdf
            )
            messages.success(request, "✅ Unit Test uploaded successfully.")
            return redirect('upload_unit_test')

        # Search filters
        if class_name or year:
            if class_name:
                queryset = queryset.filter(class_name=class_name)
            if year:
                queryset = queryset.filter(year=year)

    context = {
        'latest_unit_test': latest_unit_test,
        'unit_tests': queryset
    }
    return render(request, 'templates/teacher_upload_unit_test.html', context)

def teacher_create_test(request):
    return render(request,'templates/teacher_create_test.html')
