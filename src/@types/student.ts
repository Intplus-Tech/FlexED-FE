export type CreateStudentRequest = {
  id?: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  school: string;
  class: string;
  // parents: string[];
  parentDetails: ParentDetail[];
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
};
export interface ParentDetail {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  occupation?: string;
  relationship: "PARENT" | "GUARDIAN";
  gender: "MALE" | "FEMALE";
  title?: string;
}

export interface GetStudentsResponse {
  success: boolean;
  message: string;
  data: Student[];
  statusCode: number;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  school: string;
  class: string;
  parentDetails: {
    _id: string;
    email: string;
    authUserId: string;
    children: string[];
    firstName: string;
    isRegistered: boolean;
    lastName: string;
    phone: string;
    relationship: string;
  }[];
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
