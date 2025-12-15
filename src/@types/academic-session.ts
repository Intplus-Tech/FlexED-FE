export interface CreateAcademicSessionRequest {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface GetAcademicSessionResponse {
  message: string;
  data: SessionData[];
}

export interface SessionData {
  _id: string;
  school: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
