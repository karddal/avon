import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
          <form>
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
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="rounded-none"
                />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center flex flex-row justify-center gap-4">
                  <a href="#">Contact Us</a>
                  <a href="#">Privacy Statement</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
