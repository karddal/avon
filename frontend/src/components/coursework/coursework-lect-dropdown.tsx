"use client";

import {
  BookDashed,
  Container, Gitlab, GitlabIcon,
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
import StartTestBatchPopup from "@/components/coursework/start_test_batch";
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
  DropDrawer,
  DropDrawerContent,
  DropDrawerGroup,
  DropDrawerItem,
  DropDrawerLabel,
  DropDrawerSeparator,
  DropDrawerTrigger,
} from "@/components/ui/dropdrawer";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import type { BaseImage } from "@/lib/actions/get_base_images_cw_specific";
import type { CourseworkUpdateData } from "@/lib/actions/get_coursework_update_data";
import type { GetCWEngineDataResponse } from "@/lib/actions/get_cw_engine_data";
import { Item, ItemContent, ItemMedia, ItemTitle } from "../ui/item";
import CreateTemplate from "./create-templates";
import ProvisionCoursework from "./provision-coursework";
import ReposListDialog from "@/components/coursework/repos-list-dialog";

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
  avail_images_data?: BaseImage[];
}) {
  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDocker, setShowDocker] = useState(false);
  const [showTemplates, setShowTemplate] = useState(false);
  const [showStartTests, setShowStartTests] = useState<boolean>(false);
  const [viewRepos, setViewRepos] = useState<boolean>(false);
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
  console.log(cw_engine_data?.base_image_id);
  const engine_is_setup = !(
    cw_engine_data?.base_image_id == null ||
    cw_engine_data?.tester_command == null
  );
  return (
    <div className="aspect-square">
      <DropDrawer>
        <DropDrawerTrigger
          data-cy="coursework-lect-dropdown"
          className="border hover:bg-accent hover:transition p-2"
        >
          <Menu size={32} />
        </DropDrawerTrigger>
        <DropDrawerContent className="" align={"end"}>
          <DropDrawerLabel>Coursework Options</DropDrawerLabel>
          <DropDrawerSeparator />

          {hasEngineScope && (
            <DropDrawerGroup>
              <DropDrawerLabel>Engine</DropDrawerLabel>
              {!engine_is_setup && (
                <>
                  <Item variant={"outline"} className={"p-2 m-2"}>
                    <ItemMedia variant={"icon"}>
                      <Container />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>Engine Setup</ItemTitle>
                    </ItemContent>

                    <Field className={"p-2"}>
                      <FieldLabel htmlFor={"progress-engine"}>
                        <span className={"font-normal"}>
                          Configure the Avon Engine to enable test running.
                        </span>
                      </FieldLabel>
                      <FieldContent>
                        <Progress id="progress-engine" value={0}></Progress>
                      </FieldContent>
                    </Field>
                  </Item>
                  <DropDrawerItem
                    key={"Engine"}
                    disabled={true}
                    icon={<ServerCog />}
                  >
                    Start test batch
                  </DropDrawerItem>
                </>
              )}
              {engine_is_setup && (
                <DropDrawerItem
                  key={"Engine"}
                  icon={<ServerCog />}
                  disabled={false}
                  onSelect={() => setShowStartTests(true)}
                >
                  Start test batch
                </DropDrawerItem>
              )}
              <DropDrawerItem
                key={"Dockerfiles"}
                icon={<Container />}
                onSelect={() => setShowDocker(true)}
              >
                Configure engine
              </DropDrawerItem>
            </DropDrawerGroup>
          )}

          {hasGitlabScope && (
            <>
              {(hasEngineScope || hasManageScope) && <DropDrawerSeparator />}
              <DropDrawerGroup>
                <DropDrawerLabel>GitLab</DropDrawerLabel>
                <DropDrawerItem
                  key={"Templates"}
                  onSelect={() => setShowTemplate(true)}
                  disabled={!canManageTemplates}
                  icon={<BookDashed />}
                >
                  Repo template configuration
                </DropDrawerItem>
                <DropDrawerItem
                  key={"Provision-Coursework"}
                  onSelect={() => setShowProvision(true)}
                  disabled={!canProvision}
                  icon={<LayersPlus />}
                >
                  Provision student repos
                </DropDrawerItem>
                <DropDrawerItem
                  key={"View-Repos"}
                  icon={<Gitlab/>}
                  onSelect={() => setViewRepos(true)}
                >
                  View student repos
                </DropDrawerItem>
              </DropDrawerGroup>
            </>
          )}

          {hasManageScope && (
            <>
              {hasEngineScope && <DropDrawerSeparator />}
              <DropDrawerGroup>
                <DropDrawerLabel>Manage</DropDrawerLabel>
                <DropDrawerItem
                  key={"Edit"}
                  onSelect={() => setShowEdit(true)}
                  disabled={!canEdit}
                  icon={<SquarePen />}
                >
                  Edit coursework
                </DropDrawerItem>
              </DropDrawerGroup>
            </>
          )}

          {hasDeleteScope && (
            <>
              {(hasEngineScope || hasManageScope || hasGitlabScope) && (
                <DropDrawerSeparator />
              )}
              <DropDrawerGroup>
                <DropDrawerLabel>Destructive options</DropDrawerLabel>
                <DropDrawerItem
                  key={"Delete"}
                  onSelect={() => setShowDelete(true)}
                  className="text-destructive focus:text-destructive"
                  icon={<SquareX className={"text-destructive"} />}
                >
                  Delete coursework
                </DropDrawerItem>
              </DropDrawerGroup>
            </>
          )}
        </DropDrawerContent>
      </DropDrawer>

      {engine_is_setup && cw_engine_data && avail_images_data && (
        <StartTestBatchPopup
          open_state={showStartTests}
          set_open_state={setShowStartTests}
          courseworkId={slug}
          refresh={refresh}
          cw_engine_data={cw_engine_data}
          available_images={avail_images_data}
        ></StartTestBatchPopup>
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

      {hasGitlabScope && (
          <ReposListDialog open_state={viewRepos} set_open_state={setViewRepos} courseworkId={slug} refresh={refresh}></ReposListDialog>
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
          refresh={refresh}
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
            <AlertDialogCancel className="sm:h-full">Cancel</AlertDialogCancel>
            <DeleteCourseworkButton courseworkId={slug} />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
