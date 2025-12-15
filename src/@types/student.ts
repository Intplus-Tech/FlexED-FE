export type CreateStudentRequest = {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  school: string;
  class: string;
  parents: string[];
  parentsDetails: ParentDetail[];
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
