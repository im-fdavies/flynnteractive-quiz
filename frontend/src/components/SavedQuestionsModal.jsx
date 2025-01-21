import React, { useState, useEffect } from 'react';

const SavedQuestionsModal = ({ onSelect, onClose }) => {
    const [savedFiles, setSavedFiles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavedFiles = async () => {
            try {
                const response = await fetch('http://localhost:8000/saved');
                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Failed to fetch saved files.');
                }

                setSavedFiles(data.files);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchSavedFiles();
    }, []);

    const formatFileName = (file) => {
        const nameWithoutHash = file.split('--')[0];
        const nameWithoutQuestion = nameWithoutHash.replace('questions_', '');
        const nameWithSpaces = nameWithoutQuestion.replace(/_/g, ' ');
        return nameWithSpaces
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    if (error) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="p-4">
                    <p className="text-red-500">{error}</p>
                    <button className="mt-4 bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
                <h2 className="text-lg font-bold mb-4">Saved Questions</h2>
                <ul className="space-y-2">
                    {savedFiles.map((file, index) => (
                        <li key={index}>
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full text-left"
                                onClick={() => onSelect(file)} // Only pass the file name
                            >
                                {formatFileName(file)}
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    className="mt-4 bg-gray-300 px-4 py-2 rounded"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default SavedQuestionsModal;
