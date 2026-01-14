import { useState, useEffect, Fragment } from 'react'
import * as styles from '../styles/lab.css'
import Header from '../components/Header'
import {
  CheckIcon,
  XIcon,
  WarningIcon,
  RocketIcon,
  FolderIcon,
  CodeIcon,
  TerminalIcon,
} from '../components/Icons'
import {
  getEncodingRuns,
  getAgentTranscripts,
  getTranscriptsBySession,
  getSDKSessions,
  getSDKSessionEvents,
  EncodingRun,
  AgentTranscript,
  SDKSession,
  DataSource,
} from '../lib/supabase'

// ============================================
// MOCK DATA - ⚠️ NOT REAL ⚠️
// ============================================

// MOCK DATA - Placeholder values for UI development only.
// Real data should come from Supabase.
const MOCK_CALIBRATION_DATA: ExperimentRun[] = [
  {
    id: '3aedd4db',
    timestamp: '2025-12-31T10:36:22',
    citation: '26 USC 137',
    iterations: [
      { attempt: 1, success: false, duration_ms: 499500, errors: [] },
      { attempt: 2, success: true, duration_ms: 499500, errors: [] },
    ],
    scores: { rac: 7.5, formula: 8.5, parameter: 9.5, integration: 7.5 },
    dataSource: 'mock',
  },
  {
    id: '0900f584',
    timestamp: '2025-12-31T10:36:22',
    citation: '26 USC 23',
    iterations: [{ attempt: 1, success: true, duration_ms: 233000, errors: [] }],
    scores: { rac: 8.2, formula: 7.5, parameter: 9.5, integration: 8.2 },
    dataSource: 'mock',
  },
  {
    id: 'cb77655b',
    timestamp: '2025-12-31T11:02:05',
    citation: '26 USC 25A',
    iterations: [{ attempt: 1, success: true, duration_ms: 141000, errors: [] }],
    scores: { rac: 8.5, formula: 8.5, parameter: 8.0, integration: 7.5 },
    dataSource: 'mock',
  },
  {
    id: '1d1fee67',
    timestamp: '2025-12-31T11:13:56',
    citation: '26 USC 25B',
    iterations: [{ attempt: 1, success: true, duration_ms: 461000, errors: [] }],
    scores: { rac: 8.5, formula: 8.5, parameter: 9.5, integration: 7.5 },
    dataSource: 'mock',
  },
  {
    id: 'a59ef11b',
    timestamp: '2025-12-31T12:49:52',
    citation: '26 USC 21',
    iterations: [{ attempt: 1, success: true, duration_ms: 1053000, errors: [] }],
    scores: { rac: 7.5, formula: 7.5, parameter: 9.0, integration: 7.5 },
    dataSource: 'mock',
  },
  {
    id: '62f77e5d',
    timestamp: '2025-12-31T19:25:07',
    citation: '26 USC 1',
    iterations: [
      { attempt: 1, success: false, duration_ms: 600000, errors: [] },
      { attempt: 2, success: true, duration_ms: 600000, errors: [] },
    ],
    scores: { rac: 8.5, formula: 8.5, parameter: 9.0, integration: 7.5 },
    hasIssues: true,
    note: 'IRS guidance values mixed into statute; wrong bracket parameter structure',
    dataSource: 'mock',
  },
]

interface ExperimentRun {
  id: string
  timestamp: string
  citation: string
  iterations: { attempt: number; success: boolean; duration_ms: number; errors: { type: string; message: string }[] }[]
  scores: { rac: number; formula: number; parameter: number; integration: number }
  hasIssues?: boolean
  note?: string
  dataSource: DataSource
  sessionId?: string
}

