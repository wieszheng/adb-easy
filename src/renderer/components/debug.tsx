import { Globe } from "@/components/magicui/globe";

export function Debug() {


  return (
    <div className="flex items-center justify-center ">
      <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background px-40 pb-40 pt-8 md:pb-60">
        <Globe />
        <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
      </div>
      
    </div>
  );
}
