import { http, HttpResponse } from 'msw'

export const handlers = [
    http.get('https://localhost:7247/Categories', () => {
        return HttpResponse.json([
            { categoryType: 1, name: "Flags", description: "Countries" },
            { categoryType: 2, name: "World Capitals", description: "Countries" }
        ])
    }),

    http.get('https://localhost:7247/Clues/:categoryId', () => {
        return HttpResponse.json({
            clue: "This country's flag has a red maple leaf",
            category: 1,
            answer: "Canada"
        })
    }),

    http.post('https://localhost:7247/Clues/CheckResponse', () => {
        return HttpResponse.json({
            isCorrect: true,
            correctResponse: "Canada"
        })
    })
]