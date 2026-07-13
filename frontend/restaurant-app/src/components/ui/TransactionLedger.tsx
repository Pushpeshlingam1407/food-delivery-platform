import React from "react";

interface LedgerColumn {
  key: string;
  label: string;
  flex?: number;
  render?: (val: any, row: any) => React.ReactNode;
}

interface TransactionLedgerProps {
  columns: LedgerColumn[];
  data: any[];
}

export const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  columns,
  data,
}) => {
  return (
    <div
      className="premium-ledger-container premium-animate-in"
      style={{ animationDelay: "0.2s" }}
    >
      <div
        className="premium-ledger-header"
        style={{
          gridTemplateColumns: columns.map((c) => `${c.flex || 1}fr`).join(" "),
        }}
      >
        {columns.map((col, idx) => (
          <div key={idx}>{col.label}</div>
        ))}
      </div>
      <div>
        {data.length === 0 ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "var(--cred-text-secondary)",
              fontSize: "0.9rem",
            }}
          >
            No transactions found.
          </div>
        ) : (
          data.map((row, rowIdx) => (
            <div
              key={row.id || rowIdx}
              className="premium-ledger-row"
              style={{
                gridTemplateColumns: columns
                  .map((c) => `${c.flex || 1}fr`)
                  .join(" "),
              }}
            >
              {columns.map((col, colIdx) => (
                <div key={colIdx}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
