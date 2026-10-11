import { useEffect, useState } from "react";

interface AttendanceTimerProps {
	endAt: string | null | undefined;
}

export default function AttendanceTimer({ endAt }: AttendanceTimerProps) {
	const [remaining, setRemaining] = useState(() => Math.max(0, new Date(endAt ?? 0).getTime() - Date.now()));

	useEffect(() => {
		const timer = window.setInterval(() => setRemaining(Math.max(0, new Date(endAt ?? 0).getTime() - Date.now())), 1000);
		return () => window.clearInterval(timer);
	}, [endAt]);

	if (remaining === 0) return <span className="font-semibold text-red-600">Session Ended</span>;

	const totalSeconds = Math.floor(remaining / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;

	return <span className="font-semibold text-emerald-700">Time remaining: {hours > 0 ? `${String(hours).padStart(2, "0")}:` : ""}{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>;
}
