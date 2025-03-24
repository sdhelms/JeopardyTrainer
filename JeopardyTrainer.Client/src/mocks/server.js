// src/__mocks__/serverMocks.js

// Mock API response data
export const mockCategories = [
    { categoryType: 1, name: "Flags", description: "Countries" },
    { categoryType: 2, name: "World Capitals", description: "Countries" }
];

export const mockClue = {
    clue: "This country's flag has a red maple leaf",
    category: 1
};

export const mockAnswerResponse = {
    isCorrect: true,
    correctResponse: "Canada"
};

// Mock fetch for testing
export const setupMockFetch = () => {
    global.fetch = jest.fn((url, options) => {
        if (url.includes('/Categories')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockCategories)
            });
        }

        if (url.includes('/Clues/1')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockClue)
            });
        }

        if (url.includes('/Clues/CheckResponse')) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockAnswerResponse)
            });
        }

        return Promise.reject(new Error(`Unhandled request: ${url}`));
    });
};

export const resetMockFetch = () => {
    global.fetch.mockClear();
};
