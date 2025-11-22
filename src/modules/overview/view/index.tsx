"use client";

import { useState } from "react";
import { FeeMetrics } from "../components/fee-metrics";
import { SmsBalance } from "../components/sms-balance";
import { TransactionsChart } from "../components/transaction-chart";
import { CollectionByClass } from "../components/collection-by-class";
import { RecentTransactions } from "../components/recent-transaction";

export default function DashboardView() {
  const [isLoading] = useState(false);

  const transactionData = [
    { day: "Mon", fullPayment: 3500000, partPayment: 2200000 },
    { day: "Tue", fullPayment: 2700000, partPayment: 2900000 },
    { day: "Wed", fullPayment: 1400000, partPayment: 2200000 },
    { day: "Thur", fullPayment: 500000, partPayment: 3000000 },
    { day: "Fri", fullPayment: 3000000, partPayment: 2200000 },
    { day: "Sat", fullPayment: 1800000, partPayment: 2200000 },
    { day: "Sun", fullPayment: 2100000, partPayment: 300000 },
  ];

  const collectionData = [
    {
      className: "JSS 1:",
      percentage: "84%",
      collected: "₦4.5M",
      total: "₦5.4M",
    },
    {
      className: "JSS 2:",
      percentage: "83%",
      collected: "₦4.5M",
      total: "₦5.4M",
    },
    {
      className: "JSS 3:",
      percentage: "83%",
      collected: "₦4.5M",
      total: "₦5.4M",
    },
    {
      className: "SSS 1:",
      percentage: "87%",
      collected: "₦4.5M",
      total: "₦5.4M",
    },
    {
      className: "SSS 2:",
      percentage: "83%",
      collected: "₦4.5M",
      total: "₦5.4M",
    },
    {
      className: "SSS 3:",
      percentage: "83%",
      collected: "₦4.5M",
      total: "₦5.4M",
    },
  ];

  const recentTransactions = [
    {
      id: "1",
      time: "2:34pm",
      transactionId: "32353213",
      studentName: "Chiamaka Adebayo",
      class: "SSS 3",
      amountPaid: "₦150,000",
      percentRemaining: "75%",
      status: "Successful" as const,
    },
    {
      id: "2",
      time: "2:34pm",
      transactionId: "62889208",
      studentName: "Aisha Mohammed",
      class: "JSS 1",
      amountPaid: "₦150,000",
      percentRemaining: "25%",
      status: "Failed" as const,
    },
  ];

  return (
    <div className=" space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FeeMetrics
            feesThisTerm="₦24,750,000"
            feesCollected="₦1,450,000"
            totalOutstanding="₦8,250,000"
            percentageOutstanding="24.6%"
          />
        </div>
        <div>
          <SmsBalance
            available="₦20,000"
            smsCount="5,000"
            lastSent="450"
            onTopUp={() => console.log("Top up clicked")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionsChart data={transactionData} totalAmount="₦14,000,000" />
        <CollectionByClass totalStudents={324} data={collectionData} />
      </div>

      <div>
        <RecentTransactions
          transactions={recentTransactions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
