import { clsx, type ClassValue } from 'clsx';
import { format, isToday, isYesterday } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export const TIME_THRESHOLD = 5;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateLabel = (datsStr: string) => {
  const date = new Date(datsStr);

  if (isToday(date)) {
    return 'Today';
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return format(date, 'EEEE, MMMM d');
};
