import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Import our test mocks
const { mocks, setupMockFetch, resetMockFetch, createErrorResponse, addMockData } = require('../__mocks__/serverMocks.cjs');

// Setup and teardown for each test
beforeEach(() => {
    setupMockFetch();
    // Add data-testid attributes to help with targeting specific elements
    document.body.innerHTML = '';
});

afterEach(() => {
    resetMockFetch();
});

describe('App Component Initial Rendering', () => {
    test('renders welcome message and app title', async () => {
        // Arrange
        render(<App />);

        // Assert
        expect(screen.getByText('Jeopardy! Trainer')).toBeInTheDocument();

        // Wait for categories to load
        await waitFor(() => {
            expect(screen.getByText('Welcome to Jeopardy! Trainer')).toBeInTheDocument();
            expect(screen.getByText('Select a category from the left to begin')).toBeInTheDocument();
        });
    });

    test('renders category list', async () => {
        // Arrange
        render(<App />);

        // Assert - wait for categories to load
        await waitFor(() => {
            // Find the categories section directly by class name
            const categoriesSection = document.querySelector('.categories-section');

            // Make sure it exists
            expect(categoriesSection).not.toBeNull();

            // Use within to search within the categories section
            expect(within(categoriesSection).getByText('Flags')).toBeInTheDocument();
            expect(within(categoriesSection).getByText('World Capitals')).toBeInTheDocument();
            expect(within(categoriesSection).getByText('Countries by Capital')).toBeInTheDocument();
        });
    });

    test('displays initial score of 0%', async () => {
        // Arrange
        render(<App />);

        // Assert
        await waitFor(() => {
            // Find the score section to narrow the search
            const scoreSection = document.querySelector('.score-section');

            expect(within(scoreSection).getByText('Correct:')).toBeInTheDocument();
            expect(within(scoreSection).getByText('Incorrect:')).toBeInTheDocument();
            expect(within(scoreSection).getByText('0%')).toBeInTheDocument();
        });
    });
});

describe('Category Selection', () => {
    test('selecting a category shows start button', async () => {
        // Arrange
        render(<App />);

        // Act - wait for categories and select one
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        // Assert - check in the main content area
        const mainContent = document.querySelector('.main-content');
        expect(within(mainContent).getByText('Ready to start with Flags?')).toBeInTheDocument();
        expect(within(mainContent).getByText('New Question')).toBeInTheDocument();
    });

    test('can change selected category', async () => {
        // Arrange
        render(<App />);

        // Act - select first category
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        // Assert first selection
        const mainContent = document.querySelector('.main-content');
        expect(within(mainContent).getByText('Ready to start with Flags?')).toBeInTheDocument();

        // Act - change selection
        const capitalsCategory = screen.getByText('World Capitals');
        fireEvent.click(capitalsCategory);

        // Assert new selection
        expect(within(mainContent).getByText('Ready to start with World Capitals?')).toBeInTheDocument();
    });
});

describe('Clue Fetching', () => {
    test('clicking New Question fetches and displays a clue', async () => {
        // Arrange
        render(<App />);

        // Act - select category
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        // Click new question button
        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        // Assert - clue should appear in main content area
        const mainContent = document.querySelector('.main-content');
        await waitFor(() => {
            expect(within(mainContent).getByText("This country's flag has a red maple leaf")).toBeInTheDocument();
        });

        // Verify answer components are present
        expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
    });

    test('handles image-based clues correctly', async () => {
        // Arrange - override with image URL
        addMockData('clues', {
            clue: 'https://example.com/flags/canada.svg',
            category: 1
        });

        render(<App />);

        // Act - select category and get question
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        // Assert - image should appear
        const mainContent = document.querySelector('.main-content');
        await waitFor(() => {
            const image = within(mainContent).getByRole('img', { name: 'Clue' });
            expect(image).toBeInTheDocument();
            expect(image).toHaveAttribute('src', 'https://example.com/flags/canada.svg');
        });
    });

    test('handles API error when fetching clues', async () => {
        // Arrange
        render(<App />);

        // Act - select category
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        // Create error response before clicking button
        createErrorResponse('/Clues/1');

        // Click new question button
        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        // Assert - error should appear in main content area
        const mainContent = document.querySelector('.main-content');
        await waitFor(() => {
            const errorMessages = within(mainContent).getAllByText('Failed to fetch question. Please try again.');
            expect(errorMessages.length).toBeGreaterThan(0);
        });
    });
});

