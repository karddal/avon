type CourseworkDeadlineBannerProps = {
  deadline: Date | string;
  warningThreshold?: number;
  className?: string;
};

export function CourseworkDeadlineBanner({
  deadline,
  warningThreshold = 3,
  className = "",
}: CourseworkDeadlineBannerProps) {
  const deadlineDate = new Date(deadline);
  const now = new Date();

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / msPerDay,
  );

  const isOverdue = daysLeft < 0;
  const isDueToday = daysLeft === 0;
  const isClose = daysLeft > 0 && daysLeft <= warningThreshold;

  if (!isOverdue && !isDueToday && !isClose) {
    return null;
  }

  let text = "";
  let styles = "";

  if (isOverdue) {
    const overdueDays = Math.abs(daysLeft);
    text = `Coursework overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}!`;
    styles = [
      "border-red-200 bg-red-50 text-red-700",
      "dark:border-red-900 dark:bg-red-950/60 dark:text-red-200",
    ].join(" ");
  } else if (isDueToday) {
    text = "Coursework due today!";
    styles = [
      "border-orange-200 bg-orange-50 text-orange-700",
      "dark:border-orange-900 dark:bg-orange-950/60 dark:text-orange-200",
    ].join(" ");
  } else {
    text = `Coursework due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}!`;
    styles = [
      "border-amber-200 bg-amber-50 text-amber-700",
      "dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-200",
    ].join(" ");
  }

  return (
    <div
      className={[
        "w-full rounded-md border py-2 text-center text-sm font-black",
        styles,
        className,
      ].join(" ")}
    >
      {text}
    </div>
  );
}

type CourseworkDeadlineBannerData = {
  due_date: string;
};

export async function CourseworkDeadlineBannerFromSlug({
  slug,
  token,
  warningThreshold = 3,
  className = "",
}: {
  slug: string;
  token?: string;
  warningThreshold?: number;
  className?: string;
}) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/coursework/${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );

  if (!res.ok) {
    return null;
  }

  const coursework: CourseworkDeadlineBannerData = await res.json();

  return (
    <CourseworkDeadlineBanner
      deadline={coursework.due_date}
      warningThreshold={warningThreshold}
      className={className}
    />
  );
}
