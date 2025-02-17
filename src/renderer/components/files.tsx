import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload,
  Download,
  Trash2,
  FolderPlus,
  ArrowLeft,
  FileIcon,
  FolderIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeviceStore } from "@/store/useDeviceStore";
import dayjs from "dayjs";
import log from "@/lib/log.ts";
import { fileSize } from "@/lib/utils.ts";

export function Files() {
  const [currentPath, setCurrentPath] = useState("/");
  const [files, setFiles] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const { currentDevice } = useDeviceStore();
  const loadFiles = async (path: string) => {
    const result = await window.main.readDir(currentDevice || "", path);
    setFiles(result);
    setCurrentPath(path);
  };

  useEffect(() => {
    loadFiles(currentPath);
  }, []);

  const handleNavigate = async (entry: any) => {
    if (entry.directory) {
      const newPath = currentPath.endsWith("/")
        ? `${currentPath}${entry.name}`
        : `${currentPath}/${entry.name}`;
      await loadFiles(newPath);
    }
  };

  const handleGoBack = async () => {
    const parentPath = currentPath.split("/").slice(0, -1).join("/") || "/";
    await loadFiles(parentPath);
  };

  const handleCreateDir = async () => {
    if (!newFolderName) return;
    const newPath = currentPath.endsWith("/")
      ? `${currentPath}${newFolderName}`
      : `${currentPath}/${newFolderName}`;
    log.info("handleCreateDir", newPath);
    await window.main.createDir(currentDevice || "", newPath);
    await loadFiles(currentPath);
  };

  const handleDeleteFile = async (path: string) => {
    await window.main.deleteFile(currentDevice || "", path);
  };
  const handleDeleteDir = async (path: string) => {
    log.info("handleDeleteDir", path);
    await window.main.deleteDir(currentDevice || "", path);
  };
  const handleDownload = async (name: string) => {
    const { canceled, filePath } = await window.main.showSaveDialog({
      defaultPath: name,
    });
    if (canceled) {
      return;
    }
    const newPath = currentPath.endsWith("/")
      ? `${currentPath}${name}`
      : `${currentPath}/${name}`;
    await window.main.pullFile(currentDevice!, newPath, filePath);
  };

  const handleUpload = async () => {
    const { canceled, filePaths } = await window.main.showOpenDialog({
      properties: ["openFile"],
    });

    if (canceled) {
      return;
    }
    const file = filePaths[0];
    const newPath = currentPath.endsWith("/") ? currentPath : `${currentPath}/`;
    console.log(newPath, file);
    await window.main.pushFile(currentDevice || "", file, newPath);
    await loadFiles(currentPath);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex items-center"
          onClick={handleGoBack}
          disabled={currentPath === "/"}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 text-sm text-muted-foreground overflow-hidden">
          {currentPath}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" className="ml-auto h-7">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新建文件夹</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="文件夹名称"
              />
              <Button onClick={handleCreateDir}>创建</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Button
          variant="outline"
          size="icon"
          className="ml-auto h-7"
          onClick={handleUpload}
        >
          <Upload className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="overflow-auto"
        style={{ maxHeight: "calc(100vh - 13rem)" }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[500px]">名称</TableHead>
              <TableHead>大小</TableHead>
              <TableHead>修改时间</TableHead>
              <TableHead className="w-[100px]">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.name}>
                <TableCell>
                  <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleNavigate(file)}
                  >
                    {file?.directory ? (
                      <FolderIcon className="h-4 w-4" />
                    ) : (
                      <FileIcon className="h-4 w-4" />
                    )}
                    {file?.name}
                  </div>
                </TableCell>
                <TableCell>
                  {file?.directory ? "-" : fileSize(file?.size || 0, true)}
                </TableCell>
                <TableCell>
                  {dayjs(file?.mtime).format("YYYY-MM-DD HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {!file.directory && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex items-center"
                        onClick={() => handleDownload(file.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex items-center"
                      onClick={async () => {
                        const filePath = currentPath.endsWith("/")
                          ? `${currentPath}${file?.name}`
                          : `${currentPath}/${file?.name}`;
                        if (file.directory) {
                          await handleDeleteDir(filePath);
                        } else {
                          await handleDeleteFile(filePath);
                        }
                        await loadFiles(currentPath);
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
