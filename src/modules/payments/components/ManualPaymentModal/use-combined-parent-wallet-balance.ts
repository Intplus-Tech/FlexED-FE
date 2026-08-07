import { useGetParentWalletQuery } from "@/redux/api/parent-wallet";

/**
 * Bounded to a fixed number of hook calls (rules of hooks forbid a variable
 * count) rather than one call per parent. Covers the overwhelming majority
 * of real families — a 4th+ registered guardian simply won't contribute to
 * the combined total used for the auto-distribute wallet prefill.
 */
const MAX_PARENTS = 3;

export interface ParentWalletInfo {
  balance: number;
  isLoading: boolean;
}

export function useCombinedParentWalletBalance(parentIds: (string | undefined)[]) {
  const [id0, id1, id2] = parentIds.slice(0, MAX_PARENTS);

  const q0 = useGetParentWalletQuery(id0 as string, { skip: !id0 });
  const q1 = useGetParentWalletQuery(id1 as string, { skip: !id1 });
  const q2 = useGetParentWalletQuery(id2 as string, { skip: !id2 });

  const entries: [string | undefined, typeof q0][] = [
    [id0, q0],
    [id1, q1],
    [id2, q2],
  ];

  const infoByParentId: Record<string, ParentWalletInfo> = {};
  entries.forEach(([id, query]) => {
    if (!id) return;
    infoByParentId[id] = {
      balance: query.data?.balance ?? 0,
      isLoading: query.isFetching,
    };
  });

  const total = Object.values(infoByParentId).reduce(
    (sum, info) => sum + info.balance,
    0,
  );
  const isLoading = Object.values(infoByParentId).some((info) => info.isLoading);

  return { infoByParentId, total, isLoading };
}
