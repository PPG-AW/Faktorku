"use client";

export interface SiswaSession {
  siswaId: string;
  nama: string;
  kelasId: string;
  kelasKode: string;
  kelasNama: string;
}

const SISWA_KEY = "faktorku_siswa";
const GURU_KEY = "faktorku_guru_kode";
const GURU_NAMA_KEY = "faktorku_guru_nama";

export function getSiswaSession(): SiswaSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SISWA_KEY);
    return raw ? (JSON.parse(raw) as SiswaSession) : null;
  } catch {
    return null;
  }
}

export function setSiswaSession(s: SiswaSession) {
  localStorage.setItem(SISWA_KEY, JSON.stringify(s));
}

export function clearSiswaSession() {
  localStorage.removeItem(SISWA_KEY);
}

export function getGuruKode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GURU_KEY);
}

export function setGuruKode(kode: string) {
  localStorage.setItem(GURU_KEY, kode);
}

export function getGuruNama(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(GURU_NAMA_KEY) ?? "";
}

export function setGuruNama(nama: string) {
  localStorage.setItem(GURU_NAMA_KEY, nama);
}
