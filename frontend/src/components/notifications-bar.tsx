import { Bell } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import NotificationMessage from "./notification-message";

export default function NotificationBar() {
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger className="mx-2 hover:cursor-pointer">
                    <Bell size={20} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mx-5">
                    <DropdownMenuItem className="w-128">
                        <NotificationMessage />
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}