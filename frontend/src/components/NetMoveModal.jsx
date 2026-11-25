export default function NetMoveModal({ metrics, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-bold">Net Movement Breakdown</h2>
        <div className="space-y-2">
          <div className="flex justify-between"><span>Purchases (+):</span><span className="font-semibold">{metrics.purchases}</span></div>
          <div className="flex justify-between"><span>Transfers In (+):</span><span className="font-semibold text-green-600">+{metrics.transfersIn}</span></div>
          <div className="flex justify-between"><span>Transfers Out (-):</span><span className="font-semibold text-red-600">-{metrics.transfersOut}</span></div>
          <hr />
          <div className="flex justify-between font-bold"><span>Total Net:</span><span>{metrics.netMovement}</span></div>
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-md bg-slate-800 py-2 text-white hover:bg-slate-700">Close</button>
      </div>
    </div>
  );
}
