import { redirect } from "next/navigation";

export default function Home() {
  return (
    // <div>current pages /login /units and /units/unitcode /courseworks</div>
    redirect("/login")
  );
}
