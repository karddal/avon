import { format, formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Bell,
  BellOff,
  Calendar,
  CheckCircle2,
  Clock,
  Copy, Download, File,
  GitBranch,
  Loader2,
  RefreshCw, Scroll,
  ScrollText,
  Terminal,
  User,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";
import {
  get_test_run_for_cw,
  type TestRunFullDetails,
} from "@/lib/actions/test_run/cw-get-specific-test-run";
import { cn } from "@/lib/utils";
import {Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle} from "@/components/ui/empty";

export default function TestRunComponent({
  test_run_id,
  coursework_id,
}: {
  test_run_id: string;
  coursework_id: string;
}) {
  const AUTO_REFRESH_SECONDS = 10;
  const [data, setData] = useState<TestRunFullDetails>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(false);
  const [isManualRefreshing, setIsManualRefreshing] = useState<boolean>(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [logsBlob, setLogsBlob] = useState<Blob>();
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number | null>(
    null,
  );
  const [liveNow, setLiveNow] = useState<number>(Date.now());
  const refreshInFlight = useRef(false);

  const updateData = useCallback(
    async (mode: "initial" | "auto" | "manual") => {
      if (refreshInFlight.current) {
        return;
      }

      refreshInFlight.current = true;
      if (mode === "initial") setLoading(true);
      if (mode === "auto") setIsAutoRefreshing(true);
      if (mode === "manual") setIsManualRefreshing(true);

      try {
        const updatedData = await get_test_run_for_cw({
          run_id: test_run_id,
          cw_id: coursework_id,
        });
        setData(updatedData);
        if (updatedData.log_text) {
          const blob = new Blob([updatedData.log_text], { type: 'text/plain' });
          setLogsBlob(blob);
        }
        setLastRefreshedAt(new Date());
      } catch (_error) {
        toast.error("Failed to refresh test run data");
      } finally {
        if (mode === "initial") setLoading(false);
        if (mode === "auto") setIsAutoRefreshing(false);
        if (mode === "manual") setIsManualRefreshing(false);
        refreshInFlight.current = false;
      }
    },
    [coursework_id, test_run_id],
  );

  useEffect(() => {
    void updateData("initial");
  }, [updateData]);

  useEffect(() => {
    if (
      !data ||
      !["pending", "running"].includes(data.status) ||
      !autoRefreshEnabled
    ) {
      setSecondsUntilRefresh(null);
      return;
    }

    setSecondsUntilRefresh(AUTO_REFRESH_SECONDS);

    const interval = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev === null) {
          return AUTO_REFRESH_SECONDS;
        }
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.status, autoRefreshEnabled, data]);

  useEffect(() => {
    if (
      !data ||
      !["pending", "running"].includes(data.status) ||
      !autoRefreshEnabled
    ) {
      return;
    }
    if (secondsUntilRefresh === null || secondsUntilRefresh > 0) {
      return;
    }

    setSecondsUntilRefresh(AUTO_REFRESH_SECONDS);
    void updateData("auto");
  }, [data?.status, autoRefreshEnabled, secondsUntilRefresh, updateData, data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          variant: "secondary" as const,
          color: "text-muted-foreground",
        };
      case "running":
        return {
          icon: Loader2,
          label: "Running",
          variant: "default" as const,
          color: "text-blue-500",
          animate: true,
        };
      case "succeeded":
        return {
          icon: CheckCircle2,
          label: "Succeeded",
          variant: "default" as const,
          color: "text-green-500",
        };
      case "failed":
        return {
          icon: XCircle,
          label: "Failed",
          variant: "destructive" as const,
          color: "text-destructive",
        };
      case "error":
        return {
          icon: AlertCircle,
          label: "Error",
          variant: "destructive" as const,
          color: "text-destructive",
        };
      default:
        return {
          icon: AlertCircle,
          label: "Unknown",
          variant: "secondary" as const,
          color: "text-muted-foreground",
        };
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case "initial":
        return "Initial Run";
      case "retry":
        return "Retry";
      case "manual_rerun":
        return "Manual Rerun";
      default:
        return "Unknown";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date || !Number.isFinite(date.getTime())) return "N/A";
    try {
      return format(date, "dd MMM yyyy, HH:mm");
    } catch {
      return "Invalid date";
    }
  };

  const formatRelativeDate = (date: Date | null) => {
    if (!date || !Number.isFinite(date.getTime())) return "N/A";
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  const getDuration = () => {
    if (!data?.created_at || !Number.isFinite(data.created_at.getTime()))
      return null;
    const end =
      data.completed_at && Number.isFinite(data.completed_at.getTime())
        ? data.completed_at
        : new Date();
    const duration = end.getTime() - data.created_at.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <p className="text-muted-foreground">No test run data available</p>
      </div>
    );
  }

  const statusConfig = getStatusConfig(data.status);
  const StatusIcon = statusConfig.icon;
  const duration = getDuration();
  const isPollingActive = ["pending", "running"].includes(data.status);

  return (
    <div className="w-full space-y-4 p-1">
      {/* Header Section */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <StatusIcon
            className={cn(
              "h-8 w-8",
              statusConfig.color,
              statusConfig.animate && "animate-spin",
            )}
          />
          <div>
            <h3 className="text-lg font-semibold">Test Run Details</h3>
            <p className="text-sm text-muted-foreground">
              ID: {data.id.substring(0, 8)}...
            </p>
            <p className="text-xs text-muted-foreground">
              {liveNow && " "}
              Last refreshed{" "}
              {lastRefreshedAt
                ? formatDistanceToNow(lastRefreshedAt, {
                    addSuffix: true,
                    includeSeconds: true,
                  })
                : "never"}
            </p>
            {isPollingActive && (
              <p className="text-xs text-muted-foreground">
                {!autoRefreshEnabled
                  ? "Auto-refresh paused"
                  : isAutoRefreshing
                    ? "Auto-refreshing..."
                    : `Refreshing in ${secondsUntilRefresh ?? AUTO_REFRESH_SECONDS} seconds`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isPollingActive && (
            <label
              htmlFor={"auto-refresh-checkbox"}
              className="mr-1 inline-flex items-center gap-2 text-xs text-muted-foreground"
            >
              <Checkbox
                id={"auto-refresh-checkbox"}
                checked={autoRefreshEnabled}
                onCheckedChange={(checked) => {
                  const enabled = !!checked;
                  setAutoRefreshEnabled(enabled);
                  if (enabled) {
                    setSecondsUntilRefresh(AUTO_REFRESH_SECONDS);
                  }
                }}
              />
              Auto-refresh
            </label>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void updateData("manual")}
            disabled={isAutoRefreshing || isManualRefreshing}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                (isAutoRefreshing || isManualRefreshing) && "animate-spin",
              )}
            />
            <span className="ml-2">
              {isAutoRefreshing ? "Refreshing..." : "Refresh"}
            </span>
          </Button>
          <Badge variant={statusConfig.variant} className="text-sm px-3 py-1">
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-md border bg-accent/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <User className="h-3 w-3" />
            <span>Started By</span>
          </div>
          <div className="text-sm font-semibold">{data.started_by_name}</div>
        </div>

        <div className="rounded-md border bg-accent/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="h-3 w-3" />
            <span>Created</span>
          </div>
          <div className="text-sm font-semibold">
            {formatRelativeDate(data.created_at)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatDate(data.created_at)}
          </div>
        </div>

        <div className="rounded-md border bg-accent/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Clock className="h-3 w-3" />
            <span>Duration</span>
          </div>
          <div className="text-sm font-semibold">
            {duration || "In progress..."}
          </div>
        </div>

        <div className="rounded-md border bg-accent/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <GitBranch className="h-3 w-3" />
            <span>Trigger Type</span>
          </div>
          <div className="text-sm font-semibold">
            {getTriggerLabel(data.trigger)}
          </div>
        </div>

        <div className="rounded-md border bg-accent/40 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {data.notifications_enabled ? (
              <Bell className="h-3 w-3" />
            ) : (
              <BellOff className="h-3 w-3" />
            )}
            <span>Notifications</span>
          </div>
          <div className="text-sm font-semibold">
            {data.notifications_enabled ? "Enabled" : "Disabled"}
          </div>
        </div>

        {data.completed_at && (
          <div className="rounded-md border bg-accent/40 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Completed</span>
            </div>
            <div className="text-sm font-semibold">
              {formatDate(data.completed_at)}
            </div>
          </div>
        )}
      </div>

      {/* Repository Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Repository Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 p-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">Git URL</div>
              <div className="text-sm font-mono truncate">{data.git_url}</div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(data.git_url, "Git URL")}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 p-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">
                GitLab Repo ID
              </div>
              <div className="text-sm font-mono">{data.gitlab_repo_id}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(data.gitlab_repo_id, "Repo ID")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/50 p-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">Batch ID</div>
              <div className="text-sm font-mono truncate">{data.batch_id}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(data.batch_id, "Batch ID")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Technical Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start justify-between gap-2 rounded-md border bg-muted/50 p-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">
                ECS Task ARN
              </div>
              <div className="text-sm font-mono break-all">
                {data.ecs_task_arn}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => copyToClipboard(data.ecs_task_arn, "ECS Task ARN")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-start justify-between gap-2 rounded-md border bg-muted/50 p-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">
                Task Definition
              </div>
              <div className="text-sm font-mono break-all">{data.task_def}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => copyToClipboard(data.task_def, "Task Definition")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-start justify-between gap-2 rounded-md border bg-muted/50 p-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1">
                Tester Command
              </div>
              <div className="text-sm font-mono break-all whitespace-pre-wrap">
                {data.tester_command}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
              onClick={() => copyToClipboard(data.tester_command, "Command")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Logs will be fetched from S3 using a pre-signed URL when
              available.
            </p>
            {/*<Button*/}
            {/*  variant="outline"*/}
            {/*  size="sm"*/}
            {/*  disabled={logsLoading}*/}
            {/*  onClick={async () => {*/}
            {/*    setLogsLoading(true);*/}
            {/*    try {*/}
            {/*      const content = await fetchLogsStub();*/}
            {/*      setLogsContent(content);*/}
            {/*    } finally {*/}
            {/*      setLogsLoading(false);*/}
            {/*    }*/}
            {/*  }}*/}
            {/*>*/}
            {/*  {logsLoading ? (*/}
            {/*    <Loader2 className="h-4 w-4 animate-spin" />*/}
            {/*  ) : (*/}
            {/*    <RefreshCw className="h-4 w-4" />*/}
            {/*  )}*/}
            {/*  <span className="ml-2">Fetch logs</span>*/}
            {/*</Button>*/}
          </div>

            {data.log_text ? (
                <div className="rounded-md border bg-muted/50 text-mono p-3 flex flex-col gap-4 w-full">
                  <div className={"flex flex-row gap-2 items-center"}>
                    <File/>
                    <pre className={"text-sm text-ellipsis"}>{data.log_name}</pre>
                    {logsBlob && (
                        <Button asChild className={"ml-auto cursor-default"} variant={"outline"} size={"icon-lg"}><a download={data.log_name ?? "logs.log"} href={window.URL.createObjectURL(logsBlob)}><Download/></a></Button>
                    )}
                  </div>
              <pre className="max-h-[100lh] text-muted-foreground overflow-auto overflow-x-scroll max-w-full whitespace-pre-wrap text-sm font-mono">
                {data.log_text}
              </pre>
                </div>

            ) : (
              <Empty className={"border border-dashed bg-muted/50"}>
                <EmptyHeader>
                  <EmptyMedia variant={"icon"}>
                    <Scroll/>
                  </EmptyMedia>
                  <EmptyTitle>No logs.</EmptyTitle>
                </EmptyHeader>
                <EmptyContent>
                  <EmptyDescription>No logs available yet.</EmptyDescription>
                </EmptyContent>
              </Empty>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
