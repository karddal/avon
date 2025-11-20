import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar";
import {AppSidebar} from "@/components/app-sidebar";
import {ModeToggle} from "@/components/mode-toggle";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 px-4">
                    <ModeToggle />
                    <SidebarTrigger className="-ml-1" />
                    <p className="font-normal text-xl">Create a coursework</p>
                </header>
                <div className="flex flex-1 flex-row gap-4 px-4 sm:justify-center sm:align-center sm:items-center">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    );
}