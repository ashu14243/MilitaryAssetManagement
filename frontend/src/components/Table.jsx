export default function Table({ columns, rows, empty = 'No records.' }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full">
        <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="text-center text-slate-400">{empty}</td></tr>}
          {rows.map((r) => <tr key={r.id}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}
export const fmtDate = (d) => new Date(d).toLocaleString();
