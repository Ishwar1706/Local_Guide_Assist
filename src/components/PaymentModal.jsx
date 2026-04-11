import { useState } from 'react';
import { CreditCard, Lock, CheckCircle2, Loader2, AlertCircle, X } from 'lucide-react';
import { paymentsAPI } from '../services/api';

export default function PaymentModal({ booking, paymentType, onSuccess, onClose }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [step, setStep] = useState('form'); // form | processing | success
  const [error, setError] = useState('');

  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  };

  const amountToPay = booking.totalPrice / 2;

  const handlePay = async (e) => {
    e.preventDefault();
    setError('');
    if (cardNumber.replace(/\s/g, '').length !== 16) { setError('Enter a valid 16-digit card number'); return; }
    if (expiry.length < 5) { setError('Enter a valid expiry date MM/YY'); return; }
    if (cvv.length < 3) { setError('Enter a valid CVV'); return; }

    setStep('processing');
    try {
      const orderRes = await paymentsAPI.initiate(booking._id, paymentType);
      await new Promise((r) => setTimeout(r, 1500)); // simulate processing
      await paymentsAPI.verify({
        bookingId: booking._id,
        orderId: orderRes.data.orderId,
        paymentType,
        cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
      });
      setStep('success');
      setTimeout(() => onSuccess(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setStep('form');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[var(--color-primary-600)] to-blue-500 px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard size={20} />
            <h3 className="text-lg font-bold">Secure Payment ({paymentType === 'advance' ? '50% Advance' : 'Final 50%'})</h3>
          </div>
          {step === 'form' && <button onClick={onClose} className="text-white/70 hover:text-white"><X size={20} /></button>}
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center text-sm text-slate-600 mb-1">
              <span>Booking on {booking.date}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-slate-900 text-lg">
              <span>Amount ({paymentType === 'advance' ? 'Advance' : 'Final'})</span>
              <span>₹{amountToPay}</span>
            </div>
          </div>

          {step === 'form' && (
            <form onSubmit={handlePay} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-xl">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              {/* Form fields */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Card Number</label>
                <input
                  type="text" inputMode="numeric" placeholder="1234 5678 9012 3456"
                  value={cardNumber} onChange={(e) => setCardNumber(formatCard(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] text-slate-800 font-mono tracking-widest"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Expiry</label>
                  <input
                    type="text" placeholder="MM/YY"
                    value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">CVV</label>
                  <input
                    type="password" maxLength={4} placeholder="•••"
                    value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] text-slate-800 font-mono"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-[var(--color-primary-600)] text-white font-bold rounded-xl hover:bg-[var(--color-primary-500)] transition-all mt-2"
              >
                Pay ₹{amountToPay}
              </button>
            </form>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center">
              <Loader2 size={48} className="animate-spin text-[var(--color-primary-600)] mx-auto mb-4" />
              <p className="font-bold text-slate-800 text-lg">Processing...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-10 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} className="text-green-500" />
              </div>
              <p className="font-bold text-slate-800 text-xl">Successful!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
