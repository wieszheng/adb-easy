import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Play, RefreshCw } from "lucide-react";
import { useDeviceStore } from "@/store/useDeviceStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  tag: string;
  message: string;
}

export function LogCat() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { currentDevice } = useDeviceStore();
  const [isRunning, setIsRunning] = useState(false);
  const [packageFilter, setPackageFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [logLevel, setLogLevel] = useState<
    "ALL" | "DEBUG" | "INFO" | "WARNING" | "ERROR"
  >("ALL");
  useEffect(() => {
    return () => {
      if (isRunning) {
        window.logcat.stop();
      }
    };
  }, [isRunning]);

  const handleLogData = (logEntry: LogEntry | null) => {
    if (logEntry) {
      setLogs((prev) => [...prev, logEntry]);
    }
  };

  const toggleLogcat = async () => {
    if (isRunning) {
      await window.logcat.stop();
      setIsRunning(false);
    } else {
      if (!currentDevice) return;

      await window.logcat.clear(currentDevice);
      const success = await window.logcat.start(currentDevice);
      if (success) {
        setIsRunning(true);
        setLogs([]);
        window.logcat.onData(handleLogData);
      }
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (logLevel !== "ALL" && log.level !== logLevel) return false;
    if (
      packageFilter &&
      !log.message.toLowerCase().includes(packageFilter.toLowerCase())
    )
      return false;
    return !(
      tagFilter && !log.tag.toLowerCase().includes(tagFilter.toLowerCase())
    );
  });
  const LogRow = ({ log }: { log: LogEntry }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const messageRef = useRef<HTMLSpanElement>(null);
    const [truncatedMessage, setTruncatedMessage] = useState(log.message);

    useEffect(() => {
      const truncateMessage = () => {
        if (messageRef.current) {
          const maxWidth = messageRef.current.offsetWidth;
          const tempSpan = document.createElement("span");
          tempSpan.style.visibility = "hidden";
          tempSpan.style.position = "absolute";
          tempSpan.style.whiteSpace = "nowrap";
          document.body.appendChild(tempSpan);

          let start = 0;
          let end = log.message.length;
          let mid: number;

          while (start <= end) {
            mid = Math.floor((start + end) / 2);
            tempSpan.textContent = log.message.slice(0, mid) + "...";
            if (tempSpan.offsetWidth <= maxWidth) {
              start = mid + 1;
            } else {
              end = mid - 1;
            }
          }

          document.body.removeChild(tempSpan);
          setTruncatedMessage(
            log.message.slice(0, end) + (end < log.message.length ? "..." : ""),
          );
        }
      };

      truncateMessage();
      window.addEventListener("resize", truncateMessage);
      return () => window.removeEventListener("resize", truncateMessage);
    }, [log.message]);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    return (
      <TableRow>
        <TableCell>{log.timestamp}</TableCell>
        <TableCell>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              log.level === "INFO"
                ? "bg-blue-100 text-blue-800"
                : log.level === "WARNING"
                  ? "bg-yellow-100 text-yellow-800"
                  : log.level === "ERROR"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {log.level}
          </span>
        </TableCell>
        <TableCell>{log.tag}</TableCell>
        <TableCell>
          <div className="flex items-center">
            <span ref={messageRef} className="flex-grow">
              {isExpanded ? (
                log.message
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer" onClick={toggleExpand}>
                        {truncatedMessage}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-md">{log.message}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </span>
            {truncatedMessage !== log.message && (
              <Button
                variant="link"
                size="sm"
                onClick={toggleExpand}
                className="ml-2 flex-shrink-0"
              >
                {isExpanded ? "收起" : "展开"}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 p-2 ">
        <Select
          value={logLevel}
          onValueChange={(value: any) => setLogLevel(value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="选择日志级别" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">ALL</SelectItem>
            <SelectItem value="DEBUG">DEBUG</SelectItem>
            <SelectItem value="INFO">INFO</SelectItem>
            <SelectItem value="WARNING">WARNING</SelectItem>
            <SelectItem value="ERROR">ERROR</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Package Name"
          value={packageFilter}
          onChange={(e) => setPackageFilter(e.target.value)}
          className="max-w-[200px]"
        />
        <Input
          placeholder="Tag"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="max-w-[200px] mr-auto"
        />
        <Button
          size="icon"
          className="h-7"
          onClick={toggleLogcat}
          disabled={!currentDevice}
        >
          {isRunning ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7"
          disabled={isRunning}
          onClick={async () => {
            const csvContent =
              "data:text/csv;charset=utf-8," +
              "Timestamp,Level,Message\n" +
              filteredLogs
                .map((log) => `${log.timestamp},${log.level},${log.message}`)
                .join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "logs.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <div
        className="relative overflow-auto"
        style={{ maxHeight: "calc(100vh - 13rem)" }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">时间戳</TableHead>
              <TableHead className="w-[100px]">级别</TableHead>
              <TableHead className="w-[150px]">标签</TableHead>
              <TableHead>消息</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
