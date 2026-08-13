import React, { useState, useEffect } from 'react';
import './DoorConfigurator.css';

export default function DoorConfigurator() {
  const [questions, setQuestions] = useState([]);
  const [doors, setDoors] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [history, setHistory] = useState([1]); // Track visited questions for back button
  const [currentDoorId, setCurrentDoorId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load JSON data
  useEffect(() => {
    Promise.all([
      fetch('/questions.json').then(r => r.json()),
      fetch('/doors.json').then(r => r.json())
    ]).then(([q, d]) => {
      setQuestions(q);
      setDoors(d);
      setLoading(false);
    });
  }, []);

  const currentQuestion = questions.find(q => q.id === currentQuestionId);
  const currentDoor = doors.find(d => d.id === currentDoorId);

  const handleAnswer = (isYes) => {
    const nextId = isYes ? currentQuestion.yesNext : currentQuestion.noNext;

    // Check if nextId is a door ID (string) or question ID (number)
    if (typeof nextId === 'string') {
      setCurrentDoorId(nextId);
    } else {
      setCurrentQuestionId(nextId);
      setHistory([...history, nextId]);
    }
  };

  const handleBack = () => {
    if (currentDoorId) {
      // Going back from a door result
      setCurrentDoorId(null);
    } else if (history.length > 1) {
      // Going back from a question
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentQuestionId(newHistory[newHistory.length - 1]);
    }
  };

  const handleReset = () => {
    setCurrentQuestionId(1);
    setCurrentDoorId(null);
    setHistory([1]);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="configurator-container">
      {/* Header */}
      <header className="configurator-header">
        <div style={{ display: 'flex'}}>
            <div className="logo">
                <img src="/img/ds-trans.png" alt="Dockstar Logo" />
            </div>
            <div className="title">
                <h1>Door Configurator</h1>
            </div>
        </div>
        <nav className="breadcrumb">
          <span>Step {history.length}</span>
        </nav>
      </header>

      {/* Main Content */}
      <main className={`configurator-main${currentQuestion && currentQuestion.recs ? '' : ' no-recs'}`}>
        {currentDoorId && currentDoor ? (
          // DOOR RESULT VIEW
          <div className="door-result">
            <a href={currentDoor.link} target="_blank" rel="noopener noreferrer">
                <img src={currentDoor.imageUrl} alt={currentDoor.name} className="door-image" />
            </a>
            <div className="door-info">
              <a href={currentDoor.link} target="_blank" rel="noopener noreferrer">
                <h2>{currentDoor.name}</h2>
              </a>
              <p className="door-description">{currentDoor.description}</p>
            </div>
          </div>
        ) : currentQuestion ? (
          // QUESTION VIEW
          <div className="question-view">
            <div className="question-section">
              <h2 className="question-text">{currentQuestion.text}</h2>
              {/* <img src={currentQuestion.imageUrl} alt="question" className="question-image" /> */}
            </div>

            {/* Yes/No Buttons */}
            <div className="button-container">
              <button className="answer-button yes-button" onClick={() => handleAnswer(true)}>
                YES
              </button>
              <button className="answer-button no-button" onClick={() => handleAnswer(false)}>
                NO
              </button>
            </div>
          </div>
        ) : null}

        {/* Recommendations at bottom */}
        {currentQuestion && currentQuestion.recs && (
            <div className="recommendations">
                <div style={{display: 'flex'}}>
                    <p className="recs-label">Possible matches:</p>
                    <div className="recs-grid">
                    {currentQuestion.recs.map(recId => {
                        const recDoor = doors.find(d => d.id === recId);
                        return recDoor ? (
                        
                        <div key={recId} className="rec-card">
                            <a href={recDoor.link} target="_blank" rel="noopener noreferrer">
                                <img src={recDoor.imageUrl} alt={recDoor.name} />
                                <p>{recDoor.name}</p>
                            </a>
                        </div>
                        ) : null;
                    })}
                    </div>
                </div>
            </div>
        )}
      </main>

      {/* Footer Navigation */}
      <footer className="configurator-footer">
        <button 
          className="nav-button back-button" 
          onClick={handleBack}
          disabled={history.length === 1 && !currentDoorId}
        >
          BACK
        </button>
        {currentDoorId && (
          <button className="nav-button reset-button" onClick={handleReset}>
            START OVER
          </button>
        )}
      </footer>
    </div>
  );
}