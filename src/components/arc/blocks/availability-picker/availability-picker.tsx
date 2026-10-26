"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { Avatar } from "../../avatar/avatar";
import { Button } from "../../button/button";
import { motionTokens } from "../../lib/motion-tokens";
import styles from "./availability-picker.module.css";

const defaultAttendees = [
  { name: "Alexandra Silva", first: "Alexandra", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
] as const;

type Slot = { time: string; busy?: boolean };

const days: { id: string; short: string; date: string; full: string; slots: Slot[] }[] = [
  { id: "ter", short: "Ter", date: "28", full: "Terça-feira, 28 Out", slots: [{ time: "09:30" }, { time: "11:00" }, { time: "14:30", busy: true }, { time: "16:00" }] },
  { id: "qua", short: "Qua", date: "29", full: "Quarta-feira, 29 Out", slots: [{ time: "10:00" }, { time: "11:30" }, { time: "15:00" }, { time: "17:00", busy: true }] },
  { id: "qui", short: "Qui", date: "30", full: "Quinta-feira, 30 Out", slots: [{ time: "09:00", busy: true }, { time: "10:30" }, { time: "14:00" }, { time: "16:30" }] },
  { id: "sex", short: "Sex", date: "31", full: "Sexta-feira, 31 Out", slots: [{ time: "09:30" }, { time: "11:00" }, { time: "13:30" }, { time: "15:00" }] },
  { id: "seg", short: "Seg", date: "03", full: "Segunda-feira, 03 Nov", slots: [{ time: "10:00" }, { time: "14:00" }, { time: "15:30" }, { time: "17:00" }] },
];

const addMinutes = (time: string, minutes: number) => {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

const slideVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 16 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -16, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] as [number, number, number, number] } }),
};
const fadeVariants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } } };

export interface AvailabilityPickerProps {
  onConfirm?: (selection: { date: string; time: string }) => void;
  title?: string;
  duration?: string;
}

