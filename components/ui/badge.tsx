// === INÍCIO ARQUIVO NOVO: components/ui/badge.tsx ===
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        "bg-slate-100 text-slate-700",
        className
      )}
      {...props}
    />
  );
}
// === FIM ARQUIVO NOVO ===
