import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export const ROLES = {
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  SCHOOL_STAFF: "SCHOOL_STAFF",
} as const;

export type Role = keyof typeof ROLES;

export const usePermission = () => {
  const { currentUser } = useSelector((state: RootState) => state.authState);
  
  const isAdmin = currentUser?.role === ROLES.SCHOOL_ADMIN;
  const isStaff = currentUser?.role === ROLES.SCHOOL_STAFF;
  
  return {
    role: currentUser?.role,
    isAdmin,
    isStaff,
    hasPermission: (allowedRoles: Role[]) => {
      return currentUser?.role ? allowedRoles.includes(currentUser.role as Role) : false;
    }
  };
};
