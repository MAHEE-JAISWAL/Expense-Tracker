import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import { expenseAPI } from "../services/api";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

const Home = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      fetchExpenses();
    } else {
      setLoading(false);
    }
  }, []);

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

  const savingsTips = [
    {
      title: "50/30/20 Rule",
      description: "Allocate 50% for needs, 30% for wants, 20% for savings.",
      icon: "📊",
    },
    {
      title: "Track Daily Spending",
      description:
        "Log every expense to identify spending patterns and reduce unnecessary costs.",
      icon: "📝",
    },
    {
      title: "Set Budget Limits",
      description:
        "Define category-wise budgets and stick to them. Review monthly.",
      icon: "💰",
    },
    {
      title: "Automate Savings",
      description:
        "Transfer a fixed amount to savings account on payday automatically.",
      icon: "🤖",
    },
    {
      title: "Cut Unnecessary Subscriptions",
      description:
        "Review and cancel unused subscriptions, apps, and memberships.",
      icon: "✂️",
    },
    {
      title: "Use Cash for Variable Expenses",
      description:
        "Physical money makes you more aware of spending compared to cards.",
      icon: "💵",
    },
  ];

  return (
    <div>
      <Navbar />

      {isLoggedIn && !loading ? (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
          {/* Dashboard Header */}
          <section className="pt-24 pb-12 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-lg text-indigo-100 mb-8">
                Track your spending and build better financial habits
              </p>

              {/* Stats Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-lg rounded-lg p-6 border border-white/30">
                  <p className="text-indigo-100 text-sm font-semibold">
                    Total Expenses
                  </p>
                  <h2 className="text-3xl font-bold text-white mt-2">
                    ${totalExpense.toFixed(2)}
                  </h2>
                  <p className="text-indigo-100 text-xs mt-2">This month</p>
                </div>

                <div className="bg-white/20 backdrop-blur-lg rounded-lg p-6 border border-white/30">
                  <p className="text-indigo-100 text-sm font-semibold">
                    Total Transactions
                  </p>
                  <h2 className="text-3xl font-bold text-white mt-2">
                    {expenses.length}
                  </h2>
                  <p className="text-indigo-100 text-xs mt-2">
                    Expense entries
                  </p>
                </div>

                <div className="bg-white/20 backdrop-blur-lg rounded-lg p-6 border border-white/30">
                  <p className="text-indigo-100 text-sm font-semibold">
                    Average Expense
                  </p>
                  <h2 className="text-3xl font-bold text-white mt-2">
                    $
                    {expenses.length > 0
                      ? (totalExpense / expenses.length).toFixed(2)
                      : "0.00"}
                  </h2>
                  <p className="text-indigo-100 text-xs mt-2">
                    Per transaction
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pie Chart Section */}
          {expenses.length > 0 && (
            <section className="py-12 px-4">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">
                    Spending Distribution
                  </h2>
                  <div className="flex justify-center">
                    <div style={{ maxWidth: "400px", width: "100%" }}>
                      <Pie data={chartData} options={chartOptions} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Savings Tips Section */}
          <section className="py-16 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
                Money-Saving Tips
              </h2>
              <p className="text-lg text-gray-600 text-center mb-12">
                Follow these expert strategies to reduce expenses and build
                wealth
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {savingsTips.map((tip, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-8 border-2 border-indigo-200 hover:shadow-lg transition"
                  >
                    <div className="text-5xl mb-4">{tip.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {tip.title}
                    </h3>
                    <p className="text-gray-700">{tip.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA to Dashboard */}
          <section className="py-12 px-4 bg-indigo-600">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Manage Your Expenses
              </h2>
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Go to Full Dashboard
              </button>
            </div>
          </section>
        </div>
      ) : !isLoggedIn ? (
        // Non-logged-in home page
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
          {/* Hero Section */}
          <section className="pt-32 pb-20 px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Manage Your Expenses Smartly
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Track, categorize, and control your spending with ease. Take
                charge of your financial future today.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/register")}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  Get Started
                </button>
                <a
                  href="#features"
                  className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
                >
                  Learn More
                </a>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 px-4 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
                Why Choose Expense Tracker?
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-8 border rounded-lg shadow-md hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Easy Tracking
                  </h3>
                  <p className="text-gray-600">
                    Add expenses in seconds. Categorize them and see where your
                    money goes.
                  </p>
                </div>

                <div className="p-8 border rounded-lg shadow-md hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Smart Analytics
                  </h3>
                  <p className="text-gray-600">
                    View detailed insights and statistics about your spending
                    patterns.
                  </p>
                </div>

                <div className="p-8 border rounded-lg shadow-md hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Secure & Private
                  </h3>
                  <p className="text-gray-600">
                    Your data is encrypted and stored securely. Only you have
                    access.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-gray-300 py-8 px-4">
            <div className="max-w-6xl mx-auto text-center">
              <p>&copy; 2025 Expense Tracker. All rights reserved.</p>
            </div>
          </footer>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default Home;
