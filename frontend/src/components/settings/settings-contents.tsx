import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/new_tabs";
import {KeyRound, Palette, SquareUser} from "lucide-react";

export default function SettingsContents() {
    return (
        <Tabs defaultValue={"account"} orientation={"vertical"}>
            <TabsList variant={"default"}>
                <TabsTrigger value="account">
                    <SquareUser />
                    Account
                </TabsTrigger>
                <TabsTrigger value="password">
                    <KeyRound />
                    Security
                </TabsTrigger>
                <TabsTrigger value="notifications">
                    <Palette />
                    Theme
                </TabsTrigger>
            </TabsList>
            <div className={"no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4"}>
                <TabsContent value={"account"}>
                    Account settings
                </TabsContent>
                <TabsContent value={"password"}>

                </TabsContent>
                <TabsContent value={"notifications"}>

                </TabsContent>
            </div>
        </Tabs>
    )
}