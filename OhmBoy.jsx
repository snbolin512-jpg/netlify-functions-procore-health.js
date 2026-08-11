import React, { useState, useEffect, useCallback, useRef } from "react";

/* ============================================================================
   OHM BOY — Electrical Command Center
   Mission-critical data center construction / electrical PM dashboard.

   INTEGRATION NOTE (read this before wiring up real Procore data):
   This artifact runs entirely client-side in a sandboxed preview with no
   outbound network access and nowhere safe to hold a Procore client secret.
   So the "Procore hook" below is built as a real, swappable data-layer:
   `pollProcoreRevisions()` and `transformToPacket()` are the two functions
   you'd point at your actual backend. Everything else in this file (state,
   UI, the packet pipeline, the breaker-panel nav) is production-shaped and
   doesn't change when you swap the data source.

   Real wiring, when you're ready:
   1. Stand up a small backend (even a single serverless function) that
      holds your Procore client_id/secret and does the OAuth2 code exchange.
      Never put those in frontend code.
   2. Subscribe to Procore webhooks for the events you care about, e.g.
      "drawings.revision.created" and "schedule.activity.updated" (exact
      resource/event names depend on your Procore API version + app scopes —
      check your Procore app's webhook trigger list).
   3. Your backend receives the webhook, verifies the signature, and either
      forwards the normalized event to this app over a websocket/SSE channel,
      or drops it in a queue this app polls via a REST endpoint you control.
   4. Replace pollProcoreRevisions() below with a fetch() to that endpoint.
      Replace transformToPacket() with your real normalization rules — the
      shape it outputs (a "workable packet") is what the rest of the UI
      consumes, so keep that contract stable and iterate on the mapping.
============================================================================ */

const JACKSON_PHOTO = "data:image/jpeg;base64,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";

/**
 * Point this at your deployed OhmBoy backend (see the /backend project,
 * README.md for setup) to switch from demo data to live Procore packets,
 * e.g. "https://ohmboy-backend.onrender.com". Leave blank to keep running
 * on simulated data, which is what this preview does since it has no
 * outbound network access anyway.
 */
const BACKEND_URL = "";

/* ---------------------------------------------------------------------------
   MOCK PROCORE DATA LAYER
   Stands in for the webhook/polling pipeline described above. Raw shapes
   here loosely mirror real Procore drawing/schedule payload fields so the
   transform step below is a realistic template, not just a demo.
--------------------------------------------------------------------------- */

const DISCIPLINES = ["Electrical", "Fire Alarm", "Low Voltage", "Grounding", "UPS/Switchgear"];
const AREAS = ["Data Hall 3", "Level 2 Switchgear Rm", "Generator Yard", "MEP Corridor B", "Battery Room 1"];
const CREWS = ["Crew A — Feeders", "Crew C — Grounding", "Crew D — Terminations", "BIM Coordination", "Startup & Commissioning"];

let rawEventCounter = 4400;

