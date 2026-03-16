import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { getMyIssues } from "../services/issueService";

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await getMyIssues();
      setIssues(data.issues || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to fetch your issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleFindHelpers = (issue) => {
    localStorage.setItem("selected_issue_id", issue._id);
    navigate("/helpers");
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "matched":
        return "bg-blue-100 text-blue-700";
      case "booked":
        return "bg-purple-100 text-purple-700";
      case "in-progress":
        return "bg-indigo-100 text-indigo-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              My Issues
            </h1>
            <p className="mt-2 text-slate-600">
              View your submitted issues and assign helpers later if needed.
            </p>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                Loading your issues...
              </div>
            ) : issues.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-800">
                  No issues found
                </p>
                <p className="mt-2 text-slate-600">
                  Submit a problem report to see it here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {issues.map((issue) => (
                  <div
                    key={issue._id}
                    className="bg-white rounded-3xl shadow-sm p-5 border border-slate-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {issue.category}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {issue.address || "No address provided"}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(
                          issue.status
                        )}`}
                      >
                        {issue.status}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="bg-slate-50 rounded-2xl p-3">
                        <p className="text-xs text-slate-500">Description</p>
                        <p className="text-sm font-medium text-slate-800 mt-1">
                          {issue.description}
                        </p>
                      </div>

                      {issue.image ? (
                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500 mb-2">
                            Uploaded Image
                          </p>
                          <img
                            src={`http://localhost:8080${issue.image}`}
                            alt="Issue"
                            className="w-full h-48 object-cover rounded-xl"
                          />
                        </div>
                      ) : null}

                      {issue.assignedHelper ? (
                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500">Assigned Helper</p>
                          <p className="text-sm font-medium text-slate-800 mt-1">
                            {issue.assignedHelper.fullName} •{" "}
                            {issue.assignedHelper.category}
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {issue.assignedHelper.phone}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-2xl p-3">
                          <p className="text-xs text-slate-500">Assigned Helper</p>
                          <p className="text-sm font-medium text-slate-800 mt-1">
                            Not assigned yet
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => handleFindHelpers(issue)}
                        className="rounded-2xl bg-blue-600 text-white py-3 font-semibold"
                      >
                        Find Helpers
                      </button>

                      <button
                        onClick={fetchIssues}
                        className="rounded-2xl border border-slate-300 text-slate-700 py-3 font-semibold"
                      >
                        Refresh
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default MyIssues;