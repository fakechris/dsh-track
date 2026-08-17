/**
 * Calendar-yarn view for the 会话结构图 tab — adapted from the design mock
 * (dsh-track-calendar-yarn.jsx): sessions as lines across natural days,
 * project lanes, per-day activity nodes, drill-down segment sequence.
 * Key nodes are clickable to jump into the conversation.
 * @module @fakechris/dsh-track/client/calendar-yarn
 */
export interface CalProject {
    id: string;
    name: string;
    hue: string;
}
export interface CalTurn {
    outcome: 'completed' | 'aborted' | 'error' | 'blocked';
}
export interface CalDirective {
    text: string;
    messageId?: string;
}
export interface CalSegment {
    day: number;
    proj: string;
    req: string;
    reqMessageId?: string;
    sessionId: string;
    instr: CalDirective[];
    events: number;
    turns: CalTurn[];
    tools: string[];
}
export interface CalPerDay {
    day: number;
    dom: string;
    events: number;
    multi: boolean;
}
export interface CalSession {
    id: string;
    title: string;
    startDay: number;
    activeDays: number[];
    perDay: CalPerDay[];
    segments: CalSegment[];
    switches: number;
    nReq: number;
    nInstr: number;
    projects: string[];
}
export interface CalData {
    days: number;
    dayBase: string;
    projects: CalProject[];
    sessions: CalSession[];
}
export interface CalJump {
    sessionId: string;
    messageId?: string;
}
export interface CalProps {
    data: CalData;
    onJump: (j: CalJump) => void;
}
/** Root: main yarn + drill-down drawer + table, all in one scrollable column. */
export declare function CalendarYarnRoot(props: CalProps): import("react").JSX.Element;
/** Mount (or re-mount) the calendar-yarn view into a container. */
export declare function mountCalendar(container: HTMLElement, data: CalData, onJump: (j: CalJump) => void): void;
