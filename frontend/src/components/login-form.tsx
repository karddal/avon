"use client";

import axios from "axios";
import Image from "next/image";
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [actionState, setActionState] = useState<number>(0);

  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    /*async function clicked() {
    setActionState(1);
    console.log("Started mock api call");
    const delay = new Promise((r) => setTimeout(r, 1000));
    await delay;
    setActionState(2);
    const delay2 = new Promise((r) => setTimeout(r, 500));
    await delay2;
    setActionState(0);
    toast.success("Test run started successfully.");
  }*/
    setActionState(1);
    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      console.log(
        process.env.NEXT_PUBLIC_API_URL,
        process.env.NEXT_PUBLIC_CDN_URL,
      );

      const _response = await axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/token`, form, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
        .catch((error) => {
          throw error;
        });

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login failed:", error);
      // alert("Login failed. Please check your credentials and try again.");
      setActionState(2);
      toast.error("Login failed. Check your creds");
      const delay = new Promise((r) => setTimeout(r, 2000));
      await delay;
      setActionState(0);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="drop-shadow-2xl shadow-none border">
        <div className="flex justify-center">
          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/avon-white-optimized.svg`}
            alt="logo"
            width={200}
            height={200}
            className="dark:block hidden"
          />
          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/avon-black-optimized.svg`}
            alt="logo"
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
                    src={`${process.env.NEXT_PUBLIC_CDN_URL}/microsoft.svg`}
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
