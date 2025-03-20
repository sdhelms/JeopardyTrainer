import React from 'react';
import './PlayerStats.css';

function PlayerStats({ correct, incorrect }) {
    const total = correct + incorrect;
    const percentage = total > 0 ? ((correct / total) * 100).toFixed(2) : 0;

    return (
        <aside className="player-stats">
            <h2 className="player-stats-title">Player Stats</h2>
            <div className="stats-item">
                <span>Correct:</span>
                <span>{correct}</span>
            </div>
            <div className="stats-item">
                <span>Incorrect:</span>
                <span>{incorrect}</span>
            </div>
            <div className="stats-item">
                <span>Percentage:</span>
                <span>{percentage}%</span>
            </div>
        </aside>
    );
}

export default PlayerStats;