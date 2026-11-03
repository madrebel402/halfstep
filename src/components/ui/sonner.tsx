import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="light"
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "bg-card text-card-foreground border-border shadow-border font-sans",
          title: "text-foreground",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}
