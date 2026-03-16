export default function App() {
  const topics = [
    { name: 'Current', done: true },
    { name: 'Voltage', done: true },
    { name: 'Resistance', done: false, active: true },
    { name: 'Power', done: false }
  ];

  return (
    <main className="app-shell">
      <section className="hero card">
        <span className="badge">ICTSM Study App</span>
        <h1>ICTSM Zen Learning</h1>
        <p className="subtitle">
          A calm mobile-first space to revise concepts, build streaks, and learn one topic at a time.
        </p>
        <div className="hero-actions">
          <button>Start Daily Challenge</button>
          <button className="secondary">Continue Learning</button>
        </div>
      </section>

      <section className="stats-grid">
        <div className="card stat-card">
          <p className="label">Today&apos;s Goal</p>
          <strong>5 Questions</strong>
        </div>
        <div className="card stat-card">
          <p className="label">XP</p>
          <strong>120</strong>
        </div>
        <div className="card stat-card">
          <p className="label">Streak</p>
          <strong>3 Days</strong>
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <h2>Learning Path</h2>
          <span>Step by step</span>
        </div>
        <ul className="path-list">
          {topics.map((topic) => (
            <li
              key={topic.name}
              className={`path-item ${topic.done ? 'done' : ''} ${topic.active ? 'active' : ''}`.trim()}
            >
              <span className="dot">{topic.done ? '✓' : topic.active ? '▶' : '•'}</span>
              <span>{topic.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
