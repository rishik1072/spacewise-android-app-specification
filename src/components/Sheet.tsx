import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

export function Sheet({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 320, damping: 34 }}
      className="absolute inset-0 z-40 flex flex-col bg-[#f4f5f8] dark:bg-[#0a0b0f]"
    >
      {children}
    </motion.div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  danger,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.95 }}
            className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-[#15161d] sm:rounded-3xl"
          >
            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="mt-2 text-[13.5px] leading-relaxed text-slate-500 dark:text-white/50">{description}</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 rounded-2xl bg-slate-100 py-3 text-[14.5px] font-semibold text-slate-700 dark:bg-white/[0.06] dark:text-white/80"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-2xl py-3 text-[14.5px] font-semibold text-white ${
                  danger ? "bg-rose-600" : "bg-indigo-600"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
