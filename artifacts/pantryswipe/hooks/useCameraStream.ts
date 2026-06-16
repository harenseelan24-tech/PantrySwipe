import { useRef, useState, useCallback } from "react";
import { Platform } from "react-native";

export type CameraStreamError = "permission-denied" | "not-supported" | "unknown";

export interface CameraStreamResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isLoading: boolean;
  error: CameraStreamError | null;
  startStream: () => Promise<boolean>;
  captureFrame: () => string | null;
  stopStream: () => void;
}

export function useCameraStream(facingMode: "environment" | "user" = "environment"): CameraStreamResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CameraStreamError | null>(null);

  const startStream = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== "web") return false;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("not-supported");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = s;
      setStream(s);

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play().catch(() => {});
      }

      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      setIsLoading(false);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("permission-denied");
        } else if (err.name === "NotFoundError" || err.name === "NotSupportedError") {
          setError("not-supported");
        } else {
          setError("unknown");
        }
      } else {
        setError("unknown");
      }
      return false;
    }
  }, [facingMode]);

  const captureFrame = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return null;

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8).replace(/^data:image\/jpeg;base64,/, "");
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  return { videoRef, stream, isLoading, error, startStream, captureFrame, stopStream };
}
