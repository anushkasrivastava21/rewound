"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface UseBlowDetectionOptions {
  threshold?: number; // dB above ambient to trigger (default: 15)
  lowPassCutoff?: number; // Hz cutoff for blow detection (default: 400)
  minDuration?: number; // ms of sustained signal to count as blow (default: 150)
  calibrationMs?: number; // ms to sample ambient noise (default: 500)
}

export function useBlowDetection(options: UseBlowDetectionOptions = {}) {
  const {
    threshold = 15,
    lowPassCutoff = 400,
    minDuration = 150,
    calibrationMs = 500,
  } = options;

  const [isBlowing, setIsBlowing] = useState(false);
  const [intensity, setIntensity] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const ambientFloorRef = useRef<number>(0);
  const blowStartRef = useRef<number>(0);
  const isBlowingRef = useRef(false);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);

      // Low-pass filter: blowing produces energy in 100-400Hz range
      const lowPass = audioCtx.createBiquadFilter();
      lowPass.type = "lowpass";
      lowPass.frequency.value = lowPassCutoff;
      lowPass.Q.value = 1.0;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;

      source.connect(lowPass);
      lowPass.connect(analyser);
      // Don't connect to destination — we don't want to play back the mic

      // Calibrate ambient noise floor
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const calibrationSamples: number[] = [];
      const calibrationStart = performance.now();

      const calibrate = () => {
        analyser.getByteFrequencyData(dataArray);
        // Average energy in the 80-350Hz range
        const binSize = audioCtx.sampleRate / analyser.fftSize;
        const lowBin = Math.floor(80 / binSize);
        const highBin = Math.floor(350 / binSize);
        let sum = 0;
        for (let i = lowBin; i <= highBin; i++) {
          sum += dataArray[i];
        }
        const avg = sum / (highBin - lowBin + 1);
        calibrationSamples.push(avg);

        if (performance.now() - calibrationStart < calibrationMs) {
          requestAnimationFrame(calibrate);
        } else {
          // Set ambient floor as the average of calibration samples
          ambientFloorRef.current =
            calibrationSamples.reduce((a, b) => a + b, 0) /
            calibrationSamples.length;
          setIsListening(true);
          // Start detection loop
          detect();
        }
      };

      const detect = () => {
        analyser.getByteFrequencyData(dataArray);
        const binSize = audioCtx.sampleRate / analyser.fftSize;
        const lowBin = Math.floor(80 / binSize);
        const highBin = Math.floor(350 / binSize);
        let sum = 0;
        for (let i = lowBin; i <= highBin; i++) {
          sum += dataArray[i];
        }
        const avg = sum / (highBin - lowBin + 1);
        const aboveAmbient = avg - ambientFloorRef.current;

        if (aboveAmbient > threshold) {
          if (!isBlowingRef.current) {
            if (blowStartRef.current === 0) {
              blowStartRef.current = performance.now();
            } else if (
              performance.now() - blowStartRef.current >
              minDuration
            ) {
              isBlowingRef.current = true;
              setIsBlowing(true);
            }
          }
          // Normalize intensity 0-1 (threshold to threshold*4 range)
          const normalizedIntensity = Math.min(
            1,
            aboveAmbient / (threshold * 4)
          );
          setIntensity(normalizedIntensity);
        } else {
          if (isBlowingRef.current) {
            isBlowingRef.current = false;
            setIsBlowing(false);
            setIntensity(0);
          }
          blowStartRef.current = 0;
        }

        rafRef.current = requestAnimationFrame(detect);
      };

      calibrate();
    } catch {
      console.warn("Microphone access denied for blow detection");
    }
  }, [threshold, lowPassCutoff, minDuration, calibrationMs]);

  const stopListening = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());
    audioCtxRef.current = null;
    analyserRef.current = null;
    streamRef.current = null;
    setIsListening(false);
    setIsBlowing(false);
    setIntensity(0);
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return { isBlowing, intensity, isListening, startListening, stopListening };
}
