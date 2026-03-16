import { useState } from 'react';
import { Link } from 'react-router-dom';

const subjects = [
  {
    name: 'Electrical Fundamentals',
    topics: [
      { name: 'Current', description: 'Flow of electric charge through a conductor. Measured in Amperes (A).', done: true },
      { name: 'Voltage', description: 'The electric potential difference between two points. Measured in Volts (V).', done: true },
      { name: 'Resistance', description: 'Opposition to current flow in a circuit. Measured in Ohms (Ω).', done: false, active: true },
      { name: 'Power', description: 'Rate of energy transfer in a circuit. Measured in Watts (W).', done: false }
    ]
  },
  {
    name: 'Circuit Analysis',
    topics: [
      { name: "Ohm's Law", description: 'V = IR — the fundamental relationship between voltage, current and resistance.', done: false },
      { name: "Kirchhoff's Laws", description: 'Rules for current and voltage in circuit loops and junctions.', done: false },
      { name: 'Series & Parallel', description: 'Two fundamental ways components can be connected in circuits.', done: false }
    ]
  }
];

export default function Learn() {
  const [expandedTopic, setExpandedTopic] = useState(null);

  return (
    <>
      <div className="section-head" style={{ marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Learning Path</h1>
        <Link to="/"><button className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>← Home</button></Link>
      </div>

      {subjects.map(subject => (
        <section key={subject.name} className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>{subject.name}</h2>
          <ul className="path-list">
            {subject.topics.map(topic => (
              <li
                key={topic.name}
                className={`path-item ${topic.done ? 'done' : ''} ${topic.active ? 'active' : ''}`}
                style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch' }}
                onClick={() => setExpandedTopic(expandedTopic === topic.name ? null : topic.name)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="dot">{topic.done ? '✓' : topic.active ? '▶' : '•'}</span>
                  <span style={{ flex: 1 }}>{topic.name}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{expandedTopic === topic.name ? '▲' : '▼'}</span>
                </div>
                {expandedTopic === topic.name && (
                  <div className="topic-detail">
                    <p>{topic.description}</p>
                    {topic.done && <span className="badge" style={{ marginTop: '0.5rem' }}>✓ Completed</span>}
                    {topic.active && <Link to="/quiz"><button style={{ marginTop: '0.75rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}>Start Quiz</button></Link>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
