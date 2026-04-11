import React, { useEffect, useState } from "react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import { getMyIssues } from "../services/issueService";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../lib/utils";

const MyIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await getMyIssues();
      setIssues(res.issues || []);
    } catch (err) {
      alert("Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleToggle = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500 text-white";
      case "assigned":
        return "bg-blue-600 text-white";
      case "completed":
        return "bg-emerald-600 text-white";
      default:
        return "bg-slate-500 text-white";
    }
  };

  const stats = {
    total: issues.length,
    pending: issues.filter((i) => i.status === "pending").length,
    assigned: issues.filter((i) => i.status === "assigned").length,
    completed: issues.filter((i) => i.status === "completed").length,
  };

  return (
    <>
      <Navbar />

      <section className="min-h-screen bg-mesh px-4 py-6 pt-28">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[2.4rem] border border-white/60 bg-white/80 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold tracking-widest text-blue-600">
                  HISTORY
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900">
                  My Issues
                </h1>
                <p className="text-slate-500 mt-1">
                  Track and manage your community reports.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <div className="bg-blue-50 px-4 py-3 rounded-xl min-w-[95px]">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-xl font-bold text-blue-700">
                    {stats.total}
                  </p>
                </div>

                <div className="bg-amber-50 px-4 py-3 rounded-xl min-w-[95px]">
                  <p className="text-xs text-slate-500">Pending</p>
                  <p className="text-xl font-bold text-amber-700">
                    {stats.pending}
                  </p>
                </div>

                <div className="bg-blue-50 px-4 py-3 rounded-xl min-w-[95px]">
                  <p className="text-xs text-slate-500">Assigned</p>
                  <p className="text-xl font-bold text-blue-700">
                    {stats.assigned}
                  </p>
                </div>

                <div className="bg-emerald-50 px-4 py-3 rounded-xl min-w-[95px]">
                  <p className="text-xs text-slate-500">Completed</p>
                  <p className="text-xl font-bold text-emerald-700">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="text-center py-10 rounded-[2rem] border border-white/60 bg-white/80 shadow-md backdrop-blur-xl">
                <Loader2 className="animate-spin mx-auto text-blue-600" />
                <p className="mt-2 text-slate-600">Loading issues...</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-10 rounded-[2rem] border border-white/60 bg-white/80 shadow-md backdrop-blur-xl">
                <ShieldCheck className="mx-auto text-slate-300" size={40} />
                <p className="mt-3 text-lg font-bold text-slate-900">
                  No issues found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {issues.map((issue) => {
                  const isExpanded = expandedId === issue._id;

                  return (
                    <div
                      key={issue._id}
                      className="self-start rounded-2xl bg-white/80 p-5 shadow-md backdrop-blur-xl hover:shadow-xl transition"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <h2 className="font-bold text-lg text-slate-900">
                            {issue.category}
                          </h2>

                          <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                            <MapPin size={12} />
                            {issue.address || "Area location"}
                          </p>

                          <p className="text-sm text-slate-500 mt-2">
                            {issue.description}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span
                            className={cn(
                              "text-xs px-3 py-1 rounded-full font-bold",
                              getStatusStyle(issue.status)
                            )}
                          >
                            {issue.status}
                          </span>

                          <button
                            onClick={() => handleToggle(issue._id)}
                            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            {isExpanded ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-5 grid gap-3">
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                              Description
                            </p>
                            <p className="text-sm text-slate-700 mt-2">
                              {issue.description || "N/A"}
                            </p>
                          </div>

                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                              Address
                            </p>
                            <p className="text-sm text-slate-700 mt-2">
                              {issue.address || "N/A"}
                            </p>
                          </div>

                          {issue.image && (
                            <div className="bg-slate-50 p-3 rounded-xl">
                              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                                Image
                              </p>
                              <img
                                src={`http://localhost:8080${issue.image}`}
                                alt="issue"
                                className="mt-2 h-32 w-full object-cover rounded-xl"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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