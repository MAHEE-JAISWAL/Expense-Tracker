import React, { useEffect, useState } from "react";
import Navbar from "../components/NavBar";
import { authAPI, expenseAPI } from "../services/api";

const Badge = ({ title, desc }) => (
  <div className="bg-white p-4 rounded shadow text-center">
    <div className="text-3xl mb-2">🏅</div>
    <h4 className="font-bold">{title}</h4>
    <p className="text-sm text-gray-600">{desc}</p>
  </div>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await authAPI.me();
        if (res.data?.success) {
          setUser(res.data.user);
          setForm({
            name: res.data.user.name || "",
            email: res.data.user.email || "",
          });
        }
      } catch (e) {
        console.error("me error", e);
      }

      try {
        const exp = await expenseAPI.getAllExpenses();
        setExpenses(exp.data || []);
      } catch (e) {
        console.error("expenses error", e);
      }
    })();
  }, []);

  const total = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const count = expenses.length;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form.name, form.email);
      if (res.data?.success) {
        setUser(res.data.user);
        setEditing(false);
      } else {
        console.error(res.data?.message);
      }
    } catch (err) {
      console.error("update error", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-6 pt-24">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold mb-2">Profile</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="text-indigo-600"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => setEditing(false)}
                  className="text-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>

            {!editing ? (
              <>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-semibold mb-2">{user?.name ?? "—"}</p>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold">{user?.email ?? "—"}</p>
              </>
            ) : (
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600">
                    Full name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6">
              <p className="text-sm text-gray-600">Total spent</p>
              <p className="text-xl font-bold text-indigo-600">
                ${total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Transactions: {count}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 grid md:grid-cols-2 gap-6">
            <Badge
              title="Consistency"
              desc={
                count >= 10
                  ? "Great – 10+ entries"
                  : "Keep logging your expenses"
              }
            />
            <Badge
              title="Savings Star"
              desc={
                total < 500 ? "Good control" : "Try to cut discretionary spend"
              }
            />
            <Badge
              title="No-subscribe saver"
              desc="Review subscriptions monthly"
            />
            <Badge title="Goal Setter" desc="Set a monthly savings target" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
