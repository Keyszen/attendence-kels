import React, { useEffect, useState } from "react";
import { User, AttendanceRecord } from "../types";
import { WebcamCapture } from "../components/WebcamCapture";
import { LogOut, Clock, CheckCircle2, Camera } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function EmployeeDashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [attendance, setAttendance] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCamera, setShowCamera] = useState<"in" | "out" | null>(null);

  const fetchAttendance = async () => {
    try {
      const res = await fetch(`/api/attendance/today/${user.id}`);
      const data = await res.json();
      if (data.success) {
        setAttendance(data.attendance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user.id]);

  const handleCapture = async (base64: string) => {
    setActionLoading(true);
    const type = showCamera;
    setShowCamera(null);

    const endpoint =
      type === "in" ? "/api/attendance/in" : "/api/attendance/out";
    const payload =
      type === "in"
        ? { userId: user.id, photoIn: base64 }
        : { userId: user.id, photoOut: base64 };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        fetchAttendance();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  };

  const getCheckInStatus = (timeIn: string) => {
    if (!timeIn) return null;
    const [hours, minutes] = timeIn.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes;
    const targetMinutes = 9 * 60; // 09:00

    if (totalMinutes <= targetMinutes) {
      return {
        label: "Tepat Waktu",
        color: "text-green-700 bg-green-50 border-green-200",
      };
    } else if (totalMinutes <= targetMinutes + 30) {
      return {
        label: "Telat",
        color: "text-yellow-700 bg-yellow-50 border-yellow-200",
      };
    } else {
      return {
        label: "Sangat Telat",
        color: "text-red-700 bg-red-50 border-red-200",
      };
    }
  };

  const currentDate = format(new Date(), "EEEE, dd MMMM yyyy", { locale: id });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1A1A1A] to-[#050505] font-sans text-white pb-20">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-[#333] pb-6 px-6 pt-6 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C8B6A6] to-transparent opacity-30"></div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-serif italic text-[#C8B6A6] tracking-tight drop-shadow-sm">
            Kels Beauty Studio
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#A0A0A0] font-semibold mt-1">
            Staff Attendance System
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <div className="flex flex-col">
            <span className="text-sm font-medium capitalize text-white">
              {user.username}
            </span>
            <span className="text-[10px] uppercase text-[#C8B6A6] tracking-wider">
              {user.role}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="w-10 h-10 rounded-full bg-[#1A1A1A] border border-[#C8B6A6]/40 flex items-center justify-center text-[#C8B6A6] hover:bg-[#333] transition-colors shadow-[0_0_10px_rgba(200,182,166,0.1)]"
            aria-label="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto p-6 space-y-8 mt-4">
        {/* Date Display */}
        <div className="text-center space-y-1 relative">
          <p className="text-xs uppercase tracking-widest text-[#A0A0A0] font-bold">
            {currentDate}
          </p>
          <div className="flex items-center justify-center space-x-2 text-[#C8B6A6]">
            <Clock className="w-5 h-5 drop-shadow-[0_0_8px_rgba(200,182,166,0.5)]" />
            <span className="text-3xl font-mono tracking-tighter text-white drop-shadow-md">
              {format(new Date(), "HH:mm")}
            </span>
          </div>
          <p className="text-xs text-[#A0A0A0] mt-2 font-medium">
            Jam Kerja: 09:00 - 19:00
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-[#121212] rounded-[32px] p-6 shadow-xl border border-[#C8B6A6]/20 relative overflow-hidden">
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#C8B6A6]/5 rounded-full blur-2xl"></div>
          <h2 className="text-sm uppercase tracking-widest text-[#A0A0A0] font-bold mb-6 relative z-10">
            Status Kehadiran Hari Ini
          </h2>

          <div className="space-y-6 relative z-10">
            {/* Check In Status */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">Jam Masuk</p>
                {attendance ? (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 text-white font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[#C8B6A6]" />
                      <span className="font-mono text-sm">
                        {attendance.timeIn}
                      </span>
                    </div>
                    {(() => {
                      const status = getCheckInStatus(attendance.timeIn);
                      return status ? (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border w-fit ${status.color}`}
                        >
                          {status.label}
                        </span>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <span className="text-[#666] font-mono font-medium">—</span>
                )}
              </div>
              {attendance && attendance.photoIn && (
                <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-[#C8B6A6]/30 shrink-0">
                  <img
                    src={attendance.photoIn}
                    alt="Foto Masuk"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Check Out Status */}
            <div className="flex items-start justify-between pt-6 border-t border-[#333]">
              <div>
                <p className="text-sm text-[#A0A0A0] mb-1">Jam Keluar</p>
                {attendance?.timeOut ? (
                  <div className="flex items-center space-x-2 text-white font-medium">
                    <CheckCircle2 className="w-5 h-5 text-[#C8B6A6]" />
                    <span className="font-mono text-sm">
                      {attendance.timeOut}
                    </span>
                  </div>
                ) : (
                  <span className="text-[#666] font-mono font-medium">—</span>
                )}
              </div>
              {attendance?.photoOut && (
                <div className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-[#C8B6A6]/30 shrink-0">
                  <img
                    src={attendance.photoOut}
                    alt="Foto Keluar"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!showCamera ? (
          <div className="space-y-4">
            {!attendance ? (
              <button
                onClick={() => setShowCamera("in")}
                disabled={actionLoading}
                className="w-full bg-gradient-to-r from-[#5C1616] to-[#7A2021] text-[#E8DCC4] py-4 rounded-2xl font-bold text-sm hover:from-[#7A2021] hover:to-[#9B292A] transition-all shadow-[0_4px_14px_rgba(200,182,166,0.3)] flex items-center justify-center space-x-2 disabled:opacity-70"
              >
                <Camera className="w-5 h-5" />
                <span>Absen Masuk</span>
              </button>
            ) : !attendance.timeOut ? (
              <button
                onClick={() => setShowCamera("out")}
                disabled={actionLoading}
                className="w-full bg-[#1A1A1A] text-[#C8B6A6] border border-[#C8B6A6]/50 py-4 rounded-2xl font-bold text-sm hover:bg-[#222] transition-colors flex items-center justify-center space-x-2 shadow-[0_4px_14px_rgba(0,0,0,0.5)] disabled:opacity-70"
              >
                <Camera className="w-5 h-5" />
                <span>Absen Keluar</span>
              </button>
            ) : (
              <div className="text-center p-4 bg-[#1A1A1A] border border-[#333] text-[#A0A0A0] rounded-3xl text-sm font-medium">
                Anda telah menyelesaikan absensi hari ini.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 bg-[#121212] p-4 rounded-[32px] border border-[#C8B6A6]/20 shadow-xl">
            <div className="flex justify-between items-center mb-2 px-2">
              <h3 className="text-sm font-medium text-white">
                Ambil Selfie ({showCamera === "in" ? "Masuk" : "Keluar"})
              </h3>
              <button
                onClick={() => setShowCamera(null)}
                className="text-xs text-[#A0A0A0] hover:text-white transition-colors uppercase tracking-wider font-bold"
              >
                Batal
              </button>
            </div>
            <WebcamCapture onCapture={handleCapture} />
          </div>
        )}
      </main>
    </div>
  );
}
