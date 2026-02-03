// DigitalEventCalendar.jsx — Full rebuilt (Option C)
// Improvements: polished green/gold theme, animations, stronger shadows, mobile-friendly keyboard handling, admin tools, import/export, offline-ready notes.

import React, { useEffect, useMemo, useRef, useState } from 'react';

// ---------- CONFIG ----------
const ADMIN_PASSWORD = 'ros123';
const TIMEZONE = 'Asia/Manila';
const REMOTE_EVENTS_URL = 'https://ching0ching.github.io/TWA/events.json';
const LOCAL_STORAGE_KEY = 'dec_events_v2';

// Palette (sampled from your screenshots, softened)
const COLORS = {
  green: { bg: '#4CAF50', dark: '#0f5132', text: '#08341f' },
  gold: { bg: '#F7E7BF', dark: '#A67C00', text: '#5b3f00' },
  pink: { bg: '#FFB3C8', dark: '#A63A5A', text: '#6d2030' },
  indigo: { bg: '#C7D7FF', dark: '#2f4f9b', text: '#223a6a' },
  orange: { bg: '#FFD4A3', dark: '#D97706', text: '#7C3B0E' },
};

const TYPE_META = {
  event: { color: COLORS.green, icon: '🎉' },
  holiday: { color: COLORS.gold, icon: '⭐' },
  birthday: { color: COLORS.pink, icon: '🎂' },
  exam: { color: COLORS.indigo, icon: '📚' },
  meeting: { color: COLORS.orange, icon: '📝' },
};

// ---------- HELPERS ----------
function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function formatDateISO(d) {
  const dd = new Date(d);
  if (isNaN(dd)) return '';
  return dd.toISOString().slice(0, 10);
}
function parseEventDate(s) {
  const d = new Date(s);
  if (!isNaN(d)) return d;
  const parts = (s || '').split('T')[0].split('-');
  if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
  return new Date(s);
}
function isSameDay(a, b) {
  const x = new Date(a);
  const y = new Date(b);
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate();
}

