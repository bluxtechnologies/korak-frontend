/**
 * Shared formatters for money, currencies, and dates.
 * Follows money principles in docs/14-wallet-and-payments.md §1:
 * - Amounts are integer minor units (e.g. kobo for NGN).
 * - Converted equivalents are display-only, computed at read time.
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

/**
 * Formats an integer minor-unit amount into a localized currency string.
 *
 * @param amountMinor - Amount in minor currency units (e.g., 100 kobo = 1 NGN)
 * @param currency - ISO 4217 currency code (default: "NGN")
 */
export function formatCurrency(
  amountMinor: number,
  currency: string = "NGN"
): string {
  const isNegative = amountMinor < 0;
  const absAmountMinor = Math.abs(amountMinor);
  const majorUnits = absAmountMinor / 100;

  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;

  const formattedMajor = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorUnits);

  return `${isNegative ? "-" : ""}${symbol}${formattedMajor}`;
}

/**
 * Formats a major-unit Naira amount into a localized currency string.
 *
 * @param amountMajor - Amount in major currency units (e.g. 3500 => "₦3,500.00")
 */
export function formatNaira(amountMajor: number): string {
  return formatCurrency(Math.round(amountMajor * 100), "NGN");
}

/**
 * Returns a masked representation of a currency value for privacy.
 */
export function maskCurrency(currency: string = "NGN"): string {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;
  return `${symbol}••••••`;
}

/**
 * Formats an ISO date/time string into a human-readable display string.
 */
export function formatDate(
  dateInput: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return "—";
    }
    return new Intl.DateTimeFormat("en-US", options).format(date);
  } catch {
    return "—";
  }
}
