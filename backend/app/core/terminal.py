RESET = "\033[0m"
WHITE_TEXT = "97"
BLOCK_INDENT = "  "
BLOCK_LABEL_WIDTH = 7

BLOCK_COLOURS = {
    "aws": "48;5;30",
    "backend": "48;5;24",
    "debug": "48;5;238",
    "info": "48;5;30",
    "sqs": "48;5;54",
    "warning": "48;5;130",
    "error": "48;5;88",
    "critical": "48;5;52",
    "seed": "48;5;22",
    "worker": "48;5;94",
}


def format_block(label: str, colour: str | None = None) -> str:
    colour_name = colour or label.lower()
    background = BLOCK_COLOURS.get(colour_name, BLOCK_COLOURS["info"])
    block_label = label.lower()
    padding = " " * max(BLOCK_LABEL_WIDTH - len(block_label), 0)
    return f"{BLOCK_INDENT}{padding}\033[{background};{WHITE_TEXT}m {block_label} {RESET}"


def format_message(label: str, message: object, colour: str | None = None) -> str:
    return f"{format_block(label, colour)} {message}"


def print_block(label: str, message: object, colour: str | None = None) -> None:
    print(format_message(label, message, colour))
