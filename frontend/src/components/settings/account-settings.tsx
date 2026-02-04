import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item";
import { getInitials } from "@/components/user-card";
import { requireSession } from "@/lib/auth-utils";

export default async function AccountSettings() {
  const s = await requireSession();
  const i = s.user.image ? s.user.image : "";
  return (
    <div className={"w-full"}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Preview</p>
          <Item variant={"outline"} className={"w-full"}>
            <ItemMedia>
              <Avatar className={"size-10"}>
                <AvatarImage src={i}></AvatarImage>
                <AvatarFallback>{getInitials(s.user.name)}</AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent className={"w-full"}>
              <ItemTitle>{s.user.name}</ItemTitle>
            </ItemContent>
          </Item>
        </CardContent>
      </Card>
    </div>
  );
}
