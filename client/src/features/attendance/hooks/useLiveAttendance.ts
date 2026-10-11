import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "../../../lib/firebase";

export interface LiveAttendanceRecord {
	id: string;
	studentId: string;
	studentName: string;
	markedAt: string | null;
	status: string;
}

export function useLiveAttendance(sessionId: string | undefined) {
	const [records, setRecords] = useState<LiveAttendanceRecord[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!sessionId) {
			return;
		}

		const recordsQuery = query(
			collection(db, "attendanceRecords"),
			where("sessionId", "==", sessionId),
			orderBy("markedAt", "desc"),
		);

		return onSnapshot(recordsQuery, (snapshot) => {
			setRecords(snapshot.docs.map((record) => {
				const data = record.data();
				const markedAt = data.markedAt?.toDate?.();
				return {
					id: record.id,
					studentId: typeof data.studentId === "string" ? data.studentId : "",
					studentName: typeof data.studentName === "string" ? data.studentName : "Unknown student",
					markedAt: markedAt instanceof Date ? markedAt.toISOString() : null,
					status: typeof data.status === "string" ? data.status : "present",
				};
			}));
			setError(null);
		}, () => setError("Live attendance could not be loaded."));
	}, [sessionId]);

	return { records, error };
}
