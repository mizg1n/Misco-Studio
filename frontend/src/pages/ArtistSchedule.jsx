import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { Clock, Calendar as CalendarIcon, CheckCircle, XCircle } from "lucide-react";

const ArtistSchedule = () => {
  const [workingHours, setWorkingHours] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Leave Form
  const [leaveFormOpen, setLeaveFormOpen] = useState(false);
  const [leaveData, setLeaveData] = useState({
    leave_type: "ANNUAL",
    start_datetime: "",
    end_datetime: "",
    reason: ""
  });

  const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  const fetchData = async () => {
    try {
      const [whRes, leavesRes] = await Promise.all([
        axiosInstance.get("/working-hours/"),
        axiosInstance.get("/leaves/")
      ]);
      setWorkingHours(whRes.data);
      setLeaves(leavesRes.data);
    } catch (error) {
      console.error("Error fetching schedule", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/leaves/", leaveData);
      setLeaveFormOpen(false);
      setLeaveData({ leave_type: "ANNUAL", start_datetime: "", end_datetime: "", reason: "" });
      fetchData();
      alert("İzin talebiniz başarıyla gönderildi.");
    } catch (error) {
      alert("İzin talebi oluşturulurken bir hata oluştu.");
    }
  };

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Clock className="text-purple-400" size={24} />
            Sabit Haftalık Çalışma Şablonum
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Aşağıdaki saatler sizin her hafta geçerli olan <strong>genel (sabit)</strong> mesai planınızdır. 
          Aldığınız belirli tarihli izinler bu şablonu bozmaz; sadece ilgili tarihlerde müşterilerin randevu almasını engeller.
        </p>
        <div className="glass-panel p-6 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {workingHours.length === 0 ? (
              <p className="text-slate-400">Henüz çalışma saati tanımlanmamış.</p>
            ) : (
              workingHours.map(wh => (
                <div key={wh.id} className={wh.is_active ? "p-4 rounded-xl border border-purple-500/30 bg-purple-500/10" : "p-4 rounded-xl border border-slate-700 bg-slate-800/50"}>
                  <h3 className="font-semibold text-slate-200 mb-2">{DAYS[wh.day_of_week]}</h3>
                  {wh.is_active ? (
                    <p className="text-purple-300 font-medium">
                      {wh.start_time.substring(0, 5)} - {wh.end_time.substring(0, 5)}
                    </p>
                  ) : (
                    <p className="text-slate-400">İzinli (Çalışmıyor)</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <CalendarIcon className="text-pink-400" size={24} />
            İzin Taleplerim
          </h2>
          <button 
            onClick={() => setLeaveFormOpen(true)}
            className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors"
          >
            Yeni İzin Talep Et
          </button>
        </div>

        {leaveFormOpen && (
          <div className="glass-panel p-6 rounded-2xl mb-6 border border-pink-500/30">
            <h3 className="text-lg font-semibold text-white mb-4">İzin Talebi Oluştur</h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">İzin Türü</label>
                  <select 
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-pink-500"
                    value={leaveData.leave_type}
                    onChange={(e) => setLeaveData({...leaveData, leave_type: e.target.value})}
                  >
                    <option value="ANNUAL">Yıllık İzin</option>
                    <option value="SICK">Hastalık İzni / Rapor</option>
                    <option value="UNPAID">Ücretsiz İzin</option>
                    <option value="CASUAL">Mazeret İzni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Başlangıç</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-pink-500"
                    value={leaveData.start_datetime}
                    onChange={(e) => setLeaveData({...leaveData, start_datetime: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Bitiş</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-pink-500"
                    value={leaveData.end_datetime}
                    onChange={(e) => setLeaveData({...leaveData, end_datetime: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-400 mb-1">Gerekçe / Açıklama</label>
                  <textarea 
                    required
                    rows="2"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-pink-500"
                    value={leaveData.reason}
                    onChange={(e) => setLeaveData({...leaveData, reason: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setLeaveFormOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white">İptal</button>
                <button type="submit" className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium">Gönder</button>
              </div>
            </form>
          </div>
        )}

        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Tür</th>
                <th className="px-6 py-4 font-medium">Başlangıç</th>
                <th className="px-6 py-4 font-medium">Bitiş</th>
                <th className="px-6 py-4 font-medium">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">Geçmiş izin talebiniz bulunmuyor.</td>
                </tr>
              ) : (
                leaves.map(leave => (
                  <tr key={leave.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      {leave.leave_type === "ANNUAL" ? "Yıllık İzin" : 
                       leave.leave_type === "SICK" ? "Hastalık" : 
                       leave.leave_type === "UNPAID" ? "Ücretsiz" : "Mazeret"}
                    </td>
                    <td className="px-6 py-4">{new Date(leave.start_datetime).toLocaleString("tr-TR")}</td>
                    <td className="px-6 py-4">{new Date(leave.end_datetime).toLocaleString("tr-TR")}</td>
                    <td className="px-6 py-4">
                      <span className={leave.status === "APPROVED" ? "px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400" : leave.status === "REJECTED" ? "px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400" : "px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400"}>
                        {leave.status === "PENDING" ? "Bekliyor" : 
                         leave.status === "APPROVED" ? "Onaylandı" : "Reddedildi"}
                      </span>
                    </td>
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

export default ArtistSchedule;