import React from 'react';
import PropTypes from 'prop-types';

const ScoreDisplay = ({ score }) => {
    const percentage = score.correct + score.incorrect > 0
        ? Math.round((score.correct / (score.correct + score.incorrect)) * 100)
        : 0;

    return (
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
                    {`${percentage}%`}
                </div>
            </div>
        </div>
    );
};

ScoreDisplay.propTypes = {
    score: PropTypes.shape({
        correct: PropTypes.number.isRequired,
        incorrect: PropTypes.number.isRequired
    }).isRequired
};

export default React.memo(ScoreDisplay);
