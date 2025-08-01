import React, { useEffect } from "react";

export default function Toast({ toasts = [], removeToast }) {
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => removeToast(toasts[0].id), 3500);
      return () => clearTimeout(timer);
    }
  }, [toasts, removeToast]);
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col space-y-3">
      {toasts.map((toast) => (
        <div key={toast.id} className={toastColor(toast.type)}>
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
function toastColor(type) {
  let base =
    "flex items-center px-4 py-3 rounded-lg shadow-lg backdrop-blur bg-white dark:bg-gray-900 font-semibold";
  if (type === "success")
    return base + " border border-green-500 text-green-700";
  if (type === "error") return base + " border border-rose-500 text-rose-700";
  return base + " border border-gray-400 text-gray-900";
}
