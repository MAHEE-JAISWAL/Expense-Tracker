// jsx
// filepath: Frontend/src/components/EditExpenseModal.jsx
// ...new file...
import React, { useState, useEffect } from "react";

export default function EditExpenseModal({ expense, onClose, onSave }) {
  const [form, setForm] = useState({ title: "", amount: "", category: "" });

  useEffect(() => {
    if (expense) {
      setForm({
        title: expense.title ?? "",
        amount: expense.amount != null ? String(expense.amount) : "",
        category: expense.category ?? "",
      });
    }
  }, [expense]);

  if (!expense) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      id: expense.id,
      title: form.title.trim(),
      amount: parseFloat(form.amount),
      category: form.category.trim(),
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4">Edit Expense</h3>
        <form onSubmit={handleSubmit}>
          <label className="block mb-3">
            <span className="text-sm font-semibold">Title</span>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded"
            />
          </label>

          <label className="block mb-3">
            <span className="text-sm font-semibold">Amount</span>
            <input
              name="amount"
              value={form.amount}
              onChange={handleChange}
              type="number"
              step="0.01"
              required
              className="mt-1 block w-full px-3 py-2 border rounded"
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm font-semibold">Category</span>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border rounded"
            />
          </label>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
