/**
 * Formats an ISO date string to a human-readable format: "Month DD, YYYY hh:mm AM/PM"
 * Example: "2020-10-30T12:43:58.198Z" -> "Oct 30, 2020 12:43 PM"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // fallback to original string if invalid

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;

  return `${month} ${day}, ${year} ${hours}:${minutesStr} ${ampm}`;
}

/**
 * Formats a number as Nigerian Naira currency.
 * Example: 150000 -> "₦150,000.00"
 */
export function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "";
  
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);
}
