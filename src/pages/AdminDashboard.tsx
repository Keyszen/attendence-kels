import React, { useEffect, useState } from "react";
import { User, AttendanceRecord } from "../types";
import { LogOut, Calendar, Clock, User as UserIcon, X } from "lucide-react";

export function AdminDashboard({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"attendance" | "employees">(
    "attendance",
  );

  // Filter state
  const currentDate = new Date();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedPhotoData, setSelectedPhotoData] = useState<{
    url: string;
    date: string;
    username: string;
    type: "Masuk" | "Keluar";
  } | null>(null);

  // New employee form state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resRecords, resUsers] = await Promise.all([
        fetch("/api/attendance"),
        fetch("/api/users"),
      ]);
      const dataRecords = await resRecords.json();
      const dataUsers = await resUsers.json();

      if (dataRecords.success) setRecords(dataRecords.records);
      if (dataUsers.success) setUsers(dataUsers.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setNewUsername("");
        setNewPassword("");
        fetchData(); // Refresh list
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async (id: string | number) => {
    if (!confirm("Yakin ingin menghapus karyawan ini?")) return;

    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Karyawan berhasil dihapus");
        fetchData();
      } else {
        alert(data.message || "Gagal menghapus karyawan");
      }
    } catch (err) {
      alert("Terjadi kesalahan");
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1A1A1A] to-[#050505] font-sans text-white">
      <header className="flex justify-between items-center mb-8 border-b border-[#333] pb-6 px-6 sm:px-8 lg:px-12 pt-6 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C8B6A6] to-transparent opacity-30"></div>
        <div className="flex flex-col relative z-10">
          <h1 className="text-3xl font-serif italic text-[#C8B6A6] tracking-tight drop-shadow-sm">
            Kels Beauty Studio
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#A0A0A0] font-semibold mt-1">
            Admin Dashboard
          </p>
        </div>
        <div className="flex items-center gap-4 text-right relative z-10">
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

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "attendance"
                ? "bg-[#C8B6A6] text-black font-bold shadow-[0_0_10px_rgba(200,182,166,0.3)]"
                : "bg-[#1A1A1A] text-[#A0A0A0] border border-[#333] hover:text-white"
            }`}
          >
            Data Absensi
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTab === "employees"
                ? "bg-[#C8B6A6] text-black font-bold shadow-[0_0_10px_rgba(200,182,166,0.3)]"
                : "bg-[#1A1A1A] text-[#A0A0A0] border border-[#333] hover:text-white"
            }`}
          >
            Manajemen Karyawan
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-[#A0A0A0]">
            Memuat data...
          </div>
        ) : activeTab === "attendance" ? (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-[#121212] rounded-2xl p-4 shadow-xl border border-[#C8B6A6]/20 relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <Calendar className="w-5 h-5 text-[#C8B6A6]" />
                <span className="text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">
                  Filter Bulan
                </span>
              </div>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-[#1A1A1A] border border-[#333] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#C8B6A6] transition-colors relative z-10 [color-scheme:dark]"
              />
            </div>

            {records.filter((r) =>
              selectedMonth ? r.date.startsWith(selectedMonth) : true,
            ).length === 0 ? (
              <div className="text-center py-20 bg-[#121212] rounded-[32px] border border-[#333]">
                <p className="text-[#666]">
                  Belum ada data absensi untuk bulan ini.
                </p>
              </div>
            ) : (
              <div className="bg-[#121212] rounded-[32px] p-8 shadow-xl border border-[#C8B6A6]/20 overflow-hidden flex flex-col relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8B6A6]/5 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-end mb-6 relative z-10">
                  <h2 className="text-lg font-serif italic text-[#C8B6A6]">
                    Riwayat Absensi
                  </h2>
                  <span className="text-[10px] text-[#A0A0A0] uppercase font-bold tracking-widest">
                    Total Record:{" "}
                    {
                      records.filter((r) =>
                        selectedMonth ? r.date.startsWith(selectedMonth) : true,
                      ).length
                    }
                  </span>
                </div>

                <div className="overflow-x-auto relative z-10">
                  <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] uppercase tracking-widest text-[#A0A0A0] border-b border-[#333]">
                      <tr>
                        <th className="pb-4 font-bold">Tanggal</th>
                        <th className="pb-4 font-bold">Karyawan</th>
                        <th className="pb-4 font-bold">Masuk</th>
                        <th className="pb-4 font-bold">Keluar</th>
                        <th className="pb-4 font-bold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-[#333]">
                      {records
                        .filter((r) =>
                          selectedMonth
                            ? r.date.startsWith(selectedMonth)
                            : true,
                        )
                        .map((record) => (
                          <tr
                            key={record.id}
                            className="group hover:bg-[#1A1A1A] transition-colors"
                          >
                            <td className="py-4 text-[#A0A0A0]">
                              {record.date}
                            </td>
                            <td className="py-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#C8B6A6]/10 text-[#C8B6A6] flex items-center justify-center font-bold text-[10px] uppercase shadow-[0_0_8px_rgba(200,182,166,0.2)]">
                                {record.username?.substring(0, 2) || "KA"}
                              </div>
                              <span className="font-medium text-white capitalize">
                                {record.username || "Karyawan"}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <div className="flex flex-col space-y-1">
                                  <span className="font-mono text-[12px] text-white w-12">
                                    {record.timeIn}
                                  </span>
                                  {(() => {
                                    const status = getCheckInStatus(
                                      record.timeIn,
                                    );
                                    return status ? (
                                      <span
                                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border w-fit ${status.color}`}
                                      >
                                        {status.label}
                                      </span>
                                    ) : null;
                                  })()}
                                </div>
                                {record.photoIn ? (
                                  <div
                                    onClick={() => {
                                      setSelectedPhoto(record.photoIn);
                                      setSelectedPhotoData({
                                        url: record.photoIn,
                                        date: record.date,
                                        username: record.username || "Unknown",
                                        type: "Masuk",
                                      });
                                    }}
                                    className="inline-block w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#C8B6A6]/30 overflow-hidden shrink-0 cursor-pointer hover:border-[#C8B6A6] transition-all"
                                  >
                                    <img
                                      src={record.photoIn}
                                      alt="In"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="inline-block w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#333] overflow-hidden shrink-0" />
                                )}
                              </div>
                            </td>
                            <td className="py-4">
                              {record.timeOut ? (
                                <div className="flex items-center space-x-3">
                                  <span className="font-mono text-[12px] text-white w-12">
                                    {record.timeOut}
                                  </span>
                                  {record.photoOut ? (
                                    <div
                                      onClick={() => {
                                        setSelectedPhoto(record.photoOut!);
                                        setSelectedPhotoData({
                                          url: record.photoOut!,
                                          date: record.date,
                                          username:
                                            record.username || "Unknown",
                                          type: "Keluar",
                                        });
                                      }}
                                      className="inline-block w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#C8B6A6]/30 overflow-hidden shrink-0 cursor-pointer hover:border-[#C8B6A6] transition-all"
                                    >
                                      <img
                                        src={record.photoOut}
                                        alt="Out"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="inline-block w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#333] overflow-hidden shrink-0" />
                                  )}
                                </div>
                              ) : (
                                <span className="font-mono text-[12px] text-[#666] w-12 inline-block">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="py-4 text-right">
                              <button
                                onClick={async () => {
                                  if (
                                    !confirm(
                                      "Yakin ingin menghapus data absensi ini?",
                                    )
                                  )
                                    return;
                                  try {
                                    const res = await fetch(
                                      `/api/attendance/${record.id}`,
                                      { method: "DELETE" },
                                    );
                                    if (res.ok) {
                                      fetchData();
                                    } else {
                                      const data = await res.json();
                                      alert(
                                        data.message || "Gagal menghapus data",
                                      );
                                    }
                                  } catch (err) {
                                    alert("Terjadi kesalahan koneksi");
                                  }
                                }}
                                className="text-[#FF6B6B] hover:text-[#FF8787] text-xs font-semibold px-3 py-1 rounded-full bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 transition-colors border border-[#FF6B6B]/20"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#121212] rounded-[32px] p-8 shadow-xl border border-[#C8B6A6]/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#C8B6A6]/5 rounded-full blur-3xl"></div>
              <div className="flex justify-between items-end mb-6 relative z-10">
                <h2 className="text-lg font-serif italic text-[#C8B6A6]">
                  Daftar Karyawan
                </h2>
                <span className="text-[10px] text-[#A0A0A0] uppercase font-bold tracking-widest">
                  Total: {users.length}
                </span>
              </div>
              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-collapse">
                  <thead className="text-[10px] uppercase tracking-widest text-[#A0A0A0] border-b border-[#333]">
                    <tr>
                      <th className="pb-4 font-bold">Username</th>
                      <th className="pb-4 font-bold">Password</th>
                      <th className="pb-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-[#333]">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-[#1A1A1A] transition-colors"
                      >
                        <td className="py-4 font-medium text-white capitalize">
                          {u.username}
                        </td>
                        <td className="py-4 text-[#A0A0A0] font-mono text-xs">
                          {u.password}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDeleteEmployee(u.id)}
                            className="text-[#FF6B6B] hover:text-[#FF8787] text-xs font-semibold px-3 py-1 rounded-full bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 transition-colors border border-[#FF6B6B]/20"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-[#666]"
                        >
                          Belum ada karyawan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#121212] rounded-[32px] p-8 shadow-xl border border-[#C8B6A6]/20 h-fit relative overflow-hidden">
              <h2 className="text-lg font-serif italic text-[#C8B6A6] mb-6 relative z-10">
                Tambah Karyawan
              </h2>
              <form
                onSubmit={handleAddEmployee}
                className="space-y-4 relative z-10"
              >
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#A0A0A0] font-bold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#C8B6A6] transition-colors text-white placeholder:text-zinc-600"
                    placeholder="Masukkan username"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#A0A0A0] font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#C8B6A6] transition-colors text-white placeholder:text-zinc-600"
                    placeholder="Masukkan password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#5C1616] to-[#7A2021] text-[#E8DCC4] rounded-2xl py-3 text-sm font-bold hover:from-[#7A2021] hover:to-[#9B292A] transition-all disabled:opacity-50 shadow-[0_4px_14px_rgba(200,182,166,0.3)] mt-2"
                >
                  {isSubmitting ? "Menyimpan..." : "Tambah Karyawan"}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Photo Modal */}
      {selectedPhoto && selectedPhotoData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => {
            setSelectedPhoto(null);
            setSelectedPhotoData(null);
          }}
        >
          <div
            className="relative bg-[#121212] rounded-3xl p-2 max-w-sm w-full shadow-2xl flex flex-col border border-[#C8B6A6]/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setSelectedPhoto(null);
                setSelectedPhotoData(null);
              }}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-[#1A1A1A]/80 hover:bg-[#333] text-white flex items-center justify-center backdrop-blur-md transition-colors border border-[#333]"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="rounded-2xl overflow-hidden bg-black mb-2 relative border border-[#333]">
              <div className="absolute top-2 left-2 bg-black/70 text-[#C8B6A6] border border-[#C8B6A6]/30 text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded backdrop-blur-md z-10">
                {selectedPhotoData.username} • {selectedPhotoData.date} •{" "}
                {selectedPhotoData.type}
              </div>
              <img
                src={selectedPhoto}
                alt="Verification"
                className="w-full h-auto max-h-[70vh] object-contain relative z-0"
              />
            </div>
            <a
              href={selectedPhoto}
              download={`[Bulan-${selectedPhotoData.date.substring(0, 7)}]_Foto_Absensi_${selectedPhotoData.username}_${selectedPhotoData.date}_${selectedPhotoData.type}.jpg`}
              className="w-full bg-gradient-to-r from-[#5C1616] to-[#7A2021] text-[#E8DCC4] rounded-xl py-3 text-sm font-bold hover:from-[#7A2021] hover:to-[#9B292A] transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(200,182,166,0.3)]"
            >
              Unduh Foto
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
