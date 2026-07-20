import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const ROSTERS_API_URL =
  import.meta.env.VITE_ROSTERS_API_URL
  ?? `${import.meta.env.VITE_ROSTERS_API_BASE_URL ?? 'https://leaderboard.104thbattalionmilsim.com'}/api/rosters`

const CONSOLE_ORDER = {
  xbox: 1,
  playstation: 2,
  pc: 3,
}

function orderedConsoles(consoles) {
  return [...consoles].sort((left, right) => {
    return (CONSOLE_ORDER[left.code] ?? 999) - (CONSOLE_ORDER[right.code] ?? 999)
  })
}

function MemberList({ members }) {
  if (!members.length) {
    return <p className="empty">None</p>
  }

  return (
    <ul className="member-list">
      {members.map((member) => {
        return (
          <li className="member" key={`${member.id}-${member.callsign ?? member.displayName}`}>
            <span className="member-name">{member.displayName}</span>
            <span className="member-designation">{member.callsign ?? '-'}</span>
          </li>
        )
      })}
    </ul>
  )
}

function ConsoleRoster({ consoleRoster, headCadre }) {
  const cadreGroup = consoleRoster.roleGroups.find((group) => group.key === 'cadre')
  const columnGroups = consoleRoster.roleGroups.filter((group) => group.key !== 'cadre')

  return (
    <article className="console-panel">
      <h3 className="console-title">{consoleRoster.name}</h3>
      <section className="leadership-strip leadership-strip-primary">
        <h4 className="leadership-label">{headCadre.label}</h4>
        <MemberList members={headCadre.members} />
      </section>
      {cadreGroup ? (
        <section className="leadership-strip">
          <h4 className="leadership-label">{cadreGroup.label}</h4>
          <MemberList members={cadreGroup.members} />
        </section>
      ) : null}
      <div className="role-grid">
        {columnGroups.map((group) => (
          <section className="role-group" key={group.key}>
            <h4 className="role-label">{group.label}</h4>
            <MemberList members={group.members} />
          </section>
        ))}
      </div>
    </article>
  )
}

function QualificationRoster({ qualification }) {
  const consoles = useMemo(() => orderedConsoles(qualification.consoles), [qualification.consoles])
  const [activeConsoleCode, setActiveConsoleCode] = useState(consoles[0]?.code ?? '')

  useEffect(() => {
    setActiveConsoleCode(consoles[0]?.code ?? '')
  }, [qualification.slug, consoles])

  const activeConsole =
    consoles.find((consoleRoster) => consoleRoster.code === activeConsoleCode)
    ?? consoles[0]

  return (
    <article className="qualification" style={{ '--qual-color': qualification.color ?? '#d8b15f' }}>
      <header className="qualification-header">
        <div>
          <h2>{qualification.name}</h2>
          {qualification.description ? <p>{qualification.description}</p> : null}
        </div>
      </header>

      <nav className="console-tabs" aria-label="Platforms">
        {consoles.map((consoleRoster) => (
          <button
            className="console-tab"
            type="button"
            aria-selected={consoleRoster.code === activeConsole?.code}
            data-platform={consoleRoster.code}
            key={consoleRoster.id}
            onClick={() => setActiveConsoleCode(consoleRoster.code)}
          >
            {consoleRoster.name}
          </button>
        ))}
      </nav>

      {activeConsole ? (
        <ConsoleRoster consoleRoster={activeConsole} headCadre={qualification.headCadre} />
      ) : null}
    </article>
  )
}

function App() {
  const [payload, setPayload] = useState(null)
  const [activeSlug, setActiveSlug] = useState('')
  const [status, setStatus] = useState('Loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadRosters() {
      setStatus('Loading')
      setError(null)

      try {
        const response = await fetch(ROSTERS_API_URL)

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()

        if (!isMounted) {
          return
        }

        setPayload(data)
        setActiveSlug(data.qualifications[0]?.slug ?? '')
        setStatus(
          data.qualifications.length
            ? `Updated ${new Date(data.lastUpdated).toLocaleTimeString()}`
            : 'No rosters',
        )
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        setError(loadError)
        setStatus('Offline')
      }
    }

    loadRosters()

    return () => {
      isMounted = false
    }
  }, [])

  const activeQualification = useMemo(() => {
    return payload?.qualifications.find((qualification) => qualification.slug === activeSlug)
  }, [activeSlug, payload])

  return (
    <>
      <header className="site-header">
        <div>
          <p className="eyebrow">KMC Rosters</p>
          <h1>Qualification Rosters</h1>
        </div>
        <div className="status">{status}</div>
      </header>

      <main>
        {payload?.qualifications.length ? (
          <>
            <label className="qual-select-label" htmlFor="qualificationSelect">
              Qualification
            </label>
            <select
              className="qual-select"
              id="qualificationSelect"
              value={activeSlug}
              onChange={(event) => setActiveSlug(event.target.value)}
            >
              {payload.qualifications.map((qualification) => (
                <option key={qualification.slug} value={qualification.slug}>
                  {qualification.name}
                </option>
              ))}
            </select>

            <nav className="qual-tabs" aria-label="Qualifications">
              {payload.qualifications.map((qualification) => (
                <button
                  className="qual-tab"
                  type="button"
                  aria-selected={qualification.slug === activeSlug}
                  style={{ '--qual-color': qualification.color ?? '#d8b15f' }}
                  key={qualification.slug}
                  onClick={() => setActiveSlug(qualification.slug)}
                >
                  {qualification.name}
                </button>
              ))}
            </nav>
          </>
        ) : null}

        <section className="rosters" aria-live="polite">
          {error ? (
            <div className="error">
              Could not load rosters. Check that the API is running and DATABASE_URL is configured.
            </div>
          ) : null}
          {!error && payload && !payload.qualifications.length ? (
            <p className="empty">No qualification rosters are available.</p>
          ) : null}
          {!error && activeQualification ? (
            <QualificationRoster qualification={activeQualification} />
          ) : null}
        </section>
      </main>
    </>
  )
}

createRoot(document.querySelector('#root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
