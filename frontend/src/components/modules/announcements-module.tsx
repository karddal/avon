export default function AnnouncementsModule() {
  return (
    <div className="flex h-[14rem] min-h-0 max-h-[17rem] flex-col p-4 sm:h-[15rem] sm:max-h-[18rem] sm:p-5 2xl:h-full 2xl:max-h-none">
      <div className="shrink-0 text-sm font-medium">Announcements</div>
      <div className="mt-2 min-h-0 flex-1 overflow-y-auto">
        <p className="text-sm text-muted-foreground">No new announcements.</p>
      </div>
    </div>
  );
}
