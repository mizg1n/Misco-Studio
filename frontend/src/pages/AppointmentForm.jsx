import { useState, useEffect } from "react";
import axiosInstance from "../api/axios";
import { format, isSameDay } from "date-fns";
import { tr } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useNavigate } from "react-router-dom";

const AppointmentForm = () => {
  const [prices, setPrices] = useState([]);
  const [formData, setFormData] = useState({
    service_type: "TATTOO",
    sub_service: "",
    description: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("");
  const [artists, setArtists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axiosInstance.get("/pricelist/");
        setPrices(res.data);
      } catch (error) {
        console.error("Fiyat listesi yüklenemedi", error);
      }
    };
    const fetchArtists = async () => {
      try {
        const res = await axiosInstance.get("/users/");
        setArtists(res.data.filter(u => u.role === "ARTIST"));
      } catch (error) {
        console.error("Sanatçılar yüklenemedi", error);
      }
    };
    fetchPrices();
    fetchArtists();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const fetchSlots = async () => {
        try {
          const dateStr = format(selectedDate, "yyyy-MM-dd");
          const url = selectedArtist 
            ? `/shifts/artist-available-slots/?artist_id=${selectedArtist}&date=${dateStr}`
            : `/shifts/artist-available-slots/?date=${dateStr}`;
          const res = await axiosInstance.get(url);
          setAvailableSlots(res.data.slots);
        } catch (error) {
          console.error("Slotlar yüklenemedi", error);
          setAvailableSlots([]);
        }
      };
      fetchSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedArtist]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedDate || !selectedTime) {
      setError("Lütfen randevu tarihi ve saati seçin.");
      return;
    }

    const selectedServiceObj = prices.find(p => p.title === formData.sub_service);
    const estPrice = selectedServiceObj ? selectedServiceObj.base_price : 0;

    const payload = {
      ...formData,
      scheduled_at: `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`,
      estimated_price: estPrice,
      artist: selectedArtist || null
    };

    try {
      setLoading(true);
      await axiosInstance.post("/appointments/", payload);
      setSuccess(true);
      setTimeout(() => {
        navigate("/dashboard/customer");
      }, 3000);
    } catch (err) {
      console.error("Randevu oluşturulamadı", err);
      if (err.response?.data?.scheduled_at) {
        setError(err.response.data.scheduled_at[0]);
      } else {
        setError("Randevu oluşturulurken beklenmeyen bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center max-w-lg mx-auto mt-10">
        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Randevu Talebiniz Alındı!</h2>
        <p className="text-slate-400">Talebiniz stüdyomuza ulaştı. Onaylandığında bilgilendirileceksiniz.</p>
        <p className="text-sm text-slate-500 mt-4">Ana sayfaya yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  const availableSubServices = prices.filter(p => {
    if (formData.service_type === "TATTOO") return p.category === "TATTOO";
    if (formData.service_type === "PIERCING") return p.category === "PIERCING_EAR" || p.category === "PIERCING_BODY";
    return false;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-100">Yeni Randevu Oluştur</h2>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="glass-panel p-8 rounded-2xl space-y-6 h-fit">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Ana Kategori</label>
              <select
                className="w-full px-4 py-3 text-sm bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200"
                value={formData.service_type}
                onChange={(e) => setFormData({ ...formData, service_type: e.target.value, sub_service: "" })}
              >
                <option value="TATTOO">Dövme (Tattoo)</option>
                <option value="PIERCING">Piercing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Alt İşlem Seçimi</label>
              <select
                className="w-full px-4 py-3 text-sm bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200"
                value={formData.sub_service}
                onChange={(e) => setFormData({ ...formData, sub_service: e.target.value })}
                required
              >
                <option value="" disabled>Lütfen bir işlem seçin</option>
                {availableSubServices.map(item => (
                  <option key={item.id} value={item.title}>{item.title}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Sanatçı Tercihi (İsteğe Bağlı)</label>
            <select
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200"
              value={selectedArtist}
              onChange={(e) => { setSelectedArtist(e.target.value); setSelectedTime(""); }}
            >
              <option value="">Fark Etmez / Stüdyo Belirlesin</option>
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.username}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Ek Detaylar (İsteğe Bağlı)</label>
            <textarea
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-200 h-32 resize-none"
              placeholder="İstediğiniz modelin detaylarını veya özel isteklerinizi buraya yazabilirsiniz..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {selectedDate && selectedTime ? (
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <p className="text-purple-300 font-medium">Seçilen Randevu:</p>
              <p className="text-slate-200">{format(selectedDate, "dd MMMM yyyy", { locale: tr })} - {selectedTime}</p>
            </div>
          ) : (
            <p className="text-sm text-yellow-400/80">Lütfen sağ taraftaki takvimden tarih ve saat seçin.</p>
          )}

          <button
            type="submit"
            disabled={loading || !selectedDate || !selectedTime}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Gönderiliyor..." : "Randevu Talebini Gönder"}
          </button>
        </div>

        <div className="glass-panel p-8 rounded-2xl h-fit">
          <label className="block text-sm font-medium text-slate-400 mb-4">Randevu Tarihi Seçin</label>
          <div className="flex justify-center bg-slate-800/30 rounded-xl p-4 mb-6">
            <style>{`
              .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #a855f7; --rdp-background-color: rgba(168, 85, 247, 0.2); margin: 0; }
              .rdp-day_selected { font-weight: bold; background-color: #a855f7; color: white; }
              .rdp-day_selected:hover { background-color: #9333ea; }
              .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(255,255,255,0.1); }
              .rdp-day { color: #e2e8f0; }
              .rdp-day_disabled { color: #475569; opacity: 0.5; }
              .rdp-caption_label { font-weight: 600; color: #f8fafc; }
              .rdp-nav_button { color: #cbd5e1; }
            `}</style>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedTime("");
              }}
              locale={tr}
              disabled={[
                { before: new Date() },
                (date) => date.getDay() === 0
              ]}
            />
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-4">Müsait Saatler</label>
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={!slot.available
                        ? "py-2 rounded-lg text-sm font-medium transition-colors bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                        : selectedTime === slot.time
                          ? "py-2 rounded-lg text-sm font-medium transition-colors bg-purple-600 text-white shadow-lg shadow-purple-500/30"
                          : "py-2 rounded-lg text-sm font-medium transition-colors bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"}
                    >
                      {slot.time}
                    </button>
                  ))
                ) : (
                  <p className="col-span-3 text-sm text-slate-400 text-center py-4">Bu tarih için uygun saat bulunamadı.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm;