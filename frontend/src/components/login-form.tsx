"use client";

import axios from "axios";
import Image from "next/image";
import { useState } from "react";
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
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);

      const response = await axios
        .post("http://localhost:8000/auth/token", form, {
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
      alert("Login failed. Please check your credentials and try again.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="drop-shadow-2xl shadow-none border">
        <div className="flex justify-center">
          <Image
            src="/avon.png"
            alt="logo"
            width={200}
            height={200}
            className="dark:block hidden"
          />
          <Image
            src="/avonlight.png"
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
                    src="/microsoft.svg"
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
                <Button type="submit">Login</Button>
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
