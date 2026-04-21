"use client";

import {
  BookDashed,
  BookPlus,
  Gitlab,
  Menu,
  SquarePen,
  SquareX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import ConfigureCWTesting from "@/components/coursework/configure-c-w-testing";
import CreateTemplate from "@/components/coursework/create-templates";
import DeleteCourseworkButton from "@/components/coursework/delete_coursework_button";
import EditCoursework from "@/components/coursework/edit-coursework";
import ProvisionCoursework from "@/components/coursework/provision-coursework";
import ReposListDialog from "@/components/coursework/repos-list-dialog";
import StartTestBatchPopup from "@/components/coursework/start_test_batch";
import TestBatchesDialog from "@/components/coursework/test-batches-list/test-batches-dialog";
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
import type { BaseImage } from "@/lib/actions/coursework/get_base_images_cw_specific";
import type { CourseworkUpdateData } from "@/lib/actions/coursework/get_coursework_update_data";
import type { GetCWEngineDataResponse } from "@/lib/actions/coursework/get_cw_engine_data";
import { Item, ItemContent, ItemMedia, ItemTitle } from "../ui/item";

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
  const [showStartTests, setShowStartTests] = useState(false);
  const [showTestBatches, setShowTestBatches] = useState(false);
  const [viewRepos, setViewRepos] = useState(false);
  const [showProvision, setShowProvision] = useState(false);
  const [_hasProvisionedLocally, setHasProvisionedLocally] = useState(false);

  const router = useRouter();
  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

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

  const engineIsSetup = !(
    cw_engine_data?.base_image_id == null ||
    cw_engine_data?.tester_command == null
  );

  return (
    <div className="aspect-square">
      <DropDrawer>
        <DropDrawerTrigger
          data-cy="coursework-lect-dropdown"
          className="border p-2 hover:bg-accent hover:transition"
        >
          <Menu size={32} />
        </DropDrawerTrigger>
        <DropDrawerContent align={"end"}>
          <DropDrawerLabel>Coursework Options</DropDrawerLabel>
          <DropDrawerSeparator />

          {hasEngineScope && (
            <DropDrawerGroup>
              <DropDrawerLabel>Engine</DropDrawerLabel>
              {!engineIsSetup && (
                <>
                  <Item variant={"outline"} className={"m-2 p-2"}>
                    <ItemMedia variant={"icon"}>
                      <BookPlus />
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
                        <Progress id="progress-engine" value={0} />
                      </FieldContent>
                    </Field>
                  </Item>
                  <DropDrawerItem key={"Engine"} disabled icon={<BookPlus />}>
                    Start test batch
                  </DropDrawerItem>
                  <DropDrawerItem key={"TestRuns"} disabled icon={<Gitlab />}>
                    Test batches
                  </DropDrawerItem>
                </>
              )}
              {engineIsSetup && (
                <>
                  <DropDrawerItem
                    key={"Engine"}
                    icon={<BookPlus />}
                    onSelect={() => setShowStartTests(true)}
                  >
                    Start test batch
                  </DropDrawerItem>
                  <DropDrawerItem
                    key={"TestRuns"}
                    icon={<Gitlab />}
                    onSelect={() => setShowTestBatches(true)}
                  >
                    Test batches
                  </DropDrawerItem>
                </>
              )}
              <DropDrawerItem
                key={"Dockerfiles"}
                icon={<BookPlus />}
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
                  className="[&>div>div:first-child]:pr-3 [&>div>div:first-child]:min-w-0 [&>div>div:first-child]:whitespace-normal"
                  icon={<BookDashed />}
                >
                  Repo template configuration
                </DropDrawerItem>
                <DropDrawerItem
                  key={"Provision-Coursework"}
                  onSelect={() => setShowProvision(true)}
                  disabled={!canProvision}
                  icon={<BookPlus />}
                >
                  Provision student repos
                </DropDrawerItem>
                <DropDrawerItem
                  key={"View-Repos"}
                  icon={<Gitlab />}
                  onSelect={() => setViewRepos(true)}
                >
                  Manage student repos
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
                  data-cy="coursework-edit-menu-item"
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

      {showStartTests &&
        engineIsSetup &&
        cw_engine_data &&
        avail_images_data && (
          <>
            <StartTestBatchPopup
              open_state={showStartTests}
              set_open_state={setShowStartTests}
              courseworkId={slug}
              refresh={refresh}
              cw_engine_data={cw_engine_data}
              available_images={avail_images_data}
            />
          </>
        )}

      {showTestBatches && engineIsSetup && (
        <TestBatchesDialog
          open_state={showTestBatches}
          set_open_state={setShowTestBatches}
          courseworkId={slug}
        />
      )}

      {showDocker && avail_images_data && cw_engine_data && (
        <ConfigureCWTesting
          open_state={showDocker}
          set_open_state={setShowDocker}
          refresh={refresh}
          available_images={avail_images_data}
          cw_engine_data={cw_engine_data}
        />
      )}

      {showEdit && coursework_update_data && (
        <EditCoursework
          coursework_update_data={coursework_update_data}
          open_state={showEdit}
          set_open_state={setShowEdit}
        />
      )}

      {showTemplates && coursework_update_data && (
        <CreateTemplate
          open_state={showTemplates}
          set_open_state={setShowTemplate}
          courseworkGitlabId={coursework_update_data.gitlabId}
          courseworkId={coursework_update_data.id}
          refresh={refresh}
        />
      )}

      {viewRepos && hasGitlabScope && (
        <ReposListDialog
          open_state={viewRepos}
          set_open_state={setViewRepos}
          courseworkId={slug}
          due_date={coursework_update_data?.due_date ?? ""}
          refresh={refresh}
        />
      )}

      {showProvision && coursework_update_data && (
        <ProvisionCoursework
          open_state={showProvision}
          set_open_state={setShowProvision}
          gitlab_data={{
            name: coursework_update_data.name,
            coursework_id: coursework_update_data.id,
            template_id: String(coursework_update_data.templateId),
          }}
          refresh={refresh}
          set_has_provisioned={setHasProvisionedLocally}
        />
      )}

      {showDelete && (
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
              <AlertDialogCancel className="sm:h-full">
                Cancel
              </AlertDialogCancel>
              <DeleteCourseworkButton courseworkId={slug} />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
