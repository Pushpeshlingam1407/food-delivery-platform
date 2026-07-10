import { toast as hotToast } from "react-hot-toast";
import { toast as sonnerToast } from "sonner";

export const notify = {
  success: (message: string, description?: string) => {
    hotToast.success(message, {
      style: {
        background: "#f0fdf4",
        color: "#166534",
        border: "1px solid #bbf7d0",
        fontWeight: 600,
      },
    });
    sonnerToast.success(message, { description });
  },
  error: (message: string, description?: string) => {
    hotToast.error(message, {
      style: {
        background: "#fef2f2",
        color: "#991b1b",
        border: "1px solid #fca5a5",
        fontWeight: 600,
      },
    });
    sonnerToast.error(message, { description });
  },
  info: (message: string, description?: string) => {
    hotToast(message, {
      icon: "ℹ️",
      style: {
        background: "#eff6ff",
        color: "#1e40af",
        border: "1px solid #bfdbfe",
        fontWeight: 600,
      },
    });
    sonnerToast.info(message, { description });
  },
};
