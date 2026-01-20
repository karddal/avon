# Agile workflows

## Schedule

<div id="calendar"></div>

<link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css" rel="stylesheet">

<style>
.fc-day-today {
  background: inherit !important;
}

.fc-daygrid-day-frame {
 padding: 8px;
  min-height: 110px;
}

.fc-daygrid-event {
  margin-top: 4px;
  padding: 4px 6px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;    
  justify-content: center;
}

.fc-bg-event {
  opacity: 0.35;
}
</style>

<script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',

    height: 'auto',
    aspectRatio: 1.6,
    fixedWeekCount: false,

    eventDisplay: 'block',
    dayMaxEventRows: 3,

    events: [
        {
            title: 'Pre-TB2',
            start: '2026-01-01',
            end: '2026-01-19',
            display: 'background',
            backgroundColor: '#cce5ff'
        },
        {
            title: 'Sprint 1',
            start: '2026-01-19',
            end: '2026-01-26',
            display: 'background',
            backgroundColor: '#d4edda'
        },
        {
            title: 'Sprint 2',
            start: '2026-01-26',
            end: '2026-02-02',
            display: 'background',
            backgroundColor: '#fff3cd'
        },

        {
            title: 'Progress Update',
            start: '2026-01-03',
            url: '/meetings/pre-TB2/03-01-2025-team.html'
        },
        {
            title: 'Retrospective',
            start: '2026-01-08',
            url: '/meetings/pre-TB2/08-01-2025-team.html'
        },
        {
            title: 'Initial Meeting',
            start: '2026-01-19',
            url: '/meetings/sprint1/19-01-2025-team.html'
        },
                {
            title: 'mentor Meeting',
            start: '2026-01-21',
            url: '/meetings/sprint1/21-01-2025-team.html'
        },
                {
            title: 'Retrospective',
            start: '2026-01-23',
            url: '/meetings/sprint1/23-01-2025-team.html'
        },

    ]
  });

  calendar.render();
});
</script>
