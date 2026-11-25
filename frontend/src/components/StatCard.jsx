export default function StatCard({ title, value, accent = 'border-blue-600', onClick, hint }) {
  return (
    <div onClick={onClick} className={`rounded-lg border-l-4 bg-white p-6 shadow-md ${accent} ${onClick ? 'cursor-pointer transition hover:bg-emerald-50' : ''}`}>
      <h3 className="text-sm font-semibold text-gray-500">{title}{hint && <span className="ml-1 font-normal">({hint})</span>}</h3>
      <p className="text-2xl font-bold">{value ?? '-'}</p>
    </div>
  );
}
