import { SmsBalanceProps } from "../../@types";

export function SmsBalance({
  available,
  smsCount,
  lastSent,
  onTopUp,
}: SmsBalanceProps) {
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">SMS Balance</h3>
        <button
          onClick={onTopUp}
          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          + Top Up
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className=" font-bold text-green-600 mb-1">{available}</p>
          <p className="text-sm text-gray-600">Available</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <p className=" font-bold text-yellow-600 mb-1">{smsCount}</p>
          <p className="text-sm text-gray-600">SMS</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <p className=" font-bold text-red-600 mb-1">{lastSent}</p>
          <p className="text-sm text-gray-600">Last Sent</p>
        </div>
      </div>
    </div>
  );
}
