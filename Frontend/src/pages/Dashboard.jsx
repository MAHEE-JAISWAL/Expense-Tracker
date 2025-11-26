import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import { expenseAPI } from "../services/api";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import EditExpenseModal from "../components/EditExpenseModal";

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
  });
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchExpenses();
  }, [navigate]);

  const fetchExpenses = async () => {
    try {
      const response = await expenseAPI.getAllExpenses();
      setExpenses(response.data);
      const total = response.data.reduce(
        (sum, exp) => sum + parseFloat(exp.amount),
        0
      );
      setTotalExpense(total);
    } catch (err) {
      console.error("Error fetching expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await expenseAPI.addExpense(
        formData.title,
        parseFloat(formData.amount),
        formData.category
      );
      setFormData({ title: "", amount: "", category: "" });
      setShowForm(false);
      fetchExpenses();
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expenseAPI.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  const openEdit = (expense) => setEditing(expense);
  const closeEdit = () => setEditing(null);

  const handleEditSave = async ({ id, title, amount, category }) => {
    try {
      await expenseAPI.updateExpense(id, title, amount, category);
      closeEdit();
      fetchExpenses();
    } catch (err) {
      console.error("Error updating expense:", err);
    }
  };

  // Calculate category-wise expenses
  const getCategoryData = () => {
    const categories = {};
    expenses.forEach((exp) => {
      categories[exp.category] =
        (categories[exp.category] || 0) + parseFloat(exp.amount);
    });
    return categories;
  };

  const categoryData = getCategoryData();
  const chartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(categoryData),
        backgroundColor: [
          "#6366f1",
          "#ec4899",
          "#f59e0b",
          "#10b981",
          "#3b82f6",
          "#8b5cf6",
          "#ef4444",
          "#14b8a6",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { font: { size: 12 } },
      },
    },
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Add Expense Section */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">
              Manage Expenses
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              {showForm ? "Cancel" : "+ Add Expense"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Add New Expense
              </h3>
              <form onSubmit={handleAddExpense}>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g., Grocery Shopping"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Utilities">Utilities</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Add Expense
                </button>
              </form>
            </div>
          )}

          {/* Chart Section */}
          {expenses.length > 0 && (
            <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Spending by Category
              </h2>
              <div className="flex justify-center">
                <div style={{ maxWidth: "400px", width: "100%" }}>
                  <Pie data={chartData} options={chartOptions} />
                </div>
              </div>
            </div>
          )}

          {/* Expenses List */}
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Expenses
            </h2>
            {loading ? (
              <p className="text-center text-gray-600">Loading...</p>
            ) : expenses.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                No expenses yet. Click "Add Expense" to get started!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-gray-900 font-semibold">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-gray-900 font-semibold">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-gray-900 font-semibold">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-gray-900 font-semibold">
                        Date
                      </th>
                      <th className="px-6 py-3 text-center text-gray-900 font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 text-gray-900 font-semibold">
                          {expense.title}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-indigo-600 font-bold text-lg">
                          ${expense.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => openEdit(expense)} // <- open modal now
                            className="text-blue-600 hover:text-blue-700 font-semibold mr-4"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="text-red-600 hover:text-red-700 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Edit Expense Modal */}
          {editing && (
            <EditExpenseModal
              expense={editing}
              onClose={() => setEditing(null)}
              onSave={async (payload) => {
                await handleEditSave(payload);
                setEditing(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
