import logging

from app.core.settings import settings
from app.core.terminal import format_message


class BlockFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        label = record.levelname
        colour = record.levelname.lower()
        if record.name == "SQS Worker":
            label = "SQS"
            colour = "sqs"
        elif record.name == "provision_worker":
            label = "WORKER"
            colour = "worker"
        elif record.name.startswith("aiobotocore"):
            label = "AWS"
            colour = "aws"
        elif record.name.startswith("app"):
            label = "BACKEND"
            colour = "backend"

        message = format_message(label, record.getMessage(), colour)
        if record.exc_info:
            message = f"{message}\n{self.formatException(record.exc_info)}"
        return message


def configure_logging() -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(BlockFormatter())

    root_logger = logging.getLogger()
    root_logger.handlers = [handler]
    root_logger.setLevel(settings.log_level.upper())

    for logger_name in ("uvicorn", "uvicorn.error", "uvicorn.access", "uvicorn.asgi"):
        logging.getLogger(logger_name).propagate = False
