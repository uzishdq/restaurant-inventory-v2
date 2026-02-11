"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle, Pencil, Plus, RotateCcw, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

type DialogType = "create" | "edit" | "edit_status" | "delete";

interface FormChildProps {
  onSuccess?: () => void;
}

interface IDialogForm {
  type: DialogType;
  children: React.ReactElement<FormChildProps>;
  title?: string;
  description?: string;
  className?: string;
}

export default function DialogForm({
  type,
  children,
  title,
  description,
}: Readonly<IDialogForm>) {
  const [open, setOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const smoothClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 200); // match dialog transition
  };

  const handleSuccess = () => {
    smoothClose();
  };

  const config = React.useMemo(() => {
    switch (type) {
      case "create":
        return {
          icon: <Plus className="h-4 w-4" />,
          label: "Tambah",
          variant: "default" as const,
          size: "sm" as const,
          defaultTitle: "Tambah Data",
          defaultDesc: "Isi data baru, kemudian klik Tambah.",
        };
      case "edit":
        return {
          icon: <Pencil className="h-4 w-4" />,
          label: "Update",
          variant: "ghost" as const,
          size: "icon" as const,
          defaultTitle: "Edit Data",
          defaultDesc: "Ubah data yang dipilih, lalu klik Update.",
        };
      case "edit_status":
        return {
          icon: <RotateCcw className="h-4 w-4" />,
          label: "Update Status",
          variant: "ghost" as const,
          size: "icon" as const,
          defaultTitle: "Update Status",
          defaultDesc: "Ubah data yang dipilih, lalu klik Update.",
        };
      case "delete":
        return {
          icon: <Trash className="h-4 w-4" />,
          label: "Delete",
          variant: "destructive" as const,
          size: "icon" as const,
          defaultTitle: "Delete Data",
          defaultDesc:
            "Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?",
        };
      default:
        return {
          icon: null,
          label: "Open",
          variant: "default" as const,
          size: "default" as const,
          defaultTitle: "Dialog",
          defaultDesc: "",
        };
    }
  }, [type]);

  const injectedChild = React.isValidElement(children)
    ? React.cloneElement(children, { onSuccess: handleSuccess })
    : children;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={config.variant}
          size={config.size}
          className={cn("ml-auto gap-1", config.size === "icon" && "w-full")}
        >
          {config.icon}
          <span>{config.label}</span>
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ?? config.defaultTitle}</DialogTitle>
          {type !== "delete" && (
            <DialogDescription>
              {description ?? config.defaultDesc}
            </DialogDescription>
          )}

          {type === "delete" && (
            <DialogDescription asChild>
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <div className="flex items-center gap-3 text-destructive/90">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div className="space-y-1 text-left">
                    <p>
                      Penghapusan data bersifat permanen dan tidak dapat
                      dipulihkan.
                    </p>
                  </div>
                </div>
              </div>
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Area konten yang bisa di-scroll */}
        <div
          className={cn(
            "overflow-y-auto py-4", // ← scroll hanya di sini
            "max-h-[calc(90vh-120px)]", // ← sesuaikan 120px ≈ tinggi header + padding
            isClosing && "pointer-events-none",
          )}
        >
          {injectedChild}
        </div>
      </DialogContent>
    </Dialog>
  );
}
