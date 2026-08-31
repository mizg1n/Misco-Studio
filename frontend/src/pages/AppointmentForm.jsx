import { useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axios";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import ServiceSelect from '../components/ServiceSelect';
import CustomSelect from '../components/CustomSelect';
import { getServicesByCategory } from '../data/servicesData';

const AppointmentForm = () => {
  const [prices, setPrices] = useState([]);
  const [formData, setFormData] = useState({
    service_type: "TATTOO",
    sub_service: "",
    description: "",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedArtist, setSelectedArtist] = useState("UNSELECTED");
  const [artists, setArtists] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const calendarRef = useRef(null);

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
          const url = (selectedArtist && selectedArtist !== "ANY" && selectedArtist !== "UNSELECTED")
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

  const handleSubServiceChange = (e) => {
    setFormData({ ...formData, sub_service: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedDate || !selectedTime) {
      setError("Lütfen randevu tarihi ve saati seçin.");
      return;
    }

    const selectedServiceObj = prices.find(p => p.title === formData.sub_service);
    const estPrice = selectedServiceObj ? selectedServiceObj.base_price : 0;

    const selectedSlot = availableSlots.find(s => s.time === selectedTime);
    const actualArtistId = (selectedArtist === "ANY" && selectedSlot) ? selectedSlot.assigned_artist_id : selectedArtist;

    const payload = {
      ...formData,
      scheduled_at: `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`,
      estimated_price: estPrice,
      artist: actualArtistId || null
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
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <style>{`
        .fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #f59e0b; --rdp-background-color: rgba(245, 158, 11, 0.15); margin: 0; }
        .rdp-day_selected { font-weight: bold; background-color: #f59e0b; color: #1c1a24; }
        .rdp-day_selected:hover { background-color: #d97706; }
        .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: rgba(255,255,255,0.1); }
        .rdp-day { color: #e2e8f0; }
        .rdp-day_disabled { color: #475569; opacity: 0.5; }
        .rdp-caption_label { font-weight: 600; color: #f8fafc; }
        .rdp-nav_button { color: #cbd5e1; }
      `}</style>

      <div>
        <h2 className="text-2xl font-bold text-slate-100">Yeni Randevu Oluştur</h2>
        <p className="text-sm text-slate-400">Adım adım randevunuzu planlayın.</p>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm fade-in">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- ADIM 1: HİZMET VE DETAYLAR --- */}
        <div className="glass-panel p-8 rounded-2xl space-y-6 shadow-xl border border-slate-700/50 bg-[#1e2330]">
          <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700/50 pb-2">1. Hizmet Seçimi</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-base font-semibold text-slate-300 mb-2">Ana Kategori</label>
              <CustomSelect
                options={[
                  { value: 'TATTOO', label: 'Dövme (Tattoo)' },
                  { value: 'PIERCING', label: 'Piercing' }
                ]}
                value={formData.service_type}
                onChange={(val) => setFormData({ ...formData, service_type: val, sub_service: "" })}
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-slate-300 mb-2">Alt İşlem Seçimi</label>
              <ServiceSelect 
                options={getServicesByCategory(formData.service_type)}
                value={formData.sub_service}
                onChange={(val) => setFormData({ ...formData, sub_service: val })}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-base font-semibold text-slate-300 mb-2">Sanatçı Tercihi (İsteğe Bağlı)</label>
            <CustomSelect
              placeholder="Lütfen bir tercih yapın"
              options={[
                { value: 'ANY', label: 'Fark Etmez / Stüdyo Belirlesin' },
                ...artists.map(a => ({ value: a.id, label: a.username }))
              ]}
              value={selectedArtist !== 'UNSELECTED' ? selectedArtist : null}
              onChange={(val) => {
                setSelectedArtist(val);
                setSelectedTime("");
                setTimeout(() => {
                  if (calendarRef.current) {
                    calendarRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }, 100);
              }}
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-slate-300 mb-2">Ek Detaylar (İsteğe Bağlı)</label>
            {formData.sub_service === 'Vücut (Göbek/Kaş vs.)' && (
              <div className="flex items-start gap-2 p-3 mb-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                <Info size={16} className="mt-0.5 shrink-0" />
                <p>Lütfen yaptırmak istediğiniz spesifik vücut piercingi bölgesini (göbek, kaş, dil vb.) detaylar kısmında belirtin.</p>
              </div>
            )}
            <textarea
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-slate-200 h-24 resize-none"
              placeholder="İstediğiniz modelin detaylarını veya özel isteklerinizi buraya yazabilirsiniz..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>
        </div>

        {/* --- ADIM 2: TAKVİM VE SAAT --- */}
        {formData.sub_service && selectedArtist !== 'UNSELECTED' && (
          <div ref={calendarRef} className="glass-panel p-8 rounded-2xl space-y-6 shadow-xl border border-slate-700/50 bg-[#1e2330] fade-in" style={{ scrollMarginTop: "2rem" }}>
            <h3 className="text-lg font-semibold text-slate-200 border-b border-slate-700/50 pb-2">2. Tarih ve Saat Seçimi</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              
              {/* Takvim */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-4 text-center md:text-left">Randevu Tarihi</label>
                <div className="flex justify-center md:justify-start bg-slate-800/50 rounded-xl p-4 w-fit mx-auto md:mx-0">
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
              </div>

              {/* Saatler */}
              {selectedDate && (
                <div className="fade-in">
                  <label className="block text-sm font-medium text-slate-400 mb-4">Müsait Saatler ({format(selectedDate, "dd MMM yyyy", { locale: tr })})</label>
                  <div className="grid grid-cols-3 gap-3">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={!slot.available
                            ? "py-2.5 rounded-lg text-sm font-medium transition-colors bg-slate-800/80 text-slate-600 cursor-not-allowed border border-slate-700/30"
                            : selectedTime === slot.time
                              ? "py-2.5 rounded-lg text-sm font-medium transition-colors bg-yellow-600 text-white shadow-lg shadow-yellow-500/30 border border-yellow-500"
                              : "py-2.5 rounded-lg text-sm font-medium transition-colors bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600"}
                        >
                          {slot.time}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-3 text-sm text-slate-500 text-center py-8">Seçilen tarih için uygun saat bulunamadı.</p>
                    )}
                  </div>
                  
                  {/* Özet ve Gönder (Sağ Sütun Altı) */}
                  {selectedTime && (
                    <div className="mt-8 p-5 rounded-2xl shadow-xl border border-yellow-500/20 bg-yellow-500/5 fade-in">
                      <p className="text-yellow-400 text-sm font-medium mb-1">Seçilen Randevu:</p>
                      <p className="text-slate-200 font-semibold text-lg mb-1">
                        {format(selectedDate, "dd MMMM yyyy", { locale: tr })} - {selectedTime}
                      </p>
                      <div className="text-slate-400 text-sm mb-5 space-y-1">
                        <p>İşlem: <span className="text-slate-300 font-medium">{formData.sub_service}</span></p>
                        <p>Sanatçı: <span className="text-slate-300 font-medium">
                          {selectedArtist === "ANY" 
                            ? availableSlots.find(s => s.time === selectedTime)?.assigned_artist_name || "Stüdyo Belirleyecek"
                            : artists.find(a => String(a.id) === String(selectedArtist))?.username}
                        </span></p>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 rounded-xl font-semibold text-white shadow-lg shadow-yellow-500/20 transition-all transform hover:scale-[1.02] active:scale-95"
                      >
                        {loading ? "Gönderiliyor..." : "Randevu Talebini Gönder"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}



      </form>
    </div>
  );
};

export default AppointmentForm;