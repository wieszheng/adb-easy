import { MoreVertical, Pencil, Play, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeviceStore } from "@/store/useDeviceStore";

type AdbCommand = {
  id: string;
  name: string;
  command: string;
  description: string;
  loading?: boolean;
};

const initialAdbCommands: AdbCommand[] = [
  {
    id: "1",
    name: "重启设备",
    command: "reboot",
    description: "重启Android设备",
  },
  {
    id: "2",
    name: "Recovery",
    command: "reboot recovery",
    description: "重启到Recovery模式",
  },
  {
    id: "3",
    name: "Bootloader",
    command: "reboot bootloader",
    description: "重启到Bootloader模式",
  },
  {
    id: "4",
    name: "音量+",
    command: "input keyevent KEYCODE_VOLUME_UP",
    description: "增大音量",
  },
  {
    id: "5",
    name: "音量-",
    command: "input keyevent KEYCODE_VOLUME_DOWN",
    description: "缩小音量",
  },
  {
    id: "6",
    name: "静音",
    command: "input keyevent KEYCODE_VOLUME_MUTE",
    description: "设备静音",
  },
  {
    id: "7",
    name: "主屏幕键",
    command: "input keyevent KEYCODE_HOME",
    description: "主屏幕键",
  },
  {
    id: "8",
    name: "返回键",
    command: "input keyevent KEYCODE_BACK",
    description: "返回键",
  },
  {
    id: "9",
    name: "菜单键",
    command: "input keyevent KEYCODE_MENU",
    description: "打开菜单",
  },
  {
    id: "10",
    name: "电源键",
    command: "input keyevent KEYCODE_POWER",
    description: "电源键",
  },
  {
    id: "11",
    name: "打开通知栏",
    command: "cmd statusbar expand-notifications",
    description: "打开通知栏",
  },
  {
    id: "12",
    name: "关闭通知栏",
    command: "cmd statusbar collapse",
    description: "关闭通知栏",
  },
  {
    id: "14",
    name: "多任务",
    command: "input keyevent KEYCODE_APP_SWITCH",
    description: "打开最近任务",
  },
  {
    id: "15",
    name: "系统设置",
    command: "am start -a android.settings.SETTINGS",
    description: "打开设置页",
    loading: false,
  },
  {
    id: "16",
    name: "开启WIFI",
    command: "svc wifi enable",
    description: "开启WIFI",
    loading: false,
  },
  {
    id: "17",
    name: "关闭WIFI",
    command: "svc wifi disable",
    description: "关闭WIFI",
    loading: false,
  },
];
export function Instruct() {
  const [adbCommands, setAdbCommands] =
    useState<AdbCommand[]>(initialAdbCommands);
  const [, setEditingCommand] = useState<AdbCommand | null>(null);
  const [, setIsDialogOpen] = useState(false);

  const { currentDevice } = useDeviceStore();
  const executeCommand = async (command: AdbCommand) => {
    setAdbCommands(
      adbCommands.map(
        (cmd) => (cmd.id === command.id ? { ...cmd, loading: true } : cmd), // 设置当前命令为 loading
      ),
    );
    await window.main.deviceShell(currentDevice!, command.command);
    setAdbCommands(
      adbCommands.map(
        (cmd) => (cmd.id === command.id ? { ...cmd, loading: false } : cmd), // 执行完毕后重置 loading
      ),
    );
  };

  const deleteCommand = (id: string) => {
    setAdbCommands(adbCommands.filter((cmd) => cmd.id !== id));
  };

  const editCommand = (command: AdbCommand) => {
    setEditingCommand(command);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <TooltipProvider>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-auto"
          style={{
            maxHeight: "calc(100vh - 10rem)",
          }}
        >
          {adbCommands.map((cmd) => (
            <Card key={cmd.id} className="flex flex-col mr-2">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{cmd.name}</h3>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => executeCommand(cmd)}
                      className="h-8 w-8"
                      disabled={cmd.loading}
                    >
                      {cmd.loading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => editCommand(cmd)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>修改</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteCommand(cmd.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>删除</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {cmd.description}
                </p>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <code className="block rounded bg-muted px-2 py-1 font-mono text-xs truncate">
                      {cmd.command}
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">{cmd.command}</p>
                  </TooltipContent>
                </Tooltip>
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>
    </div>
  );
}
