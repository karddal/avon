"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import LoginButton from "@/components/ui/login-button";
import { cn } from "@/lib/utils";

import { signIn, SignInData } from "@/lib/actions/login";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [actionState, setActionState] = useState<number>(0);

  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setActionState(1);
    const data: SignInData = {
      email: email,
      password: password,
    };
    try {
      let response = await signIn(data);
      router.push(response.redirect);
    } catch (error) {
      setActionState(2);
      toast.error("Login failed, please check your credentials.");
      const delay = new Promise((r) => setTimeout(r, 2000));
      await delay;
      setActionState(0);
    }
    // if (isLecturer) {
    //   router.push("/dashboard");
    // } else {
    //   router.push("/units");
    // }

    // await axios
    //   .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/token`, form, {
    //     withCredentials: true,
    //     headers: {
    //       "Content-Type": "application/x-www-form-urlencoded",
    //     },
    //   })
    //   .catch((error) => {
    //     throw error;
    //   });
    //
    // const verifyResp = await axios.get(
    //   `${process.env.NEXT_PUBLIC_API_URL}/auth/verify`,
    //   {
    //     withCredentials: true,
    //   },
    // );
    //
    // const isLecturer = verifyResp.data.is_lecturer;
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="drop-shadow-2xl shadow-none border">
        <div className="flex justify-center">
          <Image
            src={`/images/avon-white-optimized.svg`}
            alt="logo"
            loading="eager"
            width={200}
            height={200}
            className="dark:block hidden"
          />
          <Image
            src={`/images/avon-black-optimized.svg`}
            alt="logo"
            loading="eager"
            width={200}
            height={200}
            className="dark:hidden "
          />
        </div>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  className="hover:cursor-pointer"
                >
                  <Image
                    width={15}
                    height={15}
                    src={`/images/microsoft.svg`}
                    alt="microsoft logo"
                  />
                  Login with Microsoft
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  className="rounded-none"
                  id="email"
                  type="email"
                  placeholder="user@bristol.ac.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="/login"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-none"
                />
              </Field>
              <Field>
                <LoginButton
                  props={{
                    actionState: actionState,
                    setActionState: setActionState,
                  }}
                />
                <FieldDescription className="text-center flex flex-row justify-center gap-4">
                  <a href="/login">Contact Us</a>
                  <a href="/login">Privacy Statement</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
