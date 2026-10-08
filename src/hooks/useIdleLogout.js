import { useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  logoutFun,
  toggleAutoOffFeature,
  toggleAutoOnFeature,
} from "../toolkit/slices/authSlice";

// Logout is tied to the machine being locked or asleep — never to the user
// simply not touching the mouse while reading a page.
//
// Three signals, in order of accuracy:
//  1. IdleDetector (Chromium, behind the 'idle-detection' permission) reports the
//     real OS screen-lock state, so Win+L logs out straight away.
//  2. A suspend check that ticks while the tab is visible: timers stop while the
//     machine sleeps, so a jump in the wall clock means it was suspended.
//  3. A visibility fallback for browsers that don't give us (1): locking or
//     sleeping also hides the tab, so staying hidden past the grace period logs
//     out. Skipped once (1) is running, otherwise alt-tabbing would log out too.
//
// Shutdown needs no signal of its own — the session lives in sessionStorage, so
// closing the browser already ends it on this side. The server side is what a
// plain close leaves behind (the user stays "present" and keeps getting auto
// assigned leads), so closing the tab/browser also sends the same "off" call a
// logout does. `pagehide` is the only event that fires reliably for that.
//
// pagehide fires on reload too, and a reload keeps the session. A marker in
// sessionStorage tells the next load to switch presence back on; after a real
// close sessionStorage is gone, so nothing is switched back on.
const LOCK_GRACE_MS = 60 * 1000;
const SUSPEND_TICK_MS = 5 * 1000;
const GESTURE_EVENTS = ["click", "keydown", "touchstart"];
const CLOSING_MARKER = "presenceOffOnUnload";

// fetch + keepalive survives the page being torn down and, unlike
// navigator.sendBeacon, can be a PUT carrying the Authorization header.
const sendPresenceOff = (userId) => {
  try {
    const jwt = JSON.parse(sessionStorage.getItem("userDetail") || "{}")?.jwt;
    if (!userId || !jwt) return;

    fetch(`/leadService/api/v1/users/autoPresentOff?userId=${userId}&flag=false`, {
      method: "PUT",
      keepalive: true,
      headers: { Authorization: `Bearer ${jwt}` },
    });
    sessionStorage.setItem(CLOSING_MARKER, "1");
  } catch {
    // Nothing more can be done while the page is closing.
  }
};

export default function useIdleLogout(userId, { graceMs = LOCK_GRACE_MS } = {}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loggedOutRef = useRef(false);

  const doLogout = useCallback(() => {
    if (loggedOutRef.current) return;
    loggedOutRef.current = true;

    dispatch(logoutFun());

    if (userId) {
      dispatch(toggleAutoOffFeature({ userId, flag: false })).catch(() => {});
    }

    navigate("/login", { replace: true });
  }, [dispatch, navigate, userId]);

  useEffect(() => {
    loggedOutRef.current = false;

    const controller = new AbortController();
    let detectorActive = false;
    let permissionAsked = false;
    let hiddenTimer = null;
    let hiddenAt = 0;
    let suspendTimer = null;
    let lastTick = Date.now();

    const clearHiddenTimer = () => {
      if (hiddenTimer) {
        clearTimeout(hiddenTimer);
        hiddenTimer = null;
      }
    };

    const stopSuspendTicks = () => {
      if (suspendTimer) {
        clearInterval(suspendTimer);
        suspendTimer = null;
      }
    };

    // Only ticks while the tab is visible — background tabs get throttled to
    // roughly one callback a minute, which would look exactly like a suspend.
    const startSuspendTicks = () => {
      stopSuspendTicks();
      lastTick = Date.now();

      suspendTimer = setInterval(() => {
        const now = Date.now();
        const asleep = now - lastTick > graceMs;
        lastTick = now;

        if (asleep) doLogout();
      }, SUSPEND_TICK_MS);
    };

    const startDetector = async () => {
      if (detectorActive || !("IdleDetector" in window)) return;

      try {
        const detector = new window.IdleDetector();

        detector.addEventListener("change", () => {
          if (detector.screenState === "locked") doLogout();
        });

        // 60s is the minimum the API accepts, and it only governs the "user is
        // idle" signal — screen-lock changes are delivered as they happen.
        await detector.start({ threshold: 60000, signal: controller.signal });

        detectorActive = true;
        clearHiddenTimer();
      } catch {
        // Unsupported, denied, or insecure context — the fallbacks still apply.
      }
    };

    // A grant from an earlier visit is still valid, so this skips the prompt.
    const useExistingPermission = async () => {
      try {
        const status = await navigator.permissions.query({
          name: "idle-detection",
        });

        if (status.state === "granted") startDetector();
      } catch {
        // Browser doesn't know this permission name.
      }
    };

    // requestPermission() needs user activation, so it can only run from here.
    const onGesture = async () => {
      if (permissionAsked || detectorActive || !("IdleDetector" in window)) {
        return;
      }

      permissionAsked = true;

      try {
        const state = await window.IdleDetector.requestPermission();
        if (state === "granted") startDetector();
      } catch {
        // Denied or unavailable — the fallbacks still apply.
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        stopSuspendTicks();
        hiddenAt = Date.now();
        // Disabled: logging out when the tab merely stays hidden also fired on
        // switching windows/tabs. Logout now only follows a real screen lock
        // (IdleDetector), a machine suspend (tick check) or a browser close.
        // if (!detectorActive) hiddenTimer = setTimeout(doLogout, graceMs);
        return;
      }

      clearHiddenTimer();

      // The timer above is frozen while the machine sleeps and fires late (or
      // not at all) on wake, so settle the elapsed time against the wall clock.
      // if (!detectorActive && hiddenAt && Date.now() - hiddenAt >= graceMs) {
      //   doLogout();
      //   return;
      // }

      hiddenAt = 0;
      startSuspendTicks();
    };

    // Browser / tab closing (also hits on reload — see the marker note above).
    const onPageHide = () => sendPresenceOff(userId);

    // Reload, or back/forward restored from the cache: the session survived, so
    // undo the "off" sent by onPageHide.
    const restorePresence = () => {
      if (userId && sessionStorage.getItem(CLOSING_MARKER)) {
        sessionStorage.removeItem(CLOSING_MARKER);
        dispatch(toggleAutoOnFeature({ userId, flag: true }));
      }
    };

    restorePresence();
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", restorePresence);

    document.addEventListener("visibilitychange", onVisibility);
    GESTURE_EVENTS.forEach((evt) =>
      window.addEventListener(evt, onGesture, { passive: true }),
    );

    useExistingPermission();
    if (!document.hidden) startSuspendTicks();

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", restorePresence);
      document.removeEventListener("visibilitychange", onVisibility);
      GESTURE_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onGesture),
      );
      clearHiddenTimer();
      stopSuspendTicks();
      controller.abort();
    };
  }, [doLogout, dispatch, graceMs, userId]);
}
