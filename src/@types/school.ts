export interface SchoolProfileResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: SchoolProfile;
}

export interface SchoolProfile {
  _id: string;
  name: string;
  address: string;
  contactEmail: string;
  contactName: string;
  contactPhone: string;
  schoolType: "Private" | "Public";
  owner: string;
  logoUrl: { url: string; publicId: string };
  website?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

export interface UpdateSchoolRequest {
  name?: string;
  address?: string;
  contactEmail?: string;
  contactName?: string;
  contactPhone?: string;
  schoolType?: "Private" | "Public";
  website?: string;
  logoUrl?: string;
}

export interface FileUploadRequest {
  fileBase64: string;
  folder: string;
  originalName: string;
  mimeType: string;
  description: string;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  data: {
    _id: string;
    url: string;
    publicId: string;
    bytes: number;
    format: string;
    mimeType: string;
    originalName: string;
    folder: string;
    resourceType: string;
    uploadedBy: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
  statusCode: number;
    meta: {
      additionalProp1: unknown;
    };
  }

  export interface InviteStaffRequest {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    gender: string;
    staffNumber: string;
    position: string;
  }
  
  export interface UpdateStaffRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    gender?: string;
    staffNumber?: string;
    position?: string;
  }
  
  export interface StaffResponse {
    success: boolean;
    message: string;
    data: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      gender: string;
      staffNumber: string;
      position: string;
      school: string;
      isRegistered: boolean;
      isDeleted: boolean;
      deletedAt: string | null;
      authUserId: string;
      createdAt: string;
      updatedAt: string;
    };
    statusCode: number;
    meta: any;
  }
  
  export interface AcceptInviteRequest {
    token: string;
    password?: string;
  }
  
  export interface InviteDetailsResponse {
    success: boolean;
    message: string;
    data: {
      staff: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
      school: SchoolProfile;
    };
    statusCode: number;
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }

  export interface GetAllStaffResponse {
    success: boolean;
    message: string;
    data: {
      _id: string;
      school: string;
      isRegistered: boolean;
      email: string;
      address: string;
      authUserId: string | null;
      createdAt: string;
      deletedAt: string | null;
      firstName: string;
      gender: string;
      isDeleted: boolean;
      lastName: string;
      phone: string;
      position: string;
      staffNumber: string;
      updatedAt: string;
    }[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    statusCode: number;
  }
