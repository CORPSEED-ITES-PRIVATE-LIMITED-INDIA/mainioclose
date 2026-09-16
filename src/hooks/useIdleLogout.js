import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutFun, toggleAutoOffFeature } from "../toolkit/slices/authSlice";

// No browser exposes "OS locked / sleeping" directly to a background tab, so this
// combines two signals to approximate it:
//  1. An inactivity timer (works everywhere, and keeps counting even when this tab
//     isn't focused — switching tabs or locking the screen both stop activity events
//     from reaching it, so it fires regardless of what's on screen).
//  2. The experimental IdleDetector API (Chromium only, needs a one-time permission
//     grant from a real user gesture) which reports the OS screen-lock state almost
//     immediately, used here as a fast path on top of the timer.
const IDLE_TIMEOUT_MS = 60 * 1000;
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "wheel",
  "click",
];
const GESTURE_EVENTS = new Set(["click", "keydown", "mousedown", "touchstart"]);

export default function useIdleLogout(userId, { timeoutMs = IDLE_TIMEOUT_MS } = {}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const abortRef = useRef(null);
  const loggedOutRef = useRef(false);
  const permissionRequestedRef = useRef(false);

  const doLogout = useCallback(() => {
    if (loggedOutRef.current) return;
    loggedOutRef.current = true;
    dispatch(logoutFun());
    if (userId) {
      dispatch(toggleAutoOffFeature({ userId, flag: false })).catch(() => {});
    }
    navigate("/login");
  }, [dispatch, navigate, userId]);

  useEffect(() => {
    loggedOutRef.current = false;
    permissionRequestedRef.current = false;

    const resetTimer = () => {
      if (loggedOutRef.current) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(doLogout, timeoutMs);
    };

    const requestLockDetection = () => {
      if (permissionRequestedRef.current || !("IdleDetector" in window)) return;
      permissionRequestedRef.current = true;
      (async () => {
        try {
          const state = await window.IdleDetector.requestPermission();
          if (state !== "granted") return;
          const controller = new AbortController();
          abortRef.current = controller;
          const detector = new window.IdleDetector();
          detector.addEventListener("change", () => {
            if (detector.screenState === "locked") doLogout();
          });
          await detector.start({ threshold: 60000, signal: controller.signal });
        } catch {
          // Unsupported, denied, or insecure context — the idle timer is still the fallback.
        }
      })();
    };

    const onActivity = (evt) => {
      resetTimer();
      if (GESTURE_EVENTS.has(evt.type)) requestLockDetection();
    };

    ACTIVITY_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onActivity, { passive: true }),
    );
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [doLogout, timeoutMs]);
}
