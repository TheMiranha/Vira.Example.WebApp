import { people, type PersonId } from "../../lib/media";
import { DAY, dateDay, fromWall } from "./calendar-time";

export interface CalendarAttendee {
  name: string;
  /** Portrait URL. Initials show when it is missing. */
  avatar?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  /** Exclusive. For an all day event this is midnight after the last day. */
  end: Date;
  calendarId: string;
  allDay?: boolean;
  location?: string;
  attendees?: CalendarAttendee[];
}

/** Built in hues tuned for light and dark; any CSS color works too. */
export type CalendarColor = "blue" | "green" | "violet" | "amber" | "rose" | "teal" | (string & {});

export interface CalendarSource {
  id: string;
  name: string;
  color: CalendarColor;
  /** Start hidden. People can still turn it on from the calendar list. */
  hidden?: boolean;
}

export const SAMPLE_CALENDARS: CalendarSource[] = [
  { id: "mentorias", name: "Mentorias 1:1", color: "blue" },
  { id: "estrategia", name: "Sessões Estratégicas", color: "violet" },
  { id: "conteudo", name: "Gravação & Lançamentos", color: "amber" },
  { id: "pessoal", name: "Pessoal & Pausas", color: "green" },
];

/** A semana de amostra de 19 a 25 de Outubro de 2026. */
export const SAMPLE_WEEK = dateDay(2026, 10, 19);
export const SAMPLE_DATE = new Date(Date.UTC(2026, 9, 23, 14, 0));

const client = (name: string, personId: PersonId): CalendarAttendee => {
  const p = people.find(entry => entry.id === personId);
  return { name, avatar: p?.src };
};

const BEATRIZ = client("Beatriz Nogueira", "emma-collins");
const LUCAS = client("Lucas Prado", "marcus-johnson");
const MARIANA = client("Mariana Costa", "jasmine-brooks");
const RAFAEL = client("Rafael Dias", "daniel-kim");
const CAMILA = client("Camila Torres", "sofia-ramirez");
const THIAGO = client("Thiago Rocha", "mateo-alvarez");

type Seed = [day: number, start: string, end: string, title: string, calendarId: string, location?: string, attendees?: CalendarAttendee[]];
type AllDaySeed = [from: number, to: number, title: string, calendarId: string, location?: string];

const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

/** Segunda é dia 0. Horários locais. */
const WEEK: Seed[] = [
  // Segunda-feira (19/10)
  [0, "09:00", "10:00", "Planejamento Semanal & Inbox", "conteudo"],
  [0, "10:30", "11:30", "Mentoria 1:1: Beatriz Nogueira", "mentorias", "Google Meet (meet.google.com/vir-btz)", [BEATRIZ]],
  [0, "14:00", "15:00", "Sessão Estratégica: Lucas Prado", "estrategia", "Google Meet (meet.google.com/vir-lcs)", [LUCAS]],
  [0, "16:00", "17:30", "Gravação: Módulo 4 do Curso Criador Digital", "conteudo", "Estúdio Home Office"],

  // Terça-feira (20/10)
  [1, "09:30", "10:30", "Mentoria 1:1: Mariana Costa", "mentorias", "Google Meet (meet.google.com/vir-mri)", [MARIANA]],
  [1, "11:00", "12:00", "Mentoria 1:1: Rafael Dias", "mentorias", "Google Meet (meet.google.com/vir-rfl)", [RAFAEL]],
  [1, "14:30", "15:30", "Alinhamento com Editor de Vídeos", "conteudo", "Google Meet"],
  [1, "16:00", "17:00", "Mentoria 1:1: Camila Torres", "mentorias", "Google Meet (meet.google.com/vir-cml)", [CAMILA]],

  // Quarta-feira (21/10)
  [2, "09:00", "10:00", "Revisão de Conteúdos & Métricas", "conteudo"],
  [2, "10:30", "11:30", "Sessão Estratégica: Thiago Rocha", "estrategia", "Google Meet (meet.google.com/vir-thg)", [THIAGO]],
  [2, "14:00", "15:00", "Mentoria 1:1: Beatriz Nogueira (Follow-up)", "mentorias", "Google Meet (meet.google.com/vir-btz)", [BEATRIZ]],
  [2, "18:00", "19:00", "Treino Funcional", "pessoal", "Academia"],

  // Quinta-feira (22/10)
  [3, "10:00", "11:00", "Mentoria 1:1: Lucas Prado", "mentorias", "Google Meet (meet.google.com/vir-lcs)", [LUCAS]],
  [3, "14:00", "15:30", "Live Exclusiva para Alunos do Curso", "conteudo", "YouTube Privado", [BEATRIZ, LUCAS, MARIANA, RAFAEL]],
  [3, "16:30", "17:30", "Mentoria 1:1: Mariana Costa", "mentorias", "Google Meet (meet.google.com/vir-mri)", [MARIANA]],

  // Sexta-feira (23/10)
  [4, "09:30", "10:30", "Mentoria 1:1: Rafael Dias", "mentorias", "Google Meet (meet.google.com/vir-rfl)", [RAFAEL]],
  [4, "11:00", "12:00", "Sessão Estratégica: Novos Negócios", "estrategia", "Google Meet"],
  [4, "14:00", "15:30", "Fechamento Financeiro & Repasses Pix", "pessoal"],
  [4, "16:00", "17:00", "Mentoria 1:1: Camila Torres", "mentorias", "Google Meet (meet.google.com/vir-cml)", [CAMILA]],

  // Sábado (24/10)
  [5, "10:00", "11:00", "Revisão Semanal", "conteudo"],
];

