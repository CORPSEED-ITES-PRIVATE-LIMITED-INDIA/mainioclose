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
  if (!isoDate || typeof isoDate !== 'string') {
    console.error('Invalid date input:', isoDate);
    return 'Invalid Date'; // Or return a fallback value
  }

  try {
    const date = parseAbsolute(isoDate, 'UTC');
    return date.toString().split('T')[0].split('-').reverse().join('-');
  } catch (error) {
    console.error('Error parsing date:', error);
    return 'Invalid Date'; // Or handle the error as needed
  }
}
