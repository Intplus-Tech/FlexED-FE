"use client";

import { ChevronDownIcon } from "@/icon/dashbaord";
import { useState } from "react";
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
}

export function TransactionsChart({
  data,
  totalAmount,
}: TransactionsChartProps) {
  const [period, setPeriod] = useState("Week");

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 col-span-2 ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Transactions
          </h3>
          <p className="text-3xl font-bold text-gray-900">{totalAmount}</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          {period}
          <ChevronDownIcon />
        </button>
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
