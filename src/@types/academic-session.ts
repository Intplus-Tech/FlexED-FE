
export interface CreateAcademicSessionRequest {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface GetAcademicSessionResponse {
  message: string;
  success: boolean;
  statusCode: number;
  data: {
    items: SessionData[]; 
    meta: Meta;
  };
}



export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
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
