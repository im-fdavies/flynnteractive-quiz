import React from 'react';

const ScoreModal = ({ score, total, incorrectQuestions, onRestart, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Quiz Summary</h2>
                <p className="mb-4">Your score: {score} / {total}</p>
                <h3 className="text-lg font-bold mb-2">Incorrect Questions:</h3>
                <ul className="list-disc pl-5 space-y-2">
                    {incorrectQuestions.length > 0 ? (
                        incorrectQuestions.map((question, index) => (
                            <li key={index}>{question.question}</li>
                        ))
                    ) : (
                        <p>No incorrect answers!</p>
                    )}
                </ul>
                <div className="mt-6 flex justify-between">
                    <button
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        onClick={onRestart}
                    >
                        Restart Quiz
                    </button>
                    <button
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScoreModal;
