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
  statusCode: number;
  data: {            
    items: Student[];
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


export interface BulkUploadResponse {
    success: boolean;
    message: string;
    data: BulkUploadData;
    statusCode: number;
}

export interface BulkUploadData {
    successful: SuccessfulStudent[];
    failed: FailedStudent[];
}

export interface SuccessfulStudent {
    // Add properties based on what successful uploads return
    // Currently empty array in your example
    row?: number;
    admissionNumber?: string;
    // Add other student properties as needed
}

export interface FailedStudent {
    row: number;
    admissionNumber: string;
    error: string;
}