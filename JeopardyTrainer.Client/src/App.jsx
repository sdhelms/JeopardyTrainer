import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './App.css';
import CategoryList from './CategoryList';

function App() {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentClue, setCurrentClue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [answerResult, setAnswerResult] = useState(null);

    const API_BASE_URL = 'https://localhost:7247';

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/Categories`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('Invalid data format received');
                }

                const validCategories = data.filter(category =>
                    category &&
                    typeof category.categoryType === 'number' &&
                    typeof category.name === 'string'
                );

                setCategories(validCategories);
            } catch (error) {
                setError('Failed to load categories. Please try again later.');
                console.error('Categories fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategorySelect = useCallback((category) => {
        if (typeof category?.categoryType !== 'number') {
            console.error('Invalid category selected');
            return;
        }
        setSelectedCategory(category);
        setCurrentClue(null);
        setUserAnswer('');
        setShowAnswer(false);
        setError(null);
    }, []);

    const handleNewQuestion = useCallback(async () => {
        if (typeof selectedCategory?.categoryType !== 'number') {
            setError('Please select a category first');
            return;
        }

        setLoading(true);
        setError(null);
        setShowAnswer(false);
        setAnswerResult(null); // Reset previous answer result

        try {
            const response = await fetch(
                `${API_BASE_URL}/Clues/${selectedCategory.categoryType}`,
                {
                    headers: {
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const clue = await response.json();
            console.log("Received clue:", clue); // Debug log

            // Validate based on the server's actual model structure
            if (!clue?.clue || !clue?.category) {
                throw new Error('Invalid clue data received');
            }

            setCurrentClue(clue);
            setUserAnswer('');
        } catch (error) {
            setError('Failed to fetch question. Please try again.');
            console.error('Clue fetch error:', error);
            setCurrentClue(null);
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, API_BASE_URL]);

    const handleAnswerSubmit = useCallback(async () => {
        if (!currentClue || (!userAnswer.trim() && showAnswer)) {
            return;
        }

        setLoading(true);
        try {
            // Create the response object according to server model
            const responseData = {
                question: currentClue,
                response: userAnswer.trim()
            };

            console.log("Submitting answer:", responseData); // Debug log

            const response = await fetch(`${API_BASE_URL}/Clues/CheckResponse`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(responseData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Answer result:", result); // Debug log

            setAnswerResult(result);

            // Update the score based on server response
            setScore(prev => ({
                ...prev,
                correct: prev.correct + (result.isCorrect ? 1 : 0),
                incorrect: prev.incorrect + (result.isCorrect ? 0 : 1)
            }));

            setShowAnswer(true);
        } catch (error) {
            setError('Failed to check answer. Please try again.');
            console.error('Answer check error:', error);
        } finally {
            setLoading(false);
        }
    }, [currentClue, userAnswer, API_BASE_URL, showAnswer]);

    const handleSkipQuestion = useCallback(async () => {
        if (!currentClue || showAnswer) return; // Don't skip if answer is already shown
        
        // Send empty string as response to indicate skipped question
        setUserAnswer('');
        await handleAnswerSubmit();
    }, [currentClue, handleAnswerSubmit, showAnswer]);

    const handleKeyPress = useCallback((event) => {
        if (event.key === 'Enter' && userAnswer.trim() && !showAnswer) {
            handleAnswerSubmit();
        }
    }, [handleAnswerSubmit, userAnswer, showAnswer]);

    const isValidUrl = useCallback((string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }, []);

    const renderClue = useCallback(() => {
        if (!currentClue) return null;

        return (
            <div className="clue-display">
                {isValidUrl(currentClue.clue) ? (
                    <div className="image-container">
                        <img
                            src={currentClue.clue}
                            alt="Clue"
                            className="clue-image"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'placeholder-image.png';
                            }}
                            loading="lazy"
                        />
                    </div>
                ) : (
                    <h3>{currentClue.clue}</h3>
                )}
                {showAnswer && answerResult && (
                    <div className={`answer-result ${answerResult.isCorrect ? 'correct' : 'incorrect'}`}>
                        <p>Correct Answer: {answerResult.correctResponse}</p>
                        {userAnswer ? (
                            <p>Your Answer: {userAnswer}</p>
                        ) : (
                            <p>Question skipped</p>
                        )}
                    </div>
                )}
            </div>
        );
    }, [currentClue, showAnswer, userAnswer, isValidUrl, answerResult]);


    const renderContent = () => {
        if (error) {
            return <div className="error-message">{error}</div>;
        }

        if (!selectedCategory) {
            return (
                <div className="welcome-message">
                    <h2>Welcome to Jeopardy! Trainer</h2>
                    <p>Select a category from the left to begin</p>
                </div>
            );
        }

        if (!currentClue) {
            return (
                <div className="start-section">
                    <p>Ready to start with {selectedCategory.name}?</p>
                    <button
                        className="new-question-btn"
                        onClick={handleNewQuestion}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="loading-spinner" />
                        ) : (
                            'New Question'
                        )}
                    </button>
                </div>
            );
        }

        return (
            <div className="clue-section">
                {renderClue()}
                <div className="answer-section">
                    <input
                        type="text"
                        className="answer-input"
                        placeholder="Enter your answer..."
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={showAnswer}
                        aria-label="Answer input"
                    />
                    <div className="buttons-container">
                        {!showAnswer ? (
                            <>
                                <button
                                    className="submit-btn"
                                    onClick={handleAnswerSubmit}
                                    disabled={!userAnswer.trim() || loading}
                                >
                                    {loading ? (
                                        <span className="loading-spinner" />
                                    ) : (
                                        'Submit'
                                    )}
                                </button>
                                <button
                                    className="skip-btn"
                                    onClick={handleSkipQuestion}
                                    disabled={loading}
                                >
                                    Skip
                                </button>
                            </>
                        ) : (
                            <button
                                className="new-question-btn"
                                onClick={handleNewQuestion}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="loading-spinner" />
                                ) : (
                                    'Next Question'
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="app-layout">
            <div className="left-panel">
                <div className="panel-header">
                    <h1 className="app-title">Jeopardy! Trainer</h1>
                </div>

                <CategoryList
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategorySelect={handleCategorySelect}
                    error={error}
                    loading={loading}
                />

                <div className="score-section">
                    <div className="score-content">
                        <div className="score-item">
                            <span className="score-label">Correct:</span>
                            <span className="score-value">{score.correct}</span>
                        </div>
                        <div className="score-item">
                            <span className="score-label">Incorrect:</span>
                            <span className="score-value">{score.incorrect}</span>
                        </div>
                        <div className="score-percentage">
                            {score.correct + score.incorrect > 0
                                ? `${Math.round((score.correct / (score.correct + score.incorrect)) * 100)}%`
                                : '0%'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-content">
                <div className="content-area">
                    <div className="centered-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

App.propTypes = {
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            categoryType: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })
    )
};

export default App;
