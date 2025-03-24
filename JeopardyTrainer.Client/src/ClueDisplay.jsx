import React from 'react';
import PropTypes from 'prop-types';

const ClueDisplay = ({ clue, showAnswer, userAnswer, isValidUrl }) => {
    if (!clue) return null;

    const isAnswerCorrect = showAnswer && userAnswer && clue.expectedResponse
        ? userAnswer.trim().toLowerCase() === clue.expectedResponse.toLowerCase()
        : false;

    return (
        <div className="clue-display">
            {isValidUrl(clue.clue) ? (
                <img
                    src={clue.clue}
                    alt="Clue"
                    className="clue-image"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'placeholder-image.png';
                    }}
                />
            ) : (
                <h3>{clue.clue}</h3>
            )}
            {showAnswer && clue.expectedResponse && (
                <div className={`answer-result ${isAnswerCorrect ? 'correct' : 'incorrect'}`}>
                    <p>Correct Answer: {clue.expectedResponse}</p>
                    <p>Your Answer: {userAnswer || 'No answer provided'}</p>
                </div>
            )}
        </div>
    );
};

ClueDisplay.propTypes = {
    clue: PropTypes.shape({
        clue: PropTypes.string.isRequired,
        expectedResponse: PropTypes.string.isRequired
    }),
    showAnswer: PropTypes.bool,
    userAnswer: PropTypes.string,
    isValidUrl: PropTypes.func.isRequired
};

ClueDisplay.defaultProps = {
    showAnswer: false,
    userAnswer: '',
};

export default React.memo(ClueDisplay);

