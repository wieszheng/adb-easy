import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Play, StopCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider.tsx";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Progress } from "@/components/ui/progress.tsx";

const eventTypes = [
  { id: "touch", label: "触摸事件" },
  { id: "motion", label: "动作事件" },
  { id: "trackball", label: "轨迹球事件" },
  { id: "nav", label: "基本导航事件" },
  { id: "majornav", label: "主要导航事件" },
  { id: "syskeys", label: "系统按键事件" },
  { id: "appswitch", label: "应用切换事件" },
  { id: "flip", label: "键盘翻转事件" },
  { id: "anyevent", label: "任意事件" },
];

export default function Monkey() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [throttle, setThrottle] = useState(0);
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="package-name">包名</Label>
            <Input
              id="package-name"
              placeholder="com.example.app"
              // value={packageName}
              // onChange={(e) => setPackageName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="event-count">事件数量</Label>
            <Input
              id="event-count"
              type="number"
              // value={eventCount}
              // onChange={(e) => setEventCount(Number(e.target.value))}
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seed">随机种子（可选）</Label>
            <Input
              id="seed"
              placeholder="留空为随机"
              // value={seed}
              // onChange={(e) => setSeed(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="throttle">事件间隔（毫秒）</Label>
          <Slider
            id="throttle"
            min={0}
            max={1000}
            step={10}
            value={[throttle]}
            onValueChange={(value) => setThrottle(value[0])}
          />
          <div className="text-right text-sm text-muted-foreground">
            {throttle} ms
          </div>
        </div>

        <div className="space-y-2">
          <Label>事件类型及百分比</Label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {eventTypes.map((event) => (
              <div key={event.id} className="flex items-center space-x-2">
                <Checkbox
                  id={event.id}
                  // checked={selectedEvents[event.id] > 0}
                  // onCheckedChange={(checked) =>
                  //   updateEventPercentage(event.id, checked ? 1 : 0)
                  // }
                />
                <Label htmlFor={event.id} className="flex-1 text-sm">
                  {event.label}
                </Label>
                <Input
                  type="number"
                  // value={selectedEvents[event.id] || 0}
                  // onChange={(e) =>
                  //   updateEventPercentage(event.id, Number(e.target.value))
                  // }
                  min={0}
                  max={100}
                  step={1}
                  className="w-16 h-8 text-sm"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            ))}
          </div>
          {/*<div className="text-sm mt-2">*/}
          {/*  <span*/}
          {/*    className={cn(*/}
          {/*      "font-medium",*/}
          {/*      Object.values(selectedEvents).reduce(*/}
          {/*        (sum, value) => sum + value,*/}
          {/*        0,*/}
          {/*      ) === 100*/}
          {/*        ? "text-green-500"*/}
          {/*        : "text-red-500",*/}
          {/*    )}*/}
          {/*  >*/}
          {/*    总计:{" "}*/}
          {/*    {Object.values(selectedEvents).reduce(*/}
          {/*      (sum, value) => sum + value,*/}
          {/*      0,*/}
          {/*    )}*/}
          {/*    %*/}
          {/*  </span>*/}
          {/*  {Object.values(selectedEvents).reduce(*/}
          {/*    (sum, value) => sum + value,*/}
          {/*    0,*/}
          {/*  ) !== 100 && (*/}
          {/*    <span className="text-red-500 ml-2">(总和必须为100%)</span>*/}
          {/*  )}*/}
          {/*</div>*/}
        </div>
        <div className="space-y-2">
          <Label>选项</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="verbose-mode"
                // checked={verboseMode}
                // onCheckedChange={setVerboseMode}
              />
              <Label htmlFor="verbose-mode">详细模式</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ignore-crashes"
                // checked={ignoreCrashes}
                // onCheckedChange={setIgnoreCrashes}
              />
              <Label htmlFor="ignore-crashes">忽略崩溃</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="ignore-timeouts"
                // checked={ignoreTimeouts}
                // onCheckedChange={setIgnoreTimeouts}
              />
              <Label htmlFor="ignore-timeouts">忽略超时</Label>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Button
            // onClick={isRunning ? stopMonkeyTest : startMonkeyTest}
            className="w-full"
            // disabled={
            //   !packageName ||
            //   Object.values(selectedEvents).reduce(
            //     (sum, value) => sum + value,
            //     0,
            //   ) !== 100
            // }
          >
            {isRunning ? (
              <>
                <StopCircle className="mr-2 h-4 w-4" />
                停止测试
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                开始测试
              </>
            )}
          </Button>
        </div>
        {isRunning && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>测试进度</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </div>
    </div>
  );
}
