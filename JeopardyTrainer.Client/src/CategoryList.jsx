import React from 'react';
import PropTypes from 'prop-types';
import './CategoryList.css';

const CategoryList = ({ categories, selectedCategory, onCategorySelect, error, loading }) => {
    return (
        <div className="categories-section">
            <h2 className="section-title">Categories</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="categories-list">
                {loading ? (
                    <div className="category-item loading">
                        Loading categories...
                    </div>
                ) : categories.length === 0 ? (
                    <div className="category-item">
                        No categories available
                    </div>
                ) : (
                    categories.map((category) => (
                        <div
                            key={category.categoryType}
                            className={`category-item ${selectedCategory?.categoryType === category.categoryType
                                    ? 'selected'
                                    : ''
                                }`}
                            onClick={() => onCategorySelect(category)}
                        >
                            {category.name}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

CategoryList.propTypes = {
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            categoryType: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired
        })
    ).isRequired,
    selectedCategory: PropTypes.shape({
        categoryType: PropTypes.number.isRequired
    }),
    onCategorySelect: PropTypes.func.isRequired,
    error: PropTypes.string,
    loading: PropTypes.bool
};

CategoryList.defaultProps = {
    categories: [],
    error: null,
    loading: false
};

export default React.memo(CategoryList);
