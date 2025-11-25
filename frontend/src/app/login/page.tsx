import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="relative min-h-svh w-full flex items-center justify-center p-6 md:p-10">
      <Image
        src={`${process.env.NEXT_PUBLIC_CDN_URL}/campus.jpg`}
        alt="Campus"
        fill
        className="object-cover -z-10"
        priority
      />
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
