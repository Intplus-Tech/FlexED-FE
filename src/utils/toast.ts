/* eslint-disable @typescript-eslint/no-explicit-any */

import { toast } from "sonner";

export const showerror = (message: string, options: any = {}) => {
  toast.error(message, {
    duration: 2500,
    onClick: (toast: any) => toast.dismiss(), // Dismiss toast on click
    ...options,
    // Allow overriding options if needed
  });
};

export const showsuccess = (message: string, options: any = {}) => {
  toast.success(message, {
    duration: 2500, // Default duration in milliseconds
    onClick: (toast: any) => toast.dismiss(), // Dismiss toast on click
    ...options, // Allow overriding options if needed
  });
};

export const showinfo = (message: string, options: any = {}) => {
  toast.info(message, {
    duration: 2500, // Default duration in milliseconds
    onClick: (toast: any) => toast.dismiss(), // Dismiss toast on click
    ...options, // Allow overriding options if needed
  });
};
