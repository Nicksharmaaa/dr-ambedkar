'use client';

import { useState, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface InboxFile {
  filename: string;
  relative_path: string;
  size_bytes: number | null;
}

interface IngestResult {
  filename: string;
  path: string;
  archival_id: string | null;
  object_id: string | null;
  sha256: string | null;
  status: 'ok' | 'needs_review' | 'duplicate' | 'failed' | 'pending' | 'unsupported';
  error: string | null;
}

interface BatchSummary {
  total: number;
  processed: number;
  pending: number;
  failed: number;
  duplicate: number;
  needs_review: number;
  results: IngestResult[];
}

interface ScanResponse {
  dry_run: boolean;
  summary: BatchSummary;
}

interface ManifestEntry {
  archival_id: string | null;
  filename: string | null;
  status: string | null;
  sha256: string | null;
  mime_type: string | null;
  ingestion_timestamp: string | null;
  manifest_file: string;
}

type PanelView = 'inbox' | 'scan' | 'manifests';

// ─────────────────────────────────────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ok: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    needs_review: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    duplicate: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    failed: 'bg-red-500/20 text-red-300 border-red-500/40',
    unsupported: 'bg-red-500/20 text-red-300 border-red-500/40',
    pending: 'bg-zinc-600/30 text-zinc-400 border-zinc-600/40',
  };
  const cls = map[status] || map.pending;
  return (
    <span className={`ingestion-badge ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary counters row
// ─────────────────────────────────────────────────────────────────────────────

function SummaryBar({ summary }: { summary: BatchSummary }) {
  const stats = [
    { label: 'Total', value: summary.total, color: 'text-zinc-300' },
    { label: 'Ingested', value: summary.processed, color: 'text-emerald-400' },
    { label: 'Needs Review', value: summary.needs_review, color: 'text-amber-400' },
    { label: 'Duplicate', value: summary.duplicate, color: 'text-sky-400' },
    { label: 'Failed', value: summary.failed, color: 'text-red-400' },
  ];
  return (
    <div className="ingestion-summary-bar">
      {stats.map((s) => (
        <div key={s.label} className="ingestion-stat">
          <span className={`ingestion-stat-value ${s.color}`}>{s.value}</span>
          <span className="ingestion-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────────────────

export default function IngestionDashboard() {
  const [panel, setPanel] = useState<PanelView>('inbox');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inbox state
  const [inboxFiles, setInboxFiles] = useState<InboxFile[] | null>(null);

  // Scan state
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [dryRun, setDryRun] = useState(true);

  // Manifests state
  const [manifests, setManifests] = useState<ManifestEntry[] | null>(null);

  const api = (path: string, method = 'GET') =>
    fetch(`/api/v1/admin/ingest${path}`, { method });

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/inbox');
      const data = await res.json();
      setInboxFiles(data.files);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const runScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    setScanResult(null);
    try {
      const endpoint = dryRun ? '/scan/dry' : '/scan';
      const res = await api(endpoint, 'POST');
      const data: ScanResponse = await res.json();
      setScanResult(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [dryRun]);

  const loadManifests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/manifests');
      const data = await res.json();
      setManifests(data.manifests);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="ingestion-dashboard">
      {/* Header */}
      <div className="ingestion-header">
        <div>
          <h2 className="ingestion-title">Archival Ingestion Pipeline</h2>
          <p className="ingestion-subtitle">
            Phase 3 — Controlled inbox scanner · Zero-hallucination · PREMIS-compliant
          </p>
        </div>
        <div className="ingestion-phase-badge">Phase 3</div>
      </div>

      {/* Nav Tabs */}
      <div className="ingestion-tabs">
        {(['inbox', 'scan', 'manifests'] as PanelView[]).map((tab) => (
          <button
            key={tab}
            id={`ingestion-tab-${tab}`}
            onClick={() => setPanel(tab)}
            className={`ingestion-tab ${panel === tab ? 'ingestion-tab-active' : ''}`}
          >
            {tab === 'inbox' && '📂 Inbox'}
            {tab === 'scan' && '🔬 Run Ingestion'}
            {tab === 'manifests' && '📋 Manifests'}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="ingestion-error">
          ⚠ {error}
        </div>
      )}

      {/* ── Inbox Panel ── */}
      {panel === 'inbox' && (
        <div className="ingestion-panel">
          <div className="ingestion-panel-actions">
            <p className="ingestion-panel-hint">
              Lists all eligible files currently in <code>data/inbox/</code>. Sidecar .json files are excluded.
            </p>
            <button
              id="btn-load-inbox"
              onClick={loadInbox}
              disabled={loading}
              className="ingestion-btn"
            >
              {loading ? 'Scanning...' : 'Scan Inbox'}
            </button>
          </div>

          {inboxFiles !== null && (
            <>
              {inboxFiles.length === 0 ? (
                <div className="ingestion-empty">
                  <p>📭 Inbox is empty.</p>
                  <p className="ingestion-empty-hint">
                    Place approved source files in <code>data/inbox/</code> to begin.
                    See <code>DATA_CHECKPOINT.md</code> for instructions.
                  </p>
                </div>
              ) : (
                <table className="ingestion-table">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Path</th>
                      <th>Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inboxFiles.map((f, i) => (
                      <tr key={i}>
                        <td className="font-mono text-sm">{f.filename}</td>
                        <td className="font-mono text-xs text-zinc-400">{f.relative_path}</td>
                        <td className="text-right tabular-nums">{formatBytes(f.size_bytes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Scan Panel ── */}
      {panel === 'scan' && (
        <div className="ingestion-panel">
          <div className="ingestion-scan-controls">
            <div className="ingestion-dry-toggle">
              <label htmlFor="dry-run-toggle" className="ingestion-toggle-label">
                <span>Dry Run</span>
                <span className="ingestion-toggle-hint">
                  Analyze only — no writes to storage or database
                </span>
              </label>
              <button
                id="dry-run-toggle"
                role="switch"
                aria-checked={dryRun}
                onClick={() => setDryRun((v) => !v)}
                className={`ingestion-toggle ${dryRun ? 'ingestion-toggle-on' : 'ingestion-toggle-off'}`}
              >
                <span className="ingestion-toggle-knob" />
              </button>
            </div>

            <button
              id="btn-run-scan"
              onClick={runScan}
              disabled={loading}
              className={`ingestion-btn ${!dryRun ? 'ingestion-btn-danger' : ''}`}
            >
              {loading
                ? 'Processing...'
                : dryRun
                ? '🔍 Dry Run Analysis'
                : '⚡ Run Full Ingestion'}
            </button>
          </div>

          {!dryRun && (
            <div className="ingestion-warning">
              <strong>⚠ Full Ingestion Mode</strong> — Files will be stored and records will be written to the database.
              Only proceed if source files in <code>data/inbox/</code> have been reviewed and approved by an archivist.
            </div>
          )}

          {scanResult && (
            <div className="ingestion-results">
              <div className="ingestion-results-header">
                <h3>
                  {scanResult.dry_run ? '🔍 Dry Run Results' : '✅ Ingestion Complete'}
                </h3>
              </div>
              <SummaryBar summary={scanResult.summary} />

              {scanResult.summary.results.length > 0 && (
                <table className="ingestion-table">
                  <thead>
                    <tr>
                      <th>Filename</th>
                      <th>Status</th>
                      <th>Archival ID</th>
                      <th>SHA-256</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResult.summary.results.map((r, i) => (
                      <tr key={i}>
                        <td className="font-mono text-sm">{r.filename}</td>
                        <td><StatusBadge status={r.status} /></td>
                        <td className="font-mono text-xs">{r.archival_id || '—'}</td>
                        <td className="font-mono text-xs text-zinc-500">
                          {r.sha256 ? r.sha256.slice(0, 16) + '…' : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {scanResult.summary.total === 0 && (
                <div className="ingestion-empty">
                  <p>📭 No files found in inbox.</p>
                  <p className="ingestion-empty-hint">
                    Place files in <code>data/inbox/</code> first.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Manifests Panel ── */}
      {panel === 'manifests' && (
        <div className="ingestion-panel">
          <div className="ingestion-panel-actions">
            <p className="ingestion-panel-hint">
              Ingestion manifests are written to <code>data/manifests/</code> for each successfully processed file.
            </p>
            <button
              id="btn-load-manifests"
              onClick={loadManifests}
              disabled={loading}
              className="ingestion-btn"
            >
              {loading ? 'Loading...' : 'Load Manifests'}
            </button>
          </div>

          {manifests !== null && (
            <>
              {manifests.length === 0 ? (
                <div className="ingestion-empty">
                  <p>📋 No manifests yet.</p>
                  <p className="ingestion-empty-hint">Run ingestion first to generate manifests.</p>
                </div>
              ) : (
                <table className="ingestion-table">
                  <thead>
                    <tr>
                      <th>Archival ID</th>
                      <th>Filename</th>
                      <th>MIME</th>
                      <th>Status</th>
                      <th>Ingested At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manifests.map((m, i) => (
                      <tr key={i}>
                        <td className="font-mono text-xs">{m.archival_id || '—'}</td>
                        <td className="font-mono text-sm">{m.filename || m.manifest_file}</td>
                        <td className="text-xs text-zinc-400">{m.mime_type || '—'}</td>
                        <td>{m.status ? <StatusBadge status={m.status} /> : '—'}</td>
                        <td className="text-xs text-zinc-500">
                          {m.ingestion_timestamp
                            ? new Date(m.ingestion_timestamp).toLocaleString()
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