export function AvailabilityPicker({ onConfirm, title = "Sessão 1:1 Estratégica", duration = "45 minutos · Google Meet" }: AvailabilityPickerProps) {
  const reduce = !!useReducedMotion();
  const id = useId();
  const [dayId, setDayId] = useState(days[0].id);
  const [direction, setDirection] = useState(1);
  const [time, setTime] = useState("11:00");
  const [confirmed, setConfirmed] = useState(false);
  const day = days.find((entry) => entry.id === dayId) ?? days[0];
  const slot = day.slots.find((entry) => entry.time === time) ?? day.slots[0];
  const summary = `${day.full}, ${slot.time} às ${addMinutes(slot.time, 45)}`;
  const selectionLabel = confirmed ? "Horário reservado com sucesso!" : slot.busy ? "Horário indisponível" : "Horário disponível";

  function selectDay(index: number) {
    const next = days[index];
    if (next.id === dayId) return;
    setDirection(index > days.findIndex((entry) => entry.id === dayId) ? 1 : -1);
    setDayId(next.id);
    setTime((next.slots.find((entry) => !entry.busy) ?? next.slots[0]).time);
    setConfirmed(false);
  }

  function selectTime(next: string) {
    setTime(next);
    setConfirmed(false);
  }

  function confirm() {
    setConfirmed(true);
    onConfirm?.({ date: day.full, time: slot.time });
  }

  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 4, filter: `blur(${motionTokens.blur.subtle}px)` }, animate: { opacity: 1, y: 0, filter: "blur(0px)" }, exit: { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)` } };
  const swapTransition = { duration: reduce ? motionTokens.duration.instant : motionTokens.duration.fast, ease: [...motionTokens.ease.standard] as [number, number, number, number] };

  return (
    <section className={styles.root} aria-labelledby={`${id}-title`}>
      <div className={styles.picker}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <h2 id={`${id}-title`}>{title}</h2>
            <p>{duration}</p>
          </div>
          <div className={styles.attendees} aria-label="Mentor: Alexandra Silva">
            {defaultAttendees.map((person) => (
              <Avatar key={person.name} name={person.name} src={person.src} size="sm" />
            ))}
          </div>
        </header>

        <div className={styles.days} role="group" aria-label="Dias disponíveis">
          {days.map((entry, index) => {
            const selected = dayId === entry.id;
            const open = entry.slots.filter((item) => !item.busy).length;
            return (
              <button
                key={entry.id}
                type="button"
                className={styles.day}
                data-selected={selected || undefined}
                aria-pressed={selected}
                aria-label={`${entry.full}, ${open} horários livres`}
                onClick={() => selectDay(index)}
              >
                {selected && (
                  <motion.span
                    layoutId={`${id}-day`}
                    className={styles.dayHighlight}
                    transition={reduce ? { duration: 0 } : motionTokens.spring.snappy}
                  />
                )}
                <span className={styles.dayName}>{entry.short}</span>
                <span className={styles.dayDate}>{entry.date}</span>
                <span className={styles.dayOpen}>{open} livres</span>
              </button>
            );
          })}
        </div>

        <div className={styles.slotsHead}>
          <h3 className={styles.slotsTitle}>
            <span className={styles.swap}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={day.id} {...swap} transition={swapTransition}>
                  {day.full}
                </motion.span>
              </AnimatePresence>
            </span>
          </h3>
          <span className={styles.legend}>
            <i className={styles.markFree} aria-hidden="true" />Disponível
            <i className={styles.markBusy} aria-hidden="true" />Ocupado
          </span>
        </div>

        <div className={styles.slotsStage}>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.ul
              key={day.id}
              className={styles.slots}
              aria-label={`Horários em ${day.full}`}
              custom={direction}
              variants={reduce ? fadeVariants : slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={
                reduce
                  ? { duration: motionTokens.duration.instant }
                  : { x: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } }
              }
            >
              {day.slots.map((entry) => {
                const selected = slot.time === entry.time;
                const status = entry.busy ? "Indisponível" : "Disponível";
                return (
                  <li key={entry.time}>
                    <button
                      type="button"
                      disabled={entry.busy}
                      className={styles.slot}
                      data-selected={selected || undefined}
                      data-busy={entry.busy ? "" : undefined}
                      aria-pressed={selected}
                      aria-label={`${entry.time} às ${addMinutes(entry.time, 45)}, ${status}`}
                      onClick={() => !entry.busy && selectTime(entry.time)}
                    >
                      <span className={styles.slotTime}>{entry.time}</span>
                      <span className={styles.slotMeta}>{status}</span>
                      <span className={styles.marks} aria-hidden="true">
                        <i className={entry.busy ? styles.markBusy : styles.markFree} />
                      </span>
                      <span className={styles.slotCheck} aria-hidden="true">
                        <Check size={14} strokeWidth={2} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        </div>

        <footer className={styles.footer}>
          <div className={styles.selection}>
            <span className={styles.swap}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={selectionLabel} className={styles.selectionLabel} {...swap} transition={swapTransition}>
                  {selectionLabel}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className={styles.swap}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.strong key={summary} className={styles.selectionValue} {...swap} transition={swapTransition}>
                  {summary}
                </motion.strong>
              </AnimatePresence>
            </span>
          </div>
          <Button
            variant={confirmed ? "secondary" : "primary"}
            onClick={confirmed ? undefined : confirm}
            aria-disabled={confirmed || undefined}
            className={styles.confirmButton}
          >
            <span className={styles.swap}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={confirmed ? "done" : "idle"}
                  className={styles.buttonLabel}
                  {...swap}
                  transition={swapTransition}
                >
                  {confirmed ? (
                    <>
                      <Check size={16} aria-hidden="true" />
                      Confirmado
                    </>
                  ) : (
                    "Confirmar horário"
                  )}
                </motion.span>
              </AnimatePresence>
            </span>
          </Button>
          <p className={styles.srOnly} aria-live="polite">
            {confirmed ? `Confirmado ${summary}.` : ""}
          </p>
        </footer>
      </div>
    </section>
  );
}

export default AvailabilityPicker;
