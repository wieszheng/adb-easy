import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDeviceStore } from "@/store/useDeviceStore";
import { Download, Loader2, Play, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import { fileSize } from "@/lib/utils";
import dayjs from "dayjs";
import log from "@/lib/log";

export default function ScreenRecord() {
  const { currentDevice } = useDeviceStore();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [screenfiles, setScreenFiles] = useState<any[]>([]);
  const loadScreenFiles = async () => {
    const result = await window.main.readDir(
      currentDevice || "",
      "/sdcard/screenTemp",
    );
    setScreenFiles(result);
  };
  // useEffect(() => {
  //
  // }, []);

  useEffect(() => {
    loadScreenFiles();
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
        setProgress((prev) => Math.min(prev + 0.5, 100));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = async () => {
    const result = await window.main.startScreenRecord(currentDevice!);
    log.info("handleStartRecording", result);
    setIsRecording(result as boolean);
    setRecordingTime(0);
    setProgress(0);
  };

  const handleStopRecording = async () => {
    await window.main.stopScreenRecord();
    setIsRecording(false);
    await loadScreenFiles();
  };

  const handleDownload = async (fileName: string) => {
    const { canceled, filePath } = await window.main.showSaveDialog({
      defaultPath: fileName,
    });
    if (canceled) {
      return;
    }
    await window.main.pullFile(
      currentDevice!,
      `/sdcard/screenTemp/${fileName}`,
      filePath,
    );
    setIsRecording(false);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };
  return (
    <div className="flex flex-col ">
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="mb-4 text-center">
          {isRecording ? (
            <div className="mt-4 text-red-500 animate-pulse ">
              录制: {formatTime(recordingTime)}
            </div>
          ) : (
            <div className="mt-4 text-muted-foreground">准备录制</div>
          )}
        </div>
        <div className="w-full max-w-md mb-4">
          <Progress value={progress} className="h-2" />
        </div>
        <div className="flex gap-4 mb-8">
          <Button
            size="sm"
            onClick={!isRecording ? handleStartRecording : handleStopRecording}
            // disabled={isRecording}
            className={!isRecording ? "" : "bg-primary/60"}
          >
            {!isRecording ? (
              <Play className="mr-2 h-4 w-4" />
            ) : (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {!isRecording ? "Start Recording " : "Stop Recording"}
          </Button>
        </div>
      </div>
      <div
        className="overflow-auto "
        style={{ maxHeight: "calc(100vh - 19rem)" }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文件名</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>录制时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {screenfiles.map((file) => (
              <TableRow key={file.name}>
                <TableCell>{file.name}</TableCell>
                <TableCell>{fileSize(file?.size || 0, true)}</TableCell>
                <TableCell>
                  {dayjs(file?.mtime).format("YYYY-MM-DD HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        await window.main.deleteFile(
                          currentDevice!,
                          `/sdcard/screenTemp/${file.name}`,
                        );
                        await loadScreenFiles();
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
