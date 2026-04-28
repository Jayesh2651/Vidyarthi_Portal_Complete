from django.db import migrations


def add_missing_columns(apps, schema_editor):
    connection = schema_editor.connection
    targets = {
        "Assignment": ("semester", "subject"),
        "UnitTestUpload": ("semester", "subject"),
    }

    with connection.cursor() as cursor:
        for model_name, field_names in targets.items():
            model = apps.get_model("vp", model_name)
            existing_columns = {
                column.name
                for column in connection.introspection.get_table_description(
                    cursor,
                    model._meta.db_table,
                )
            }

            for field_name in field_names:
                if field_name in existing_columns:
                    continue

                field = model._meta.get_field(field_name)
                field.set_attributes_from_name(field.name)
                schema_editor.add_field(model, field)
                existing_columns.add(field.column)


class Migration(migrations.Migration):
    dependencies = [
        ("vp", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(add_missing_columns, reverse_code=migrations.RunPython.noop),
    ]
