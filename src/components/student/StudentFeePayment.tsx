import React, { useEffect, useState } from 'react';
import { FeeRecord } from '../../types';
import { api } from '../../lib/api';
import { Modal } from '../common/Modal';
import { CreditCard, CheckCircle2, Download, DollarSign } from 'lucide-react';

export const StudentFeePayment: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<FeeRecord | null>(null);

  const loadData = async () => {
    try {
      const list = await api.getFees('u-student1');
      setFees(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee) return;
    setProcessing(true);
    try {
      const amountToPay = selectedFee.totalAmount - selectedFee.paidAmount;
      const updated = await api.payFee(selectedFee.id, amountToPay);
      setSuccessReceipt(updated);
      setIsModalOpen(false);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const downloadReceipt = (fee: FeeRecord) => {
    alert(`Downloading Official Payment Receipt #${fee.id} for ${fee.title}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" /> Online Fee Collection Portal
          </h2>
          <p className="text-xs text-slate-500">Pay tuition, lab fees, and examination dues with instant receipt issuance.</p>
        </div>
      </div>

      {successReceipt && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-bold">Payment Successful for {successReceipt.title}!</p>
              <p className="text-[11px] text-emerald-700">Receipt Code: {successReceipt.transactionId}</p>
            </div>
          </div>
          <button
            onClick={() => downloadReceipt(successReceipt)}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Receipt</span>
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fees.map((fee) => {
          const isPaid = fee.status === 'paid';
          const dueAmount = fee.totalAmount - fee.paidAmount;

          return (
            <div key={fee.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{fee.title}</span>
                <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] capitalize ${
                  isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {fee.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Total Fee Amount:</span>
                  <span className="font-bold text-slate-900">${fee.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span className="font-semibold text-emerald-600">${fee.paidAmount}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 font-bold text-slate-900">
                  <span>Balance Due:</span>
                  <span className="text-rose-600">${dueAmount}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Due Date: {fee.dueDate}</span>
                {isPaid ? (
                  <button
                    onClick={() => downloadReceipt(fee)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Receipt</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedFee(fee);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Pay Online</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Online Payment: ${selectedFee?.title}`}>
        <form onSubmit={handlePay} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="font-semibold text-slate-700">Amount Due to Pay:</span>
            <span className="text-lg font-bold text-emerald-600">
              ${selectedFee ? selectedFee.totalAmount - selectedFee.paidAmount : 0}
            </span>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Payment Gateway / Method</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'card', label: 'Credit Card' },
                { id: 'upi', label: 'UPI / Wallet' },
                { id: 'bank', label: 'Net Banking' }
              ].map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-2.5 rounded-xl border text-center font-semibold transition ${
                    paymentMethod === m.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-slate-700">Card / Payment Account Details</label>
            <input
              type="text"
              required
              placeholder="4532 •••• •••• 8891"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="MM/YY"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
              <input
                type="password"
                placeholder="CVC"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-xs mt-2"
          >
            {processing ? 'Processing Payment...' : 'Confirm & Authorize Payment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
