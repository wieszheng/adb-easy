import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Boxes,
  FileText,
  LayoutDashboard,
  RotateCw,
  ScreenShareOff,
  Video,
  Zap,
  Bug,
  FileJson,
  FlaskConical,
} from "lucide-react";
import { Instruct } from "@/components/instruct";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useDeviceStore } from "@/store/useDeviceStore";
import log from "@/lib/log";
import { Overview } from "@/components/overview";
import { Apps } from "@/components/apps";
import { Files } from "@/components/files";
import { Screenshot } from "@/components/screenshot";
import { AuroraText } from "@/components/magicui/aurora-text";
import { Meteors } from "@/components/magicui/meteors";
import { Performance } from "@/components/performance";
import { cn } from "@/lib/utils.ts";
import ScreenRecord from "@/components/screenrecord";
import { Debug } from "@/components/debug";
import { LogCat } from "@/components/logcat";
import Monkey from "@/components/monkey";

function App() {
  const { fetchDevices, fetchDeviceInfo, devices, loading, currentDevice } =
    useDeviceStore();
  const { node, chrome, electron } = window.main.versions;
  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDeviceChange = async (deviceId: string) => {
    if (!deviceId) {
      log.warning("handleDeviceChange: deviceId is undefined or null");
      return;
    }
    log.info("handleDeviceChange", deviceId);
    await fetchDeviceInfo(deviceId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Meteors number={20} />
      <Tabs defaultValue="overview" className="w-full">
        <div className="sticky top-0 z-10 bg-white shadow">
          <div className="flex items-center px-4">
            <div className="border-b dark:border-gray-700">
              <div className="flex items-center justify-between gap-1 px-2 h-12">
                <div className="flex items-center gap-1">
                  <Select
                    value={currentDevice || ""}
                    onValueChange={handleDeviceChange}
                  >
                    <SelectTrigger className="w-[150px] h-8 border-0">
                      <SelectValue
                        placeholder={loading ? "Loading..." : "选择设备"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem key={device.id} value={device.id}>
                          <AuroraText className="font-bold">
                            {device.name}
                          </AuroraText>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => fetchDevices()}
                    disabled={loading}
                  >
                    <RotateCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </div>
            <TabsList className="h-12 p-0 bg-white border-b rounded-none sticky top-12 z-10">
              <TabsTrigger
                value="overview"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                概览
              </TabsTrigger>
              <TabsTrigger
                value="apps"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Boxes className="w-4 h-4 mr-2" />
                应用
              </TabsTrigger>
              <TabsTrigger
                value="files"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <FileText className="w-4 h-4 mr-2" />
                文件
              </TabsTrigger>
              <TabsTrigger
                value="screenshot"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <ScreenShareOff className="w-4 h-4 mr-2" />
                截屏
              </TabsTrigger>
              <TabsTrigger
                value="screen-recording"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Video className="w-4 h-4 mr-2" />
                录屏
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Activity className="w-4 h-4 mr-2" />
                性能
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <FileJson className="w-4 h-4 mr-2" />
                日志
              </TabsTrigger>
              <TabsTrigger
                value="monkey"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <FlaskConical className="w-4 h-4 mr-2" />
                Monkey
              </TabsTrigger>
              <TabsTrigger
                value="instruct"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Zap className="w-4 h-4 mr-2" />
                快捷指令
              </TabsTrigger>

              <TabsTrigger
                value="memory"
                className="h-12 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                <Bug className="w-4 h-4 mr-2" />
                调试
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        <div className="p-6">
          <div className="mx-auto">
            <TabsContent value="overview" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Overview />
              </div>
            </TabsContent>
            <TabsContent value="apps" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Apps />
              </div>
            </TabsContent>
            <TabsContent value="files" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Files />
              </div>
            </TabsContent>
            <TabsContent value="screenshot" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Screenshot />
              </div>
            </TabsContent>
            <TabsContent value="screen-recording" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <ScreenRecord />
              </div>
            </TabsContent>
            <TabsContent value="performance" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Performance />
              </div>
            </TabsContent>
            <TabsContent value="instruct" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Instruct />
              </div>
            </TabsContent>
            <TabsContent value="logs" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <LogCat />
              </div>
            </TabsContent>
            <TabsContent value="monkey" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Monkey />
              </div>
            </TabsContent>
            <TabsContent value="memory" className="m-0">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <Debug />
              </div>
            </TabsContent>
          </div>
        </div>
      </Tabs>
      <div className="fixed bottom-0 left-0 right-0 p-2 text-center text-sm text-gray-600">
        <span
          className={cn(
            `inline animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent`,
          )}
        >
          Node.js: {node} | Electron: {electron} | Chrome: {chrome}
        </span>
      </div>
    </div>
  );
}

export default App;