const PLUGIN_COMPONENTS = {
  agents: [
    { name: 'RAC Encoder', file: 'encoder.md', description: 'Encodes tax/benefit rules into RAC format.', lines: 380 },
    { name: 'RAC Reviewer', file: 'rac-reviewer.md', description: 'Reviews .rac encodings for quality and accuracy.', lines: 120 },
    { name: 'Formula Reviewer', file: 'formula-reviewer.md', description: 'Audits formula logic for statutory fidelity.', lines: 95 },
    { name: 'Parameter Reviewer', file: 'parameter-reviewer.md', description: 'Audits parameter values and effective dates.', lines: 88 },
    { name: 'Integration Reviewer', file: 'integration-reviewer.md', description: 'Audits file connections and dependencies.', lines: 72 },
    { name: 'Encoding Validator', file: 'validator.md', description: 'Validates against PolicyEngine and TAXSIM.', lines: 156 },
    { name: 'Statute Analyzer', file: 'statute-analyzer.md', description: 'Pre-flight analysis of statutes.', lines: 98 },
    { name: 'Fixer', file: 'fixer.md', description: 'Makes surgical fixes to .rac files.', lines: 64 },
  ],
  skills: [
    { name: 'policy-encoding', file: 'policy-encoding/SKILL.md', description: 'Encoding tax/benefit statutes into executable code.', lines: 450 },
    { name: 'microplex', file: 'microplex/SKILL.md', description: 'Evaluating synthetic microdata quality.', lines: 280 },
  ],
  commands: [
    { name: '/encode', file: 'encode.md', description: 'Encode a statute into RAC format with validation.', lines: 85 },
    { name: '/validate', file: 'validate.md', description: 'Validate encoded policy against multiple systems.', lines: 62 },
  ],
}

const KNOWN_ISSUES = [
  {
    id: 'issue-1',
    title: '26 USC 1 encoding quality',
    description: 'Despite passing tests, the §1 encoding mixed IRS guidance values into statute parameters and used manual bracket math instead of marginal_agg().',
    status: 'investigating',
  },
  {
    id: 'issue-2',
    title: 'Reviewer agent calibration',
    description: 'Current reviewer scores show high variance. Need to implement calibration dataset with known-quality encodings.',
    status: 'planned',
  },
]

// ============================================
// HELPERS
// ============================================

const DATA_SOURCE_INFO: Record<DataSource, { label: string; color: string; warning: boolean }> = {
  reviewer_agent: { label: 'Reviewer Agent', color: '#00ff88', warning: false },
  ci_only: { label: 'CI Only', color: '#ffaa00', warning: true },
  mock: { label: 'MOCK', color: '#ff4466', warning: true },
  manual_estimate: { label: 'Manual Estimate', color: '#ff6b35', warning: true },
  unknown: { label: 'Unknown', color: '#ff4466', warning: true },
}

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}

