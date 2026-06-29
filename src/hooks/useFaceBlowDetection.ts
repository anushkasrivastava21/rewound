"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import * as MP from "@mediapipe/face_mesh";

export function useFaceBlowDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  const [isBlowing, setIsBlowing] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const faceMeshRef = useRef<any>(null);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsListening(true);
      setError(null);

      const FaceMeshClass =
        MP.FaceMesh || (MP as any).default?.FaceMesh || (window as any).FaceMesh;
      if (!FaceMeshClass) throw new Error("MediaPipe FaceMesh not found");

      const faceMesh = new FaceMeshClass({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults((results: any) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];

          // Upper lip bottom (13) and Lower lip top (14) distance for openness
          // Left lip corner (78) and Right lip corner (308) for width
          const p13 = landmarks[13];
          const p14 = landmarks[14];
          const p78 = landmarks[78];
          const p308 = landmarks[308];

          if (p13 && p14 && p78 && p308) {
            // Distance calculations
            const hDist = Math.sqrt(
              Math.pow(p13.x - p14.x, 2) + Math.pow(p13.y - p14.y, 2)
            );
            const wDist = Math.sqrt(
              Math.pow(p78.x - p308.x, 2) + Math.pow(p78.y - p308.y, 2)
            );

            // Aspect ratio of the inner mouth opening
            // When blowing, the mouth is usually an "O" shape, so ratio increases.
            // Also, the mouth width decreases (pursed lips).
            const aspectRatio = hDist / wDist;

            // Simple heuristic: if aspect ratio is relatively high (mouth is circular/pursed)
            // and the height is noticeable (lips parted).
            // A typical resting mouth has a very low aspect ratio (< 0.1).
            // A blowing mouth is usually > 0.3.
            if (hDist > 0.02 && aspectRatio > 0.25) {
              setIsBlowing(true);
              // Normalize intensity up to aspect ratio 0.6
              const currentIntensity = Math.min(1, (aspectRatio - 0.25) / 0.35);
              setIntensity(currentIntensity);
            } else {
              setIsBlowing(false);
              setIntensity(0);
            }
          }
        } else {
          setIsBlowing(false);
          setIntensity(0);
        }
      });

      faceMeshRef.current = faceMesh;

      const video = videoRef.current!;
      const sendFrame = async () => {
        if (video.readyState >= 2) {
          try {
            await faceMesh.send({ image: video });
          } catch (e) {
            // Error handling ignored during frame updates
          }
        }
        rafRef.current = requestAnimationFrame(sendFrame);
      };

      if (video.readyState >= 2) {
        sendFrame();
      } else {
        video.addEventListener("loadeddata", () => {
          sendFrame();
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start camera");
      setIsListening(false);
    }
  }, [videoRef]);

  const stopListening = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (faceMeshRef.current) faceMeshRef.current.close();
    
    streamRef.current = null;
    faceMeshRef.current = null;
    
    setIsListening(false);
    setIsBlowing(false);
    setIntensity(0);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { isBlowing, intensity, isListening, startListening, stopListening, error };
}
