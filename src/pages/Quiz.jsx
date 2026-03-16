import { useState } from 'react';
import { Link } from 'react-router-dom';

const sampleQuestions = [
  {
    question: 'What is the unit of electrical resistance?',
    options: ['Volt', 'Ampere', 'Ohm', 'Watt'],
    correct: 2
  },
  {
    question: 'Which law relates voltage, current, and resistance?',
    options: ["Kirchhoff's Law", "Ohm's Law", "Faraday's Law", "Coulomb's Law"],
    correct: 1
  },
  {
    question: 'What does a capacitor store?',
    options: ['Magnetic energy', 'Kinetic energy', 'Electrical charge', 'Heat'],
    correct: 2
  },
  {
    question: 'What is the SI unit of electric current?',
    options: ['Volt', 'Ohm', 'Watt', 'Ampere'],
    correct: 3
  },
  {
    question: 'Which component resists the flow of current?',
    options: ['Capacitor', 'Inductor', 'Resistor', 'Diode'],
    correct: 2
  }
];

export default function Quiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const [answered, setAnswered] = useState(false);

  const q = sampleQuestions[currentQ];

  function handleAnswer(idx) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) setScore(s => s + 1);
  }

  function handleNext() {
    if (currentQ + 1 >= sampleQuestions.length) {
      setFinished(true);
    } else {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  }

  if (finished) {
    return (
      <section className="card quiz-container">
        <h2>Quiz Complete!</h2>
        <div className="quiz-result">
          <span className="score-big">{score}/{sampleQuestions.length}</span>
          <p className="label">Questions Correct</p>
          <p className="xp-earned">+{score * 10} XP earned</p>
        </div>
        <div className="hero-actions">
          <Link to="/"><button>Back to Home</button></Link>
          <button className="secondary" onClick={() => {
            setCurrentQ(0); setScore(0); setSelected(null); setFinished(false); setAnswered(false);
          }}>Retry</button>
        </div>
      </section>
    );
  }

  return (
    <section className="card quiz-container">
      <div className="section-head">
        <h2>Daily Challenge</h2>
        <span>{currentQ + 1}/{sampleQuestions.length}</span>
      </div>
      <div className="quiz-progress">
        <div className="quiz-progress-bar" style={{ width: `${((currentQ + 1) / sampleQuestions.length) * 100}%` }} />
      </div>
      <p className="quiz-question">{q.question}</p>
      <ul className="quiz-options">
        {q.options.map((opt, i) => (
          <li
            key={i}
            className={`quiz-option ${selected === i ? (i === q.correct ? 'correct' : 'wrong') : ''} ${answered && i === q.correct ? 'correct' : ''}`}
            onClick={() => handleAnswer(i)}
          >
            {opt}
          </li>
        ))}
      </ul>
      {answered && (
        <button onClick={handleNext} style={{ marginTop: '1rem', width: '100%' }}>
          {currentQ + 1 >= sampleQuestions.length ? 'See Results' : 'Next Question'}
        </button>
      )}
    </section>
  );
}
