"use server"
import {Bell, BellDot} from "lucide-react";
import {check_any_unread} from "@/lib/actions/check_any_unread";

export default async function NotificationsBellIcon() {
  const has_any_unread = await check_any_unread();
  const any_unread = has_any_unread.have_unread_notifications;
  const bell = (any_unread) ? (<BellDot className="h-[1.2rem] w-[1.2rem] text-red-500"></BellDot>) : (<Bell className="h-[1.2rem] w-[1.2rem]" />)
  return bell
}