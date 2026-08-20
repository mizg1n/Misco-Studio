import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { X, Check, Calculator } from 'lucide-react';

const AppointmentCheckoutModal = ({ isOpen, onClose, appointment, onCheckoutComplete }) => {
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cashAmount, setCashAmount] = useState(0);
  const [cardAmount, setCardAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      // Reset form on open
      setTotalAmount(0);
      setDiscountAmount(0);
      setDepositAmount(0);
      setPaymentMethod('CASH');
      setCashAmount(0);
      setCardAmount(0);
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const finalAmount = Math.max(0, totalAmount - discountAmount);
  const remainingAmount = Math.max(0, finalAmount - depositAmount);

  // Preview commission for the artist (assuming default 50% for preview if not known)
  const artistCommission = finalAmount * (appointment?.artist_commission_rate ? (appointment.artist_commission_rate / 100) : 0.50);

  const handleCheckout = async () => {
    if (paymentMethod === 'SPLIT' && (cashAmount + cardAmount !== remainingAmount)) {
      alert('Parçalı ödemede nakit ve kart toplamı kalan tutara eşit olmalıdır.');
      return;
    }
    
    setLoading(true);
    try {
      await axiosInstance.post('/finance/checkout/', {
        appointment_id: appointment.id,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        deposit_amount: depositAmount,
        payment_method: paymentMethod,
        cash_amount: paymentMethod === 'SPLIT' ? cashAmount : (paymentMethod === 'CASH' ? remainingAmount : 0),
        card_amount: paymentMethod === 'SPLIT' ? cardAmount : (paymentMethod === 'CREDIT_CARD' ? remainingAmount : 0)
      });
      onCheckoutComplete();
      onClose();
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Tahsilat işlemi başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-700/50 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Calculator className="text-yellow-400" />
            Tahsilat & Tamamlama
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-rose-500/20 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-slate-300 text-sm">Müşteri: <strong className="text-white">{appointment.customer_name}</strong></p>
            <p className="text-slate-300 text-sm">Sanatçı: <strong className="text-yellow-400">{appointment.artist_name || 'Seçilmemiş'}</strong></p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Brüt Tutar (₺)</label>
              <input 
                type="number" 
                value={totalAmount || ''} 
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-yellow-500 outline-none"
                placeholder="Örn: 1500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">İndirim/İskonto (₺)</label>
                <input 
                  type="number" 
                  value={discountAmount || ''} 
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-yellow-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Alınan Kapora (₺)</label>
                <input 
                  type="number" 
                  value={depositAmount || ''} 
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-yellow-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl flex justify-between items-center border border-slate-700">
              <span className="text-slate-300 font-medium">Kalan Tutar (Tahsil Edilecek):</span>
              <span className="text-2xl font-bold text-emerald-400">₺{remainingAmount}</span>
            </div>

            <div className="text-xs text-slate-500 flex justify-between">
              <span>Sanatçı Komisyonu (Öngörülen): ₺{artistCommission.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Ödeme Yöntemi</label>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-yellow-500 outline-none"
              >
                <option value="CASH">Nakit</option>
                <option value="CREDIT_CARD">Kredi Kartı</option>
                <option value="TRANSFER">Havale/EFT</option>
                <option value="SPLIT">Parçalı (Nakit + Kart)</option>
              </select>
            </div>

            {paymentMethod === 'SPLIT' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700 border-dashed">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nakit (₺)</label>
                  <input 
                    type="number" 
                    value={cashAmount || ''} 
                    onChange={(e) => setCashAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Kart (₺)</label>
                  <input 
                    type="number" 
                    value={cardAmount || ''} 
                    onChange={(e) => setCardAmount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/50 bg-slate-900/50">
          <button 
            onClick={handleCheckout}
            disabled={loading || remainingAmount < 0}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'İşleniyor...' : (
              <>
                <Check size={20} />
                Tahsil Et ve Tamamla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCheckoutModal;