function makeRawDrawingEvent() {
  rawEventCounter += 1;
  const discipline = DISCIPLINES[Math.floor(Math.random() * DISCIPLINES.length)];
  const area = AREAS[Math.floor(Math.random() * AREAS.length)];
  return {
    source: "procore.drawings",
    event: "drawings.revision.created",
    id: `rev_${rawEventCounter}`,
    project_id: 88213,
    drawing_number: `E-${(100 + Math.floor(Math.random() * 60))}`,
    title: `${discipline} — ${area}`,
    sheet_set: "Electrical",
    revision_number: `Rev ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
    discipline,
    area,
    uploaded_by: "V. Alvarez (EOR)",
    uploaded_at: new Date().toISOString(),
    status: "current",
    supersedes: `Rev ${String.fromCharCode(64 + Math.floor(Math.random() * 6))}`,
  };
}

function makeRawScheduleEvent() {
  rawEventCounter += 1;
  const area = AREAS[Math.floor(Math.random() * AREAS.length)];
  const shift = [-3, -2, -1, 1, 2, 3][Math.floor(Math.random() * 6)];
  return {
    source: "procore.schedule",
    event: "schedule.activity.updated",
    id: `sch_${rawEventCounter}`,
    project_id: 88213,
    activity_id: `A${2000 + Math.floor(Math.random() * 400)}`,
    activity_name: `Rough-in electrical — ${area}`,
    predecessor_shift_days: shift,
    old_finish: "2026-08-04",
    new_finish: shift > 0 ? "2026-08-07" : "2026-08-01",
    updated_by: "GC Scheduler",
    updated_at: new Date().toISOString(),
    critical_path: Math.random() > 0.6,
  };
}

/** Simulated poll — swap for a real fetch() against your backend. */
function pollProcoreRevisions() {
  const roll = Math.random();
  if (roll < 0.55) return [makeRawDrawingEvent()];
  if (roll < 0.9) return [makeRawScheduleEvent()];
  return [makeRawDrawingEvent(), makeRawScheduleEvent()];
}

/** Turns one raw Procore-shaped event into a workable field packet. */
function transformToPacket(raw) {
  if (raw.source === "procore.drawings") {
    const isSuperseding = raw.revision_number !== raw.supersedes;
    return {
      id: raw.id,
      kind: "drawing",
      priority: isSuperseding ? "high" : "normal",
      discipline: raw.discipline,
      headline: `${raw.drawing_number} bumped to ${raw.revision_number}`,
      summary: `${raw.title} superseded ${raw.supersedes}. Uploaded by ${raw.uploaded_by}.`,
      area: raw.area,
      action: "Pull the new sheet before cutting any more conduit in this area.",
      notify: CREWS[Math.floor(Math.random() * CREWS.length)],
      receivedAt: raw.uploaded_at,
      raw,
    };
  }
  const slipping = raw.predecessor_shift_days > 0;
  return {
    id: raw.id,
    kind: "schedule",
    priority: raw.critical_path ? "high" : slipping ? "normal" : "low",
    discipline: "Schedule",
    headline: `${raw.activity_name} ${slipping ? "slipped" : "moved up"} ${Math.abs(raw.predecessor_shift_days)}d`,
    summary: `Finish moved ${raw.old_finish} → ${raw.new_finish}${raw.critical_path ? " — on critical path." : "."}`,
    area: raw.activity_name.split("—")[1]?.trim() || "—",
    action: raw.critical_path
      ? "Flag to super today — critical path impact."
      : "Note for next look-ahead meeting.",
    notify: CREWS[Math.floor(Math.random() * CREWS.length)],
    receivedAt: raw.updated_at,
    raw,
  };
}

const JACKSON_LINES = [
  "Sniffing through Procore since 6:14 AM. Two new drawing revs so far.",
  "Someone bumped E-118 to Rev C. I already told the crew.",
  "Schedule slipped on Data Hall 3 rough-in. Not my fault, I was napping.",
  "All circuits synced. Going back to guarding the porch.",
  "New submittal activity detected. Reading it so you don't have to.",
  "Caught a revision before the GC even mentioned it in the meeting.",
  "Feeder schedule moved up 2 days. Somebody's not gonna be happy.",
  "Zero conflicts on the board right now. Rare. Enjoy it.",
];

/* ---------------------------------------------------------------------------
   UI PRIMITIVES
--------------------------------------------------------------------------- */

function BreakerSwitch({ label, sub, active, alert, onClick }) {
  return (
    <button className={`breaker ${active ? "breaker-on" : ""} ${alert ? "breaker-alert" : ""}`} onClick={onClick}>
      <span className="breaker-toggle" aria-hidden="true">
        <span className="breaker-nub" />
      </span>
      <span className="breaker-text">
        <span className="breaker-label">{label}</span>
        <span className="breaker-sub">{sub}</span>
      </span>
    </button>
  );
}

function PriorityTag({ priority }) {
  const map = {
    high: { text: "TRIP — HIGH", cls: "tag-high" },
    normal: { text: "LOGGED", cls: "tag-normal" },
    low: { text: "FYI", cls: "tag-low" },
  };
  const t = map[priority] || map.normal;
  return <span className={`tag ${t.cls}`}>{t.text}</span>;
}

function PacketCard({ packet }) {
  return (
    <div className={`packet packet-${packet.priority}`}>
      <div className="packet-top">
        <span className="packet-kind">{packet.kind === "drawing" ? "DWG" : "SCHED"}</span>
        <PriorityTag priority={packet.priority} />
      </div>
      <div className="packet-headline">{packet.headline}</div>
      <div className="packet-summary">{packet.summary}</div>
      <div className="packet-meta">
        <span>{packet.area}</span>
        <span className="dot">•</span>
        <span>{packet.discipline}</span>
      </div>
      <div className="packet-action">
        <span className="packet-action-label">ACTION</span> {packet.action}
      </div>
      <div className="packet-footer">
        <span>→ {packet.notify}</span>
        <span>{new Date(packet.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   MAIN APP
--------------------------------------------------------------------------- */

export default function OhmBoy() {
  const [circuit, setCircuit] = useState("main");
  const [packets, setPackets] = useState([]);
  const [rawLog, setRawLog] = useState([]);
  const [tripped, setTripped] = useState({});
  const [live, setLive] = useState(true);
  const [lineIdx, setLineIdx] = useState(0);
  const [pulse, setPulse] = useState(false);
  const idCounter = useRef(0);
  const lastPollRef = useRef(null);

  const ingest = useCallback(async () => {
    let newPackets = [];
    let events = [];

    if (BACKEND_URL) {
      // Live mode: pull real packets your backend already transformed from
      // Procore webhook events. See /backend/README.md to stand this up.
      try {
        const since = lastPollRef.current ? `?since=${encodeURIComponent(lastPollRef.current)}` : "";
        const resp = await fetch(`${BACKEND_URL}/api/packets${since}`);
        if (!resp.ok) throw new Error(`Backend responded ${resp.status}`);
        const data = await resp.json();
        newPackets = (data.packets || []).map((p) => {
          idCounter.current += 1;
          return { ...p, _key: idCounter.current };
        });
        events = newPackets.map((p) => p.raw).filter(Boolean);
        lastPollRef.current = new Date().toISOString();
      } catch (err) {
        console.error("OhmBoy: couldn't reach the backend, showing nothing new this cycle.", err);
        return;
      }
    } else {
      // Demo mode: simulate what the backend would otherwise deliver.
      events = pollProcoreRevisions();
      newPackets = events.map((raw) => {
        idCounter.current += 1;
        return { ...transformToPacket(raw), _key: idCounter.current };
      });
    }

    const pairs = newPackets.map((p, i) => ({ raw: events[i], packet: p }));
    setPackets((prev) => [...newPackets, ...prev].slice(0, 40));
    setRawLog((prev) => [...pairs, ...prev].slice(0, 20));
    setTripped((prev) => {
      const next = { ...prev };
      newPackets.forEach((p) => {
        if (p.priority === "high") {
          next[p.kind === "drawing" ? "drawings" : "schedule"] = true;
        }
      });
      return next;
    });
    setPulse(true);
    setTimeout(() => setPulse(false), 600);
    setLineIdx((i) => (i + 1) % JACKSON_LINES.length);
  }, []);

  useEffect(() => {
    ingest();
  }, []);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(ingest, 9000);
    return () => clearInterval(t);
  }, [live, ingest]);

  const clearTrip = (key) => setTripped((prev) => ({ ...prev, [key]: false }));

  const drawingPackets = packets.filter((p) => p.kind === "drawing");
  const schedulePackets = packets.filter((p) => p.kind === "schedule");
  const highCount = packets.filter((p) => p.priority === "high").length;

  const visiblePackets =
    circuit === "drawings" ? drawingPackets : circuit === "schedule" ? schedulePackets : packets;

  return (
    <div className="ohmboy-root">
      <style>{`
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

  .ohmboy-root {
    min-height: 100vh;
    background:
      linear-gradient(180deg, rgba(10,25,41,0.97), rgba(10,25,41,0.99)),
      repeating-linear-gradient(0deg, rgba(63,130,166,0.08) 0px, rgba(63,130,166,0.08) 1px, transparent 1px, transparent 32px),
      repeating-linear-gradient(90deg, rgba(63,130,166,0.08) 0px, rgba(63,130,166,0.08) 1px, transparent 1px, transparent 32px),
      #0a1929;
    color: #eaf2f8;
    font-family: 'Inter', sans-serif;
    padding-bottom: 140px;
  }

  .topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 18px 24px;
    border-bottom: 2px solid #1f3a52;
    background: linear-gradient(180deg, rgba(19,37,58,0.9), rgba(19,37,58,0.4));
  }
  .topbar-left { display: flex; align-items: center; gap: 12px; }
  .plug-icon {
    width: 42px; height: 42px; border-radius: 6px;
    background: #13253a; border: 2px solid #e8a33d;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; color: #e8a33d;
    box-shadow: 0 0 14px rgba(232,163,61,0.35);
  }
  .wordmark {
    font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 26px;
    letter-spacing: 1px; line-height: 1;
  }
  .wordmark-accent { color: #e8a33d; }
  .wordmark-sub {
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 1.5px;
    color: #7c93a8; margin-top: 3px;
  }
  .topbar-right { display: flex; align-items: center; gap: 10px; }
  .status-chip {
    display: flex; align-items: center; gap: 7px;
    font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 1px;
    padding: 7px 12px; border-radius: 20px; border: 1px solid #2a4a63; color: #7c93a8;
  }
  .status-chip.status-live { color: #4cd97d; border-color: #2a5c3f; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #3a5468; }
  .status-live .status-dot { background: #4cd97d; box-shadow: 0 0 8px #4cd97d; animation: blink 1.6s infinite; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

  .btn-pull, .btn-toggle {
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 13px;
    padding: 9px 14px; border-radius: 6px; cursor: pointer; border: none;
    transition: transform 0.12s ease;
  }
  .btn-pull { background: #e8a33d; color: #17222c; }
  .btn-pull:hover { transform: translateY(-1px); }
  .btn-toggle { background: transparent; border: 1px solid #2a4a63; color: #cddbe6; }
  .btn-toggle:hover { border-color: #4a7089; }

  .body-grid { display: grid; grid-template-columns: 230px 1fr; gap: 0; }
  @media (max-width: 720px) { .body-grid { grid-template-columns: 1fr; } }

  .panel {
    border-right: 1px solid #1f3a52;
    padding: 20px 14px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .panel-label {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 2px;
    color: #4a7089; margin-bottom: 4px;
  }

  .breaker {
    display: flex; align-items: center; gap: 10px;
    background: #10202f; border: 1px solid #1f3a52; border-radius: 8px;
    padding: 10px 12px; cursor: pointer; text-align: left;
    transition: border-color 0.15s ease, background 0.15s ease;
  }
  .breaker:hover { border-color: #4a7089; }
  .breaker-on { border-color: #e8a33d; background: #16283a; }
  .breaker-alert { border-color: #ff5a1f; box-shadow: 0 0 0 1px #ff5a1f inset; }
  .breaker-toggle {
    width: 26px; height: 16px; border-radius: 9px; background: #1f3a52;
    position: relative; flex-shrink: 0;
  }
  .breaker-on .breaker-toggle { background: #6b4a1a; }
  .breaker-nub {
    position: absolute; top: 2px; left: 2px; width: 12px; height: 12px; border-radius: 50%;
    background: #7c93a8; transition: transform 0.15s ease, background 0.15s ease;
  }
  .breaker-on .breaker-nub { background: #e8a33d; transform: translateX(10px); }
  .breaker-text { display: flex; flex-direction: column; }
  .breaker-label {
    font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 0.5px;
  }
  .breaker-sub { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #7c93a8; }

  .panel-stats { display: flex; gap: 10px; margin-top: 14px; }
  .stat {
    flex: 1; background: #10202f; border: 1px solid #1f3a52; border-radius: 8px;
    padding: 10px; text-align: center;
  }
  .stat-num { font-family: 'Oswald', sans-serif; font-size: 22px; font-weight: 700; color: #eaf2f8; }
  .stat-hot { color: #ff5a1f; }
  .stat-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; color: #7c93a8; margin-top: 2px; }

  .main-col { padding: 22px 24px 40px; }
  .main-col h2 {
    font-family: 'Oswald', sans-serif; font-size: 18px; letter-spacing: 0.5px;
    color: #eaf2f8; margin: 0 0 16px; font-weight: 600;
  }

  .packet-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .empty {
    font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #4a7089;
    border: 1px dashed #2a4a63; border-radius: 8px; padding: 24px; text-align: center;
  }

  .packet {
    background: #10202f; border: 1px solid #1f3a52; border-radius: 10px; padding: 14px;
    border-left: 3px solid #4a7089;
  }
  .packet-high { border-left-color: #ff5a1f; }
  .packet-normal { border-left-color: #e8a33d; }
  .packet-low { border-left-color: #4a7089; }
  .packet-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .packet-kind {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 1.5px; color: #7c93a8;
  }
  .tag { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 1px; padding: 3px 7px; border-radius: 10px; }
  .tag-high { background: rgba(255,90,31,0.15); color: #ff8a5c; border: 1px solid rgba(255,90,31,0.4); }
  .tag-normal { background: rgba(232,163,61,0.15); color: #f0bc6d; border: 1px solid rgba(232,163,61,0.4); }
  .tag-low { background: rgba(124,147,168,0.15); color: #9fb4c4; border: 1px solid rgba(124,147,168,0.35); }

  .packet-headline { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 15px; margin-bottom: 4px; }
  .packet-summary { font-size: 12.5px; color: #b7c8d6; line-height: 1.4; margin-bottom: 8px; }
  .packet-meta { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: #7c93a8; margin-bottom: 8px; }
  .packet-meta .dot { margin: 0 6px; }
  .packet-action {
    font-size: 12px; background: #0d1b28; border: 1px solid #1f3a52; border-radius: 6px;
    padding: 8px 9px; color: #cddbe6; margin-bottom: 8px;
  }
  .packet-action-label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #e8a33d; letter-spacing: 1px; }
  .packet-footer {
    display: flex; justify-content: space-between; font-family: 'IBM Plex Mono', monospace;
    font-size: 10px; color: #5c7b93;
  }

  .raw-list { display: flex; flex-direction: column; gap: 16px; }
  .raw-row {
    display: grid; grid-template-columns: 1fr 30px 1fr; gap: 10px; align-items: center;
  }
  @media (max-width: 720px) { .raw-row { grid-template-columns: 1fr; } .raw-arrow { display: none; } }
  .raw-json {
    background: #0a1622; border: 1px solid #1f3a52; border-radius: 8px; padding: 12px;
    font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: #7ec8e3;
    overflow-x: auto; margin: 0;
  }
  .raw-arrow { text-align: center; color: #e8a33d; font-size: 18px; }

  .about h2 { margin-bottom: 6px; }
  .about > p { color: #b7c8d6; font-size: 13.5px; max-width: 640px; line-height: 1.5; margin-bottom: 20px; }
  .about-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
  .about-card { background: #10202f; border: 1px solid #1f3a52; border-radius: 10px; padding: 14px; }
  .about-step { font-family: 'Oswald', sans-serif; color: #e8a33d; font-weight: 700; font-size: 13px; margin-bottom: 6px; }
  .about-title { font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 14px; margin-bottom: 6px; }
  .about-body { font-size: 12px; color: #9fb4c4; line-height: 1.45; }

  .jackson-badge {
    position: fixed; bottom: 18px; right: 18px; z-index: 40;
    display: flex; align-items: center; gap: 12px;
    background: linear-gradient(160deg, #f4ede0, #e7dcc7);
    color: #2a2015; border-radius: 10px; padding: 10px 14px 10px 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.45);
    max-width: 300px; border: 1px solid #cbb98c;
    transition: box-shadow 0.3s ease;
  }
  .jackson-pulse { box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 0 3px rgba(232,163,61,0.5); }
  .badge-photo-wrap { position: relative; flex-shrink: 0; }
  .badge-photo {
    width: 56px; height: 56px; border-radius: 8px; object-fit: cover;
    border: 2px solid #2a2015;
  }
  .badge-onsite {
    position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%);
    background: #2a7a4a; color: #fff; font-family: 'IBM Plex Mono', monospace;
    font-size: 7px; letter-spacing: 0.5px; padding: 2px 5px; border-radius: 4px; white-space: nowrap;
  }
  .badge-name { font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; }
  .badge-role { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: #6b5a3a; margin-bottom: 4px; }
  .badge-line { font-size: 11.5px; line-height: 1.35; }

  @media (max-width: 520px) {
    .jackson-badge { left: 12px; right: 12px; max-width: none; }
  }
`}</style>

      <header className="topbar">
        <div className="topbar-left">
          <div className="plug-icon">⏚</div>
          <div>
            <div className="wordmark">OHM<span className="wordmark-accent">BOY</span></div>
            <div className="wordmark-sub">ELECTRICAL COMMAND CENTER — DC-88213</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className={`status-chip ${live ? "status-live" : ""}`}>
            <span className="status-dot" />
            {live ? "LIVE FEED" : "PAUSED"}
          </div>
          <button className="btn-pull" onClick={ingest}>
            Pull Latest Revisions
          </button>
          <button className="btn-toggle" onClick={() => setLive((v) => !v)}>
            {live ? "Pause polling" : "Resume polling"}
          </button>
        </div>
      </header>

      <div className="body-grid">
        <nav className="panel">
          <div className="panel-label">PANEL SCHEDULE</div>
          <BreakerSwitch
            label="MAIN"
            sub="Overview"
            active={circuit === "main"}
            onClick={() => setCircuit("main")}
          />
          <BreakerSwitch
            label="DRAWINGS"
            sub={`${drawingPackets.length} packets`}
            active={circuit === "drawings"}
            alert={tripped.drawings}
            onClick={() => {
              setCircuit("drawings");
              clearTrip("drawings");
            }}
          />
          <BreakerSwitch
            label="SCHEDULE"
            sub={`${schedulePackets.length} packets`}
            active={circuit === "schedule"}
            alert={tripped.schedule}
            onClick={() => {
              setCircuit("schedule");
              clearTrip("schedule");
            }}
          />
          <BreakerSwitch
            label="RAW FEED"
            sub="Procore payloads"
            active={circuit === "raw"}
            onClick={() => setCircuit("raw")}
          />
          <BreakerSwitch
            label="HOW THIS WORKS"
            sub="Integration notes"
            active={circuit === "about"}
            onClick={() => setCircuit("about")}
          />

          <div className="panel-stats">
            <div className="stat">
              <div className="stat-num">{packets.length}</div>
              <div className="stat-label">Packets today</div>
            </div>
            <div className="stat">
              <div className={`stat-num ${highCount ? "stat-hot" : ""}`}>{highCount}</div>
              <div className="stat-label">High priority</div>
            </div>
          </div>
        </nav>

        <main className="main-col">
          {circuit === "about" ? (
            <section className="about">
              <h2>How the Procore hook works</h2>
              <p>
                Every ~9 seconds this demo simulates Procore emitting drawing and schedule
                revision events. In production, that box is a webhook receiver on your own
                backend, not code running in this browser.
              </p>
              <div className="about-grid">
                <div className="about-card">
                  <div className="about-step">01</div>
                  <div className="about-title">Backend holds the credentials</div>
                  <div className="about-body">
                    OAuth2 client id/secret and refresh tokens live server-side only. Never in
                    frontend code, ever.
                  </div>
                </div>
                <div className="about-card">
                  <div className="about-step">02</div>
                  <div className="about-title">Procore webhooks fire</div>
                  <div className="about-body">
                    Subscribe to drawing revision and schedule activity events on your Procore
                    app. Verify the signature on receipt.
                  </div>
                </div>
                <div className="about-card">
                  <div className="about-step">03</div>
                  <div className="about-title">Transform to a packet</div>
                  <div className="about-body">
                    transformToPacket() normalizes the raw payload into something a field crew
                    can act on in five seconds flat.
                  </div>
                </div>
                <div className="about-card">
                  <div className="about-step">04</div>
                  <div className="about-title">Push to the command center</div>
                  <div className="about-body">
                    Backend streams packets down over SSE/websocket, or this app polls a REST
                    endpoint you control.
                  </div>
                </div>
              </div>
            </section>
          ) : circuit === "raw" ? (
            <section className="raw-section">
              <h2>Raw Procore payloads → workable packets</h2>
              <div className="raw-list">
                {rawLog.length === 0 && <div className="empty">No events yet. Pull latest revisions.</div>}
                {rawLog.map(({ raw, packet }, i) => (
                  <div className="raw-row" key={(raw?.id || "evt") + i}>
                    <pre className="raw-json">{JSON.stringify(raw, null, 2)}</pre>
                    <div className="raw-arrow">→</div>
                    <PacketCard packet={packet} />
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section>
              <h2>{circuit === "main" ? "All packets" : circuit === "drawings" ? "Drawing revisions" : "Schedule changes"}</h2>
              <div className="packet-grid">
                {visiblePackets.length === 0 && (
                  <div className="empty">Nothing logged yet — hit "Pull Latest Revisions."</div>
                )}
                {visiblePackets.map((p) => (
                  <PacketCard key={p._key} packet={p} />
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <div className={`jackson-badge ${pulse ? "jackson-pulse" : ""}`}>
        <div className="badge-photo-wrap">
          <img src={JACKSON_PHOTO} alt="Jackson, the OhmBoy site dog" className="badge-photo" />
          <span className="badge-onsite">ON SITE</span>
        </div>
        <div className="badge-info">
          <div className="badge-name">JACKSON</div>
          <div className="badge-role">Procore Watch Dog</div>
          <div className="badge-line">{JACKSON_LINES[lineIdx]}</div>
        </div>
      </div>
    </div>
  );
}
