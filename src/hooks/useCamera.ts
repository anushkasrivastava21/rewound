"use client";

import { useRef, useState, useEffect, useCallback, RefObject } from "react";

interface UseCameraOptions {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
}

export function useCamera(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: UseCameraOptions = {}
) {
  const { facingMode = "user", width = 640, height = 480 } = options;
  const streamRef = useRef<MediaStream | null>(null);
  const [permission, setPermission] = useState<"prompt" | "granted" | "denied">(
    "prompt"
  );
  const [error, setError] = useState<string | null>(null);

  const requestCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: width }, height: { ideal: height } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPermission("granted");
      setError(null);
      return stream;
    } catch (err) {
      setPermission("denied");
      setError(
        err instanceof Error ? err.message : "Camera access denied"
      );
      return null;
    }
  }, [facingMode, width, height, videoRef]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { permission, error, requestCamera, stopCamera };
}
