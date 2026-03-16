import { Link } from 'react-router-dom';

export default function Profile() {
  return (
    <>
      <div className="section-head" style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Profile</h1>
        <Link to="/"><button className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>← Home</button></Link>
      </div>

      <section className="card" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div className="avatar-placeholder">👤</div>
        <h2 style={{ marginTop: '0.75rem' }}>Student</h2>
        <p className="label">ICTSM Learner</p>
      </section>

      <section className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="card stat-card">
          <p className="label">Total XP</p>
          <strong>120</strong>
        </div>
        <div className="card stat-card">
          <p className="label">Best Streak</p>
          <strong>3 Days</strong>
        </div>
        <div className="card stat-card">
          <p className="label">Quizzes Done</p>
          <strong>4</strong>
        </div>
        <div className="card stat-card">
          <p className="label">Accuracy</p>
          <strong>78%</strong>
        </div>
      </section>

      <section className="card" style={{ marginTop: '1rem' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Recent Activity</h2>
        <ul className="path-list">
          <li className="path-item done">
            <span className="dot">✓</span>
            <span style={{ flex: 1 }}>Current — 5/5</span>
            <span className="label" style={{ margin: 0 }}>+50 XP</span>
          </li>
          <li className="path-item done">
            <span className="dot">✓</span>
            <span style={{ flex: 1 }}>Voltage — 4/5</span>
            <span className="label" style={{ margin: 0 }}>+40 XP</span>
          </li>
          <li className="path-item">
            <span className="dot">▶</span>
            <span style={{ flex: 1 }}>Resistance — In Progress</span>
            <span className="label" style={{ margin: 0 }}>+30 XP</span>
          </li>
        </ul>
      </section>
    </>
  );
}
