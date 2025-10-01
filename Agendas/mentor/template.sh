#!/bin/bash

TODAY=$(date +%d-%m-%Y)

TEMPLATE="template.md"
OUTPUT="${TODAY}.md"

sed "s/<DATE>/${TODAY}/g" "$TEMPLATE" > "$OUTPUT"

echo "created $OUTPUT from $TEMPLATE"

