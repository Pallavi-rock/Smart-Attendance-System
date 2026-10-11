import type { LiveAttendanceRecord } from "../hooks/useLiveAttendance";

export default function LiveAttendanceTable({ records }: { records: LiveAttendanceRecord[] }) {
	if (records.length === 0) return <p className="text-sm text-slate-500">No students present yet.</p>;

	return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-2 pr-4">Student Name</th><th className="py-2 pr-4">Time</th><th className="py-2">Status</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b border-slate-100"><td className="py-2 pr-4 font-medium text-slate-700">{record.studentName}</td><td className="py-2 pr-4 text-slate-500">{record.markedAt ? new Date(record.markedAt).toLocaleTimeString() : "-"}</td><td className="py-2 text-emerald-700">{record.status}</td></tr>)}</tbody></table></div>;
}