describe('Answer Submission', () => {
    test('submitting correct answer shows success feedback', async () => {
        // Arrange
        render(<App />);

        // Act - go through the flow to get a question
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        const mainContent = document.querySelector('.main-content');
        await waitFor(() => {
            expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
        });

        // Type an answer
        const answerInput = screen.getByPlaceholderText('Enter your answer...');
        fireEvent.change(answerInput, { target: { value: 'Canada' } });

        // Submit answer
        const submitButton = screen.getByRole('button', { name: 'Submit' });
        fireEvent.click(submitButton);

        // Assert - correct answer feedback in the answer-result section
        await waitFor(() => {
            const answerResult = document.querySelector('.answer-result');
            expect(within(answerResult).getByText('Correct Answer: Canada')).toBeInTheDocument();
            expect(within(answerResult).getByText('Your Answer: Canada')).toBeInTheDocument();
        });
        expect(screen.getByRole('button', { name: 'Next Question' })).toBeInTheDocument();

        // Check score update
        const scoreSection = document.querySelector('.score-section');
        expect(within(scoreSection).queryByText('0%')).not.toBeInTheDocument();
        expect(within(scoreSection).getByText('100%')).toBeInTheDocument();
    });

    test('submitting incorrect answer shows failure feedback', async () => {
        // Arrange - override to make answer incorrect
        addMockData('responses', {
            isCorrect: false,
            correctResponse: "Canada"
        });

        render(<App />);

        // Act - go through the flow to get a question
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
        });

        // Type an incorrect answer
        const answerInput = screen.getByPlaceholderText('Enter your answer...');
        fireEvent.change(answerInput, { target: { value: 'USA' } });

        // Submit answer
        const submitButton = screen.getByRole('button', { name: 'Submit' });
        fireEvent.click(submitButton);

        // Assert - failure feedback in the answer-result section
        await waitFor(() => {
            const answerResult = document.querySelector('.answer-result');
            expect(within(answerResult).getByText('Correct Answer: Canada')).toBeInTheDocument();
            expect(within(answerResult).getByText('Your Answer: USA')).toBeInTheDocument();
        });

        // Check score update
        const scoreSection = document.querySelector('.score-section');
        expect(within(scoreSection).queryByText('0%')).toBeInTheDocument();
        expect(within(scoreSection).getByText('0')).toBeInTheDocument(); // correct score
        expect(within(scoreSection).getByText('1')).toBeInTheDocument(); // incorrect score
    });

    test('submitting empty answer is disabled', async () => {
        // Arrange
        render(<App />);

        // Act - get to question stage
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
        });

        // Assert - submit button should be disabled with no input
        const submitButton = screen.getByRole('button', { name: 'Submit' });
        expect(submitButton).toBeDisabled();

        // Type something then clear it
        const answerInput = screen.getByPlaceholderText('Enter your answer...');
        fireEvent.change(answerInput, { target: { value: 'a' } });
        expect(submitButton).not.toBeDisabled();

        fireEvent.change(answerInput, { target: { value: '' } });
        expect(submitButton).toBeDisabled();
    });

    test('skipping question shows correct answer', async () => {
        // Arrange
        render(<App />);

        // Act - get to question stage
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Skip' })).toBeInTheDocument();
        });

        // Skip question
        const skipButton = screen.getByRole('button', { name: 'Skip' });
        fireEvent.click(skipButton);

        // Assert in the answer-result section
        await waitFor(() => {
            const answerResult = document.querySelector('.answer-result');
            expect(within(answerResult).getByText('Correct Answer: Canada')).toBeInTheDocument();
            expect(within(answerResult).getByText('Question skipped')).toBeInTheDocument();
        });

        // Score should update with an incorrect answer
        const scoreSection = document.querySelector('.score-section');
        expect(within(scoreSection).queryByText('0%')).toBeInTheDocument();
        expect(within(scoreSection).getByText('0')).toBeInTheDocument(); // correct score
        expect(within(scoreSection).getByText('1')).toBeInTheDocument(); // incorrect score
    });

    test('can press Enter key to submit answer', async () => {
        // Arrange
        render(<App />);

        // Act - get to question stage
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
        });

        // Type answer and press Enter
        const answerInput = screen.getByPlaceholderText('Enter your answer...');
        fireEvent.change(answerInput, { target: { value: 'Canada' } });
        fireEvent.keyPress(answerInput, { key: 'Enter', code: 'Enter', charCode: 13 });

        // Assert - answer feedback appears
        await waitFor(() => {
            const answerResult = document.querySelector('.answer-result');
            expect(within(answerResult).getByText('Correct Answer: Canada')).toBeInTheDocument();
        });
    });
});

