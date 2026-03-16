import React, { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/adminService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHelpers: 0,
    totalIssues: 0,
    totalBookings: 0,
    totalRatings: 0,
  });

  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const [recentIssues, setRecentIssues] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const data = await getAdminDashboard();

      setStats(data.stats || {});
      setRecentIssues(data.recentIssues || []);
      setRecentBookings(data.recentBookings || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Helpers",
      value: stats.totalHelpers || 0,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Reported Issues",
      value: stats.totalIssues || 0,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings || 0,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Total Ratings",
      value: stats.totalRatings || 0,
      color: "bg-pink-100 text-pink-700",
    },
  ];

  if (loading) {
    return (
      <section className="min-h-screen bg-slate-100 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
            Loading admin dashboard...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-slate-300">
              Manage users, helpers, issues, bookings, and platform activity
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-500 px-4 py-2 text-white font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {statCards.map((item, index) => (
            <div key={index} className="bg-white rounded-3xl p-5 shadow-sm">
              <p className="text-sm text-slate-500">{item.title}</p>
              <div
                className={`mt-3 inline-block px-4 py-2 rounded-2xl text-2xl font-bold ${item.color}`}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Recent Issues</h2>

            <div className="mt-5 space-y-4">
              {recentIssues.length === 0 ? (
                <div className="text-slate-500">No recent issues found</div>
              ) : (
                recentIssues.map((issue) => (
                  <div
                    key={issue._id}
                    className="border border-slate-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {issue.user?.fullName || "User"}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {issue.category} • {issue.user?.village || "Village"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {issue.description}
                        </p>
                      </div>

                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                        {issue.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Recent Bookings
            </h2>

            <div className="mt-5 space-y-4">
              {recentBookings.length === 0 ? (
                <div className="text-slate-500">No recent bookings found</div>
              ) : (
                recentBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="border border-slate-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-800">
                          {booking.user?.fullName || "User"}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {booking.helper?.fullName || "Helper"} •{" "}
                          {booking.helper?.category || "Category"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {booking.address}
                        </p>
                      </div>

                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-blue-600 text-white py-4 text-center text-lg font-semibold">
            Users Managed
          </div>
          <div className="rounded-2xl bg-green-600 text-white py-4 text-center text-lg font-semibold">
            Helpers Managed
          </div>
          <div className="rounded-2xl bg-slate-900 text-white py-4 text-center text-lg font-semibold">
            Issues Monitored
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
