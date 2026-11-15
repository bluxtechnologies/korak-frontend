export interface ApiSessionEventPayload {
  endpoint: string;
  status: number;
  code: string;
  intendedPath?: string;
}

export type SessionEventListener = (payload: ApiSessionEventPayload) => void;

function createSessionEventChannel() {
  const listeners = new Set<SessionEventListener>();

  return {
    subscribe(listener: SessionEventListener): () => void {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    emit(payload: ApiSessionEventPayload): void {
      const enrichedPayload: ApiSessionEventPayload = {
        ...payload,
        intendedPath:
          payload.intendedPath ??
          (typeof window !== "undefined"
            ? `${window.location.pathname}${window.location.search}`
            : undefined),
      };

      listeners.forEach((listener) => {
        try {
          listener(enrichedPayload);
        } catch {
          // Isolate listener errors so other subscribers continue executing
        }
      });
    },

    clear(): void {
      listeners.clear();
    },
  };
}

const sessionExpiredChannel = createSessionEventChannel();
const permissionDeniedChannel = createSessionEventChannel();

/**
 * Subscribe to session expired (HTTP 401 or unrecoverable HTTP 419) events.
 * Returns an unsubscribe callback.
 */
export const onSessionExpired = sessionExpiredChannel.subscribe;

/**
 * Emit a session expired event to registered listeners.
 */
export const emitSessionExpired = sessionExpiredChannel.emit;

/**
 * Subscribe to permission denied (HTTP 403) events.
 * Returns an unsubscribe callback.
 */
export const onPermissionDenied = permissionDeniedChannel.subscribe;

/**
 * Emit a permission denied event to registered listeners.
 */
export const emitPermissionDenied = permissionDeniedChannel.emit;

/**
 * Remove all active event listeners (primarily for test isolation).
 */
export function clearApiEventListeners(): void {
  sessionExpiredChannel.clear();
  permissionDeniedChannel.clear();
}
