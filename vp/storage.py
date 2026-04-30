from __future__ import annotations

import os
from typing import Any

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.files import File
from django.core.files.base import ContentFile
from django.core.files.storage import FileSystemStorage, Storage
from django.core.files.utils import validate_file_name
from django.utils.deconstruct import deconstructible


@deconstructible
class MediaStorage(Storage):
    """Use local media files by default and Vercel Blob for runtime uploads."""

    def __init__(self) -> None:
        super().__init__()
        self.local_storage = FileSystemStorage(
            location=settings.MEDIA_ROOT,
            base_url=settings.MEDIA_URL,
        )

    @staticmethod
    def _is_blob_name(name: str | None) -> bool:
        return bool(name) and name.startswith(("http://", "https://"))

    @staticmethod
    def _is_vercel_runtime() -> bool:
        return any(
            os.getenv(key)
            for key in ("VERCEL", "VERCEL_ENV", "VERCEL_URL", "VERCEL_PROJECT_PRODUCTION_URL")
        )

    @property
    def blob_token(self) -> str:
        return os.getenv("BLOB_READ_WRITE_TOKEN", "").strip()

    @property
    def blob_access(self) -> str:
        configured_access = os.getenv("VERCEL_BLOB_ACCESS", "public").strip().lower()
        return configured_access if configured_access in {"public", "private"} else "public"

    def _blob_sdk(self) -> dict[str, Any]:
        try:
            from vercel.blob import delete, get, head, put
            from vercel.blob.errors import BlobError, BlobNotFoundError
        except ImportError as exc:  # pragma: no cover - depends on deployment deps
            raise ImproperlyConfigured(
                "Install the `vercel` package to enable Vercel Blob media storage."
            ) from exc

        return {
            "put": put,
            "get": get,
            "head": head,
            "delete": delete,
            "BlobError": BlobError,
            "BlobNotFoundError": BlobNotFoundError,
        }

    def _require_blob_uploads(self) -> dict[str, Any]:
        if self.blob_token:
            return self._blob_sdk()

        if self._is_vercel_runtime():
            raise ImproperlyConfigured(
                "BLOB_READ_WRITE_TOKEN is required on Vercel for file uploads. "
                "Create a Blob store for the project and expose the token to the deployment."
            )

        return {}

    def save(self, name, content, max_length=None):
        if name is None:
            name = content.name

        if not hasattr(content, "chunks"):
            content = File(content, name)

        validate_file_name(name, allow_relative_path=True)
        name = self.get_available_name(name, max_length=max_length)
        validate_file_name(name, allow_relative_path=True)

        saved_name = self._save(name, content)
        if not self._is_blob_name(saved_name):
            validate_file_name(saved_name, allow_relative_path=True)
        return saved_name

    def _save(self, name, content):
        blob_sdk = self._require_blob_uploads()
        if not blob_sdk:
            return self.local_storage._save(name, content)

        if hasattr(content, "seek"):
            content.seek(0)

        uploaded = blob_sdk["put"](
            name,
            content,
            access=self.blob_access,
            content_type=getattr(content, "content_type", None),
            add_random_suffix=True,
            token=self.blob_token,
        )
        return uploaded.url

    def _open(self, name, mode="rb"):
        if self._is_blob_name(name):
            blob_sdk = self._blob_sdk()
            blob = blob_sdk["get"](
                name,
                access=self.blob_access,
                token=self.blob_token or None,
            )
            return ContentFile(blob.content, name=name)

        return self.local_storage._open(name, mode)

    def delete(self, name):
        if not name:
            return

        if self._is_blob_name(name):
            blob_sdk = self._blob_sdk()
            blob_sdk["delete"](name, token=self.blob_token or None)
            return

        self.local_storage.delete(name)

    def exists(self, name):
        if not name:
            return False

        if self._is_blob_name(name):
            blob_sdk = self._blob_sdk()
            try:
                blob_sdk["head"](name, token=self.blob_token or None)
                return True
            except blob_sdk["BlobNotFoundError"]:
                return False

        return self.local_storage.exists(name)

    def size(self, name):
        if self._is_blob_name(name):
            blob_sdk = self._blob_sdk()
            return blob_sdk["head"](name, token=self.blob_token or None).size

        return self.local_storage.size(name)

    def url(self, name):
        if self._is_blob_name(name):
            return name

        return self.local_storage.url(name)

    def path(self, name):
        if self._is_blob_name(name):
            raise NotImplementedError("Blob-backed media files do not have a local filesystem path.")

        return self.local_storage.path(name)
