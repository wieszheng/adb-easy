import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Play, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeviceStore } from "@/store/useDeviceStore";
import {
  PopoverTrigger,
  Popover,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Chart } from "@/components/chart";

export function Performance() {
  const { currentDevice } = useDeviceStore();
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [cpuData, setCpuData] = useState<{ date: string; cpu: number }[]>([]);
  const [fpsData, setFpsData] = useState<{ date: string; fps: number }[]>([]);
  const [memData, setMemData] = useState<{ date: string; mem: number }[]>([]);

  const [updateInterval, setUpdateInterval] = useState(1000);
  useEffect(() => {
    if (currentDevice) {
      window.main.getPackages(currentDevice).then((packages) => {
        setPackages(packages);
      });
    }
  }, [currentDevice]);

  useEffect(() => {
    if (running) {
      const updateChart = async () => {
        const now = new Date().toLocaleTimeString();

        const fpsUsage = await window.main.getFpsByLatency(
          currentDevice!,
          selectedPackage,
        );
        const { cpuUsage, memoryUsage } = await window.main.getCpuUsage(
          currentDevice!,
          selectedPackage,
        );
        setFpsData((prevData) => [...prevData, { date: now, fps: fpsUsage }]);
        setCpuData((prevData) => [...prevData, { date: now, cpu: cpuUsage }]);
        setMemData((prevData) => [
          ...prevData,
          { date: now, mem: memoryUsage },
        ]);
      };

      const intervalId = setInterval(updateChart, updateInterval);

      return () => clearInterval(intervalId);
    }
  }, [running, currentDevice, selectedPackage, updateInterval]);

  const handleToggle = () => {
    setRunning(!running);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div
              aria-expanded={open}
              className="flex items-center justify-between w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mr-auto"
            >
              <span className="truncate flex-1 text-left">
                {selectedPackage
                  ? packages.find((pkg) => pkg === selectedPackage)
                  : "选择应用包..."}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="搜索应用包..." />
              <CommandList>
                <CommandEmpty>未找到应用包</CommandEmpty>
                <CommandGroup>
                  {packages.map((pkg) => (
                    <CommandItem
                      key={pkg}
                      onSelect={() => {
                        setSelectedPackage(pkg === selectedPackage ? "" : pkg);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          selectedPackage === pkg ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <p className="truncate flex-1 text-left">{pkg}</p>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium whitespace-nowrap">
            更新间隔:
          </label>
          <Input
            type="number"
            value={updateInterval}
            onChange={(e) => setUpdateInterval(Number(e.target.value))} // 这里可以添加逻辑来动态改变updateInterval
            className="rounded border px-2 py-1 w-24"
            min={100}
            step={100}
            disabled={running}
          />
          <span className="text-sm text-gray-500">ms</span>
        </div>
        <Button
          size="icon"
          className="h-7"
          onClick={handleToggle}
          disabled={!selectedPackage}
        >
          {running ? (
            <RotateCw className={`h-4 w-4 ${running ? "animate-spin" : ""}`} />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div
        className="overflow-auto space-y-4"
        style={{ maxHeight: "calc(100vh - 13rem)" }}
      >
        <Card className="mr-1">
          <CardHeader className="border-b py-5 sm:flex-row">
            <CardTitle className="flex items-center gap-2">
              <Badge className="h-5 px-2">CPU</Badge>
              {selectedPackage}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              data={cpuData.map((item) => ({
                date: item.date,
                value: item.cpu,
              }))}
              title="CPU Usage"
              unit="%"
              color="rgb(255, 70, 131)"
              gradientColors={["rgb(255, 158, 68)", "rgb(255, 70, 131)"]}
            />
          </CardContent>
        </Card>

        <Card className="mr-1">
          <CardHeader className="border-b py-5 sm:flex-row">
            <CardTitle className="flex items-center gap-2">
              <Badge className="h-5 px-2">FPS</Badge>
              {selectedPackage}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              data={fpsData.map((item) => ({
                date: item.date,
                value: item.fps,
              }))}
              title="FPS"
              unit=""
              color="rgb(52, 152, 219)"
              gradientColors={["rgb(103, 194, 238)", "rgb(52, 152, 219)"]}
            />
          </CardContent>
        </Card>
        <Card className="mr-1">
          <CardHeader className="border-b py-5 sm:flex-row">
            <CardTitle className="flex items-center gap-2">
              <Badge className="h-5 px-2">Mem</Badge>
              {selectedPackage}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              data={memData.map((item) => ({
                date: item.date,
                value: item.mem,
              }))}
              title="Debug Usage"
              unit="MB"
              color="rgb(46, 204, 113)"
              gradientColors={["rgb(127, 224, 196)", "rgb(46, 204, 113)"]}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
