#!/bin/bash

TODAY=$(date +%d-%m-%Y)
NEXT=$(date -v+7d +%d-%m-%Y)

TEMPLATE="template.md"
OUTPUT="${TODAY}.md"

sed -e "s/<DATE>/${TODAY}/g" -e "s/<NEXTDATE>/${NEXT}/g" "$TEMPLATE" > "$OUTPUT"

echo "created $OUTPUT from $TEMPLATE"
echo "Date: $TODAY"
echo "Next meeting: $NEXT"

