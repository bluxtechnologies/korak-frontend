/**
 * Notifications formatting utilities (Doc 11 §7).
 * Ensures notification messages are human-readable, professional, and
 * never expose internal technical details like raw browser User-Agent strings.
 */

/**
 * Formats notification messages to clean, user-friendly language.
 * Replaces raw browser User-Agent strings (e.g. Mozilla/5.0...) with
 * clear device and browser descriptions (e.g. "Chrome on Windows").
 */
export function formatNotificationMessage(rawMessage: string): string {
  if (!rawMessage || typeof rawMessage !== "string") {
    return "";
  }

  // Detect and transform raw browser User-Agent strings
  if (/Mozilla\/5\.0/i.test(rawMessage)) {
    let os = "Windows";
    if (/iPhone/i.test(rawMessage)) os = "iPhone";
    else if (/iPad/i.test(rawMessage)) os = "iPad";
    else if (/Android/i.test(rawMessage)) os = "Android";
    else if (/Macintosh|Mac OS X/i.test(rawMessage)) os = "macOS";
    else if (/Windows NT 10/i.test(rawMessage)) os = "Windows";
    else if (/Windows/i.test(rawMessage)) os = "Windows";
    else if (/Linux/i.test(rawMessage)) os = "Linux";

    let browser = os === "iPhone" || os === "iPad" || os === "macOS" ? "Safari" : "Chrome";
    if (/Edg\//i.test(rawMessage)) {
      browser = "Edge";
    } else if (/Firefox\//i.test(rawMessage)) {
      browser = "Firefox";
    } else if (/Chrome\//i.test(rawMessage) && !/Edg\//i.test(rawMessage)) {
      browser = "Chrome";
    } else if (/Safari\//i.test(rawMessage) && !/Chrome\//i.test(rawMessage)) {
      browser = "Safari";
    }

    // If it's a device verification message, give a clean sentence
    if (/new device|device verified|login/i.test(rawMessage)) {
      return `A new sign-in from ${browser} on ${os} was verified.`;
    }

    // Otherwise replace the User-Agent token with clean device info
    return rawMessage
      .replace(/\(?\s*Mozilla\/5\.0[^)]*\)?/gi, `${browser} on ${os}`)
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  return rawMessage;
}

/**
 * Formats a notification ISO date string into a relative or human time.
 * - < 1 min: "Just now"
 * - < 1 hour: "Xm ago"
 * - < 24 hours: "Xh ago"
 * - Yesterday: "Yesterday"
 * - Older: "MMM d" (e.g. "Nov 15")
 */
export function formatNotificationTime(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return "Just now";
    }
    if (diffMin < 60) {
      return `${diffMin}m ago`;
    }
    if (diffHour < 24) {
      return `${diffHour}h ago`;
    }
    if (diffDay === 1) {
      return "Yesterday";
    }
    if (diffDay < 7) {
      return `${diffDay}d ago`;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
