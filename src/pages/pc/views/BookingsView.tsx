import { useState } from "react";
import { Avatar } from "@/components/arc/avatar/avatar";
import { Badge, type BadgeTone } from "@/components/arc/badge/badge";
import { Button } from "@/components/arc/button/button";
import SegmentedControl from "@/components/arc/segmented-control/segmented-control";
import { AvailabilityPicker } from "@/components/arc/blocks/availability-picker/availability-picker";
import WeekCalendar from "@/components/arc/blocks/week-calendar/week-calendar";
import {
  SAMPLE_CALENDARS,
  SAMPLE_DATE,
  sampleEvents,
  type CalendarEvent,
} from "@/components/arc/blocks/week-calendar/week-calendar-data";
import { Video, MessageCircle, Clock, Calendar, ExternalLink, CheckCircle, Sparkles } from "lucide-react";
import styles from "./BookingsView.module.css";

interface ScheduledSession {
  id: string;
  clientName: string;
  clientEmail: string;
  clientAvatar: string;
  date: string;
  time: string;
  topic: string;
  meetUrl: string;
  status: "Próxima" | "Confirmada" | "Concluída";
  statusTone: BadgeTone;
}

const mockSessions: ScheduledSession[] = [
  {
    id: "sess-1",
    clientName: "Beatriz Nogueira",
    clientEmail: "beatriz.nogueira@gmail.com",
    clientAvatar: "/media/people/emma-collins.jpg",
    date: "Segunda, 19 Out",
    time: "10:30 - 11:30",
    topic: "Diagnóstico de Posicionamento & Estratégia de Conteúdo",
    meetUrl: "https://meet.google.com/vir-btz",
    status: "Próxima",
    statusTone: "info",
  },
  {
    id: "sess-2",
    clientName: "Lucas Prado",
    clientEmail: "lucas.prado@techbrand.io",
    clientAvatar: "/media/people/marcus-johnson.jpg",
    date: "Segunda, 19 Out",
    time: "14:00 - 15:00",
    topic: "Estruturação de Funil de Vendas de Infoproduto",
    meetUrl: "https://meet.google.com/vir-lcs",
    status: "Confirmada",
    statusTone: "neutral",
  },
  {
    id: "sess-3",
    clientName: "Mariana Costa",
    clientEmail: "mariana.costa@agencia.com.br",
    clientAvatar: "/media/people/jasmine-brooks.jpg",
    date: "Terça, 20 Out",
    time: "09:30 - 10:30",
    topic: "Revisão de Bio, Links e Roteiros de Vídeo Viral",
    meetUrl: "https://meet.google.com/vir-mri",
    status: "Confirmada",
    statusTone: "neutral",
  },
  {
    id: "sess-4",
    clientName: "Rafael Dias",
    clientEmail: "rafael.dias@creator.br",
    clientAvatar: "/media/people/daniel-kim.jpg",
    date: "Terça, 20 Out",
    time: "11:00 - 12:00",
    topic: "Estratégia de Precificação & Oferta High Ticket",
    meetUrl: "https://meet.google.com/vir-rfl",
    status: "Confirmada",
    statusTone: "neutral",
  },
];

