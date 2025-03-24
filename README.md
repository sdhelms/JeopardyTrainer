# Jeopardy Trainer

![CI Status](https://github.com/sdhelms/JeopardyTrainer/workflows/Jeopardy%20Trainer%20CI/badge.svg)

A web application that helps users practice their knowledge in various categories through a Jeopardy-style game format.

## Features

- Browse and select from multiple knowledge categories
- Practice with random questions from selected categories
- Track your score and performance
- Visual clues (images) for certain categories

## Project Structure

This project consists of:

- **.NET 8 Backend**: Provides REST APIs and manages the question database
- **React Frontend**: Modern UI built with React and Vite

## Testing

Frontend tests use Jest and React Testing Library:
- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Generate coverage report

Backend tests use xUnit:
- `dotnet test`: Run all .NET tests

