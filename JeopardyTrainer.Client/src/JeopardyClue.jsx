import React, { useState } from 'react';
import './JeopardyClue.css';

function JeopardyClue({ clue, onAnswerSubmit }) {
    const [userAnswer, setUserAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        const isCorrect = normalizeString(userAnswer) === normalizeString(clue.expectedResponse);
        onAnswerSubmit(isCorrect);
    };

    const normalizeString = (str) => {
        return str.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase().trim();
    };

    const isImageUrl = (url) => {
        return url.match(/\.(jpeg|jpg|gif|png|svg)$/) != null;
    };

    if (!clue) {
        return (
            <div className="jeopardy-card card">
                <div className="card-body p-0">
                    <div className="answer-display mb-4">
                        <p className="text-center">
                            Select a category and click "New Question" to begin
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="jeopardy-card card">
            <div className="card-body p-0">
                <div className="answer-display mb-4">
                    {isImageUrl(clue.clue) ? (
                        <img src={clue.clue} alt="Clue" className="img-fluid" />
                    ) : (
                        <p className="text-center">
                            {clue.clue}
                        </p>
                    )}
                </div>

                <div className="response-form">
                    <form onSubmit={handleSubmit}>
                        <div className="question-input-group">
                            <div className="d-flex align-items-center mb-3">
                                <label htmlFor="questionInput" className="question-label me-3 mb-0">
                                    What is...
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="questionInput"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Enter your response"
                                    disabled={submitted}
                                    autoComplete="off"
                                />
                            </div>
                            <div className="d-grid">
                                <button
                                    type="submit"
                                    className="btn btn-success submit-button"
                                    disabled={submitted || !userAnswer.trim()}
                                >
                                    Submit Response
                                </button>
                            </div>
                        </div>
                    </form>

                    {submitted && (
                        <div className="response-display fade-in">
                            <p className="h5 mb-2">Your Response:</p>
                            <p className="response-text lead mb-0">What is {userAnswer}?</p>
                            <p className="mt-3">
                                {normalizeString(userAnswer) === normalizeString(clue.expectedResponse)
                                    ? 'Correct!'
                                    : `Incorrect. The correct answer is: What is ${clue.expectedResponse}?`}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default JeopardyClue;