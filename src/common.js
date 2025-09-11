import { parseAbsolute } from "@internationalized/date";

export const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const gstRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const formatPANInput = (value) => {
  value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let formatted = "";

  for (let i = 0; i < value.length && i < 10; i++) {
    if (i < 5) {
      if (/[A-Z]/.test(value[i])) formatted += value[i];
    } else if (i < 9) {
      if (/[0-9]/.test(value[i])) formatted += value[i];
    } else if (i === 9) {
      if (/[A-Z]/.test(value[i])) formatted += value[i];
    }
  }

  return formatted;
};

export const formatGSTInput = (value) => {
  value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let formatted = "";

  for (let i = 0; i < value.length && i < 15; i++) {
    if (i < 2) {
      if (/[0-9]/.test(value[i])) formatted += value[i];
    } else if (i < 7) {
      if (/[A-Z]/.test(value[i])) formatted += value[i];
    } else if (i < 11) {
      if (/[0-9]/.test(value[i])) formatted += value[i];
    } else if (i === 11) {
      if (/[A-Z]/.test(value[i])) formatted += value[i];
    } else if (i === 12) {
      if (/[0-9A-Z]/.test(value[i])) formatted += value[i];
    } else if (i === 13) {
      if (value[i] === "Z") formatted += value[i];
    } else if (i === 14) {
      if (/[0-9A-Z]/.test(value[i])) formatted += value[i];
    }
  }

  return formatted;
};

export function dateFormat(isoDate) {
  if (!isoDate || typeof isoDate !== "string") {
    console.error("Invalid date input:", isoDate);
    return "Invalid Date"; // Or return a fallback value
  }

  try {
    const date = parseAbsolute(isoDate, "UTC");
    return date.toString().split("T")[0].split("-").reverse().join("-");
  } catch (error) {
    console.error("Error parsing date:", error);
    return "Invalid Date"; // Or handle the error as needed
  }
}

export const leadSource = [
  "Corpseed Website",
  "Facebook",
  "Instagram",
  "IVR",
  "Person Reference",
  "Whatsapp",
  "Law Zoom website",
  "Other",
  "Mail",
  "Emailer",
];

export const paymentTermDays = [
  { label: 1, key: 1 },
  { label: 2, key: 2 },
  { label: 3, key: 3 },
  { label: 4, key: 4 },
  { label: 5, key: 5 },
  { label: 6, key: 6 },
  { label: 7, key: 7 },
  { label: 8, key: 8 },
  { label: 9, key: 9 },
  { label: 10, key: 10 },
  { label: 11, key: 11 },
  { label: 12, key: 12 },
  { label: 13, key: 13 },
  { label: 14, key: 14 },
  { label: 15, key: 15 },
  { label: 16, key: 16 },
  { label: 17, key: 17 },
  { label: 18, key: 18 },
  { label: 19, key: 19 },
  { label: 20, key: 20 },
  { label: 21, key: 21 },
  { label: 22, key: 22 },
  { label: 23, key: 23 },
  { label: 24, key: 24 },
  { label: 25, key: 25 },
  { label: 26, key: 26 },
  { label: 27, key: 27 },
  { label: 28, key: 28 },
  { label: 29, key: 29 },
  { label: 30, key: 30 },
  { label: 31, key: 31 },
  { label: 32, key: 32 },
  { label: 33, key: 33 },
  { label: 34, key: 34 },
  { label: 35, key: 35 },
  { label: 36, key: 36 },
  { label: 37, key: 37 },
  { label: 38, key: 38 },
  { label: 39, key: 39 },
  { label: 40, key: 40 },
  { label: 41, key: 41 },
  { label: 42, key: 42 },
  { label: 43, key: 43 },
  { label: 44, key: 44 },
  { label: 45, key: 45 },
];

export const getNameAndEmailById = (list, id) => {
  if (list?.length > 0) {
    const result = list.find((item) => item.id == id);
    return {
      name: result?.name,
      email: result?.email,
    };
  }
};

export function maskMobileNumber(mobile) {
  if (mobile) {
    const start = mobile.substring(0, 3);
    const stars = "****";
    const end = mobile.substring(mobile.length - 3);
    return `${start}${stars}${end}`;
  }
}

export function maskEmail(email) {
  if (email) {
    const [localPart, domain] = email?.split("@"); // Split the email into local and domain parts
    const localMasked =
      localPart?.substring(0, 2) + "***" + localPart?.substring(6);
    const domainMasked = domain?.substring(0, 2) + "***" + domain?.substring(5);
    return `${localMasked}@${domainMasked}`;
  }
}

export function inrCurrency(amount) {
  // Convert string to number if needed
  const num = typeof amount === "string" ? Number(amount) : amount;

  // Handle invalid numbers gracefully
  if (isNaN(num)) return "Invalid amount";

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2, // ensures 2 decimals if needed
  }).format(num);

  // Add non-breaking space after ₹
  return formatted.replace("₹", "₹\u00A0");
}


export function padZero(num) {
  return String(num).padStart(2, "0");
}

export function formatedDateTime(calendarDateTime) {
  if (!calendarDateTime) return null;

  const { year, day, month, hour, minute } = calendarDateTime;

  return `${year}-${padZero(month)}-${padZero(day)}T${padZero(hour)}:${padZero(minute)}`;
}



