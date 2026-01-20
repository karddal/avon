# Agile workflows

## Schedule

<div id="calendar"></div>

<link href="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.css" rel="stylesheet">

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

  });

  calendar.render();
});
</script>
