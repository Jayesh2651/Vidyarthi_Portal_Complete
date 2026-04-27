from django.core.management.base import BaseCommand

from vp.ai import rebuild_assistant_index


class Command(BaseCommand):
    help = "Rebuild the Vidyarthi Mitra AI assistant vector index."

    def handle(self, *args, **options):
        rebuild_assistant_index()
        self.stdout.write(self.style.SUCCESS("AI assistant vector index rebuilt successfully."))
