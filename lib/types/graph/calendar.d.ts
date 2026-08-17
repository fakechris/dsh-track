/**
 * Calendar-yarn data (v1) — the 会话结构图 tab's main view. Deterministic
 * projection of the store: sessions as lines across natural days, per-day
 * dominant project lanes, work segments (requirement + directives + turn
 * outcomes) derived from executed-in issues + the v3 session graph. The
 * 'requirement vs directive' split is an approximation of the utterance
 * extraction — the drill-down doubles as its acceptance tool.
 * @module @fakechris/dsh-track/graph/calendar
 */
import type { TrackStore } from '../store.ts';
export interface CalendarProject {
    id: string;
    name: string;
    hue: string;
}
export interface CalendarTurn {
    outcome: 'completed' | 'aborted' | 'error' | 'blocked';
}
export interface CalendarDirective {
    text: string;
    messageId?: string;
}
export interface CalendarSegment {
    day: number;
    proj: string;
    req: string;
    reqMessageId?: string;
    sessionId: string;
    instr: CalendarDirective[];
    events: number;
    turns: CalendarTurn[];
    tools: string[];
}
export interface CalendarPerDay {
    day: number;
    dom: string;
    events: number;
    multi: boolean;
}
export interface CalendarSession {
    id: string;
    title: string;
    startDay: number;
    activeDays: number[];
    perDay: CalendarPerDay[];
    segments: CalendarSegment[];
    switches: number;
    nReq: number;
    nInstr: number;
    projects: string[];
}
export interface CalendarData {
    days: number;
    dayBase: string;
    projects: CalendarProject[];
    sessions: CalendarSession[];
}
/** Deterministic hue from a project id (stable across re-runs). */
export declare function hueFor(id: string): string;
/** Day label (MM-DD) for a window day. */
export declare function dayLabel(day: number, base: number): string;
/**
 * Build the calendar-yarn dataset for one project (cwd).
 * @param store track store.
 * @param cwd project workspace path.
 * @param days window length (default 18).
 * @param now injectable clock.
 */
export declare function buildCalendar(store: TrackStore, cwd: string, days?: number, now?: number): Promise<CalendarData>;
