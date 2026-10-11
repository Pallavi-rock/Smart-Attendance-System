import QRCode from "react-qr-code";

export default function QRCodeDisplay({ value }: { value: string }) {
	return <div className="inline-flex rounded-lg border border-slate-200 bg-white p-3"><QRCode value={value} size={160} /></div>;
}
