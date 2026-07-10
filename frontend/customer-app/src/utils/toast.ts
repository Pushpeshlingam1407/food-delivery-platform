import { toast as hotToast } from "react-hot-toast";
import { toast as sonnerToast } from "sonner";

export const toast = {
  success: (message: string, description?: any) => {
    hotToast.success(message, {
      className: "custom-toast-success",
      duration: 3000,
    });
    if (description) {
      sonnerToast.success(message, { description });
    } else {
      sonnerToast.success(message);
    }
  },
  error: (message: string, description?: any) => {
    hotToast.error(message, {
      className: "custom-toast-error",
      duration: 4000,
    });
    if (description) {
      sonnerToast.error(message, { description });
    } else {
      sonnerToast.error(message);
    }
  },
  info: (message: string, description?: any) => {
    hotToast(message, {
      icon: "ℹ️",
      className: "custom-toast-info",
      duration: 3000,
    });
    if (description) {
      sonnerToast.info(message, { description });
    } else {
      sonnerToast.info(message);
    }
  },
  warning: (message: string, description?: any) => {
    hotToast(message, {
      icon: "⚠️",
      className: "custom-toast-warning",
      duration: 3500,
    });
    if (description) {
      sonnerToast.warning(message, { description });
    } else {
      sonnerToast.warning(message);
    }
  }
};
