"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  User,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { formatDisplayDate } from "@/lib/date-utils";
import { fetchContactQueries, updateContactQueryStatus, type ContactQuery } from "@/services/queries";

export default function AdminQueriesPage() {
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadQueries = async () => {
    setIsLoading(true);
    try {
      const data = await fetchContactQueries();
      setQueries(data);
    } catch (err) {
      console.error("Queries fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    try {
      setUpdatingId(id);
      const newStatus = currentStatus === "resolved" ? "new" : "resolved";
      await updateContactQueryStatus(id, newStatus);
      await loadQueries();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredQueries = queries.filter(
    (q) =>
      q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.phone.includes(searchQuery) ||
      (q.email && q.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Contact Queries
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage and respond to messages from the public website.
            </p>
          </div>
          <button
            onClick={loadQueries}
            className="flex items-center gap-2 px-4 py-2 bg-white border shadow-sm text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none transition-all"
              />
            </div>
            <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
              {filteredQueries.length} {filteredQueries.length === 1 ? "query" : "queries"}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Sender</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Message</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-gray-400" />
                      Loading queries...
                    </td>
                  </tr>
                ) : filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-base font-medium text-gray-900">No queries found</p>
                      <p className="text-sm mt-1">Try adjusting your search criteria</p>
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((query) => (
                    <tr key={query.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {formatDisplayDate(query.created_at.split("T")[0])}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {new Date(query.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-medium text-gray-900">
                          <User size={14} className="text-gray-400" />
                          {query.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone size={14} className="text-gray-400" />
                            {query.phone}
                          </div>
                          {query.email && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail size={14} className="text-gray-400" />
                              <a href={`mailto:${query.email}`} className="hover:text-blue-600 hover:underline">
                                {query.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600 line-clamp-2 max-w-sm" title={query.message}>
                          {query.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {query.status === "resolved" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Resolved
                          </span>
                        ) : query.status === "in_progress" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={12} /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <AlertCircle size={12} /> New
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleUpdateStatus(query.id, query.status)}
                          disabled={updatingId === query.id}
                          className={`text-sm font-medium ${
                            query.status === "resolved" 
                              ? "text-gray-500 hover:text-gray-700" 
                              : "text-blue-600 hover:text-blue-800"
                          }`}
                        >
                          {updatingId === query.id ? "Updating..." : query.status === "resolved" ? "Mark Unresolved" : "Mark Resolved"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