const WEEK_ALL_DAY: AllDaySeed[] = [
  [3, 4, "Lançamento da Nova Turma do Curso", "conteudo"],
];

const ROTATION: [start: string, end: string, title: string, calendarId: string, location?: string, attendees?: CalendarAttendee[]][] = [
  ["10:00", "11:00", "Mentoria 1:1", "mentorias", "Google Meet", [BEATRIZ]],
  ["11:30", "12:30", "Sessão Estratégica", "estrategia", "Google Meet", [LUCAS]],
  ["14:00", "15:30", "Gravação de Aulas", "conteudo"],
  ["16:00", "17:00", "Mentoria 1:1", "mentorias", "Google Meet", [MARIANA]],
];

function random(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedsForWeek(week: number): { timed: Seed[]; allDay: AllDaySeed[] } {
  if (week === SAMPLE_WEEK) return { timed: WEEK, allDay: WEEK_ALL_DAY };
  const next = random(week);
  const timed: Seed[] = [0, 1, 2, 3, 4].map(day => [
    day,
    "10:00",
    "11:00",
    "Mentoria 1:1",
    "mentorias",
    "Google Meet",
    [BEATRIZ],
  ]);
  for (let day = 0; day < 5; day++) {
    const used = new Set<number>();
    for (let n = 1 + Math.floor(next() * 2); n > 0; n--) {
      const pick = Math.floor(next() * ROTATION.length);
      if (used.has(pick)) continue;
      used.add(pick);
      const rot = ROTATION[pick];
      if (rot) {
        timed.push([day, ...rot]);
      }
    }
  }
  return { timed, allDay: [] };
}

export function sampleEvents(timeZone?: string, weeksAround = 4): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (let offset = -weeksAround; offset <= weeksAround; offset++) {
    const week = SAMPLE_WEEK + offset * 7;
    const { timed, allDay } = seedsForWeek(week);
    timed.forEach(([day, start, end, title, calendarId, location, attendees], i) => events.push({
      id: `w${week}-${i}`,
      title,
      calendarId,
      location,
      attendees,
      start: fromWall((week + day) * DAY + minutes(start), timeZone),
      end: fromWall((week + day) * DAY + minutes(end), timeZone),
    }));
    allDay.forEach(([from, to, title, calendarId, location], i) => events.push({
      id: `w${week}-a${i}`,
      title,
      calendarId,
      location,
      allDay: true,
      start: fromWall((week + from) * DAY, timeZone),
      end: fromWall((week + Math.max(from, to) + 1) * DAY, timeZone),
    }));
  }
  return events;
}