const formatTime = (ts: string) => {
  const date = new Date(ts)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

const getScoreClass = (score: number) => {
  if (score >= 8.5) return styles.scoreGood
  if (score >= 7.5) return styles.scoreWarn
  return styles.scoreBad
}

const getScoreColor = (score: number) => {
  if (score >= 8) return '#00ff88'
  if (score >= 6) return '#ffaa00'
  return '#ff4466'
}

// Transform Supabase data to UI format
function transformToUIFormat(run: EncodingRun): ExperimentRun {
  return {
    id: run.id,
    timestamp: run.timestamp,
    citation: run.citation,
    iterations: run.iterations || [],
    scores: run.scores || { rac: 0, formula: 0, parameter: 0, integration: 0 },
    hasIssues: run.has_issues ?? undefined,
    note: run.note ?? undefined,
    dataSource: run.data_source || 'unknown',
    sessionId: run.session_id ?? undefined,
  }
}

// ============================================
// COMPONENT
// ============================================

export default function LabPage() {
  const [activeTab, setActiveTab] = useState<'experiments' | 'transcripts' | 'sdk' | 'plugin' | 'issues'>('experiments')
  const [expandedTranscript, setExpandedTranscript] = useState<number | null>(null)
  const [showTimestamps, setShowTimestamps] = useState(false)
  const [selectedRun, setSelectedRun] = useState<ExperimentRun | null>(null)
  const [selectedRunTranscripts, setSelectedRunTranscripts] = useState<AgentTranscript[]>([])

  // State for Supabase data
  const [liveData, setLiveData] = useState<ExperimentRun[]>([])
  const [transcripts, setTranscripts] = useState<AgentTranscript[]>([])
  const [sdkSessions, setSdkSessions] = useState<SDKSession[]>([])
  const [selectedSDKSession, setSelectedSDKSession] = useState<SDKSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingMockData, setUsingMockData] = useState(false)

  // Fetch data from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const [runs, agentTranscripts, sessions] = await Promise.all([
          getEncodingRuns(100, 0),
          getAgentTranscripts(100, 0),
          getSDKSessions(50),
        ])

        if (runs.length > 0) {
          setLiveData(runs.map(transformToUIFormat))
          setUsingMockData(false)
        } else {
          // No data in Supabase yet, fall back to mock data
          setLiveData(MOCK_CALIBRATION_DATA)
          setUsingMockData(true)
        }

        setTranscripts(agentTranscripts)
        setSdkSessions(sessions)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setError('Failed to load data from database')
        // Fall back to mock data on error
        setLiveData(MOCK_CALIBRATION_DATA)
        setUsingMockData(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handler to select SDK session
  const handleSelectSDKSession = async (session: SDKSession) => {
    if (selectedSDKSession?.id === session.id) {
      setSelectedSDKSession(null)
      return
    }
    setSelectedSDKSession(session)
    // Events could be loaded here if needed in the future
    await getSDKSessionEvents(session.id, 500)
  }

  // Handler to select a run and load its transcripts
  const handleSelectRun = async (run: ExperimentRun) => {
    if (selectedRun?.id === run.id) {
      setSelectedRun(null)
      setSelectedRunTranscripts([])
      return
    }

    setSelectedRun(run)

    if (run.sessionId) {
      const runTranscripts = await getTranscriptsBySession(run.sessionId)
      setSelectedRunTranscripts(runTranscripts)
    } else {
      setSelectedRunTranscripts([])
    }
  }

  const data = liveData.length > 0 ? liveData : MOCK_CALIBRATION_DATA

  const totalRuns = data.length
  const successRuns = data.filter((d) => d.iterations[d.iterations.length - 1]?.success).length
  const avgScore =
    totalRuns > 0
      ? data.reduce((acc, d) => acc + (d.scores.rac + d.scores.formula + d.scores.parameter + d.scores.integration) / 4, 0) / totalRuns
      : 0

  // Count runs with untrusted data sources
  const untrustedRuns = data.filter((d) => d.dataSource !== 'reviewer_agent').length
  const hasUntrustedData = untrustedRuns > 0

  return (
    <div className={styles.page}>
      <div className={styles.gridOverlay} />
      <Header variant="lab" />

      <div className={styles.container}>
        {/* Page title section */}
        <header className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <span className={styles.labBadge}>Experiment Lab</span>
            <h1 className={styles.headerTitle}>AutoRAC calibration</h1>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Runs:</span>
              <span className={styles.metaValue}>{totalRuns}</span>
            </span>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Success:</span>
              <span className={styles.metaValue}>{((successRuns / totalRuns) * 100).toFixed(0)}%</span>
            </span>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Avg Score:</span>
              <span className={styles.metaValue}>{avgScore.toFixed(1)}/10</span>
            </span>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Plugin:</span>
              <span className={styles.metaValue}>cosilico@0.2.1</span>
            </span>
          </div>
        </header>

        {/* Data Status Banner */}
        {isLoading ? (
          <div className={`${styles.statusBanner} ${styles.statusBannerLoading}`}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <div>Loading data from Supabase...</div>
          </div>
        ) : usingMockData ? (
          <div className={`${styles.statusBanner} ${styles.statusBannerMock}`}>
            <WarningIcon size={28} />
            <div>
              <div style={{ marginBottom: '4px' }}>MOCK DATA - NOT REAL</div>
              <div style={{ fontWeight: 400, fontSize: '0.85rem', opacity: 0.9 }}>
                {error ? `Database error: ${error}. Showing placeholder data.` : 'No encoding runs in database yet. Showing placeholder data for UI preview.'}
              </div>
            </div>
          </div>
        ) : hasUntrustedData ? (
          <div className={`${styles.statusBanner} ${styles.statusBannerWarning}`}>
            <WarningIcon size={28} />
            <div>
              <div style={{ marginBottom: '4px' }}>DATA SOURCE WARNING</div>
              <div style={{ fontWeight: 400, fontSize: '0.85rem', opacity: 0.9 }}>
                {untrustedRuns} of {totalRuns} runs have scores NOT from actual reviewer agents. Check the "Source" column for details.
              </div>
            </div>
          </div>
        ) : (
          <div className={`${styles.statusBanner} ${styles.statusBannerSuccess}`}>
            <CheckIcon size={20} />
            <div>Live data from Supabase ({totalRuns} runs) - All scores verified by reviewer agents</div>
          </div>
        )}

        {/* Data Note */}
        <div className={styles.dataNote}>
          <span className={styles.dataNoteBold}>Data architecture note:</span> Plugin content is NOT currently stored with each experiment run.
          Recommend SCD2 table for <code>plugin_versions</code> with hash-based versioning to track which plugin state produced each result.
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'experiments' ? styles.tabActive : ''}`} onClick={() => setActiveTab('experiments')}>
            Experiment runs
          </button>
          <button className={`${styles.tab} ${activeTab === 'transcripts' ? styles.tabActive : ''}`} onClick={() => setActiveTab('transcripts')}>
            Agent transcripts
            {transcripts.length > 0 && (
              <span style={{ marginLeft: '8px', background: '#00ff88', color: '#08080c', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                {transcripts.length}
              </span>
            )}
          </button>
          <button className={`${styles.tab} ${activeTab === 'sdk' ? styles.tabActive : ''}`} onClick={() => setActiveTab('sdk')}>
            SDK sessions
            {sdkSessions.length > 0 && (
              <span style={{ marginLeft: '8px', background: '#00d4ff', color: '#08080c', padding: '2px 8px', borderRadius: '10px', fontSize: '11px' }}>
                {sdkSessions.length}
              </span>
            )}
          </button>
          <button className={`${styles.tab} ${activeTab === 'plugin' ? styles.tabActive : ''}`} onClick={() => setActiveTab('plugin')}>
            Plugin content
          </button>
          <button className={`${styles.tab} ${activeTab === 'issues' ? styles.tabActive : ''}`} onClick={() => setActiveTab('issues')}>
            Known issues
          </button>
        </div>

        {/* Experiments Tab */}
        {activeTab === 'experiments' && (
          <section className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>
              Encoding runs
              <span className={styles.sectionCount}>{totalRuns}</span>
            </h2>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Citation</th>
                  <th>Time</th>
                  <th>Source</th>
                  <th>Iterations</th>
                  <th>Duration</th>
                  <th>RAC</th>
                  <th>Formula</th>
                  <th>Param</th>
                  <th>Integ</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                {data.map((run) => {
                  const lastIter = run.iterations[run.iterations.length - 1]
                  const totalDuration = run.iterations.reduce((acc, i) => acc + i.duration_ms, 0)
                  const hasErrors = run.iterations.some((i) => i.errors && i.errors.length > 0)
                  const sourceInfo = DATA_SOURCE_INFO[run.dataSource]

                  return (
                    <Fragment key={run.id}>
                      <tr
                        onClick={() => handleSelectRun(run)}
                        style={{
                          cursor: 'pointer',
                          background: selectedRun?.id === run.id ? 'rgba(0, 212, 255, 0.1)' : undefined,
                          borderLeft: selectedRun?.id === run.id ? '3px solid #00d4ff' : '3px solid transparent',
                        }}
                      >
                        <td className={styles.citationCell}>
                          {run.citation}
                          {run.hasIssues && (
                            <span style={{ color: '#ff4466', marginLeft: '8px' }}>
                              <WarningIcon size={14} />
                            </span>
                          )}
                        </td>
                        <td className={styles.timestampCell}>{formatTime(run.timestamp)}</td>
                        <td>
                          <span
                            className={styles.sourceBadge}
                            style={{
                              color: sourceInfo.color,
                              background: `${sourceInfo.color}15`,
                              border: `1px solid ${sourceInfo.color}40`,
                            }}
                            title={sourceInfo.warning ? 'WARNING: Scores may not be from actual reviewer agents' : 'Verified by reviewer agents'}
                          >
                            {sourceInfo.label}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.iterationBadge} ${lastIter?.success ? styles.iterationSuccess : styles.iterationFailed}`}>
                            {run.iterations.length} {lastIter?.success ? <CheckIcon size={12} /> : <XIcon size={12} />}
                          </span>
                        </td>
                        <td className={styles.durationCell}>{formatDuration(totalDuration)}</td>
                        <td className={`${styles.scoreCell} ${getScoreClass(run.scores.rac)}`}>{run.scores.rac.toFixed(1)}</td>
                        <td className={`${styles.scoreCell} ${getScoreClass(run.scores.formula)}`}>{run.scores.formula.toFixed(1)}</td>
                        <td className={`${styles.scoreCell} ${getScoreClass(run.scores.parameter)}`}>{run.scores.parameter.toFixed(1)}</td>
                        <td className={`${styles.scoreCell} ${getScoreClass(run.scores.integration)}`}>{run.scores.integration.toFixed(1)}</td>
                        <td>
                          {hasErrors && <span className={styles.errorTag}>{run.iterations.flatMap((i) => i.errors || []).map((e) => e.type).join(', ')}</span>}
                          {run.note && (
                            <span className={styles.errorTag} style={{ background: 'rgba(255, 170, 0, 0.15)', color: '#ffaa00' }}>
                              structural
                            </span>
                          )}
                        </td>
                      </tr>
                      {/* Inline Detail Panel */}
                      {selectedRun?.id === run.id && (
                        <tr>
                          <td colSpan={10} style={{ padding: 0, border: 'none' }}>
                            <div className={styles.detailPanel}>
                              <div className={styles.detailHeader}>
                                <div>
                                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#00d4ff' }}>{run.citation}</h3>
                                  <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>
                                    {new Date(run.timestamp).toLocaleString()} • {run.id}
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedRun(null)
                                    setSelectedRunTranscripts([])
                                  }}
                                  style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#888',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                  }}
                                >
                                  Close ✕
                                </button>
                              </div>

                              {/* Scores */}
                              <div className={styles.detailSection}>
                                <div className={styles.detailSectionTitle}>Scores</div>
                                <div className={styles.scoresGrid}>
                                  {(['rac', 'formula', 'parameter', 'integration'] as const).map((key) => (
                                    <div key={key} className={styles.scoreItem}>
                                      <div className={styles.scoreValue} style={{ color: getScoreColor(run.scores[key]) }}>
                                        {run.scores[key].toFixed(1)}
                                      </div>
                                      <div className={styles.scoreLabel}>{key}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Metadata */}
                              <div className={styles.detailSection}>
                                <div className={styles.metaGrid}>
                                  <div className={styles.metaBlock}>
                                    <div>Iterations</div>
                                    <div style={{ color: lastIter?.success ? '#00ff88' : '#ff4466' }}>
                                      {run.iterations.length} {lastIter?.success ? <CheckIcon size={14} /> : <XIcon size={14} />}
                                    </div>
                                  </div>
                                  <div className={styles.metaBlock}>
                                    <div>Duration</div>
                                    <div>{formatDuration(totalDuration)}</div>
                                  </div>
                                  <div className={styles.metaBlock}>
                                    <div>Data source</div>
                                    <div style={{ color: sourceInfo.color }}>{sourceInfo.label}</div>
                                  </div>
                                  {run.note && (
                                    <div className={styles.metaBlock} style={{ flex: '1 1 100%' }}>
                                      <div>Notes</div>
                                      <div style={{ color: '#ffaa00', fontSize: '0.85rem' }}>{run.note}</div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Transcripts */}
                              <div className={styles.detailSection} style={{ borderBottom: 'none' }}>
                                <div className={styles.detailSectionTitle}>Agent transcripts ({selectedRunTranscripts.length})</div>
                                {selectedRunTranscripts.length === 0 ? (
                                  <div style={{ color: '#666', fontStyle: 'italic' }}>
                                    {run.sessionId ? 'Loading transcripts...' : 'No session ID - transcripts not linked'}
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedRunTranscripts.map((t) => (
                                      <div
                                        key={t.id}
                                        style={{
                                          background: 'rgba(0, 0, 0, 0.2)',
                                          border: '1px solid rgba(255,255,255,0.1)',
                                          borderRadius: '6px',
                                          padding: '12px 16px',
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                          <span className={styles.transcriptBadge}>{t.subagent_type}</span>
                                          <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{t.description || 'No description'}</span>
                                        </div>
                                        <span style={{ color: '#00ff88', fontSize: '0.8rem' }}>{t.message_count} msgs</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </section>
        )}

        {/* Transcripts Tab */}
        {activeTab === 'transcripts' && (
          <section className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>
              Agent transcripts
              <span className={styles.sectionCount}>{transcripts.length}</span>
            </h2>

            {transcripts.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <CodeIcon size={48} />
                </div>
                <div className={styles.emptyStateTitle}>No agent transcripts yet</div>
                <div className={styles.emptyStateDesc}>Run an encoding task to capture transcripts.</div>
              </div>
            ) : (
              <div className={styles.transcriptList}>
                {transcripts.map((t) => {
                  const isExpanded = expandedTranscript === t.id
                  return (
                    <div key={t.id} className={styles.transcriptCard}>
                      <div
                        className={`${styles.transcriptHeader} ${isExpanded ? styles.transcriptHeaderExpanded : ''}`}
                        onClick={() => setExpandedTranscript(isExpanded ? null : t.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span className={styles.transcriptBadge}>{t.subagent_type}</span>
                          <span style={{ fontWeight: 500 }}>{t.description || 'No description'}</span>
                        </div>
                        <div className={styles.transcriptMeta}>
                          <span style={{ color: '#888', fontSize: '0.85rem' }}>{new Date(t.created_at).toLocaleString()}</span>
                          <span style={{ color: '#00ff88', fontSize: '0.85rem' }}>{t.message_count} messages</span>
                          <span style={{ color: '#00d4ff' }}>{isExpanded ? '▼' : '▶'}</span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className={styles.transcriptContent}>
                          {t.orchestrator_thinking && (
                            <div className={styles.orchestratorThinking}>
                              <div style={{ color: '#a78bfa', fontSize: '0.75rem', marginBottom: '8px', fontWeight: 600 }}>ORCHESTRATOR THINKING</div>
                              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.8rem', color: '#ccc', maxHeight: '200px', overflow: 'auto' }}>
                                {t.orchestrator_thinking}
                              </pre>
                            </div>
                          )}
                          <div className={styles.timelineControls}>
                            <span style={{ color: '#888', fontSize: '0.8rem' }}>{t.message_count} events</span>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                              <input type="checkbox" checked={showTimestamps} onChange={(e) => setShowTimestamps(e.target.checked)} />
                              <span style={{ color: '#888', fontSize: '0.8rem' }}>Show timestamps</span>
                            </label>
                          </div>
                          <div className={styles.timeline}>
                            <div style={{ color: '#666', fontStyle: 'italic' }}>Full transcript view available when connected to Supabase</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* SDK Sessions Tab */}
        {activeTab === 'sdk' && (
          <section className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>
              Encoding missions
              <span className={styles.sectionCount}>{sdkSessions.length}</span>
            </h2>

            {sdkSessions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <RocketIcon size={48} />
                </div>
                <div className={styles.emptyStateTitle}>No missions recorded yet</div>
                <div className={styles.emptyStateDesc}>
                  Run <code style={{ background: 'rgba(0, 212, 255, 0.1)', padding: '3px 8px', borderRadius: '4px', color: '#00d4ff' }}>autorac sync-sdk-sessions</code> to
                  sync from experiments.db
                </div>
              </div>
            ) : (
              <div className={styles.sessionList}>
                {sdkSessions.map((session) => {
                  const duration = session.ended_at ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000) : null

                  return (
                    <div key={session.id} className={styles.sessionCard} onClick={() => handleSelectSDKSession(session)}>
                      <div className={styles.sessionGlow} />
                      <div className={styles.sessionHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span className={styles.sessionBadge}>Mission</span>
                          <code className={styles.sessionId}>{session.id}</code>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(session.started_at).toLocaleDateString()}</div>
                          <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'JetBrains Mono, monospace' }}>
                            {new Date(session.started_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className={styles.sessionStats}>
                        <div className={styles.sessionStat}>
                          <div>Duration</div>
                          <div style={{ color: '#00d4ff' }}>{duration ? `${Math.floor(duration / 60)}m ${duration % 60}s` : '—'}</div>
                        </div>
                        <div className={styles.sessionStat}>
                          <div>Events</div>
                          <div style={{ color: '#a78bfa' }}>{session.event_count.toLocaleString()}</div>
                        </div>
                        <div className={styles.sessionStat}>
                          <div>Tokens</div>
                          <div style={{ color: '#00ff88' }}>{(session.input_tokens + session.output_tokens).toLocaleString()}</div>
                        </div>
                        <div className={styles.sessionStat}>
                          <div>Cost</div>
                          <div style={{ color: '#ff6b35' }}>${session.estimated_cost_usd.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )}

        {/* Plugin Content Tab */}
        {activeTab === 'plugin' && (
          <section className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>Plugin content</h2>

            <div className={styles.pluginGrid}>
              {/* Agents */}
              <div className={styles.pluginCategory}>
                <h3 className={styles.pluginCategoryTitle}>
                  <CodeIcon size={20} />
                  Agents ({PLUGIN_COMPONENTS.agents.length})
                </h3>
                {PLUGIN_COMPONENTS.agents.map((agent) => (
                  <div key={agent.name} className={styles.pluginItem}>
                    <div className={styles.pluginItemHeader}>
                      <span className={styles.pluginItemName}>{agent.name}</span>
                      <span className={styles.pluginItemLines}>{agent.lines} lines</span>
                    </div>
                    <p className={styles.pluginItemDesc}>{agent.description}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className={styles.pluginCategory}>
                <h3 className={styles.pluginCategoryTitle}>
                  <FolderIcon size={20} />
                  Skills ({PLUGIN_COMPONENTS.skills.length})
                </h3>
                {PLUGIN_COMPONENTS.skills.map((skill) => (
                  <div key={skill.name} className={styles.pluginItem}>
                    <div className={styles.pluginItemHeader}>
                      <span className={styles.pluginItemName}>{skill.name}</span>
                      <span className={styles.pluginItemLines}>{skill.lines} lines</span>
                    </div>
                    <p className={styles.pluginItemDesc}>{skill.description}</p>
                  </div>
                ))}
              </div>

              {/* Commands */}
              <div className={styles.pluginCategory}>
                <h3 className={styles.pluginCategoryTitle}>
                  <TerminalIcon size={20} />
                  Commands ({PLUGIN_COMPONENTS.commands.length})
                </h3>
                {PLUGIN_COMPONENTS.commands.map((cmd) => (
                  <div key={cmd.name} className={styles.pluginItem}>
                    <div className={styles.pluginItemHeader}>
                      <span className={styles.pluginItemName}>{cmd.name}</span>
                      <span className={styles.pluginItemLines}>{cmd.lines} lines</span>
                    </div>
                    <p className={styles.pluginItemDesc}>{cmd.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Known Issues Tab */}
        {activeTab === 'issues' && (
          <section className={styles.tableSection}>
            <h2 className={styles.sectionTitle}>
              Known issues
              <span className={styles.sectionCount}>{KNOWN_ISSUES.length}</span>
            </h2>

            <div className={styles.issuesList}>
              {KNOWN_ISSUES.map((issue) => (
                <div key={issue.id} className={styles.issueCard}>
                  <div className={styles.issueHeader}>
                    <span className={styles.issueIcon}>⚠️</span>
                    <span className={styles.issueTitle}>{issue.title}</span>
                  </div>
                  <div className={styles.issueContent}>
                    <p>{issue.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
