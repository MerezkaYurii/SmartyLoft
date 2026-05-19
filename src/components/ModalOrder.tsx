"use client";

import { useEffect, useState } from "react";
import { Dictionary } from "../i18n-config";
import { useDictionary } from "../hooks/useDictionary";

interface ModalOrderProps {

  buttonLabel?: string;
}

export default function ModalOrder({ buttonLabel }: ModalOrderProps) {
  const dict = useDictionary();

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
  });
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status) {
      const timer = setTimeout(() => setStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", contact: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }

    setLoading(false);
  };

  const openModal = () => {
    setIsOpen(true);
    setStatus(null);
    setFormData({ name: "", contact: "", message: "" });
  };

  const closeModal = () => {
    setIsOpen(false);
    setStatus(null);
  };
  if (!dict) return null;
  return (
    <>
      {/* Кнопка */}
      <button
        onClick={openModal}
        className="px-6 py-3 bg-gradient-to-r from-indigo-800 to-purple-600 text-white rounded-xl shadow-lg hover:opacity-80 transition  duration-500"
      >
        {buttonLabel || dict.ModalOrder.cta}
      </button>

      {/* Модалка */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            className="bg-gray-200 dark:bg-neutral-900 p-6 rounded-2xl max-w-md w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4 text-center text-neutral-800 dark:text-neutral-100">
              {dict.ModalOrder.title}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder={dict.ModalOrder.phName}
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
              />
              <input
                type="text"
                name="contact"
                placeholder={dict.ModalOrder.phEmail}
                value={formData.contact}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
              />
              <textarea
                name="message"
                placeholder={dict.ModalOrder.phTextarea}
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 dark:bg-neutral-800 dark:border-neutral-700"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 rounded-lg bg-blue-800 text-white  hover:opacity-80 transition  duration-500"
              >
                {loading ? dict.ModalOrder.loding : dict.ModalOrder.btn}
              </button>

              {status === "success" && (
                <p className="text-green-600 text-center mt-2">
                  ✅ {dict.ModalOrder.success}
                </p>
              )}
              {status === "error" && (
                <p className="text-red-600 text-center mt-2">
                  ❌ {dict.ModalOrder.error}
                </p>
              )}
            </form>

            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-neutral-500 hover:text-neutral-800 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}
