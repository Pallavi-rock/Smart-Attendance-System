import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef } from "react";

interface Props {
  onResult: (value: string) => void;
  onClose: () => void;
  onError: (message: string) => void;
}

export default function QRCodeScanner({ onResult, onClose, onError }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const handledRef = useRef(false);
  const onResultRef = useRef(onResult);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  }, [onClose, onError, onResult]);

  useEffect(() => {
    const scanner = new Html5Qrcode("student-attendance-qr-reader");
    scannerRef.current = scanner;
    handledRef.current = false;

    const start = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (handledRef.current) {
              return;
            }
            handledRef.current = true;
            void scanner.stop().finally(() => onResultRef.current(decodedText));
          },
          () => undefined,
        );
      } catch {
        onErrorRef.current("Camera permission is required to scan the QR code.");
        onCloseRef.current();
      }
    };

    void start();

    return () => {
      if (scannerRef.current) {
        void scannerRef.current.stop().catch(() => undefined);
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">Point your camera at the QR code</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600"
        >
          Close
        </button>
      </div>
      <div id="student-attendance-qr-reader" className="min-h-[260px] w-full overflow-hidden rounded-lg bg-slate-100" />
    </div>
  );
}
