export type User = {
  id: number | string;
  username: string;
  role: "admin" | "employee";
};

export type AttendanceRecord = {
  id: number | string;
  userId: number | string;
  username?: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  photoIn: string;
  photoOut: string | null;
};
