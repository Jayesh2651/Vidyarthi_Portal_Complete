from rest_framework import serializers

from .models import Assignment, ImportantLink, NewsEvent, QuestionPaper, Syllabus, UnitTestUpload


class FileUrlMixin:
    def build_file_url(self, file_field):
        if not file_field:
            return None

        request = self.context.get("request")
        file_url = file_field.url
        return request.build_absolute_uri(file_url) if request else file_url


class AssignmentSerializer(FileUrlMixin, serializers.ModelSerializer):
    class_label = serializers.CharField(source="get_class_name_display", read_only=True)
    year_label = serializers.CharField(source="get_year_display", read_only=True)
    semester_label = serializers.CharField(source="get_semester_display", read_only=True)
    theory_pdf_url = serializers.SerializerMethodField()
    practical_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = [
            "id",
            "class_name",
            "class_label",
            "year",
            "year_label",
            "semester",
            "semester_label",
            "subject",
            "theory_pdf",
            "theory_pdf_url",
            "practical_pdf",
            "practical_pdf_url",
            "uploaded_at",
        ]
        read_only_fields = ["id", "class_label", "year_label", "semester_label", "uploaded_at"]

    def validate(self, attrs):
        if not attrs.get("theory_pdf") and not attrs.get("practical_pdf"):
            raise serializers.ValidationError("Upload at least one assignment PDF.")
        return attrs

    def get_theory_pdf_url(self, obj):
        return self.build_file_url(obj.theory_pdf)

    def get_practical_pdf_url(self, obj):
        return self.build_file_url(obj.practical_pdf)


class SyllabusSerializer(FileUrlMixin, serializers.ModelSerializer):
    class_label = serializers.CharField(source="get_class_name_display", read_only=True)
    year_label = serializers.CharField(source="get_year_display", read_only=True)
    semester_label = serializers.CharField(source="get_semester_display", read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Syllabus
        fields = [
            "id",
            "title",
            "class_name",
            "class_label",
            "subject",
            "year",
            "year_label",
            "semester",
            "semester_label",
            "file",
            "file_url",
            "uploaded_at",
        ]
        read_only_fields = ["id", "class_label", "year_label", "semester_label", "uploaded_at"]

    def get_file_url(self, obj):
        return self.build_file_url(obj.file)


class UnitTestSerializer(FileUrlMixin, serializers.ModelSerializer):
    class_label = serializers.CharField(source="get_class_name_display", read_only=True)
    year_label = serializers.CharField(source="get_year_display", read_only=True)
    semester_label = serializers.CharField(source="get_semester_display", read_only=True)
    theory_pdf_url = serializers.SerializerMethodField()
    practical_pdf_url = serializers.SerializerMethodField()

    class Meta:
        model = UnitTestUpload
        fields = [
            "id",
            "class_name",
            "class_label",
            "year",
            "year_label",
            "semester",
            "semester_label",
            "subject",
            "theory_pdf",
            "theory_pdf_url",
            "practical_pdf",
            "practical_pdf_url",
            "uploaded_at",
        ]
        read_only_fields = ["id", "class_label", "year_label", "semester_label", "uploaded_at"]

    def validate(self, attrs):
        if not attrs.get("theory_pdf") and not attrs.get("practical_pdf"):
            raise serializers.ValidationError("Upload at least one unit test PDF.")
        return attrs

    def get_theory_pdf_url(self, obj):
        return self.build_file_url(obj.theory_pdf)

    def get_practical_pdf_url(self, obj):
        return self.build_file_url(obj.practical_pdf)


class NewsEventSerializer(FileUrlMixin, serializers.ModelSerializer):
    attachment_url = serializers.SerializerMethodField()

    class Meta:
        model = NewsEvent
        fields = [
            "id",
            "news_title",
            "news_date",
            "news_description",
            "attachment",
            "attachment_url",
        ]
        read_only_fields = ["id"]

    def get_attachment_url(self, obj):
        return self.build_file_url(obj.attachment)


class ImportantLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportantLink
        fields = ["id", "link_title", "link_url", "link_description"]
        read_only_fields = ["id"]


class QuestionPaperSerializer(FileUrlMixin, serializers.ModelSerializer):
    class_label = serializers.CharField(source="get_class_name_display", read_only=True)
    semester_label = serializers.CharField(source="get_semester_display", read_only=True)
    pdf_file_url = serializers.SerializerMethodField()

    class Meta:
        model = QuestionPaper
        fields = [
            "id",
            "class_name",
            "class_label",
            "exam",
            "subject",
            "semester",
            "semester_label",
            "upload_date",
            "pdf_file",
            "pdf_file_url",
            "uploaded_at",
        ]
        read_only_fields = ["id", "class_label", "semester_label", "uploaded_at"]

    def get_pdf_file_url(self, obj):
        return self.build_file_url(obj.pdf_file)


class NewsLinksSubmissionSerializer(serializers.Serializer):
    news_title = serializers.CharField(required=False, allow_blank=True)
    news_date = serializers.DateField(required=False)
    news_description = serializers.CharField(required=False, allow_blank=True)
    attachment = serializers.FileField(required=False, allow_null=True)
    link_title = serializers.CharField(required=False, allow_blank=True)
    link_url = serializers.URLField(required=False, allow_blank=True)
    link_description = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        has_news = any(
            attrs.get(field)
            for field in ("news_title", "news_date", "news_description", "attachment")
        )
        has_link = any(attrs.get(field) for field in ("link_title", "link_url", "link_description"))

        if not has_news and not has_link:
            raise serializers.ValidationError("Provide a news item, an important link, or both.")

        if has_news and (not attrs.get("news_title") or not attrs.get("news_date")):
            raise serializers.ValidationError("News entries require a title and date.")

        if has_link and (not attrs.get("link_title") or not attrs.get("link_url")):
            raise serializers.ValidationError("Important links require a title and URL.")

        return attrs

    def create(self, validated_data):
        created = {}

        news_fields = ["news_title", "news_date", "news_description", "attachment"]
        link_fields = ["link_title", "link_url", "link_description"]

        news_payload = {
            key: validated_data.get(key)
            for key in news_fields
            if validated_data.get(key) not in (None, "")
        }
        link_payload = {
            key: validated_data.get(key)
            for key in link_fields
            if validated_data.get(key) not in (None, "")
        }

        if news_payload:
            created["news_event"] = NewsEvent.objects.create(**news_payload)

        if link_payload:
            created["important_link"] = ImportantLink.objects.create(**link_payload)

        return created
