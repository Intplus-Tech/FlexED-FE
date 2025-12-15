"use client";

import { useState } from "react";
import { FeeMetrics } from "../components/fee-metrics";
import { SmsBalance } from "../components/sms-balance";
import { TransactionsChart } from "../components/transaction-chart";
import { CollectionByClass } from "../components/collection-by-class";
import { RecentTransactions } from "../components/recent-transaction";
import { useGetSmsMetricsQuery } from "@/redux/api/sms";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetClassCollectionsQuery,
  useGetPaymentMetricsQuery,
  useGetTransactionsQuery,
} from "@/redux/api/transaction";
import { formatNaira } from "@/utils/functions";

export default function DashboardView() {
  const authState = useSelector((state: RootState) => state.authState);
  const { data, isFetching, isLoading } = useGetSmsMetricsQuery(
    {
      schoolId: authState.currentUser?.schoolId as string,
    },
    { skip: !authState.currentUser }
  );

  const {
    data: transactions,
    isFetching: isTrasactionFetching,
    isLoading: isTransactionLoading,
  } = useGetTransactionsQuery(
    {
      schoolId: String(authState.currentUser?.schoolId),
    },
    { skip: !authState.currentUser }
  );

  const {
    data: smsMetrics,
    isFetching: isFetchingSmsMetrics,
    isLoading: isLoadingSmsMetrics,
  } = useGetSmsMetricsQuery(
    {
      schoolId: String(authState.currentUser?.schoolId),
    },
    { skip: !authState.currentUser }
  );

  const {
    data: paymentMetrics,
    isFetching: isFetchingMetrics,
    isLoading: isLoadingMetrics,
  } = useGetPaymentMetricsQuery();

  const {
    data: collection,
    isFetching: isFetchingCollection,
    isLoading: isLoadingCollection,
  } = useGetClassCollectionsQuery();

  const transactionData = [
    { day: "Mon", fullPayment: 3500000, partPayment: 2200000 },
    { day: "Tue", fullPayment: 2700000, partPayment: 2900000 },
    { day: "Wed", fullPayment: 1400000, partPayment: 2200000 },
    { day: "Thur", fullPayment: 500000, partPayment: 3000000 },
    { day: "Fri", fullPayment: 3000000, partPayment: 2200000 },
    { day: "Sat", fullPayment: 1800000, partPayment: 2200000 },
    { day: "Sun", fullPayment: 2100000, partPayment: 300000 },
  ];

  return (
    <div className=" space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <FeeMetrics
            feesThisTerm={formatNaira(
              paymentMetrics?.data?.totalExpectedAll ?? 0
            )}
            feesCollected={formatNaira(paymentMetrics?.data?.totalPaidAll ?? 0)}
            totalOutstanding={formatNaira(
              (paymentMetrics?.data?.totalExpectedAll ?? 0) -
                (paymentMetrics?.data?.totalPaidAll ?? 0)
            )}
            percentageOutstanding={
              paymentMetrics?.data?.totalExpectedAll
                ? (
                    (paymentMetrics.data.totalPaidAll /
                      paymentMetrics.data.totalExpectedAll) *
                    100
                  ).toFixed(2)
                : "0.00"
            }
          />
        </div>
        <div>
          <SmsBalance
            available={smsMetrics?.data?.avalable ?? "0"}
            smsCount={smsMetrics?.data?.sms ?? "0"}
            lastSent={smsMetrics?.data?.totalSent ?? "0"}
            onTopUp={() => console.log("Top up clicked")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TransactionsChart data={transactionData} totalAmount="₦14,000,000" />
        <CollectionByClass
          totalStudents={collection?.data?.totalPaid ?? 0}
          data={collection?.data?.items ?? []}
          isLoading={isFetchingCollection || isLoadingCollection}
        />
      </div>

      <div>
        <RecentTransactions
          transactions={transactions?.data ?? []}
          isLoading={isFetching || isLoading}
        />
      </div>
    </div>
  );
}
