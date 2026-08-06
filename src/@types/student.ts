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
    address?: string;
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

export type GetStudentByIdResponse = StudentDetail;

export interface StudentDetail {
  _id: string;
  id?: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  school: string;
  class: {
    _id: string;
    name: string;
    level: string;
    classType: string;
    subClass?: string;
    description?: string;
  };
  profileImageId?: {
    _id: string;
    url: string;
    publicId: string;
  } | null;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  discounts: StudentDiscount[];
  exemptions: StudentExemption[];
  exemptedPayments: ExemptedPayment[];
  parentDetails: ParentDetailResponse[];
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface StudentDiscount {
  paymentItem: string;
  type: "PERCENTAGE" | "FLAT";
  value: number;
  expiresAt: string;
}

export interface StudentExemption {
  paymentItem: string;
  reason?: string;
  exemptedBy?: string;
  exemptedAt?: string;
}

export interface ExemptedPayment {
  paymentItemId: string;
  name: string;
  amount: number;
  category?: string;
  reason?: string;
  exemptedAt?: string;
}

export interface ClassMapping {
  fromClassId: string;
  toClassId: string;
}

export interface PromoteStudentsRequest {
  excludeStudentIds: string[];
  classMappings: ClassMapping[];
  dryRun: boolean;
}

export interface PromoteStudentsResponse {
  success: boolean;
  message: string;
  data?: {
    promotedCount?: number;
    excludedCount?: number;
    promoted?: string[];
    excluded?: string[];
  };
}

export interface ParentDetailResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
  isRegistered: boolean;
  address?: string;
  occupation?: string;
  gender?: "MALE" | "FEMALE";
  title?: string;
  authUserId?: string | null;
  children?: string[];
}