import { showSuccess, showError, showInfo } from "./toast";
import { ToastOptions } from "react-toastify";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
} & ToastOptions;

export function useToast() {
  const toast = ({ title, description, variant, ...props }: ToastProps) => {
    const content =
      title && description
        ? `${title}: ${description}`
        : title || description || "";

    if (!content) return;

    if (variant === "destructive") {
      showError(content, props);
    } else if (variant === "success") {
      showSuccess(content, props);
    } else {
      showInfo(content, props);
    }
  };

  return { toast };
}
