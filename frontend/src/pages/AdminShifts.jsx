import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { Calendar, Clock, AlertCircle } from "lucide-react";

const AdminShifts = () => {
  const [workingHours, setWorkingHours] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  
  const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

  const fetchData = async () => {
    try {
      const [whRes, artistsRes, shiftsRes] = await Promise.all([
        axiosInstance.get("/working-hours/"),
        axiosInstance.get("/users/"),
        axiosInstance.get("/shifts/")
      ]);
      setWorkingHours(whRes.data);
      setArtists(artistsRes.data.filter(u => u.role === "ARTIST"));
      setShifts(shiftsRes.data);
    } catch (error) {
      console.error("Error fetching shift data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="text-slate-400">Yükleniyor...</div>;
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mb-6">
          <Calendar className="text-purple-400" size={24} />
          Personel Vardiya Matrisi
        </h2>

        <div className="flex flex-wrap gap-2 mb-6">
          {DAYS.map((dayName, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              className={selectedDay === idx ? "px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-purple-500 text-white shadow-lg shadow-purple-500/20" : "px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"}
            >
              {dayName}
            </button>
          ))}
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/80 text-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium w-1/3">Sanatçı</th>
                <th className="px-6 py-4 font-medium w-1/3">Mesai Saatleri</th>
                <th className="px-6 py-4 font-medium w-1/3">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {artists.map(artist => {
                const wh = workingHours.find(w => w.artist === artist.id && w.day_of_week === selectedDay);
                return (
                  <tr key={artist.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 font-bold">
                        {artist.username.charAt(0).toUpperCase()}
                      </div>
                      {artist.username}
                    </td>
                    <td className="px-6 py-4">
                      {wh ? (
                        wh.is_active ? (
                          <div className="flex items-center gap-2 text-purple-300 font-medium">
                            <Clock size={16} />
                            {wh.start_time.substring(0,5)} - {wh.end_time.substring(0,5)}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Çalışmıyor</span>
                        )
                      ) : (
                        <span className="text-slate-500 italic">Tanımlanmamış</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {wh && wh.is_active ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                          Aktif (Mesai Var)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400">
                          Kapalı (İzinli)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminShifts;