import React, { useState, useEffect } from 'react';
import './CategoryList.css';

function CategoryList({ onCategorySelect, selectedCategory }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await fetch('https://localhost:7247/Categories');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const groupCategories = (categories) => {
        return categories.reduce((groups, category) => {
            const area = category.knowledgeArea;
            if (!groups[area]) {
                groups[area] = [];
            }
            groups[area].push(category);
            return groups;
        }, {});
    };

    if (loading) return <div className="category-list category-list-loading">Loading categories...</div>;

    const groupedCategories = groupCategories(categories);

    return (
        <aside className="category-list">
            <h2 className="category-list-title">Categories</h2>
            <div className="category-groups">
                {Object.entries(groupedCategories).map(([area, cats]) => (
                    <div key={area} className="category-group">
                        <h3 className="knowledge-area">{area}</h3>
                        <ul className="category-items">
                            {cats.map(category => (
                                <li
                                    key={category.categoryType}
                                    className={`category-item ${selectedCategory?.categoryType === category.categoryType ? 'selected' : ''}`}
                                    onClick={() => onCategorySelect(category)}
                                >
                                    {category.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </aside>
    );
}

export default CategoryList;
