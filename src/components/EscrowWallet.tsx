import React, { useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMarketplace } from "../context/MarketplaceContext";
import { GatewayType } from "../types";

export const EscrowWallet: React.FC = () => {
  const { user } = useAuth();
  const { transactions, addTransaction } = useMarketplace();

  // Top Up Modal State
  const [showTopUp, setShowTopUp] = useState<boolean>(false);
  const [amount, setAmount] = useState<number>(20000);
  const [gateway, setGateway] = useState<GatewayType>("OPay");

  // Withdrawal Modal State
  const [showWithdraw, setShowWithdraw] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(10000);
  const [bankName, setBankName] = useState<string>("OPay Digital Bank");
  const [accountNumber, setAccountNumber] = useState<string>("8012345678");

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    addTransaction({
      userId: user.uid,
      type: "top_up",
      amount,
      reference: `${gateway.toUpperCase()}_TOPUP_${Date.now().toString().slice(-6)}`,
      gateway,
      status: "completed",
      notes: `Direct Wallet Top-up via ${gateway} Checkout API`,
    });

    setShowTopUp(false);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (withdrawAmount > user.walletBalance) {
      alert("Insufficient wallet balance for this withdrawal.");
      return;
    }

    addTransaction({
      userId: user.uid,
      type: "withdrawal",
      amount: withdrawAmount,
      reference: `PAYOUT_NUBAN_${Date.now().toString().slice(-6)}`,
      gateway: "RushWallet",
      status: "completed",
      notes: `Payout to ${bankName} (${accountNumber})`,
    });

    setShowWithdraw(false);
  };

  const userTxs = transactions.filter((t) => t.userId === user?.uid || user?.role === "admin");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Rush Escrow Ledger & Wallet
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time balance settlement with automated escrow locking and instant OPay / Paystack payout hooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTopUp(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Top-up Wallet</span>
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4 text-orange-400" />
            <span>Withdraw Payout</span>
          </button>
        </div>
      </div>

      {/* Balance Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Available Wallet Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-xl border border-slate-700 shadow-md space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              Available Cash
            </span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">
            ₦{user?.walletBalance.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400">
            Ready for instant job posting or withdrawal
          </p>
        </div>

        {/* Escrow Locked Balance */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600">
              Escrow Held
            </span>
            <Lock className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            ₦{user?.escrowHeld.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">
            Protected in Rush ledger pending OTP validation
          </p>
        </div>

        {/* Gateway Integration Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
              Supported Gateways
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              OPay Direct
            </span>
            <span className="text-[11px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
              Paystack
            </span>
            <span className="text-[11px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
              Flutterwave
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Zero fee deposit & instant NUBAN payouts
          </p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <h3 className="font-extrabold text-sm text-slate-900">
          Escrow Audit Ledger & Activity
        </h3>

        {userTxs.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No financial transactions recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {userTxs.map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === "top_up" || tx.type === "escrow_release" || tx.type === "refund"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-orange-50 text-orange-600 border border-orange-200"
                    }`}
                  >
                    {tx.type === "top_up" || tx.type === "escrow_release" ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900 capitalize">
                      {tx.type.replace("_", " ")}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Ref: {tx.reference} • {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                    {tx.notes && (
                      <p className="text-[11px] text-slate-500">{tx.notes}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-sm ${
                      tx.type === "top_up" || tx.type === "escrow_release" || tx.type === "refund"
                        ? "text-emerald-600"
                        : "text-slate-900"
                    }`}
                  >
                    {tx.type === "top_up" || tx.type === "escrow_release" || tx.type === "refund"
                      ? "+"
                      : "-"}
                    ₦{tx.amount.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    {tx.gateway}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOP UP MODAL */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">
              Top-up Escrow Wallet
            </h3>

            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-extrabold bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["OPay", "Paystack", "Flutterwave"] as GatewayType[]).map((gt) => (
                    <button
                      key={gt}
                      type="button"
                      onClick={() => setGateway(gt)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                        gateway === gt
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {gt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTopUp(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Proceed to Checkout API
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-base text-slate-900">
              Withdraw to Bank Account
            </h3>

            <form onSubmit={handleWithdrawSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  required
                  max={user?.walletBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-extrabold bg-slate-50 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bank Name
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="OPay Digital Bank">OPay Digital Bank</option>
                  <option value="Palmpay">Palmpay</option>
                  <option value="Kuda Bank">Kuda Microfinance</option>
                  <option value="GTBank">Guaranty Trust Bank</option>
                  <option value="First Bank">First Bank Nigeria</option>
                  <option value="Zenith Bank">Zenith Bank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Number (10 digits)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  Confirm Payout NUBAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
