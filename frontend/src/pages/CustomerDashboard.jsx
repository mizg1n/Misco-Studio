const CustomerDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-2">Fiyat Listesi</h3>
          <p className="text-slate-400 text-sm">Tüm dövme ve piercing hizmetlerinin güncel fiyatları.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-2">Bakım Yönergeleri</h3>
          <p className="text-slate-400 text-sm">İşlem sonrası dikkat etmeniz gerekenler.</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-yellow-500/30">
          <h3 className="text-lg font-semibold mb-2 text-yellow-400">Yeni Randevu</h3>
          <p className="text-slate-400 text-sm">Hemen randevunuzu oluşturun.</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
