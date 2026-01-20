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
  logoUrl: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}
