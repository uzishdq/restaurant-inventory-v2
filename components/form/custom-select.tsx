"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { ControllerFieldState, ControllerRenderProps } from "react-hook-form";

// ── Props Generic ───────────────────────────────────────────────

interface CustomSelectProps<T> {
  items: T[];
  valueField: keyof T; // field yang jadi value (misal "idUnit", "idCategory")
  labelField: keyof T; // field yang ditampilkan (misal "name")
  searchField?: keyof T; // field untuk filter search (default = labelField)
  placeholder?: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  field: ControllerRenderProps<any, any>;
  fieldState: ControllerFieldState;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect<T>({
  items,
  valueField,
  labelField,
  searchField,
  placeholder = "Pilih...",
  label,
  field,
  fieldState,
  className,
  disabled = false,
}: Readonly<CustomSelectProps<T>>) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const effectiveSearchField = searchField ?? labelField;

  // Item yang sedang dipilih
  const selectedItem = items.find(
    (item) => String(item[valueField]) === String(field.value),
  );

  const displayText = selectedItem
    ? String(selectedItem[labelField])
    : placeholder;

  return (
    <Field
      orientation="vertical"
      data-invalid={fieldState.invalid}
      className={className}
    >
      {label && <FieldLabel>{label}</FieldLabel>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={fieldState.invalid}
            disabled={disabled}
            className={cn(
              "w-full justify-between text-left font-normal",
              !field.value && "text-muted-foreground",
              fieldState.invalid && "border-destructive",
            )}
          >
            {displayText}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={`Cari ${placeholder.toLowerCase()}...`}
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Tidak ditemukan.</CommandEmpty>
              <CommandGroup>
                {items
                  .filter((item) => {
                    const searchValue = String(
                      item[effectiveSearchField] ?? "",
                    ).toLowerCase();
                    return searchValue.includes(search.toLowerCase());
                  })
                  .map((item) => {
                    const itemValue = String(item[valueField]);
                    const itemLabel = String(item[labelField]);

                    return (
                      <CommandItem
                        key={itemValue}
                        value={itemValue}
                        onSelect={(currentValue) => {
                          field.onChange(
                            currentValue === field.value ? "" : currentValue,
                          );
                          setOpen(false);
                          setSearch("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === itemValue
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {itemLabel}
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
    </Field>
  );
}