// ---------- COMPONENT ----------
export default function DigitalEventCalendar() {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(today));



  const [events, setEvents] = useState(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    // Default events (holidays, birthdays, school events)
    const holidays = [
      { id: 'holiday-001', title: "New Year's Day", type: 'holiday', start: '2026-01-01', end: '2026-01-01', location: '', description: 'National holiday', recurring: 'annual' },
      { id: 'holiday-002', title: 'EDSA Revolution Day', type: 'holiday', start: '2026-02-25', end: '2026-02-25', location: '', description: 'Commemoration of EDSA Revolution', recurring: 'annual' },
      { id: 'holiday-003', title: 'Holy Thursday', type: 'holiday', start: '2026-04-02', end: '2026-04-02', location: '', description: 'Maundy Thursday - No work', recurring: 'none' },
      { id: 'holiday-004', title: 'Good Friday', type: 'holiday', start: '2026-04-03', end: '2026-04-03', location: '', description: 'National holiday', recurring: 'none' },
      { id: 'holiday-005', title: 'Black Saturday', type: 'holiday', start: '2026-04-04', end: '2026-04-04', location: '', description: 'Special non-working day', recurring: 'none' },
      { id: 'holiday-006', title: 'Araw ng Kagitingan', type: 'holiday', start: '2026-04-09', end: '2026-04-09', location: '', description: 'Day of Valor - National hero', recurring: 'annual' },
      { id: 'holiday-007', title: 'Labor Day', type: 'holiday', start: '2026-05-01', end: '2026-05-01', location: '', description: 'International Workers Day', recurring: 'annual' },
      { id: 'holiday-008', title: 'Independence Day', type: 'holiday', start: '2026-06-12', end: '2026-06-12', location: '', description: 'Philippine Independence Declaration', recurring: 'annual' },
      { id: 'holiday-009', title: 'Ninoy Aquino Day', type: 'holiday', start: '2026-08-21', end: '2026-08-21', location: '', description: 'Commemoration of Ninoy Aquino', recurring: 'annual' },
      { id: 'holiday-010', title: 'National Heroes Day', type: 'holiday', start: '2026-08-24', end: '2026-08-24', location: '', description: 'Last Monday of August', recurring: 'annual' },
      { id: 'holiday-011', title: "All Saints' Day", type: 'holiday', start: '2026-11-01', end: '2026-11-01', location: '', description: 'Fiesta ng mga Santo', recurring: 'annual' },
      { id: 'holiday-012', title: "All Souls' Day", type: 'holiday', start: '2026-11-02', end: '2026-11-02', location: '', description: 'Day of the Dead', recurring: 'annual' },
      { id: 'holiday-013', title: 'Bonifacio Day', type: 'holiday', start: '2026-11-30', end: '2026-11-30', location: '', description: 'Birth of Andres Bonifacio', recurring: 'annual' },
      { id: 'holiday-014', title: 'Feast of the Immaculate Conception', type: 'holiday', start: '2026-12-08', end: '2026-12-08', location: '', description: 'Religious holiday', recurring: 'annual' },
      { id: 'holiday-015', title: 'Christmas Day', type: 'holiday', start: '2026-12-25', end: '2026-12-25', location: '', description: 'Merry Christmas!', recurring: 'annual' },
      { id: 'holiday-016', title: 'Rizal Day', type: 'holiday', start: '2026-12-30', end: '2026-12-30', location: '', description: 'Death of Jose Rizal', recurring: 'annual' },
      // Staff & Admin Birthdays
      { id: 'birthday-001', title: "Sir John Joseph Umandap's Birthday", type: 'birthday', start: '2026-01-06', end: '2026-01-06', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-002', title: "Sir Ronald Yazon's Birthday", type: 'birthday', start: '2026-02-01', end: '2026-02-01', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-003', title: "Ma'am Karen Fajardo's Birthday", type: 'birthday', start: '2026-02-02', end: '2026-02-02', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-004', title: "Ma'am Lady Lyn Ramos's Birthday", type: 'birthday', start: '2026-02-05', end: '2026-02-05', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-005', title: "Ma'am Geneveive Jamias's Birthday", type: 'birthday', start: '2026-02-08', end: '2026-02-08', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-006', title: "Sir James De Guzman's Birthday", type: 'birthday', start: '2026-02-27', end: '2026-02-27', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-007', title: "Sir Ken Deseo's Birthday", type: 'birthday', start: '2026-02-23', end: '2026-02-23', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-008', title: "Ma'am Jennifer Bas's Birthday", type: 'birthday', start: '2026-03-31', end: '2026-03-31', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-009', title: "Sir Vicente Porto's Birthday", type: 'birthday', start: '2026-04-10', end: '2026-04-10', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-010', title: "Sir Louie Cezar Leocadio's Birthday", type: 'birthday', start: '2026-04-05', end: '2026-04-05', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-011', title: "Sir Ronn Ramos's Birthday", type: 'birthday', start: '2026-04-12', end: '2026-04-12', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-012', title: "Ma'am Maryjane De Cillo's Birthday", type: 'birthday', start: '2026-04-21', end: '2026-04-21', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-013', title: "Ma'am Angelica Aguila's Birthday", type: 'birthday', start: '2026-05-02', end: '2026-05-02', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-014', title: "Admin 2 Birthday", type: 'birthday', start: '2026-06-25', end: '2026-06-25', location: '', description: 'Admin Birthday', recurring: 'annual' },
      { id: 'birthday-015', title: "Sir Arnel Mendoza's Birthday", type: 'birthday', start: '2026-07-08', end: '2026-07-08', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-016', title: "Sir Ken Deseo's Birthday", type: 'birthday', start: '2026-07-23', end: '2026-07-23', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-017', title: "Sir Cris De Silva's Birthday", type: 'birthday', start: '2026-08-20', end: '2026-08-20', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-018', title: "Sir Rammir Palacio's Birthday", type: 'birthday', start: '2026-08-30', end: '2026-08-30', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-019', title: "Sir Eugene Saguirer's Birthday", type: 'birthday', start: '2026-09-15', end: '2026-09-15', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-020', title: "Ma'am Maura Zeta's Birthday", type: 'birthday', start: '2026-09-22', end: '2026-09-22', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-021', title: "Ma'am Teresa Marquez's Birthday", type: 'birthday', start: '2026-10-11', end: '2026-10-11', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-022', title: "Ma'am Irene Manongsong's Birthday", type: 'birthday', start: '2026-10-20', end: '2026-10-20', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-023', title: "Admin 1 Birthday", type: 'birthday', start: '2026-11-08', end: '2026-11-08', location: '', description: 'Admin Birthday', recurring: 'annual' },
      { id: 'birthday-024', title: "Admin 3 Birthday", type: 'birthday', start: '2026-11-05', end: '2026-11-05', location: '', description: 'Admin Birthday', recurring: 'annual' },
      { id: 'birthday-025', title: "Sir Marlito Gollena's Birthday", type: 'birthday', start: '2026-11-05', end: '2026-11-05', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-026', title: "Sir John Carlo Balbuena's Birthday", type: 'birthday', start: '2026-12-22', end: '2026-12-22', location: '', description: 'Faculty Birthday', recurring: 'annual' },
      { id: 'birthday-027', title: "Sir Carrie Estrellado's Birthday", type: 'birthday', start: '2026-12-31', end: '2026-12-31', location: '', description: 'Faculty Birthday', recurring: 'annual' },
    // School Events 2025-2026
    { id: 'event-001', title: 'First Faculty Meeting', type: 'meeting', start: '2025-06-13', end: '2025-06-13', location: '', description: 'First Faculty Meeting', recurring: '' },
    { id: 'event-002', title: 'First Day of School', type: 'event', start: '2025-06-16', end: '2025-06-16', location: '', description: 'First Day of School', recurring: '' },
    { id: 'event-003', title: "Student's General Orientation", type: 'event', start: '2025-06-16', end: '2025-06-16', location: '', description: "Student's General Orientation", recurring: '' },
    { id: 'event-004', title: "Student's General Orientation", type: 'event', start: '2025-06-17', end: '2025-06-17', location: '', description: "Student's General Orientation", recurring: '' },
    { id: 'event-005', title: 'Psychosocial Support Activities', type: 'event', start: '2025-06-16', end: '2025-06-16', location: '', description: 'Psychosocial Support Activities', recurring: '' },
    { id: 'event-006', title: 'Psychosocial Support Activities', type: 'event', start: '2025-06-17', end: '2025-06-17', location: '', description: 'Psychosocial Support Activities', recurring: '' },
    { id: 'event-007', title: 'Psychosocial Support Activities', type: 'event', start: '2025-06-18', end: '2025-06-18', location: '', description: 'Psychosocial Support Activities', recurring: '' },
    { id: 'event-008', title: 'Psychosocial Support Activities', type: 'event', start: '2025-06-19', end: '2025-06-19', location: '', description: 'Psychosocial Support Activities', recurring: '' },
    { id: 'event-009', title: "Parents' General Orientation (PM)", type: 'meeting', start: '2025-06-19', end: '2025-06-19', location: '', description: "Parents' General Orientation (PM)", recurring: '' },
    { id: 'event-010', title: "Teachers' Seminar/Training/Workshops", type: 'event', start: '2025-06-20', end: '2025-06-20', location: '', description: "Teachers' Seminar/Training/Workshops", recurring: '' },
    { id: 'event-011', title: '1st Day Intramurals', type: 'event', start: '2025-07-16', end: '2025-07-16', location: '', description: '1st Day Intramurals', recurring: '' },
    { id: 'event-012', title: '2nd Day Intramurals', type: 'event', start: '2025-07-17', end: '2025-07-17', location: '', description: '2nd Day Intramurals', recurring: '' },
    { id: 'event-013', title: '3rd Day Intramurals', type: 'event', start: '2025-08-01', end: '2025-08-01', location: '', description: '3rd Day Intramurals', recurring: '' },
    { id: 'event-014', title: 'First Professional Learning Community (PLC)', type: 'event', start: '2025-07-30', end: '2025-07-30', location: '', description: 'First Professional Learning Community (PLC)', recurring: '' },
    { id: 'event-015', title: 'Preliminary Examination for the 1st Semester', type: 'exam', start: '2025-08-04', end: '2025-08-04', location: '', description: 'Preliminary Examination for the 1st Semester', recurring: '' },
    { id: 'event-016', title: 'Preliminary Examination for the 1st Semester', type: 'exam', start: '2025-08-06', end: '2025-08-06', location: '', description: 'Preliminary Examination for the 1st Semester', recurring: '' },
    { id: 'event-017', title: 'Second Professional Learning Community (PLC)', type: 'event', start: '2025-08-27', end: '2025-08-27', location: '', description: 'Second Professional Learning Community (PLC)', recurring: '' },
    { id: 'event-018', title: 'Midterm Examination for the 1st Semester', type: 'exam', start: '2025-08-28', end: '2025-08-28', location: '', description: 'Midterm Examination for the 1st Semester', recurring: '' },
    { id: 'event-019', title: 'Midterm Examination for the 1st Semester', type: 'exam', start: '2025-08-29', end: '2025-08-29', location: '', description: 'Midterm Examination for the 1st Semester', recurring: '' },
    { id: 'event-020', title: 'Mental Health Awareness Seminar (Phase 1) (PM)', type: 'event', start: '2025-09-19', end: '2025-09-19', location: '', description: 'Mental Health Awareness Seminar (Phase 1) (PM)', recurring: '' },
    { id: 'event-021', title: 'Third Professional Learning Community (PLC)', type: 'event', start: '2025-09-24', end: '2025-09-24', location: '', description: 'Third Professional Learning Community (PLC)', recurring: '' },
    { id: 'event-022', title: 'Semi-Final Examination for the 1st Semester', type: 'exam', start: '2025-09-25', end: '2025-09-25', location: '', description: 'Semi-Final Examination for the 1st Semester', recurring: '' },
    { id: 'event-023', title: 'Semi-Final Examination for the 1st Semester', type: 'exam', start: '2025-09-26', end: '2025-09-26', location: '', description: 'Semi-Final Examination for the 1st Semester', recurring: '' },
    { id: 'event-024', title: "World Teachers' Day Celebration (AM)", type: 'event', start: '2025-10-03', end: '2025-10-03', location: '', description: "World Teachers' Day Celebration (AM)", recurring: '' },
    { id: 'event-025', title: 'Completion of Academic Clearance for Second Semester', type: 'event', start: '2025-10-13', end: '2025-10-13', location: '', description: 'Completion of Academic Clearance for Second Semester', recurring: '' },
    { id: 'event-026', title: 'Completion of Academic Clearance for Second Semester', type: 'event', start: '2025-10-14', end: '2025-10-14', location: '', description: 'Completion of Academic Clearance for Second Semester', recurring: '' },
    { id: 'event-027', title: 'Completion of Academic Clearance for Second Semester', type: 'event', start: '2025-10-15', end: '2025-10-15', location: '', description: 'Completion of Academic Clearance for Second Semester', recurring: '' },
    { id: 'event-028', title: 'Completion of Academic Clearance for Second Semester', type: 'event', start: '2025-10-16', end: '2025-10-16', location: '', description: 'Completion of Academic Clearance for Second Semester', recurring: '' },
    { id: 'event-029', title: 'Completion of Academic Clearance for Second Semester', type: 'event', start: '2025-10-17', end: '2025-10-17', location: '', description: 'Completion of Academic Clearance for Second Semester', recurring: '' },
    { id: 'event-030', title: 'Final Examination for the 1st Semester', type: 'exam', start: '2025-10-23', end: '2025-10-23', location: '', description: 'Final Examination for the 1st Semester', recurring: '' },
    { id: 'event-031', title: 'Final Examination for the 1st Semester', type: 'exam', start: '2025-10-24', end: '2025-10-24', location: '', description: 'Final Examination for the 1st Semester', recurring: '' },
    { id: 'event-032', title: 'Mid-School Year Wellness Break of Learners and Teachers', type: 'event', start: '2025-10-27', end: '2025-10-27', location: '', description: 'Mid-School Year Wellness Break of Learners and Teachers', recurring: '' },
    { id: 'event-033', title: 'Enrollment for Second Semester', type: 'event', start: '2025-10-27', end: '2025-10-27', location: '', description: 'Enrollment for Second Semester', recurring: '' },
    { id: 'event-034', title: 'Enrollment for Second Semester', type: 'event', start: '2025-10-28', end: '2025-10-28', location: '', description: 'Enrollment for Second Semester', recurring: '' },
    { id: 'event-035', title: 'Enrollment for Second Semester', type: 'event', start: '2025-10-29', end: '2025-10-29', location: '', description: 'Enrollment for Second Semester', recurring: '' },
    { id: 'event-036', title: 'Enrollment for Second Semester', type: 'event', start: '2025-10-30', end: '2025-10-30', location: '', description: 'Enrollment for Second Semester', recurring: '' },
    { id: 'event-037', title: 'Enrollment for Second Semester', type: 'event', start: '2025-10-31', end: '2025-10-31', location: '', description: 'Enrollment for Second Semester', recurring: '' },
    { id: 'event-038', title: 'Career Guidance Activity For Grade 11 (AM)', type: 'meeting', start: '2025-11-11', end: '2025-11-11', location: '', description: 'Career Guidance Activity For Grade 11 (AM)', recurring: '' },
    { id: 'event-039', title: "Semestral Convocation Day (AM)/ Parents' Meeting (PM)", type: 'meeting', start: '2025-11-13', end: '2025-11-13', location: '', description: "Semestral Convocation Day (AM)/ Parents' Meeting (PM)", recurring: '' },
    { id: 'event-040', title: 'Educational Trip 2025 (Tentative)', type: 'event', start: '2025-11-26', end: '2025-11-26', location: '', description: 'Educational Trip 2025 (Tentative)', recurring: '' },
    { id: 'event-041', title: 'Career Guidance Activity for Grade 12 (AM)', type: 'meeting', start: '2025-12-11', end: '2025-12-11', location: '', description: 'Career Guidance Activity for Grade 12 (AM)', recurring: '' },
    { id: 'event-042', title: 'Year End Party', type: 'event', start: '2025-12-17', end: '2025-12-17', location: '', description: 'Year End Party', recurring: '' },
    { id: 'event-043', title: 'Start of Christmas Break', type: 'event', start: '2025-12-18', end: '2025-12-18', location: '', description: 'Start of Christmas Break', recurring: '' },
    { id: 'event-044', title: 'Resumption of Classes', type: 'event', start: '2026-01-05', end: '2026-01-05', location: '', description: 'Resumption of Classes', recurring: '' },
    { id: 'event-045', title: 'Fifth Professional Learning Community (PLC)', type: 'event', start: '2026-01-09', end: '2026-01-09', location: '', description: 'Fifth Professional Learning Community (PLC)', recurring: '' },
    { id: 'event-046', title: 'Midterm Examination for the 2nd Semester', type: 'exam', start: '2026-01-12', end: '2026-01-12', location: '', description: 'Midterm Examination for the 2nd Semester', recurring: '' },
    { id: 'event-047', title: 'Midterm Examination for the 2nd Semester', type: 'exam', start: '2026-01-13', end: '2026-01-13', location: '', description: 'Midterm Examination for the 2nd Semester', recurring: '' },
    { id: 'event-048', title: '98th Foundation Day', type: 'event', start: '2026-01-19', end: '2026-01-19', location: '', description: '98th Foundation Day', recurring: '' },
    { id: 'event-049', title: '98th Foundation Day', type: 'event', start: '2026-01-20', end: '2026-01-20', location: '', description: '98th Foundation Day', recurring: '' },
    { id: 'event-050', title: '98th Foundation Day', type: 'event', start: '2026-01-21', end: '2026-01-21', location: '', description: '98th Foundation Day', recurring: '' },
    { id: 'event-051', title: '98th Foundation Day', type: 'event', start: '2026-01-22', end: '2026-01-22', location: '', description: '98th Foundation Day', recurring: '' },
    { id: 'event-052', title: '98th Foundation Day', type: 'event', start: '2026-01-23', end: '2026-01-23', location: '', description: '98th Foundation Day', recurring: '' },
    { id: 'event-053', title: 'Early Registration for the Incoming Grade 11', type: 'event', start: '2026-01-31', end: '2026-01-31', location: '', description: 'Early Registration for the Incoming Grade 11', recurring: '' },
    { id: 'event-054', title: 'Candelaria Town Fiesta', type: 'event', start: '2026-02-05', end: '2026-02-05', location: '', description: 'Candelaria Town Fiesta', recurring: '' },
    { id: 'event-055', title: "Valentine's Day Celebration", type: 'event', start: '2026-02-13', end: '2026-02-13', location: '', description: "Valentine's Day Celebration", recurring: '' },
    { id: 'event-056', title: 'Mental Health Awareness Seminar (Phase 2) (PM)', type: 'event', start: '2026-02-20', end: '2026-02-20', location: '', description: 'Mental Health Awareness Seminar (Phase 2) (PM)', recurring: '' },
    { id: 'event-057', title: 'Final Examination of Grade 12 for the 2nd Semester', type: 'exam', start: '2026-02-26', end: '2026-02-26', location: '', description: 'Final Examination of Grade 12 for the 2nd Semester', recurring: '' },
    { id: 'event-058', title: 'Final Examination of Grade 12 for the 2nd Semester', type: 'exam', start: '2026-02-27', end: '2026-02-27', location: '', description: 'Final Examination of Grade 12 for the 2nd Semester', recurring: '' },
    { id: 'event-059', title: 'Sixth Professional Learning Community (PLC)', type: 'event', start: '2026-03-04', end: '2026-03-04', location: '', description: 'Sixth Professional Learning Community (PLC)', recurring: '' },
    { id: 'event-060', title: 'Final Examination of Grades 11 for the 2nd Semester', type: 'exam', start: '2026-03-05', end: '2026-03-05', location: '', description: 'Final Examination of Grades 11 for the 2nd Semester', recurring: '' },
    { id: 'event-061', title: 'Final Examination of Grades 11 for the 2nd Semester', type: 'exam', start: '2026-03-06', end: '2026-03-06', location: '', description: 'Final Examination of Grades 11 for the 2nd Semester', recurring: '' },
    { id: 'event-062', title: 'Deliberation of Honors (Grade 12) (PM)', type: 'event', start: '2026-03-12', end: '2026-03-12', location: '', description: 'Deliberation of Honors (Grade 12) (PM)', recurring: '' },
    { id: 'event-063', title: 'Graduation Ball', type: 'event', start: '2026-03-20', end: '2026-03-20', location: '', description: 'Graduation Ball', recurring: '' },
    { id: 'event-064', title: 'Recognition Day (AM)', type: 'event', start: '2026-03-25', end: '2026-03-25', location: '', description: 'Recognition Day (AM)', recurring: '' },
    { id: 'event-065', title: '88th Commencement Exercise', type: 'event', start: '2026-03-27', end: '2026-03-27', location: '', description: '88th Commencement Exercise', recurring: '' },
    { id: 'event-066', title: 'Distribution of Card (Tentative)', type: 'event', start: '2026-04-03', end: '2026-04-03', location: '', description: 'Distribution of Card (Tentative)', recurring: '' }
];
    console.log('Loading holidays:', holidays.length);
    // Normalize defaults: convert orientations/meetings to type 'meeting'
    const normalized = holidays.map((ev) => {
      try {
        if (ev && ev.title && /orientation|meeting/i.test(ev.title)) {
          return { ...ev, type: 'meeting' };
        }
      } catch (e) {}
      return ev;
    });
    return normalized;
  });

  // UI state
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminPw, setAdminPw] = useState('');
  const adminModalRef = useRef(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notification, setNotification] = useState(null);
  const [notificationType, setNotificationType] = useState('success'); // success, error, warning, info
  const [isDark, setIsDark] = useState(false);

  // keep the actual page background in sync so rounded containers don't show white
  useEffect(() => {
    try {
      document.documentElement.style.backgroundColor = isDark ? '#0f1720' : '#ffffff';
      document.body.style.backgroundColor = isDark ? '#0f1720' : '#ffffff';
    } catch (e) {}
    return () => {
      try { document.documentElement.style.backgroundColor = ''; document.body.style.backgroundColor = ''; } catch (e) {}
    };
  }, [isDark]);

  // forms
  const [formState, setFormState] = useState({ title: '', type: 'event', start: formatDateISO(new Date()), end: formatDateISO(new Date()), recurring: 'none', location: '', description: '' });
  const [adminForm, setAdminForm] = useState({ title: '', type: 'event', start: formatDateISO(new Date()), end: formatDateISO(new Date()), location: '', description: '' });

  const notificationRef = useRef(null);
  const fileRef = useRef(null);

  // persist local
  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(events)); } catch (e) {}
  }, [events]);

  // persist dark theme preference so index.html can apply it early
  useEffect(() => {
    try { localStorage.setItem('dec_theme_dark', isDark ? 'true' : 'false'); } catch (e) {}
  }, [isDark]);

  // notify about today's events on app load
  useEffect(() => {
    if (events.length === 0) return;
    const todayEvents = events.filter((ev) => {
      const evStart = parseEventDate(ev.start);
      return isSameDay(evStart, today) || (ev.recurring === 'annual' && new Date(evStart).getMonth() === today.getMonth() && new Date(evStart).getDate() === today.getDate());
    });
    if (todayEvents.length > 0) {
      const eventList = todayEvents.slice(0, 3).map(e => e.title).join(', ') + (todayEvents.length > 3 ? `... +${todayEvents.length - 3} more` : '');
      showNote(`📅 Today's events: ${eventList}`, 'info', 15000);
    }
  }, [events]);

  // try fetch remote events (single attempt)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(REMOTE_EVENTS_URL, { cache: 'no-store' });
        if (!res.ok) return;
        const remote = await res.json();
        if (!cancelled && Array.isArray(remote) && remote.length) {
          setEvents(remote);
          showNote('✓ Calendar updated from remote', 'success');
        }
      } catch (e) {
        // ignore network errors silently
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // notification helper with type support
  function showNote(msg, type = 'success', ms = 5000) {
    setNotification(msg);
    setNotificationType(type);
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(type === 'error' ? [100, 50, 100] : 50);
    }
    if (notificationRef.current) clearTimeout(notificationRef.current);
    notificationRef.current = setTimeout(() => setNotification(null), ms);
  }

  // attempt admin login
  function tryAdminLogin(pw) {
    if (pw === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setAdminPw('');
      showNote('✓ Logged in as Admin', 'success');
      return true;
    }
    showNote('✗ Wrong password', 'error');
    return false;
  }

  // calendar grid (weeks array)
  const weeks = useMemo(() => {
    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const days = [];
    for (let i = 0; i < start.getDay(); i++) days.push(null);
    for (let d = 1; d <= end.getDate(); d++) days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d));
    while (days.length % 7 !== 0) days.push(null);
    const out = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, [currentMonth, events]);

  function eventsOnDate(d) {
    if (!d) return [];
    return events.filter((ev) => isSameDay(parseEventDate(ev.start), d) || (ev.recurring === 'annual' && new Date(ev.start).getMonth() === d.getMonth() && new Date(ev.start).getDate() === d.getDate()));
  }

  // CRUD helpers
  function addEvent(ev) {
    const newEv = { ...ev, id: uid('evt') };
    setEvents((s) => {
      const next = [...s, newEv];
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
    // ensure UI refreshes
    setSelectedEvent(null);
    setSelectedDate(null);
    showNote('✓ Event added', 'success');
  }
  function updateEvent(ev) {
    setEvents((s) => {
      const next = s.map((x) => (x.id === ev.id ? ev : x));
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
    // ensure UI refreshes
    setSelectedEvent(null);
    setSelectedDate(null);
    showNote('✓ Event updated', 'success');
  }
  function deleteEvent(id) {
  console.log('DELETE REQUESTED FOR:', id);

  setEvents((current) => {
    const cleaned = current.map(ev => ({ ...ev, id: String(ev.id) }));
    const filtered = cleaned.filter(ev => String(ev.id) !== String(id));

    console.log('BEFORE DELETE:', cleaned);
    console.log('AFTER DELETE:', filtered);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed saving:', e);
    }

    return filtered;
  });

  setSelectedEvent(null);
  setSelectedDate(null);
  showNote('✓ Event deleted', 'success');
}

// import / export
  function downloadEventsFile() {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'events.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }
  function handleUploadFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!Array.isArray(parsed)) throw new Error('Invalid JSON');
        setEvents(parsed);
        showNote('✓ Events imported successfully', 'success');
      } catch (err) { showNote('✗ Import failed: ' + err.message, 'error'); }
    };
    reader.readAsText(file);
  }

  // keyboard helper: give page bottom padding while inputs focused and ensure scrolled into view
  useEffect(() => {
    function onFocusIn(e) {
      const tag = (e.target.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) {
        try { document.body.style.paddingBottom = '360px'; } catch (err) {}
        setTimeout(() => { try { e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {} }, 350);

        // if focus is inside admin modal, also ensure modal container scrolls so the field is visible
        try {
          if (adminModalRef?.current && adminModalRef.current.contains(e.target)) {
            setTimeout(() => {
              try {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                adminModalRef.current.scrollTop = Math.max(0, e.target.offsetTop - 40);
              } catch (er) {}
            }, 380);
          }
        } catch (er) {}
      }
    }
    function onFocusOut() { try { document.body.style.paddingBottom = ''; } catch (e) {} }
    window.addEventListener('focusin', onFocusIn);
    window.addEventListener('focusout', onFocusOut);
    return () => { window.removeEventListener('focusin', onFocusIn); window.removeEventListener('focusout', onFocusOut); };
  }, []);

  // Save admin form as event (create or update)
  function saveEvent() {
    if (!adminForm.title) return alert('Please enter a title');
    if (adminForm.id) { updateEvent(adminForm); } else { addEvent(adminForm); }
    setAdminForm({ title: '', type: 'event', start: formatDateISO(new Date()), end: formatDateISO(new Date()), location: '', description: '' });
    setShowAdminModal(false);
  }

  // small UI helpers
  function monthSelectOptions() {
    const opts = [];
    const start = today.getFullYear() - 2;
    const end = today.getFullYear() + 2;
    for (let y = start; y <= end; y++) for (let m = 1; m <= 12; m++) opts.push({ value: `${y}-${String(m).padStart(2, '0')}`, label: `${new Date(y, m - 1).toLocaleString([], { month: 'long' })} ${y}` });
    return opts;
  }

  // small animated card style for cells - taller on mobile for better touch targets
  const cellBaseClass = 'min-h-[90px] sm:min-h-[80px] md:min-h-[100px] p-2 sm:p-3 rounded-xl cursor-pointer transition-transform duration-150 ease-in-out flex flex-col justify-between border';

  // ---------------- RENDER ----------------
  return (
    <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
      {/* HEADER */}
      <header className={`max-w-4xl mx-auto mb-6 p-3 sm:p-4 rounded-xl shadow-xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between flex-wrap`} style={{ backgroundColor: COLORS.green.dark }}>
        <div className="flex items-center gap-3 sm:gap-4 flex-1">
          <div style={{ width: 56, height: 56, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/twa-logo.jpg" alt="School Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }} onError={(e) => { e.target.style.display = 'none'; }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold" style={{ color: '#f7d774', textShadow: '0 1px 0 rgba(0,0,0,0.15)' }}>Digital Event Calendar</h1>
            <p className="text-xs sm:text-sm" style={{ color: '#ffeeba' }}>Tayabas Western Academy</p>
            <p className="text-xs" style={{ color: '#ffeeba', fontStyle: 'italic', letterSpacing: '1px' }}>LAUS DEO</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 mt-3 sm:mt-0 w-full sm:w-auto flex-wrap justify-end">
          <button className={`px-3 sm:px-4 py-2 sm:py-2 rounded min-h-[44px] flex items-center justify-center ${isDark ? 'bg-gray-100 text-gray-900' : 'bg-yellow-300 text-gray-900'} text-xs sm:text-sm shadow-sm font-semibold`} onClick={() => setIsDark(!isDark)}>{isDark ? '☀️ Light' : '🌙 Dark'}</button>

          <button className={`px-3 sm:px-4 py-2 sm:py-2 rounded min-h-[44px] flex items-center justify-center ${isDark ? 'bg-gray-800 text-white' : 'bg-green-600 text-white'} text-xs sm:text-sm shadow-sm`} onClick={() => { if (isAdmin) setShowAdminModal(true); else setShowLoginModal(true); }}>{isAdmin ? 'Admin' : 'Admin Login'}</button>

          {isAdmin && <button className="px-3 sm:px-4 py-2 sm:py-2 rounded border text-xs sm:text-sm text-red-500 min-h-[44px] flex items-center justify-center" onClick={() => setIsAdmin(false)}>Logout</button>}

          <button className="px-3 sm:px-4 py-2 sm:py-2 rounded border text-xs sm:text-sm md:hidden min-h-[44px] flex items-center justify-center" onClick={() => setShowSidebar(s => !s)}>☰</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

        {/* Calendar column */}
        <section className={`sm:col-span-2 p-4 rounded-lg shadow-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}> 

          {/* month nav */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-2 mb-3">
            <div className="flex items-center gap-2 order-1">
              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="px-3 sm:px-4 py-2 rounded border min-h-[44px] flex items-center justify-center text-lg">◀</button>

              <select value={`${currentMonth.getFullYear()}-${String(currentMonth.getMonth()+1).padStart(2,'0')}`} onChange={(e) => { const [y,m] = e.target.value.split('-'); setCurrentMonth(new Date(Number(y), Number(m)-1, 1)); }} className={`px-3 sm:px-4 py-2 border rounded flex-1 min-h-[44px] text-sm ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`}>
                {monthSelectOptions().map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>

              <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="px-3 sm:px-4 py-2 rounded border min-h-[44px] flex items-center justify-center text-lg">▶</button>
            </div>

            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-right order-2 sm:order-2">Timezone: {TIMEZONE}</div>
          </div>

          {/* weekday header */}
          <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center font-semibold py-3 sm:py-2 rounded-t shadow-md text-xs sm:text-sm" style={{ backgroundColor: COLORS.green.dark, color: '#f7d774' }}>{d}</div>
            ))}
          </div>

          {/* days */}
          <div className="grid grid-cols-7 gap-2 text-xs md:text-sm mt-2">
            {weeks.map((week, wi) => (
              <React.Fragment key={wi}>
                {week.map((day, di) => {
                  const isToday = day && isSameDay(day, today);
                  const dayEvents = day ? eventsOnDate(day) : [];
                  const primary = dayEvents[0] ? TYPE_META[dayEvents[0].type].color : null;
                  const bg = day ? (primary ? primary.bg : (isDark ? '#1b1f24' : '#fff')) : (isDark ? '#0f1720' : '#f3f4f6');
                  const txt = primary ? primary.text : (isDark ? '#e5e7eb' : '#111827');
                  const numColor = primary ? primary.dark : (isDark ? '#fff' : '#111827');

                  return (
                    <div
                      key={di}
                      onClick={() => day && setSelectedDate(day)}
                      className={`${cellBaseClass} ${day ? 'shadow-lg hover:scale-[1.02]' : ''}`}
                      style={{ backgroundColor: bg, color: txt }}
                    >
                      <div className="flex justify-between items-start">
                        <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, backgroundColor: isToday ? COLORS.green.dark : 'transparent', color: isToday ? '#fff' : numColor, fontSize: '14px' }}>{day ? day.getDate() : ''}</div>

                        {dayEvents.length > 1 && <div className="text-[10px] px-1.5 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.28)', color: '#fff' }}>+{dayEvents.length - 1}</div>}
                      </div>

                      <div className="mt-1">
                        {dayEvents.slice(0,2).map(ev => (
                          <div key={ev.id} className="flex items-center gap-1 text-xs sm:text-xs font-medium truncate px-1.5 py-1 rounded" style={{ backgroundColor: TYPE_META[ev.type].color.bg, color: TYPE_META[ev.type].color.text, transition: 'background .2s' }}>
                            <div style={{ width: 16, flexShrink: 0 }}>{TYPE_META[ev.type].icon}</div>
                            <div className="truncate text-xs">{ev.title}</div>
                          </div>
                        ))}

                        {(!dayEvents || dayEvents.length === 0) && <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}> </div>}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* sidebar */}
        <aside className={`p-4 rounded-lg shadow-lg border ${isDark ? 'bg-gray-900' : 'bg-white'} hidden sm:block`}>
          {showSidebar && <button className="fixed top-4 right-4 px-4 py-3 bg-red-600 text-white rounded min-h-[44px] z-60 md:hidden" onClick={() => setShowSidebar(false)}>✕ Close</button>}
          {showSidebar && <div className="h-12 md:hidden"></div>}

          <div className="mb-4">
            <h3 className="font-semibold text-green-700">Quick Info</h3>
            <p className="text-sm text-gray-500">Tap a date to view events. Admins can add, edit, delete events.</p>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-green-700">Legend</h4>
            <div className="flex gap-2 flex-wrap mt-2">
              {Object.keys(TYPE_META).map(k => <LegendItem key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} meta={TYPE_META[k]} />)}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium text-green-700">Admin Tools</h4>
            {isAdmin ? (
              <div className="mt-2 flex flex-col gap-2">
                <button className="px-3 py-2 rounded bg-green-700 text-white text-sm" onClick={() => setShowAdminModal(true)}>Open Admin</button>
                <button className="px-3 py-2 rounded border text-sm" onClick={downloadEventsFile}>Export events.json</button>
                <label className="px-3 py-2 rounded border text-sm text-center cursor-pointer">Upload events.json<input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0])} /></label>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">Admin-only tools are hidden. Login to edit.</div>
            )}

            <div className="mt-4">
              <h4 className="text-sm font-medium text-green-700 mb-3">📊 Calendar Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700">{events.length}</div>
                  <div className="text-xs text-purple-600">Total Events</div>
                </div>
                <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-700">{events.filter(e => e.type === 'holiday').length}</div>
                  <div className="text-xs text-yellow-600">Holidays</div>
                </div>
                <div className="p-2 rounded-lg bg-pink-50 border border-pink-200">
                  <div className="text-2xl font-bold text-pink-700">{events.filter(e => e.type === 'birthday').length}</div>
                  <div className="text-xs text-pink-600">Birthdays</div>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200">
                  <div className="text-2xl font-bold text-indigo-700">{events.filter(e => e.type === 'exam').length}</div>
                  <div className="text-xs text-indigo-600">Exams</div>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="text-2xl font-bold text-amber-700">{events.filter(e => e.type === 'meeting').length}</div>
                  <div className="text-xs text-amber-600">Meetings</div>
                </div>
                <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                  <div className="text-2xl font-bold text-green-700">{events.filter(e => e.type === 'event').length}</div>
                  <div className="text-xs text-green-600">Other Events</div>
                </div>
              </div>
            </div>
          </div>
        </aside>

      </main>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className={`p-5 rounded-lg w-full max-w-sm shadow-xl ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
            <h2 className="text-lg font-semibold mb-3 text-green-700">Admin Login</h2>
            <p className="text-sm mb-3 text-gray-500">Enter password to access admin tools.</p>
            <input
              id="adminPwInput"
              type="password"
              value={adminPw}
              onChange={(e) => setAdminPw(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-3 rounded border mb-4 min-h-[44px] text-base"
              onKeyDown={(e) => { if (e.key === 'Enter') tryAdminLogin(adminPw); }}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded border min-h-[44px] flex items-center justify-center" onClick={() => { setShowLoginModal(false); setAdminPw(''); }}>Cancel</button>
              <button className="px-4 py-2 rounded bg-green-700 text-white min-h-[44px] flex items-center justify-center" onClick={() => tryAdminLogin(adminPw)}>Login</button>
            </div>
          </div>
        </div>
      )}

      {/* Selected date panel */}
      {selectedDate && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-3xl z-40">
          <div className={`p-4 rounded-lg shadow-lg ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Events on {selectedDate.toLocaleDateString()}</h3>
                <p className="text-sm text-gray-500">Tap an event to view or edit</p>
              </div>

              <div className="flex gap-2">
                <button className="px-2 py-1 border rounded" onClick={() => setSelectedDate(null)}>Close</button>
              </div>
            </div>

            <div className="mt-3 grid gap-2">
              {eventsOnDate(selectedDate).length === 0 && <div className="text-sm text-gray-500">No events</div>}

              {eventsOnDate(selectedDate).map(ev => (
                <div key={ev.id} className="p-2 rounded flex justify-between items-center" style={{ backgroundColor: TYPE_META[ev.type].color.bg, color: TYPE_META[ev.type].color.text }}>
                  <div>
                    <div className="font-medium">{ev.title}</div>
                    <div className="text-xs opacity-80">{ev.location || '—'} {ev.start ? ` • ${ev.start}` : ''}</div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button className="text-xs sm:text-sm px-3 sm:px-4 py-2 border rounded bg-green-700 text-white shadow-md min-h-[44px] flex items-center justify-center" onClick={() => setSelectedEvent(ev)}>View</button>
                    {isAdmin && <button className="text-xs sm:text-sm px-3 sm:px-4 py-2 rounded bg-red-700 text-white shadow-md hover:bg-red-800 active:scale-95 transition-all min-h-[44px] flex items-center justify-center" onClick={() => { console.log('Attempting delete id:', ev.id); deleteEvent(ev.id); }}>Delete</button>}
                  </div>
                </div>
              ))}

              {isAdmin && (
                <div className={`p-3 rounded border ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  <div className="text-sm font-medium mb-2">Quick Add</div>
                  <input className={`w-full border px-3 py-2 mb-2 rounded min-h-[44px] text-base ${isDark ? 'bg-gray-700 text-gray-100' : ''}`} placeholder="Title" value={formState.title} onChange={(e) => setFormState(s => ({ ...s, title: e.target.value }))} />
                  <select className={`w-full border px-3 py-2 mb-2 rounded min-h-[44px] text-base ${isDark ? 'bg-gray-700 text-gray-100' : ''}`} value={formState.type} onChange={(e) => setFormState(s => ({ ...s, type: e.target.value }))}>
                    <option value="event">Event</option>
                    <option value="holiday">Holiday</option>
                    <option value="birthday">Birthday</option>
                    <option value="exam">Exam</option>
                    <option value="meeting">Meeting</option>
                  </select>
                  <div className="flex gap-2 mb-2">
                    <input type="date" className={`border px-3 py-2 flex-1 rounded min-h-[44px] text-base ${isDark ? 'bg-gray-700 text-gray-100' : ''}`} value={formState.start} onChange={(e) => setFormState(s => ({ ...s, start: e.target.value }))} />
                    <input type="date" className={`border px-3 py-2 flex-1 rounded min-h-[44px] text-base ${isDark ? 'bg-gray-700 text-gray-100' : ''}`} value={formState.end} onChange={(e) => setFormState(s => ({ ...s, end: e.target.value }))} />
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded bg-green-700 text-white min-h-[44px] flex items-center justify-center" onClick={() => { if (!formState.title) return alert('Please enter a title'); addEvent(formState); setFormState({ title: '', type: 'event', start: formatDateISO(new Date()), end: formatDateISO(new Date()), recurring: 'none', location: '', description: '' }); }}>Add</button>
                    <button className="px-4 py-2 rounded border min-h-[44px] flex items-center justify-center" onClick={() => setFormState({ title: '', type: 'event', start: formatDateISO(new Date()), end: formatDateISO(new Date()), recurring: 'none', location: '', description: '' })}>Reset</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event viewer modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className={`p-4 rounded-lg w-full max-w-xl shadow-xl ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold px-3 py-1 rounded" style={{ backgroundColor: TYPE_META[selectedEvent.type].color.bg, color: TYPE_META[selectedEvent.type].color.text }}>{selectedEvent.title}</h3>
              <div className="flex gap-2">
                {isAdmin && <button className="px-2 py-1 rounded border text-sm" onClick={() => { setAdminForm(selectedEvent); setShowAdminModal(true); setSelectedEvent(null); }}>Edit</button>}
                <button className="px-2 py-1 rounded border text-sm" onClick={() => setSelectedEvent(null)}>Close</button>
              </div>
            </div>
            <div className="text-sm space-y-2">
              <div><strong>Type:</strong> {selectedEvent.type}</div>
              <div><strong>Date:</strong> {selectedEvent.start}{selectedEvent.end ? ` → ${selectedEvent.end}` : ''}</div>
              <div><strong>Location:</strong> {selectedEvent.location || '—'}</div>
              <div className="pt-2">{selectedEvent.description || 'No description'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Admin modal */}
{showAdminModal && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-auto">
    <div
      ref={adminModalRef}
      style={{ maxHeight: "80vh", overflowY: "auto", paddingBottom: 20 }}
      className={`p-5 rounded-lg w-full max-w-xl shadow-xl ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      }`}
    >
      <h2 className="text-lg font-semibold mb-4 text-green-700">Admin Panel</h2>

      <div className="mb-3">
        <label className="text-sm font-medium">Event Title</label>
        <input
          type="text"
          className="w-full px-3 py-3 rounded border mt-1 bg-white text-black min-h-[44px] text-base"
          value={adminForm.title || ""}
          onChange={(e) =>
            setAdminForm((s) => ({ ...s, title: e.target.value }))
          }
        />
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium">Type</label>
        <select
          className="w-full px-3 py-3 rounded border mt-1 bg-white text-black min-h-[44px] text-base"
          value={adminForm.type}
          onChange={(e) =>
            setAdminForm((s) => ({ ...s, type: e.target.value }))
          }
        >
          <option value="event">Event</option>
          <option value="holiday">Holiday</option>
          <option value="birthday">Birthday</option>
          <option value="exam">Exam</option>
          <option value="meeting">Meeting</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium">Start Date</label>
        <input
          type="date"
          className="w-full px-3 py-3 rounded border mt-1 bg-white text-black min-h-[44px] text-base"
          value={adminForm.start || ""}
          onChange={(e) =>
            setAdminForm((s) => ({ ...s, start: e.target.value }))
          }
        />
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium">End Date (optional)</label>
        <input
          type="date"
          className="w-full px-3 py-3 rounded border mt-1 bg-white text-black min-h-[44px] text-base"
          value={adminForm.end || ""}
          onChange={(e) =>
            setAdminForm((s) => ({ ...s, end: e.target.value }))
          }
        />
      </div>

      <div className="mb-3">
        <label className="text-sm font-medium">Location (optional)</label>
        <input
          type="text"
          className="w-full px-3 py-3 rounded border mt-1 bg-white text-black min-h-[44px] text-base"
          value={adminForm.location || ""}
          onChange={(e) =>
            setAdminForm((s) => ({ ...s, location: e.target.value }))
          }
        />
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium">Description (optional)</label>
        <textarea
          className="w-full px-3 py-3 rounded border mt-1 bg-white text-black text-base"
          rows={3}
          value={adminForm.description || ""}
          onChange={(e) =>
            setAdminForm((s) => ({ ...s, description: e.target.value }))
          }
        />
      </div>

      <div className="flex gap-2 justify-between items-center mt-6 flex-wrap">
        <button
          className="px-4 py-2 rounded border text-sm min-h-[44px] flex items-center justify-center flex-1 sm:flex-none"
          onClick={() => setShowAdminModal(false)}
        >
          Cancel
        </button>

        {adminForm.id && (
          <button
            className="px-4 py-2 rounded bg-red-700 text-white text-sm min-h-[44px] flex items-center justify-center flex-1 sm:flex-none"
            onClick={() => {
              if (confirm('Delete this event?')) {
                deleteEvent(adminForm.id);
                setShowAdminModal(false);
              }
            }}
          >
            Delete
          </button>
        )}

        <button
          className="px-4 py-2 rounded bg-green-700 text-white text-sm min-h-[44px] flex items-center justify-center flex-1 sm:flex-none"
          onClick={saveEvent}
        >
          Save Event
        </button>
      </div>
    </div>
  </div>
)}


      {/* TOAST NOTIFICATION */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '16px',
          zIndex: 9999,
          maxWidth: '400px',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          borderLeft: '4px solid',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: 500,
          animation: 'slideInFromBottom 0.3s ease-out',
          backgroundColor: notificationType === 'success' ? '#dcfce7' : 
                          notificationType === 'error' ? '#fee2e2' : 
                          notificationType === 'warning' ? '#fef3c7' : '#dbeafe',
          borderLeftColor: notificationType === 'success' ? '#22c55e' : 
                          notificationType === 'error' ? '#ef4444' : 
                          notificationType === 'warning' ? '#eab308' : '#3b82f6',
          color: notificationType === 'success' ? '#166534' : 
                notificationType === 'error' ? '#991b1b' : 
                notificationType === 'warning' ? '#92400e' : '#1e40af'
        }}>
          <div style={{ fontSize: '18px' }}>
            {notificationType === 'success' && '✓'}
            {notificationType === 'error' && '✕'}
            {notificationType === 'warning' && '⚠'}
            {notificationType === 'info' && 'ℹ'}
          </div>
          <span style={{ flex: 1 }}>{notification}</span>
          <button 
            onClick={() => setNotification(null)}
            style={{ fontSize: '18px', opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            onMouseEnter={(e) => e.target.style.opacity = '1'}
            onMouseLeave={(e) => e.target.style.opacity = '0.6'}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInFromBottom {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-in { animation: slideInFromBottom 0.3s ease-out; }
      `}</style>
    </div>
  );
}

// small helper component
function LegendItem({ label, meta }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div style={{ width: 14, height: 14, borderRadius: 6, backgroundColor: meta.color.bg, border: '1px solid rgba(0,0,0,0.06)' }} />
      <div>{label}</div>
    </div>
  );
}