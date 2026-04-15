const SHORT_MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

type ParsedIsoDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function parseIsoDateParts(value: string): ParsedIsoDateParts | null {
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/,
  );

  if (!match) {
    return null;
  }

  return {
    year: Number.parseInt(match[1], 10),
    month: Number.parseInt(match[2], 10),
    day: Number.parseInt(match[3], 10),
    hour: Number.parseInt(match[4] ?? "0", 10),
    minute: Number.parseInt(match[5] ?? "0", 10),
  };
}

export function formatIsoDate(value: string): string {
  const parts = parseIsoDateParts(value);

  if (!parts) {
    return value;
  }

  return `${pad(parts.day)}/${pad(parts.month)}/${parts.year}`;
}

export function formatIsoShortDate(value: string): string {
  const parts = parseIsoDateParts(value);

  if (!parts) {
    return value;
  }

  return `${pad(parts.day)} ${SHORT_MONTH_NAMES[parts.month - 1]} ${pad(parts.year % 100)}`;
}

export function formatIsoTime(value: string): string {
  const parts = parseIsoDateParts(value);

  if (!parts) {
    return value;
  }

  return `${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function formatIsoDateTime(value: string): string {
  const parts = parseIsoDateParts(value);

  if (!parts) {
    return value;
  }

  return `${formatIsoShortDate(value)}, ${pad(parts.hour)}:${pad(parts.minute)}`;
}
