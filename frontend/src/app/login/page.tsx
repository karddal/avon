import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  const buildCommit = process.env.NEXT_PUBLIC_BUILD_COMMIT ?? "unknown";
  const buildEnvironment = process.env.NEXT_PUBLIC_APP_ENV ?? "unknown";
  const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE
    ? new Date(process.env.NEXT_PUBLIC_BUILD_DATE).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      })
    : "unknown";

  return (
    <div className="relative min-h-svh w-full flex items-center justify-center p-6 md:p-10">
      <Image
        src={`${process.env.NEXT_PUBLIC_CDN_PATH}/images/campus.jpg`}
        alt="Campus"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
      <div className="bg-card text-card-foreground absolute bottom-4 right-4 rounded-lg border px-3 py-2 shadow-sm">
        <p className="font-mono text-[11px] leading-tight">
          {buildCommit} • {buildEnvironment}
        </p>
        <p className="text-muted-foreground font-mono text-[11px] leading-tight">
          {buildDate} UTC
        </p>
      </div>
    </div>
  );
}
