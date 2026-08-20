import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { BookOpen, CheckCircle, XCircle } from "lucide-react";

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await axiosInstance.get("/leaves/");
      // Sort by newest first
      setLeaves(res.data.sort((a, b) => new Date(b.start_datetime) - new Date(a.start_datetime)));
    } catch (error) {
      console.error("Error fetching leaves", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleReview = async (id, status) => {
    try {
      await axiosInstance.patch(/leaves/ + id + /review/, { status });
      fetchLeaves();
    } catch (error) {
      alert("İşlem sırasında hata oluştu.");
    }
  };

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;
  
  const pendingLeaves = leaves.filter(l => l.status === "PENDING");
  const pastLeaves = leaves.filter(l => l.status !== "PENDING");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-4">
          <BookOpen className="text-amber-400" size={24} />
          Onay Bekleyen İzin Talepleri
          {pendingLeaves.length > 0 && (
            <span className="ml-2 text-sm bg-yellow-500/20 text-yellow-400 px-2.5 py-0.5 rounded-full">{pendingLeaves.length}</span>
          )}
        </h2>

        {pendingLeaves.length === 0 ? (
          <div className="glass-panel p-6 rounded-2xl text-center">
            <p className="text-slate-400">Onay bekleyen izin talebi bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingLeaves.map(leave => (
              <div key={leave.id} className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-yellow-500/20">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                      {leave.leave_type === "ANNUAL" ? "Yıllık İzin" : 
                       leave.leave_type === "SICK" ? "Hastalık Raporu" : 
                       leave.leave_type === "UNPAID" ? "Ücretsiz İzin" : "Mazeret İzni"}
                    </span>
                    <span className="text-sm text-slate-300 font-bold">
                      Sanatçı: {leave.artist_name}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 mt-2">
                    <span className="text-slate-400">Tarih:</span> {new Date(leave.start_datetime).toLocaleString("tr-TR")} - {new Date(leave.end_datetime).toLocaleString("tr-TR")}
                  </p>
                  <div className="mt-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                    <p className="text-sm text-slate-300 whitespace-pre-wrap"><span className="text-slate-500">Gerekçe:</span> {leave.reason}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleReview(leave.id, "APPROVED")}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle size={18} /> Onayla
                  </button>
                  <button 
                    onClick={() => handleReview(leave.id, "REJECTED")}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    <XCircle size={18} /> Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-4">Geçmiş İzinler</h2>
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Sanatçı</th>
                <th className="px-6 py-4 font-medium">Tür</th>
                <th className="px-6 py-4 font-medium">Başlangıç</th>
                <th className="px-6 py-4 font-medium">Bitiş</th>
                <th className="px-6 py-4 font-medium">Durum</th>
                <th className="px-6 py-4 font-medium">Onaylayan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {pastLeaves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">Geçmiş izin kaydı bulunmuyor.</td>
                </tr>
              ) : (
                pastLeaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{leave.artist_name}</td>
                    <td className="px-6 py-4">
                      {leave.leave_type === "ANNUAL" ? "Yıllık İzin" : 
                       leave.leave_type === "SICK" ? "Hastalık" : 
                       leave.leave_type === "UNPAID" ? "Ücretsiz" : "Mazeret"}
                    </td>
                    <td className="px-6 py-4">{new Date(leave.start_datetime).toLocaleString("tr-TR")}</td>
                    <td className="px-6 py-4">{new Date(leave.end_datetime).toLocaleString("tr-TR")}</td>
                    <td className="px-6 py-4">
                      <span className={leave.status === 'APPROVED' ? 'px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400' : 'px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400'}>
                        {leave.status === "APPROVED" ? "Onaylandı" : "Reddedildi"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{leave.reviewed_by_name || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaves;