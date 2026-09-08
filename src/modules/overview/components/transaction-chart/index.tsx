"use client";

// import { ChevronDownIcon } from "@/icon/dashbaord";
// import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TransactionData {
  day: string;
  fullPayment: number;
  partPayment: number;
}

interface TransactionsChartProps {
  data: TransactionData[];
  totalAmount: string;
  /**
   * Context the weekly-summary endpoint scopes the figures to. The endpoint
   * itself accepts no filters — it is always the current week and the
   * school's active academic period — so this is display-only.
   */
  periodName?: string | null;
  weekStart?: string;
}

export function TransactionsChart({
  data,
  totalAmount,
  periodName,
  weekStart,
}: TransactionsChartProps) {
  const scopeLabel = [
    weekStart
      ? `Week of ${new Date(weekStart).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}`
      : "This week",
    periodName || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 col-span-2 ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Transactions
          </h3>
          {totalAmount && (
            <p className="text-3xl font-bold text-gray-900">{totalAmount}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{scopeLabel}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" stroke="#666" style={{ fontSize: "12px" }} />
          <YAxis stroke="#666" style={{ fontSize: "12px" }} />
          <Tooltip
            formatter={(value) => `₦${(value as number).toLocaleString()}`}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar
            dataKey="fullPayment"
            fill="#10b981"
            name="Full Payment"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="partPayment"
            fill="#f97316"
            name="Part Payment"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