describe('Game Progression', () => {
    test('can continue to next question after answering', async () => {
        // Arrange
        render(<App />);

        // Act - complete a question
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        await waitFor(() => {
            const answerInput = screen.getByPlaceholderText('Enter your answer...');
            fireEvent.change(answerInput, { target: { value: 'Canada' } });
            const submitButton = screen.getByRole('button', { name: 'Submit' });
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Next Question' })).toBeInTheDocument();
        });

        // Get next question
        const nextButton = screen.getByRole('button', { name: 'Next Question' });
        fireEvent.click(nextButton);

        // Assert - new question form appears
        const mainContent = document.querySelector('.main-content');
        await waitFor(() => {
            expect(within(mainContent).getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
            expect(within(mainContent).getByRole('button', { name: 'Submit' })).toBeInTheDocument();
        });

        // Score should be maintained
        const scoreSection = document.querySelector('.score-section');
        expect(within(scoreSection).getByText('1')).toBeInTheDocument(); // correct score
        expect(within(scoreSection).getByText('0')).toBeInTheDocument(); // incorrect score
    });

    test('score percentages calculate correctly', async () => {
        // Arrange
        render(<App />);

        // Act - complete a correct answer
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        await waitFor(() => {
            const answerInput = screen.getByPlaceholderText('Enter your answer...');
            fireEvent.change(answerInput, { target: { value: 'Canada' } });
            const submitButton = screen.getByRole('button', { name: 'Submit' });
            fireEvent.click(submitButton);
        });

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Next Question' })).toBeInTheDocument();
        });

        // Assert - correct percentage
        const scoreSection = document.querySelector('.score-section');
        expect(within(scoreSection).getByText('100%')).toBeInTheDocument();

        // Act - now do an incorrect answer
        addMockData('responses', {
            isCorrect: false,
            correctResponse: "Canada"
        });

        // Get next question
        const nextButton = screen.getByRole('button', { name: 'Next Question' });
        fireEvent.click(nextButton);

        await waitFor(() => {
            const answerInput = screen.getByPlaceholderText('Enter your answer...');
            fireEvent.change(answerInput, { target: { value: 'Wrong' } });
            const submitButton = screen.getByRole('button', { name: 'Submit' });
            fireEvent.click(submitButton);
        });

        // Assert - percentage should now be 50%
        await waitFor(() => {
            expect(within(scoreSection).getByText('50%')).toBeInTheDocument();
        });
    });
});

describe('Error Handling', () => {
    test('shows error when API fails to load categories', async () => {
        // Arrange - simulate API error
        createErrorResponse('/Categories');

        // Act
        render(<App />);

        // Assert in left panel where categories would normally appear
        await waitFor(() => {
            const categoriesSection = document.querySelector('.categories-section');
            const errorMessage = within(categoriesSection).getByText('No categories available');
            expect(errorMessage).toBeInTheDocument();
        });
    });

    test('shows error when submitting answer fails', async () => {
        // Arrange
        render(<App />);

        // Act - get to question
        await waitFor(() => {
            const flagsCategory = screen.getByText('Flags');
            fireEvent.click(flagsCategory);
        });

        const newQuestionBtn = screen.getByText('New Question');
        fireEvent.click(newQuestionBtn);

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Enter your answer...')).toBeInTheDocument();
        });

        // Create error before submitting
        createErrorResponse('/Clues/CheckResponse');

        // Submit answer
        const answerInput = screen.getByPlaceholderText('Enter your answer...');
        fireEvent.change(answerInput, { target: { value: 'Canada' } });
        const submitButton = screen.getByRole('button', { name: 'Submit' });
        fireEvent.click(submitButton);

        // Assert error appears within the main content area
        const mainContent = document.querySelector('.main-content');
        await waitFor(() => {
            const errorMessages = within(mainContent).getAllByText('Failed to check answer. Please try again.');
            expect(errorMessages.length).toBeGreaterThan(0);
        });
    });
});
