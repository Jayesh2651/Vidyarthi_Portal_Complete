from django.db import models
from django.utils import timezone


CLASS_CHOICES = [
    ('fy', 'FY'),
    ('sy', 'SY'),
    ('ty', 'TY'),
]

YEAR_CHOICES = [
    ('2022', '2022-23'),
    ('2023', '2023-24'),
    ('2024', '2024-25'),
    ('2025', '2025-26'),
]

SEMESTER_CHOICES = [
    ('sem1', 'Semester 1'),
    ('sem2', 'Semester 2'),
    ('sem3', 'Semester 3'),
    ('sem4', 'Semester 4'),
    ('sem5', 'Semester 5'),
    ('sem6', 'Semester 6'),
]

class Assignment(models.Model):
    CLASS_CHOICES = CLASS_CHOICES
    YEAR_CHOICES = YEAR_CHOICES
    SEMESTER_CHOICES = SEMESTER_CHOICES

    class_name = models.CharField(max_length=10, choices=CLASS_CHOICES)
    year = models.CharField(max_length=10, choices=YEAR_CHOICES)
    semester = models.CharField(max_length=10, choices=SEMESTER_CHOICES,default='sem1')
    subject = models.CharField(max_length=100,default='Unknown')
    theory_pdf = models.FileField(upload_to='assignments/theory/', blank=True, max_length=2048)
    practical_pdf = models.FileField(upload_to='assignments/practical/', blank=True, max_length=2048)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.class_name.upper()} - {self.year} - {self.semester} - {self.subject}"


class Syllabus(models.Model):
    CLASS_CHOICES = [
        ('FY', 'FY'),
        ('SY', 'SY'),
        ('TY', 'TY'),
    ]

    YEAR_CHOICES = [
        ('2022', '2022-23'),
        ('2023', '2023-24'),
        ('2024', '2024-25'),
        ('2025', '2025-26'),
    ]

    SEM_CHOICES = [
        ('sem1', 'Semester 1'),
        ('sem2', 'Semester 2'),
        ('sem3', 'Semester 3'),
        ('sem4', 'Semester 4'),
        ('sem5', 'Semester 5'),
        ('sem6', 'Semester 6'),
    ]

    title = models.CharField(max_length=255)
    class_name = models.CharField(max_length=2, choices=CLASS_CHOICES)
    subject = models.CharField(max_length=100)
    year = models.CharField(max_length=4, choices=YEAR_CHOICES)
    semester = models.CharField(max_length=10, choices=SEM_CHOICES, default='sem1')
    file = models.FileField(upload_to='syllabus_files/', max_length=2048)
    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.class_name} - {self.subject} ({self.year}) - {self.semester.upper()}"
    
class UnitTestUpload(models.Model):
    CLASS_CHOICES = [
        ('fy', 'FY'),
        ('sy', 'SY'),
        ('ty', 'TY'),
    ]

    YEAR_CHOICES = [(str(y), str(y)) for y in range(2022, 2026)]
    SEM_CHOICES = [
        ('sem1', 'Semester 1'),
        ('sem2', 'Semester 2'),
        ('sem3', 'Semester 3'),
        ('sem4', 'Semester 4'),
        ('sem5', 'Semester 5'),
        ('sem6', 'Semester 6'),
    ]

    class_name = models.CharField(max_length=10, choices=CLASS_CHOICES)
    year = models.CharField(max_length=4, choices=YEAR_CHOICES)
    semester = models.CharField(max_length=10, choices=SEM_CHOICES, default='sem1')
    subject = models.CharField(max_length=100,default="Maths")

    theory_pdf = models.FileField(upload_to='unit_tests/theory/', blank=True, max_length=2048)
    practical_pdf = models.FileField(upload_to='unit_tests/practical/', blank=True, max_length=2048)
    uploaded_at = models.DateTimeField(auto_now_add=True)



    def __str__(self):
        return f"{self.class_name.upper()} - {self.year} - {self.semester.upper()} - {self.subject}"

    
class NewsEvent(models.Model):
    news_title = models.CharField(max_length=255)
    news_date = models.DateField()
    news_description = models.TextField()
    attachment = models.FileField(upload_to='news_files/', blank=True, null=True, max_length=2048)

    def __str__(self):
        return self.news_title

class ImportantLink(models.Model):
    link_title = models.CharField(max_length=255)
    link_url = models.URLField()
    link_description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.link_title
    
class QuestionPaper(models.Model):
    CLASS_CHOICES = [
        ('fy', 'First Year'),
        ('sy', 'Second Year'),
        ('ty', 'Third Year'),
    ]

    EXAM_CHOICES = [
        ('Oct/Nov 2023', 'Oct/Nov 2023'),
        ('March/April 2024', 'March/April 2024'),
        ('Oct/Nov 2024', 'Oct/Nov 2024'),
        ('March/April 2025', 'March/April 2025'),
    ]

    SEM_CHOICES = [
        ('sem1', 'Semester 1'),
        ('sem2', 'Semester 2'),
        ('sem3', 'Semester 3'),
        ('sem4', 'Semester 4'),
        ('sem5', 'Semester 5'),
        ('sem6', 'Semester 6'),
    ]

    class_name = models.CharField(max_length=2, choices=CLASS_CHOICES)
    exam = models.CharField(max_length=100, default='Midterm')
    subject = models.CharField(max_length=100)
    semester = models.CharField(max_length=10, choices=SEM_CHOICES, default='sem1')
    upload_date = models.DateField()
    pdf_file = models.FileField(upload_to='question_papers/', max_length=2048)
    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.class_name.upper()} - {self.subject} ({self.exam}) - {self.semester.upper()}"
