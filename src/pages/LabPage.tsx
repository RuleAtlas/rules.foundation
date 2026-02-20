import { useState, useEffect, Fragment } from 'react'
import * as styles from '../styles/lab.css'
import Header from '../components/Header'
import {
  RocketIcon,
} from '../components/Icons'
import {
  getSDKSessions,
  getSDKSessionEvents,
  SDKSession,
  SDKSessionEvent,
} from '../lib/supabase'

export default function LabPage() {
  const [sdkSessions, setSdkSessions] = useState<SDKSession[]>([])
  const [selectedSDKSession, setSelectedSDKSession] = useState<SDKSession | null>(null)
  const [sdkSessionEvents, setSdkSessionEvents] = useState<SDKSessionEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const sessions = await getSDKSessions(50)
        setSdkSessions(sessions)
      } catch (err) {
        console.error('Failed to fetch sessions:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSelectSDKSession = async (session: SDKSession) => {
    if (selectedSDKSession?.id === session.id) {
      setSelectedSDKSession(null)
      setSdkSessionEvents([])
      return
    }
    setSelectedSDKSession(session)
    setSdkSessionEvents([])
    setLoadingEvents(true)
    const events = await getSDKSessionEvents(session.id, 2000)
    setSdkSessionEvents(events)
    setLoadingEvents(false)
  }

  const totalTokens = sdkSessions.reduce((acc, s) => acc + s.input_tokens + s.output_tokens, 0)
  const totalCost = sdkSessions.reduce((acc, s) => acc + s.estimated_cost_usd, 0)

  return (
    <div className={styles.page}>
      <div className={styles.gridOverlay} />
      <Header variant="lab" />

      <div className={styles.container}>
        <header className={styles.pageHeader}>
          <div className={styles.headerTop}>
            <span className={styles.labBadge}>Encoding lab</span>
            <h1 className={styles.headerTitle}>AutoRAC</h1>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Sessions:</span>
              <span className={styles.metaValue}>{sdkSessions.length}</span>
            </span>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Tokens:</span>
              <span className={styles.metaValue}>{totalTokens.toLocaleString()}</span>
            </span>
            <span className={styles.metaItem}>
              <span className={styles.metaLabel}>Cost:</span>
              <span className={styles.metaValue}>${totalCost.toFixed(2)}</span>
            </span>
          </div>
        </header>

        {isLoading ? (
          <div className={`${styles.statusBanner} ${styles.statusBannerLoading}`}>
            <span style={{ fontSize: '1.5rem' }}>⏳</span>
            <div>Loading sessions...</div>
          </div>
        ) : (
          <section className={styles.tableSection}>
            {sdkSessions.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <RocketIcon size={48} />
                </div>
                <div className={styles.emptyStateTitle}>No encoding sessions yet</div>
                <div className={styles.emptyStateDesc}>
                  Run <code style={{ background: 'rgba(0, 212, 255, 0.1)', padding: '3px 8px', borderRadius: '4px', color: '#00d4ff' }}>autorac sync-sdk-sessions</code> to
                  sync from experiments.db
                </div>
              </div>
            ) : (
              <div className={styles.sessionList}>
                {sdkSessions.map((session) => {
                  const duration = session.ended_at ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000) : null
                  const isSelected = selectedSDKSession?.id === session.id

                  const agentPhases = isSelected ? sdkSessionEvents.filter(e => e.event_type === 'agent_start') : []
                  const toolCounts: Record<string, number> = {}
                  if (isSelected) {
                    for (const e of sdkSessionEvents) {
                      if (e.tool_name) {
                        toolCounts[e.tool_name] = (toolCounts[e.tool_name] || 0) + 1
                      }
                    }
                  }

                  return (
                    <Fragment key={session.id}>
                      <div className={styles.sessionCard} onClick={() => handleSelectSDKSession(session)} style={{
                        borderColor: isSelected ? 'rgba(0, 212, 255, 0.5)' : undefined,
                      }}>
                        <div className={styles.sessionGlow} />
                        <div className={styles.sessionHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className={styles.sessionBadge}>Mission</span>
                            <code className={styles.sessionId}>{session.id}</code>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(session.started_at).toLocaleDateString()}</div>
                              <div style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'JetBrains Mono, monospace' }}>
                                {new Date(session.started_at).toLocaleTimeString()}
                              </div>
                            </div>
                            <span style={{ color: '#00d4ff', fontSize: '0.9rem' }}>{isSelected ? '▼' : '▶'}</span>
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

                      {isSelected && (
                        <div className={styles.detailPanel}>
                          {loadingEvents ? (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>Loading events...</div>
                          ) : (
                            <>
                              {/* Agent phases */}
                              <div className={styles.detailSection}>
                                <div className={styles.detailSectionTitle}>Agent phases ({agentPhases.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {agentPhases.map((phase, i) => {
                                    const endPhase = sdkSessionEvents.find(
                                      e => e.event_type === 'agent_end' && e.sequence > phase.sequence &&
                                        sdkSessionEvents.filter(x => x.event_type === 'agent_start' && x.sequence > phase.sequence && x.sequence < e.sequence).length === 0
                                    )
                                    const phaseEvents = sdkSessionEvents.filter(
                                      e => e.sequence >= phase.sequence && e.sequence <= (endPhase?.sequence ?? phase.sequence + 999999)
                                    )
                                    const phaseToolCounts: Record<string, number> = {}
                                    for (const e of phaseEvents) {
                                      if (e.tool_name) phaseToolCounts[e.tool_name] = (phaseToolCounts[e.tool_name] || 0) + 1
                                    }
                                    const prompt = (phase.content || '').slice(0, 200)

                                    return (
                                      <div key={phase.id} style={{
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        borderRadius: '6px',
                                        padding: '12px 16px',
                                      }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                          <span style={{ color: '#00d4ff', fontWeight: 600, fontSize: '0.85rem' }}>Phase {i + 1}</span>
                                          <span style={{ color: '#888', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                                            {phaseEvents.length} events
                                          </span>
                                        </div>
                                        {prompt && (
                                          <div style={{ color: '#ccc', fontSize: '0.8rem', marginBottom: '8px', lineHeight: 1.4 }}>
                                            {prompt}{phase.content && phase.content.length > 200 ? '...' : ''}
                                          </div>
                                        )}
                                        {Object.keys(phaseToolCounts).length > 0 && (
                                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {Object.entries(phaseToolCounts).sort((a, b) => b[1] - a[1]).map(([tool, count]) => (
                                              <span key={tool} style={{
                                                background: 'rgba(167, 139, 250, 0.1)',
                                                color: '#a78bfa',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: '0.7rem',
                                                fontFamily: 'JetBrains Mono, monospace',
                                              }}>
                                                {tool} ×{count}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                  {agentPhases.length === 0 && sdkSessionEvents.length > 0 && (
                                    <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.85rem' }}>
                                      No agent phases found in {sdkSessionEvents.length} events
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Tool usage summary */}
                              {Object.keys(toolCounts).length > 0 && (
                                <div className={styles.detailSection}>
                                  <div className={styles.detailSectionTitle}>Tool usage</div>
                                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {Object.entries(toolCounts).sort((a, b) => b[1] - a[1]).map(([tool, count]) => (
                                      <div key={tool} style={{
                                        background: 'rgba(0, 255, 136, 0.05)',
                                        border: '1px solid rgba(0, 255, 136, 0.15)',
                                        borderRadius: '6px',
                                        padding: '8px 14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                      }}>
                                        <span style={{ color: '#00ff88', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>{tool}</span>
                                        <span style={{ color: '#888', fontSize: '0.75rem' }}>×{count}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Session metadata */}
                              <div className={styles.detailSection} style={{ borderBottom: 'none' }}>
                                <div className={styles.detailSectionTitle}>Session info</div>
                                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                                  {session.model && (
                                    <div><span style={{ color: '#888' }}>Model: </span><span style={{ color: '#ccc' }}>{session.model}</span></div>
                                  )}
                                  <div><span style={{ color: '#888' }}>Input tokens: </span><span style={{ color: '#00ff88' }}>{session.input_tokens.toLocaleString()}</span></div>
                                  <div><span style={{ color: '#888' }}>Output tokens: </span><span style={{ color: '#00ff88' }}>{session.output_tokens.toLocaleString()}</span></div>
                                  {session.cache_read_tokens > 0 && (
                                    <div><span style={{ color: '#888' }}>Cache tokens: </span><span style={{ color: '#a78bfa' }}>{session.cache_read_tokens.toLocaleString()}</span></div>
                                  )}
                                  <div><span style={{ color: '#888' }}>Events loaded: </span><span style={{ color: '#ccc' }}>{sdkSessionEvents.length} of {session.event_count}</span></div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </Fragment>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
