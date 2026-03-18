"use client";

import {
  BookCheck,
  BookDashed,
  Container,
  LayersPlus,
  Menu,
  ServerCog,
  SquarePen,
  SquareX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ConfigureCWTesting from "@/components/coursework/configure-c-w-testing";
import DeleteCourseworkButton from "@/components/coursework/delete_coursework_button";
import EditCoursework from "@/components/coursework/edit-coursework";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CourseworkUpdateData } from "@/lib/actions/get_coursework_update_data";
import CreateTemplate from "./create-templates";
import ProvisionCoursework from "./provision-coursework";
import {BaseImage, get_base_images_cw_specific} from "@/lib/actions/get_base_images_cw_specific";
import {GetCWEngineDataResponse} from "@/lib/actions/get_cw_engine_data";
import {Item, ItemContent, ItemMedia, ItemTitle} from "../ui/item";
import {Progress} from "@/components/ui/progress";
import {Field, FieldLabel} from "@/components/ui/field";
import StartTestBatchPopup from "@/components/coursework/start_test_batch";

export default function CourseworkLectDropdown({
  slug,
  scopes,
  coursework_update_data,
    avail_images_data,
    cw_engine_data,
}: {
  slug: string;
  scopes: Set<string>;
  coursework_update_data?: CourseworkUpdateData;
  cw_engine_data?: GetCWEngineDataResponse;
  avail_images_data?: BaseImage[]
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDocker, setShowDocker] = useState(false);
  const [showTemplates, setShowTemplate] = useState(false);
  const [showStartTests, setShowStartTests] = useState<boolean>(false);
  const router = useRouter();
  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);
  const [showProvision, setShowProvision] = useState(false);

  const hasManageScope = scopes.has("unit:coursework_manage");
  const hasGitlabScope = scopes.has("unit:coursework_gitlab");
  const hasEngineScope = scopes.has("unit:coursework_engine");
  const hasDeleteScope = scopes.has("unit:coursework_delete");
  const canEdit = hasManageScope && coursework_update_data;
  const canManageTemplates = hasGitlabScope && coursework_update_data;
  const canProvision =
    hasGitlabScope && coursework_update_data?.templateId != null;
  const hasEntries =
    hasEngineScope || hasManageScope || hasGitlabScope || hasDeleteScope;

  if (!hasEntries) {
    return null;
  }
  console.log("--a-df-asdf0-dsaf")
  console.log(cw_engine_data?.base_image_id)
  const engine_is_setup = !(cw_engine_data?.base_image_id == null || cw_engine_data?.tester_command == null)
  return (
    <div className="aspect-square">
      <DropdownMenu>
        <DropdownMenuTrigger
          data-cy="coursework-lect-dropdown"
          className="border hover:bg-accent hover:transition p-2"
        >
          <Menu size={32} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col">
          <DropdownMenuLabel>Coursework Options</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {hasEngineScope && (
            <>
              <DropdownMenuGroup>
                {(!engine_is_setup) && (
                    <div>
                      <Item variant={"outline"} className={"mb-2"}>
                        <ItemMedia variant={"icon"}>
                          <Container/>
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle>Engine Setup</ItemTitle>
                        </ItemContent>

                        <Field className={"w-full max-w-sm"}>
                          <FieldLabel htmlFor={"progress-engine"}>
                            <span className={"font-normal"}>Configure engine to run tests</span>
                            <span className={"ml-auto"}>0/1</span>
                          </FieldLabel>
                        </Field>
                        <Progress id="progress-engine" value={0}></Progress>
                      </Item>
                      <DropdownMenuItem key={"Engine"} disabled={true}>
                        <ServerCog className="mr-2 h-4 w-4" />
                        Start test batch
                      </DropdownMenuItem>
                    </div>
                )}
                {(engine_is_setup && (
                    <DropdownMenuItem key={"Engine"} disabled={false} onSelect={() => setShowStartTests(true)}>
                      <ServerCog className="mr-2 h-4 w-4" />
                      Start test batch
                    </DropdownMenuItem>
                ))}
                <DropdownMenuItem
                    key={"Dockerfiles"}
                    onSelect={() => setShowDocker(true)}
                >
                  <Container className="mr-2 h-4 w-4" />
                  Configure engine
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}

          {hasManageScope && (
            <>
              {hasEngineScope && <DropdownMenuSeparator />}
              <DropdownMenuGroup>
                <DropdownMenuItem
                    key={"Edit"}
                    onSelect={() => setShowEdit(true)}
                    disabled={!canEdit}
                >
                  <SquarePen className="mr-2 h-4 w-4" />
                  Edit coursework
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}

          {hasGitlabScope && (
            <>
              {(hasEngineScope || hasManageScope) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                key={"Templates"}
                onSelect={() => setShowTemplate(true)}
                disabled={!canManageTemplates}
              >
                <BookDashed className="mr-2 h-4 w-4" />
                Templates
              </DropdownMenuItem>
              <DropdownMenuItem
                key={"Provision-Coursework"}
                onSelect={() => setShowProvision(true)}
                disabled={!canProvision}
              >
                <LayersPlus className="mr-2 h-4 w-4" />
                Provision Coursework
              </DropdownMenuItem>
            </>
          )}

          {hasDeleteScope && (
            <>
              {(hasEngineScope || hasManageScope || hasGitlabScope) && (
                <DropdownMenuSeparator />
              )}
              <DropdownMenuItem
                key={"Delete"}
                onSelect={() => setShowDelete(true)}
                className="text-destructive focus:text-destructive"
              >
                <SquareX className="text-destructive mr-2 h-4 w-4" /> Delete
                coursework
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {engine_is_setup && cw_engine_data && (
          <StartTestBatchPopup open_state={showStartTests} set_open_state={setShowStartTests} courseworkId={slug} refresh={refresh}></StartTestBatchPopup>
      )}
      {avail_images_data && cw_engine_data && (
          <ConfigureCWTesting
              open_state={showDocker}
              set_open_state={setShowDocker}
              refresh={refresh}
              available_images={avail_images_data}
              cw_engine_data={cw_engine_data}
          />
      )}

      {coursework_update_data && (
        <EditCoursework
          coursework_update_data={coursework_update_data}
          open_state={showEdit}
          set_open_state={setShowEdit}
        />
      )}

      {coursework_update_data && (
        <CreateTemplate
          open_state={showTemplates}
          set_open_state={setShowTemplate}
          courseworkGitlabId={coursework_update_data.gitlabId}
          courseworkId={coursework_update_data.id}
          refresh={refresh}
        />
      )}

      {coursework_update_data && (
        <ProvisionCoursework
          open_state={showProvision}
          set_open_state={setShowProvision}
          gitlab_data={{
            name: coursework_update_data.name,
            coursework_id: coursework_update_data.id,
            template_id: String(coursework_update_data.templateId),
          }}
        />
      )}

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              coursework and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-full">Cancel</AlertDialogCancel>
            <DeleteCourseworkButton courseworkId={slug} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
