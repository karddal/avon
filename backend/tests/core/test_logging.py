import logging

from app.core.logging import BlockFormatter
from app.core.terminal import BLOCK_LABEL_WIDTH, format_block, format_message, print_block


def _format_record(logger_name: str, message: str = "Started") -> str:
    record = logging.LogRecord(
        name=logger_name,
        level=logging.INFO,
        pathname=__file__,
        lineno=1,
        msg=message,
        args=(),
        exc_info=None,
    )
    return BlockFormatter().format(record)


def test_block_formatter_uses_source_specific_labels_and_colours() -> None:
    assert _format_record("app.db.session") == (
        format_message("backend", "Started", "backend")
    )
    assert _format_record("SQS Worker") == format_message("sqs", "Started", "sqs")
    assert _format_record("provision_worker") == (
        format_message("worker", "Started", "worker")
    )
    assert _format_record("aiobotocore.credentials") == (
        format_message("aws", "Started", "aws")
    )


def test_print_block_outputs_formatted_message(capsys) -> None:
    print_block("debug", "Value loaded")

    assert capsys.readouterr().out.rstrip("\n") == (
        format_message("debug", "Value loaded")
    )


def test_format_block_right_aligns_labels() -> None:
    aws_padding = " " * (BLOCK_LABEL_WIDTH - len("aws"))
    info_padding = " " * (BLOCK_LABEL_WIDTH - len("info"))

    assert format_block("aws", "aws").startswith(f"  {aws_padding}\033[")
    assert "m aws " in format_block("aws", "aws")
    assert format_block("info", "info").startswith(f"  {info_padding}\033[")
    assert "m info " in format_block("info", "info")
    assert format_block("backend", "backend").startswith("  \033[")
    assert "m backend " in format_block("backend", "backend")


def test_format_message_keeps_messages_aligned_without_coloured_padding() -> None:
    aws_message = format_message("aws", "Started", "aws")
    backend_message = format_message("backend", "Started", "backend")

    assert aws_message.index("Started") == backend_message.index("Started")
    assert aws_message.index("\033[") > backend_message.index("\033[")
