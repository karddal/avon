import { Palette, SquareUser } from "lucide-react";
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
        {/*Not sure what more settings tabs / pages we need*/}
        <TabsTrigger value="notifications">
          <Palette />
          Theme
        </TabsTrigger>
      </TabsList>
      <div className="w-full p-6 overflow-hidden">
        <TabsContent
          className="w-full p-0 border-none bg-transparent shadow-none overflow-hidden"
          value={"account"}
        >
          <AccountSettings user={null} isAdmin={false} settingsPage={true} />
        </TabsContent>
        <TabsContent value={"notifications"}></TabsContent>
      </div>
    </Tabs>
  );
}
