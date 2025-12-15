export interface CreateClassRequest {
  id?: string;
  name: string;
  level: string;
  classType: string;
  description: string;
  subClass: string;
}

export interface ClassItem {
  _id: string;
  name: string;
  level: string;
  classType: "NATIVE" | string;
  description: string;
  subClass: string;
  createdAt: string;
  updatedAt: string;
}

export type GetAllClassesResponse = { message: string; data: ClassItem[] };
