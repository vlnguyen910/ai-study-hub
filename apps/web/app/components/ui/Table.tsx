import type { FC, ReactNode } from "react";

export interface TableColumn {
  readonly key: string;
  readonly label: string;
  readonly align?: "left" | "right" | "center";
  readonly sortable?: boolean;
}

export interface TableRow {
  readonly id: string | number;
  readonly cells: readonly ReactNode[];
  readonly highlighted?: boolean;
}

export interface TableProps {
  readonly columns: readonly TableColumn[];
  readonly rows: readonly TableRow[];
}

export const Table: FC<TableProps> = ({ columns, rows }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-outline-variant font-label-md text-on-surface-variant">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 font-semibold ${
                  column.align === "right" ? "text-right" : ""
                } ${column.align === "center" ? "text-center" : ""}`}
              >
                {column.sortable ? (
                  <span className="inline-flex cursor-pointer items-center gap-1 hover:text-primary">
                    {column.label}
                    <span className="material-symbols-outlined text-sm">
                      unfold_more
                    </span>
                  </span>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-body-md">
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`border-b border-outline-variant transition-colors hover:bg-surface-variant ${
                row.highlighted ? "bg-surface-container" : ""
              }`}
            >
              {row.cells.map((cell, index) => (
                <td key={`${row.id}-${index}`} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
