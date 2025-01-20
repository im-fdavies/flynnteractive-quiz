import React from 'react';

const ScoreModal = ({ score, onRestart }) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold">Quiz Complete!</h2>
      <p className="text-lg mt-2">Your score: {score}</p>
      <button
        className="mt-4 p-2 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={onRestart}
      >
        Restart Quiz
      </button>
    </div>
  );
};

export default ScoreModal;
