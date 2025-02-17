import {
  ArrowDownToLine,
  Eraser,
  Loader2,
  PackagePlus,
  Pause,
  Play,
  ShieldBan,
  ShieldCheck,
  Trash,
} from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import { useDeviceStore } from "@/store/useDeviceStore.ts";
import log from "@/lib/log";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { cn } from "@/lib/utils.ts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

export function Apps() {
  const [filter, setFilter] = useState("");
  const [showSystemApps, setShowSystemApps] = useState(false);
  const [apps, setApps] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<{
    type: string;
    packageName: string;
  } | null>(null);
  const { currentDevice } = useDeviceStore();
  const fetchApps = async (showSystem: boolean) => {
    const result = await window.main.getPackages(
      currentDevice || "",
      showSystem,
    );
    log.info("getPackages", result);
    setApps(result);
  };

  useEffect(() => {
    fetchApps(showSystemApps);
  }, [showSystemApps]);

  const filteredApps = apps.filter((app) => {
    return app.toLowerCase().includes(filter.toLowerCase());
  });
  const handleContextMenuAction = async (
    action: string,
    packageName: string,
  ) => {
    try {
      setActionLoading({ type: action, packageName });

      switch (action) {
        case "start":
          log.info("Starting app:", packageName);
          await window.main.startPackage(currentDevice || "", packageName);
          break;
        case "stop":
          log.info("Stopping app:", packageName);
          await window.main.stopPackage(currentDevice || "", packageName);
          break;
        case "disable":
          log.info("disable app:", packageName);
          await window.main.disablePackage(currentDevice || "", packageName);
          break;
        case "enable":
          log.info("enable app:", packageName);
          await window.main.enablePackage(currentDevice || "", packageName);
          break;
        case "pull": {
          log.info("pull apk:", packageName);
          const { canceled, filePath } = await window.main.showSaveDialog({
            defaultPath: `${packageName}-${currentDevice}.apk`,
          });
          if (canceled) {
            return;
          }
          log.info("pull filePath:", filePath);
          await window.main.pullApk(currentDevice || "", packageName, filePath);
          break;
        }
        case "clear":
          log.info("clear app:", packageName);
          await window.main.clearPackage(currentDevice || "", packageName);
          break;
        case "uninstall":
          log.info("Uninstalling app:", packageName);
          await window.main.uninstallPackage(currentDevice || "", packageName);
          break;
        default:
          break;
      }

      await fetchApps(showSystemApps);
    } catch (error) {
      console.error(`Failed to ${action}:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenApk = async () => {
    try {
      setActionLoading({ type: "install", packageName: "" });
      const { canceled, filePaths } = await window.main.showOpenDialog({
        properties: ["openFile"],
        filters: [
          {
            name: "APK File",
            extensions: ["apk"],
          },
        ],
      });
      console.log(canceled, filePaths[0]);
      if (canceled) {
        return;
      }

      await window.main.installPackage(currentDevice || "", filePaths[0]);
      await fetchApps(showSystemApps);
    } catch (error) {
      console.error("Failed to install apk:", error);
    } finally {
      setActionLoading(null);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="过滤"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex items-center space-x-2">
          <Checkbox
            id="system"
            checked={showSystemApps}
            onCheckedChange={(checked) => setShowSystemApps(checked as boolean)}
          />
          <label
            htmlFor="system"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            系统应用
          </label>
        </div>
        <div className="text-sm text-muted-foreground">
          共 {filteredApps.length} 个应用
        </div>
        <Button
          size="icon"
          onClick={handleOpenApk}
          className="ml-auto h-7"
          disabled={!!actionLoading}
        >
          {actionLoading?.type === "install" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PackagePlus className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div
        className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 overflow-auto"
        style={{ maxHeight: "calc(100vh - 13rem)" }}
      >
        {filteredApps.map((app) => (
          <ContextMenu key={app}>
            <ContextMenuTrigger>
              <div
                className={cn(
                  "group relative flex flex-col items-center",
                  "p-4 rounded-lg",
                  "transition-colors duration-200",
                  "cursor-pointer select-none",
                  "hover:bg-primary/10",
                  // selectedPackage === app.packageName
                  //     ? "border-primary bg-primary/5"
                  //     : "border-gray-200 hover:bg-gray-50",
                )}
                // onClick={() => handleAppClick(app.packageName)}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className=" text-sm text-center truncate w-full flex flex-col items-center">
                        <div className="w-14 h-14 mb-3 flex items-center">
                          <svg
                            className="icon"
                            viewBox="0 0 1024 1024"
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            p-id="4375"
                            width="256"
                            height="256"
                          >
                            <path
                              d="M633.639322 204.310541a20.138113 20.138113 0 0 1-20.052782-20.266109 20.095447 20.095447 0 1 1 40.105563 0c0 11.178359-8.959754 20.266109-20.052781 20.266109z m-243.79063 0a20.138113 20.138113 0 0 1-20.052781-20.266109 20.095447 20.095447 0 1 1 40.105563 0c0 11.178359-8.959754 20.266109-20.052782 20.266109z m252.110401-117.756761c79.9978 39.550912 134.140311 114.471519 134.140311 200.186495H247.900596c0-85.757642 54.185177-160.635583 134.225642-200.186495l-10.623708-16.895536-10.538377-16.639542-23.466021-37.460303A10.41038 10.41038 0 0 1 340.058062 1.734779a9.173081 9.173081 0 0 1 13.140972 2.773257l25.172641 40.105564 10.666373 16.85287 10.666373 17.108863A294.818559 294.818559 0 0 1 512 56.773265c40.105564 0 78.120518 7.807785 112.210248 21.844733l10.794369-17.108863 35.88168-56.958433a8.959754 8.959754 0 0 1 13.012976-2.773258c4.35188 2.986585 5.546514 9.215747 2.64526 13.82362l-23.508686 37.460303-10.538377 16.639543-10.538377 16.895535zM251.953818 327.699148H776.099404v433.566744c0 34.388388-26.708599 62.419617-59.731691 62.419617H673.275565c1.493292 5.20519 2.346602 10.666373 2.346602 16.426215v124.796568c0 32.639102-25.385969 59.091708-56.702441 59.091708-31.231141 0-56.531779-26.452606-56.531778-59.091708V840.111724c0-5.759842 0.767979-11.221025 2.218605-16.426215h-105.127775c1.450627 5.20519 2.303937 10.666373 2.303936 16.426215v124.796568c0 32.639102-25.385969 59.091708-56.617109 59.091708-31.273807 0-56.659775-26.452606-56.659776-59.091708V840.111724c0-5.759842 0.810644-11.221025 2.303937-16.426215h-43.092148c-33.023092 0-59.774356-28.031229-59.774356-62.419617V327.699148h4.053221z m-105.639762 0c33.663074 0 60.926325 26.281944 60.926325 58.707719v251.214425c0 32.425775-27.305916 58.707719-60.926325 58.707719-33.70574 0-60.96899-26.281944-60.96899-58.707719V386.406867c0-32.425775 27.305916-58.707719 61.011656-58.707719z m731.414553 0c33.663074 0 60.926325 26.281944 60.926325 58.707719v251.214425c0 32.425775-27.305916 58.707719-60.926325 58.707719-33.70574 0-61.011656-26.281944-61.011655-58.707719V386.406867c0-32.425775 27.305916-58.707719 61.011655-58.707719z"
                              fill="#A4C639"
                              p-id="4376"
                            ></path>
                          </svg>
                        </div>
                        {app}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{app}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem
                onClick={() => handleContextMenuAction("start", app)}
              >
                <Play className="mr-2 h-4 w-4" />
                <span>启动</span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleContextMenuAction("stop", app)}
              >
                <Pause className="mr-2 h-4 w-4" />
                <span>停止</span>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => handleContextMenuAction("enable", app)}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                <span>启用</span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleContextMenuAction("disable", app)}
              >
                <ShieldBan className="mr-2 h-4 w-4" />
                <span>禁用</span>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem
                onClick={() => handleContextMenuAction("pull", app)}
                disabled={!!actionLoading}
              >
                {actionLoading?.type === "pull" &&
                actionLoading.packageName === app.packageName ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                )}
                <span>导出</span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleContextMenuAction("clear", app)}
              >
                <Eraser className="mr-2 h-4 w-4" />
                <span>清理</span>
              </ContextMenuItem>
              <ContextMenuItem
                onClick={() => handleContextMenuAction("uninstall", app)}
                className="text-red-600"
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>卸载</span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}
      </div>
    </div>
  );
}
