import { useState, useRef, useEffect } from "react";
import {
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Download,
  Maximize2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { cn, fileSize } from "@/lib/utils";
import { useDeviceStore } from "@/store/useDeviceStore";

function loadImg(
  url: string,
  callback: (err: Error | null, img: HTMLImageElement) => void,
) {
  const img = new Image();
  img.onload = () => {
    callback(null, img);
  };
  img.src = url;
}
function convertBin(base64Data: string, type: string): Blob {
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type });
}

function download(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
export function Screenshot() {
  const [image, setImage] = useState<{
    data: string;
    url: string;
    width: number;
    height: number;
    size: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const transformComponentRef = useRef(null);
  const { currentDevice } = useDeviceStore();

  const dataUrl = {
    stringify: (data: string, mimeType: string): string => {
      return `data:${mimeType};base64,${data}`;
    },
  };

  const fetchScreenshot = async () => {
    setIsLoading(true);
    try {
      const data = await window.main.screenCap(currentDevice || "");
      const url = dataUrl.stringify(data, "image/png");
      loadImg(url, (err, img) => {
        if (err) {
          console.error(err);
          return;
        }

        setImage({
          data,
          url,
          width: img.width,
          height: img.height,
          size: fileSize(data.length, true),
        });
      });
    } catch (error) {
      console.error("刷新屏幕截图时出错:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchScreenshot();
  }, []);
  const handleSave = () => {
    const blob = convertBin(image!.data, "image/png");
    download(blob, "screenshot.png");
  };

  const handleCopy = async () => {
    const buf = convertBin(image!.data, "ArrayBuffer");
    await navigator.clipboard.write([
      new ClipboardItem({
        ["image/png"]: new Blob([buf], {
          type: "image/png",
        }),
      }),
    ]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={fetchScreenshot}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleSave}
        >
          <Download className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-4" />

        <div className="ml-auto text-sm text-muted-foreground">
          {image?.width}x{image?.height} {image?.size}
        </div>
      </div>
      <Separator orientation="horizontal" />
      <div className="relative flex-1">
        <TransformWrapper
          ref={transformComponentRef}
          initialScale={1}
          minScale={0.1}
          maxScale={4}
          centerOnInit
          wheel={{ wheelDisabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute left-3 top-3 z-10 flex flex-col gap-3">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomIn()}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => zoomOut()}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => resetTransform()}
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              <TransformComponent
                wrapperClass="!w-full !h-full"
                contentClass="!w-full !h-full flex items-center justify-center"
              >
                {image && (
                  <img
                    id="image"
                    src={image?.url}
                    alt=""
                    className={cn(
                      "max-h-full w-auto transition-opacity duration-200",
                      isLoading ? "opacity-50" : "opacity-100",
                    )}
                    style={{
                      maxWidth: "calc(100vw - 3rem)",
                      maxHeight: "calc(100vh - 13.8rem)",
                    }}
                  />
                )}
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>
    </div>
  );
}
