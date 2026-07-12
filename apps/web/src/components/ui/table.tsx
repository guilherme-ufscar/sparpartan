import Link from "next/link";

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  empty,
  rowHref,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty: React.ReactNode;
  rowHref?: (row: T) => string;
}) {
  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-outline-variant bg-surface-container-lowest">
      <table className="w-full min-w-[640px] text-left text-body-md">
        <thead>
          <tr className="border-b border-outline-variant font-mono-caps text-label-sm uppercase text-outline">
            {columns.map((col) => (
              <th
                key={col.header}
                className={`px-4 py-3 ${col.align === "right" ? "text-right" : "text-left"}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const href = rowHref?.(row);
            return (
              <tr
                key={rowKey(row)}
                className="border-b border-outline-variant last:border-0 hover:bg-surface"
              >
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={`px-4 py-3 ${col.align === "right" ? "text-right" : "text-left"} ${col.className ?? ""}`}
                  >
                    {href && col === columns[0] ? (
                      <Link href={href} className="hover:underline">
                        {col.cell(row)}
                      </Link>
                    ) : (
                      col.cell(row)
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
