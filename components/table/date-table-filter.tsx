import React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { MONTHS, YEARS } from "@/lib/constant";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface IDateTableFilter<T> {
  table: Table<T>;
  filterDate: string;
}

export default function DateTableFilter<T>({
  table,
  filterDate,
}: Readonly<IDateTableFilter<T>>) {
  const [filterMonth, setFilterMonth] = React.useState<string | undefined>(
    undefined,
  );

  const [filterYear, setFilterYear] = React.useState<string | undefined>(
    undefined,
  );

  const handleYearChange = (year: string) => {
    setFilterYear(year);
    applyFilters(year, filterMonth);
  };

  const handleMonthChange = (month: string) => {
    setFilterMonth(month);
    applyFilters(filterYear, month);
  };

  const onReset = () => {
    setFilterYear(undefined);
    setFilterMonth(undefined);
    table.getColumn(filterDate)?.setFilterValue(undefined);
  };

  const applyFilters = (
    year: string | undefined,
    month: string | undefined,
  ) => {
    if (year && month) {
      const filterValue = year && month ? `${year}-${month}` : undefined;
      table.getColumn(filterDate)?.setFilterValue(filterValue);
    } else {
      table.getColumn(filterDate)?.setFilterValue(undefined);
    }
  };
  return (
    <div className="flex items-center gap-1">
      {filterYear && filterMonth ? (
        <>
          <Button variant="ghost">
            {filterMonth
              ? (() => {
                  const month = MONTHS.find(
                    (month) => month.value === filterMonth,
                  );
                  return month ? (
                    <span>
                      {month.title} - {filterYear}
                    </span>
                  ) : (
                    ""
                  );
                })()
              : ""}
          </Button>
          <Button onClick={onReset}>
            Reset <X className="ml-2 h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <Select onValueChange={handleMonthChange} value={filterMonth}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Bulan</SelectLabel>
                {MONTHS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select onValueChange={handleYearChange} value={filterYear}>
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tahun</SelectLabel>
                {YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
}
