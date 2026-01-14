"use client";

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
  useGetTransactionChartDataQuery,
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

  const {
    isFetching: isFetchingChartData,
    isLoading: isLoadingChartData,
    data: chartData,
  } = useGetTransactionChartDataQuery(
    {
      schoolId: String(authState.currentUser?.schoolId),
    },
    { skip: !authState.currentUser }
  );

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
        <TransactionsChart data={chartData?.data ?? []} totalAmount="" />
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
