import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/new_tabs";
import ListMembers from "@/components/management/list-users";
import {KeyRound, Palette, SquareUser} from "lucide-react";
import AccountSettings from "@/components/settings/account-settings";

export default function SettingsContents() {
    const currentUser = null; // TODO: Get current user from session or context
    return (
        <Tabs defaultValue={"account"} orientation={"vertical"}>
            <TabsList variant={"default"}>
                <TabsTrigger value="account">
                    <SquareUser />
                    Account
                </TabsTrigger>
                <TabsTrigger value="notifications">
                    <Palette />
                    Theme
                </TabsTrigger>
            </TabsList>
            <div className={"no-scrollbar max-h-[50vh] w-full overflow-y-auto p-6"}>
                <TabsContent value={"account"}>
                    <AccountSettings user={currentUser}/>
                </TabsContent>
                <TabsContent value={"notifications"}>

                </TabsContent>
            </div>
        </Tabs>
    )
}