# Agile workflows

## Sprints
Each week of the term is split into sprints, led by a rotating project manager. A sprint comprises of:
- An initial meeting to assign issues to developers and create issues for tasks that need to be completed. 
- A mentor meeting to discuss the progress so far and discuss any challenges faced
- A Sprint Review meeting to evaluate the undertaken work and merge all remaining pull requests. As well as ensuring that any remaining tasks are assigned for extra work over the weekend.
## Project manager responsibilities
- Lead initial sprint and sprint review meetings
- Document meeting summary and add corresponding links to the schedule
- Assign and create issues
- Ensure equal workload is met
- Create a sprint section in the documentation that summarizes the sprint and organizes all related meeting notes under it.

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

.fc .fc-button {
  font-size: 1.2rem;
}


.fc-toolbar-chunk {
  gap: 6px;
}

h2.fc-toolbar-title {
  font-size: 2.3rem !important;
  font-weight: 600 !important;
  line-height: 1.2 !important;
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
            start: '2026-01-12',
            end: '2026-01-18',
            display: 'background',
            backgroundColor: '#d4edda'
        },
        {
            title: 'Sprint 2',
            start: '2026-01-19',
            end: '2026-01-25',
            display: 'background',
            backgroundColor: '#d4edda'
        },
        {
            title: 'Sprint 3',
            start: '2026-01-26',
            end: '2026-02-01',
            display: 'background',
            backgroundColor: '#fff3cd'
        },
        {
            title: 'Sprint 4',
            start: '2026-02-02',
            end: '2026-02-08',
            display: 'background',
            backgroundColor: '#e6d9f2'
        },
        {
            title: 'Sprint 5',
            start: '2026-02-09',
            end: '2026-02-15',
            display: 'background',
            backgroundColor: '#cce5ff'
        },
        {
            title: 'Sprint 6',
            start: '2026-02-16',
            end: '2026-02-22',
            display: 'background',
            backgroundColor: '#d4edda'
        },
        {
            title: 'Sprint 7',
            start: '2026-02-23',
            end: '2026-03-01',
            display: 'background',
            backgroundColor: '#cce5ff'
        },
        {
            title: 'Progress Update',
            start: '2026-01-03',
            url: '/meetings/pre-TB2/03-01-2025-team.html'
        },
        {
            title: 'Retrospective',
            start: '2026-01-08',
            url: '/meetings/sprint1/08-01-2025-team.html'
        },
        {
            title: 'Initial Meeting',
            start: '2026-01-19',
            url: '/meetings/sprint2/19-01-2025-team.html'
        },
                {
            title: 'Mentor Meeting',
            start: '2026-01-21',
            url: '/meetings/sprint2/21-01-2025-team.html'
        },
                {
            title: 'Sprint Review',
            start: '2026-01-23',
            url: '/meetings/sprint2/23-01-2025-team.html'
        },

    ]
  });

  calendar.render();
});
</script>
