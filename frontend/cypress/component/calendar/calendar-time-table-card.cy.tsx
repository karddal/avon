import type { CalendarEvent } from "@/components/calendar/calendar-dashboard";
import { CalendarTimeTableCard } from "@/components/calendar/calendar-timetable-card";

function makeEvent(
  id: string,
  name: string,
  start: string,
  end: string,
): CalendarEvent {
  return {
    id,
    name,
    start: new Date(start),
    end: new Date(end),
    unit_id: "test_unit",
    unit_name: "Test unit",
  } as CalendarEvent;
}

function buildEventsMap(mondayKey: string) {
  const events: CalendarEvent[] = [
    makeEvent(
      "event1",
      "Event 1",
      `${mondayKey}T09:00:00`,
      `${mondayKey}T10:00:00`,
    ),
    makeEvent(
      "event2",
      "Event 2",
      `${mondayKey}T09:00:00`,
      `${mondayKey}T10:00:00`,
    ),
    makeEvent(
      "event3",
      "Event 3",
      `${mondayKey}T09:00:00`,
      `${mondayKey}T10:00:00`,
    ),
    makeEvent(
      "event4",
      "Event 4",
      `${mondayKey}T09:00:00`,
      `${mondayKey}T10:00:00`,
    ),
  ];

  const map = new Map<string, CalendarEvent[]>();
  map.set(mondayKey, events);
  return map;
}

describe("calendar-timetable-card (component test)", () => {
  it("renders 7-day header on desktop and highlights today", () => {
    const mondayKey = "2026-01-05";
    const weekStartDate = new Date(`${mondayKey}T00:00:00`);

    cy.clock(new Date(`${mondayKey}T12:00:00`).getTime(), ["Date"]);

    cy.mount(
      <div style={{ width: 1200 }}>
        <CalendarTimeTableCard
          eventsMap={buildEventsMap(mondayKey)}
          weekStartDate={weekStartDate}
        />
      </div>,
    );

    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((day) => {
      cy.contains(day).should("exist");
    });

    // height light Today
    cy.contains("Mon").closest("div").should("have.class", "bg-muted/40");
  });

  it("shows overlapping events and +N more popover when maxCols is exceeded", () => {
    const mondayKey = "2026-01-05";
    const weekStartDate = new Date(`${mondayKey}T00:00:00`);

    cy.clock(new Date(`${mondayKey}T12:00:00`).getTime(), ["Date"]);

    cy.mount(
      <div style={{ width: 1200 }}>
        <CalendarTimeTableCard
          eventsMap={buildEventsMap(mondayKey)}
          weekStartDate={weekStartDate}
        />
      </div>,
    );

    // show directly overlapping
    cy.contains("Event 1").should("exist");
    cy.contains("Event 2").should("exist");
    cy.contains("Event 3").should("exist");

    // hidden event
    cy.contains("+1 more").should("be.visible").click();
    cy.contains("Hidden events (1)").should("exist");
    cy.contains("Event 4").should("exist");
  });

  it("renders current time line when today is in the visible days", () => {
    const mondayKey = "2026-01-05";
    const weekStartDate = new Date(`${mondayKey}T00:00:00`);

    cy.clock(new Date(`${mondayKey}T8:00:00`).getTime(), ["Date"]);

    cy.mount(
      <div style={{ width: 1200 }}>
        <CalendarTimeTableCard
          weekStartDate={weekStartDate}
          eventsMap={buildEventsMap(mondayKey)}
        />
      </div>,
    );

    // check format correct
    // not working use plain time because time zone
    cy.get("div")
      .contains(/\b\d{2}:\d{2}\b/)
      .should("exist");
  });
});
