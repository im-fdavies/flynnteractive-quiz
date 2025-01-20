import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import ScoreModal from './ScoreModal';

const QuizApp = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('/questions.json')
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore(score + 1);
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
    } else {
      setShowModal(true);
    }
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setShowModal(false);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
      {questions.length > 0 && !showModal ? (
        <QuestionCard
          question={questions[currentQuestionIndex]}
          onAnswer={handleAnswer}
        />
      ) : (
        <p>Loading questions...</p>
      )}
      {showModal && <ScoreModal score={score} onRestart={restartQuiz} />}
    </div>
  );
};

export default QuizApp;
