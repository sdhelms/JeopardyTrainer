// Mock API response data organized by endpoints
const mocks = {
    categories: {
        data: [
            { categoryType: 1, name: "Flags", description: "Flags", knowledgeArea: "Countries" },
            { categoryType: 2, name: "World Capitals", description: "World Capitals", knowledgeArea: "Countries" },
            { categoryType: 3, name: "Countries by Capital", description: "Countries By Capital", knowledgeArea: "Countries" }
        ],
        endpoint: 'Categories'
    },
    clues: {
        data: {
            clue: "This country's flag has a red maple leaf",
            category: 1
        },
        endpoint: 'Clues/1'
    },
    responses: {
        data: {
            isCorrect: true,
            correctResponse: "Canada"
        },
        endpoint: 'Clues/CheckResponse'
    }
};

/**
 * Sets up a mock fetch function that intercepts API calls
 * and returns mock data based on URL patterns
 */
const setupMockFetch = () => {
    global.fetch = jest.fn((url, options) => {
        // Handle Categories endpoint
        if (url.includes(mocks.categories.endpoint)) {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mocks.categories.data)
            });
        }

        // Handle Clues endpoint - with dynamic category parameter
        const clueMatch = url.match(/\/Clues\/(\d+)/);
        if (clueMatch) {
            const categoryId = parseInt(clueMatch[1]);
            // Clone the mock data and adjust for the specific category if needed
            const clueData = { ...mocks.clues.data };
            clueData.category = categoryId;

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(clueData)
            });
        }

        // Handle CheckResponse endpoint
        if (url.includes(mocks.responses.endpoint)) {
            let responseData = mocks.responses.data;

            // If this is a POST with a body, we can examine the request
            if (options && options.body) {
                try {
                    const requestBody = JSON.parse(options.body);
                    // You could customize the response based on the request
                    // For example, if the answer contains "Canada", mark it as correct
                    if (requestBody.response && requestBody.response.toLowerCase().includes("canada")) {
                        responseData = { ...responseData, isCorrect: true };
                    } else if (requestBody.response && requestBody.response.trim() === "") {
                        responseData = { ...responseData, isCorrect: false };
                    }
                } catch (e) {
                    console.error("Error parsing request body:", e);
                }
            }

            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve(responseData)
            });
        }

        // Handle error case for unmatched URLs
        console.error(`Unhandled request: ${url}`);
        return Promise.reject(new Error(`Unhandled request: ${url}`));
    });
};

/**
 * Helper function to create error responses for testing error handling
 * @param {string} endpoint - The endpoint to create an error for
 */
const createErrorResponse = (endpoint) => {
    if (global.fetch && typeof global.fetch.mockImplementation === 'function') {
        global.fetch.mockImplementation((url) => {
            if (url.includes(endpoint)) {
                return Promise.resolve({
                    ok: false,
                    status: 500,
                    statusText: "Internal Server Error",
                    json: () => Promise.reject(new Error("Server error"))
                });
            }

            // Use the default mock implementation for other URLs
            return global.fetch(url);
        });
    }
};

/**
 * Clears the mock and resets any custom implementations
 */
const resetMockFetch = () => {
    if (global.fetch?.mockClear) {
        global.fetch.mockClear();
    }
};

/**
 * Adds additional test data to the mocks object
 * @param {string} key - The key in the mocks object
 * @param {any} data - The data to add
 */
const addMockData = (key, data) => {
    if (mocks[key]) {
        mocks[key].data = data;
    } else {
        mocks[key] = { data, endpoint: `/${key}` };
    }
};

// Export all the mock utilities
module.exports = {
    mocks,
    setupMockFetch,
    resetMockFetch,
    createErrorResponse,
    addMockData
};