export function BookingsView() {
  const [sessions, setSessions] = useState<ScheduledSession[]>(mockSessions);
  const [events, setEvents] = useState<CalendarEvent[]>(() => sampleEvents("America/Sao_Paulo"));
  const [viewMode, setViewMode] = useState<string>("calendar");
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const handleSendReminder = (name: string) => {
    setReminderToast(`Lembrete com link da sala enviado no WhatsApp para ${name}!`);
    setTimeout(() => setReminderToast(null), 3500);
  };

  return (
    <div className={styles.container}>
      {/* Top Header */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h2>Agenda de Mentorias & Consultorias 1:1</h2>
          <p>Visão de calendário oficial sincronizada em tempo real com o Google Calendar da criadora.</p>
        </div>

        <div className={styles.headerActions}>
          <a href="https://meet.google.com/vir-alex-mtg" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <Button variant="primary" size="md">
              <Video size={16} />
              <span>Abrir Minha Sala Google Meet</span>
            </Button>
          </a>
        </div>
      </header>

      {reminderToast && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 16px",
          borderRadius: "10px",
          backgroundColor: "color-mix(in oklab, var(--success) 12%, var(--surface))",
          border: "1px solid color-mix(in oklab, var(--success) 35%, transparent)",
          color: "var(--foreground)",
          fontSize: "13.5px",
        }}>
          <CheckCircle size={16} color="var(--success)" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Sessões Agendadas</span>
          <span className={styles.statValue}>8 sessões</span>
          <span className={styles.statHint}>5 confirmadas para esta semana</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Faturado em Mentorias</span>
          <span className={styles.statValue}>R$ 3.976,00</span>
          <span className={styles.statHint}>R$ 497,00 por mentoria 1:1</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Taxa de Comparecimento</span>
          <span className={styles.statValue}>100%</span>
          <span className={styles.statHint}>Zero faltas ou cancelamentos</span>
        </div>
      </div>

      {/* Control Switcher */}
      <div className={styles.modeSwitcherBar}>
        <div className={styles.segmentedWrap}>
          <SegmentedControl
            options={[
              { value: "calendar", label: "Agenda" },
              { value: "list", label: "Sessões" },
              { value: "availability", label: "Horários" },
            ]}
            value={viewMode}
            onValueChange={setViewMode}
          />
        </div>
        <span className={styles.syncStatus}>
          <Sparkles size={14} color="var(--accent)" />
          Sincronizado com Google Meet & Calendar
        </span>
      </div>

      {/* 1. VISÃO DE CALENDÁRIO LITERAL (UIArc WeekCalendar) */}
      {viewMode === "calendar" && (
        <section className={styles.calendarSection} aria-label="Calendário semanal de mentorias">
          <WeekCalendar
            calendars={SAMPLE_CALENDARS}
            events={events}
            onEventsChange={setEvents}
            defaultDate={SAMPLE_DATE}
            defaultView="week"
            locale="pt-BR"
            weekStartsOn={1}
            startHour={8}
            endHour={20}
            timeZone="America/Sao_Paulo"
          />
        </section>
      )}

      {/* 2. VISÃO EM LISTA DE PRÓXIMOS ENCONTROS */}
      {viewMode === "list" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Próximos Encontros Confirmados</h3>
              <p>Sessões sincronizadas com o Google Calendar da Alexandra Silva</p>
            </div>
            <Calendar size={18} color="var(--accent)" />
          </div>

          <div className={styles.sessionsList}>
            {sessions.map(sess => (
              <div key={sess.id} className={styles.sessionCard}>
                <div className={styles.sessionTop}>
                  <div className={styles.timeBadge}>
                    <Clock size={14} color="var(--accent)" />
                    <span>{sess.date} · {sess.time}</span>
                  </div>
                  <Badge tone={sess.statusTone} size="sm">
                    {sess.status}
                  </Badge>
                </div>

                <div className={styles.clientBlock}>
                  <Avatar name={sess.clientName} src={sess.clientAvatar} size="md" />
                  <div className={styles.clientDetails}>
                    <span className={styles.clientName}>{sess.clientName}</span>
                    <span className={styles.sessionTopic}>{sess.topic}</span>
                  </div>
                </div>

                <div className={styles.sessionActions}>
                  <a href={sess.meetUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                    <Button variant="secondary" size="sm">
                      <Video size={14} />
                      <span>Entrar no Google Meet</span>
                      <ExternalLink size={12} style={{ opacity: 0.6 }} />
                    </Button>
                  </a>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSendReminder(sess.clientName)}
                  >
                    <MessageCircle size={14} />
                    <span>Lembrete no WhatsApp</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. CONFIGURAÇÃO DE DISPONIBILIDADE (AvailabilityPicker) */}
      {viewMode === "availability" && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3>Configurar Horários Disponíveis</h3>
              <p>Simulador do seletor que os clientes veem na sua Loja Mobile</p>
            </div>
          </div>

          <AvailabilityPicker
            title="Sessão Estratégica 1:1"
            duration="45 minutos · Google Meet"
            onConfirm={(sel) => {
              const newSess: ScheduledSession = {
                id: `sess-${Date.now()}`,
                clientName: "Novo Agendamento Confirmado",
                clientEmail: "cliente@vira.app",
                clientAvatar: "/media/people/emma-collins.jpg",
                date: `Dia ${sel.date}`,
                time: `${sel.time} - 45 min`,
                topic: "Diagnóstico e Aceleração de Resultados",
                meetUrl: "https://meet.google.com/vir-alex-mtg",
                status: "Confirmada",
                statusTone: "info",
              };
              setSessions([newSess, ...sessions]);
              setViewMode("calendar");
            }}
          />
        </div>
      )}
    </div>
  );
}

export default BookingsView;
