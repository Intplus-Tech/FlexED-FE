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
