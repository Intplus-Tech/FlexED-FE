"use client";

import { ChevronDownIcon } from "@/icon/dashbaord";
import { useState } from "react";

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

  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.fullPayment, d.partPayment))
  );

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 100;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
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

      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-around gap-2 px-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div className="w-full flex gap-1 items-end h-52">
                <div
                  className="flex-1 bg-green-500 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${getBarHeight(item.fullPayment)}%` }}
                  title={`Full Payment: ₦${item.fullPayment.toLocaleString()}`}
                />
                <div
                  className="flex-1 bg-orange-400 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${getBarHeight(item.partPayment)}%` }}
                  title={`Part Payment: ₦${item.partPayment.toLocaleString()}`}
                />
              </div>
              <span className="text-sm text-gray-600 mt-2">{item.day}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-600">Full Payment</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-400"></div>
          <span className="text-sm text-gray-600">Part Payment</span>
        </div>
      </div>
    </div>
  );
}
