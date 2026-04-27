from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("vp", "0015_assignment_semester_assignment_subject"),
    ]

    operations = [
        migrations.AlterField(
            model_name="assignment",
            name="practical_pdf",
            field=models.FileField(blank=True, upload_to="assignments/practical/"),
        ),
        migrations.AlterField(
            model_name="assignment",
            name="theory_pdf",
            field=models.FileField(blank=True, upload_to="assignments/theory/"),
        ),
        migrations.AlterField(
            model_name="unittestupload",
            name="practical_pdf",
            field=models.FileField(blank=True, upload_to="unit_tests/practical/"),
        ),
        migrations.AlterField(
            model_name="unittestupload",
            name="semester",
            field=models.CharField(
                choices=[
                    ("sem1", "Semester 1"),
                    ("sem2", "Semester 2"),
                    ("sem3", "Semester 3"),
                    ("sem4", "Semester 4"),
                    ("sem5", "Semester 5"),
                    ("sem6", "Semester 6"),
                ],
                default="sem1",
                max_length=10,
            ),
        ),
        migrations.AlterField(
            model_name="unittestupload",
            name="theory_pdf",
            field=models.FileField(blank=True, upload_to="unit_tests/theory/"),
        ),
    ]
