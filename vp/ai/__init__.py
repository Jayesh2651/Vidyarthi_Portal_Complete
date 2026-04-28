import importlib
import logging
from typing import Any

from .exceptions import AssistantConfigurationError, AssistantRuntimeError


LOGGER = logging.getLogger(__name__)


def _load_assistant_module():
    try:
        return importlib.import_module(".assistant", __name__)
    except AssistantConfigurationError:
        raise
    except Exception as error:  # pragma: no cover - depends on runtime/deploy environment
        LOGGER.exception("Failed to load the AI assistant module.")
        raise AssistantRuntimeError(
            "The AI assistant is temporarily unavailable due to a startup error."
        ) from error


def build_assistant_reply(
    *,
    message: str,
    history: list[dict[str, Any]] | None = None,
    mode: str = "default",
    page_path: str = "",
    page_title: str = "",
) -> dict[str, Any]:
    assistant_module = _load_assistant_module()
    return assistant_module.build_assistant_reply(
        message=message,
        history=history,
        mode=mode,
        page_path=page_path,
        page_title=page_title,
    )


def invalidate_assistant_cache() -> None:
    try:
        assistant_module = _load_assistant_module()
        assistant_module.invalidate_assistant_cache()
    except (AssistantConfigurationError, AssistantRuntimeError) as error:
        LOGGER.warning(
            "Skipping AI cache invalidation because the assistant is unavailable: %s",
            error,
        )


def rebuild_assistant_index() -> None:
    assistant_module = _load_assistant_module()
    assistant_module.rebuild_assistant_index()


__all__ = [
    "AssistantConfigurationError",
    "AssistantRuntimeError",
    "build_assistant_reply",
    "invalidate_assistant_cache",
    "rebuild_assistant_index",
]
