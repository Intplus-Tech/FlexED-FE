export interface GetCollectionsTotalsResponse {
  success: boolean;
  message: string;
  data: CollectionsTotals;
  statusCode: number;
}

export interface CollectionsTotals {
  schoolId: string;
  period: AcademicPeriodSummary;
  totalPaidAll: number;
  totalPaidPeriod: number;
  totalExpectedAll: number;
  totalExpectedPeriod: number;
  outstandingAll: number;
  outstandingPeriod: number;
}

export interface AcademicPeriodSummary {
  id: string;
  name: string;
}
