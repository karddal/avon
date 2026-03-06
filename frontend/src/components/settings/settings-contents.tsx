import { KeyRound, Palette, SquareUser } from "lucide-react";
import AccountSettings from "@/components/settings/account-settings";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/new_tabs";

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
      <div className={"w-full p-6"}>
        <TabsContent value={"account"}>
          <AccountSettings user={null} isAdmin={false} settingsPage={true}/>
        </TabsContent>
        <TabsContent value={"password"}></TabsContent>
        <TabsContent value={"notifications"}></TabsContent>
      </div>
    </Tabs>
  );
}
