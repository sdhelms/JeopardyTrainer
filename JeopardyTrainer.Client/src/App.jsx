import { useState } from 'react';
import './App.css';
import JeopardyClue from './JeopardyClue';
import CategoryList from './CategoryList';
import PlayerStats from './PlayerStats';

function App() {
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentClue, setCurrentClue] = useState(null);
    const [loading, setLoading] = useState(false);
    const [correct, setCorrect] = useState(0);
    const [incorrect, setIncorrect] = useState(0);
    const [answered, setAnswered] = useState(false);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const handleNewQuestion = async () => {
        if (!selectedCategory) return;

        if (currentClue && !answered) {
            setIncorrect(prev => prev + 1);
        }

        setLoading(true);
        try {
            const response = await fetch(
                `https://localhost:7247/Clues/${selectedCategory.categoryType}/100`
            );

            if (response.ok) {
                const clue = await response.json();
                setCurrentClue(clue);
                setRefreshKey(prev => prev + 1);
                setAnswered(false);
            }
        } catch (error) {
            console.error('Failed to fetch clue:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSubmit = (isCorrect) => {
        if (isCorrect) {
            setCorrect(prev => prev + 1);
        } else {
            setIncorrect(prev => prev + 1);
        }
        setAnswered(true);
    };

    return (
        <div className="app-container vh-100 d-flex flex-column">
            <h1 className="app-title">Jeopardy! Trainer</h1>
            <div className="content-container flex-grow-1">
                <div className="container h-100">
                    <div className="row h-100 justify-content-center">
                        <div className="col-md-8">
                            <JeopardyClue
                                key={refreshKey}
                                clue={currentClue}
                                onAnswerSubmit={handleAnswerSubmit}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bottom-controls">
                <button
                    onClick={handleNewQuestion}
                    className="new-question-btn"
                    disabled={!selectedCategory || loading}
                >
                    {loading ? 'Loading...' : 'New Question'}
                </button>
            </div>
            <CategoryList
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
            />
            <PlayerStats correct={correct} incorrect={incorrect} />
        </div>
    );
}

export default App;


