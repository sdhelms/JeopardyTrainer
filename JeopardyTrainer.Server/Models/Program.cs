using JeopardyTrainer.Server.Database;
using JeopardyTrainer.Server.Extensions;
using JeopardyTrainer.Server.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Diagnostics.Metrics;
using System.Reflection.Metadata.Ecma335;
using System.Text.Json;
using System.Threading.Tasks;
using static JeopardyTrainer.Server.Models.Categories;

public class Program
{
    private static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddDbContext<DataContext>(options =>
            options.UseInMemoryDatabase("CountryDb"));
        builder.Services.AddHttpClient();
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("ReactAppPolicy",
                builder => builder
                    .AllowAnyOrigin()
                    .AllowAnyMethod()
                    .AllowAnyHeader());
        });

        var app = builder.Build();

        await app.InitializeDatabaseAsync();

        app.UseCors("ReactAppPolicy");

        app.UseDefaultFiles();
        app.UseStaticFiles();

        // Configure the HTTP request pipeline.
        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        app.MapGet("Categories", () =>
        {
            try
            {
                return Results.Ok(Enum.GetValues<Categories>().Select(e => new Category(e)));
            }
            catch (Exception ex)
            {
                return Results.Problem("An error occurred while retrieving categories.", statusCode: 500);
            }
        });

        app.MapGet("Clues/{category}", async (HttpContext context, DataContext db) =>
        {
            if (!IsValidCategory(context.Request.RouteValues["category"]?.ToString(), out Categories category))
            {
                return Results.NotFound();
            }

            try
            {
                var clue = await GetNextClue(db, category);
                return Results.Ok(clue);
            }
            catch (InvalidOperationException)
            {
                return Results.NotFound();
            }
        });


        app.MapPost("Clues/CheckResponse", async (HttpContext context, DataContext db) =>
        {
            try
            {
                var answer = await context.Request.ReadFromJsonAsync<JeopardyResponse>();
                if (answer == null || answer.Question == null)
                {
                    return Results.BadRequest("Invalid request format");
                }

                var knowledgeArea = answer.Question.GetKnowledgeArea();

                switch (knowledgeArea)
                {
                    case KnowledgeAreas.Countries:
                        var result = await CheckCountryAnswer(db, answer);
                        return Results.Ok(result);
                    case KnowledgeAreas.Shakespeare:
                        return Results.StatusCode(501); // Not Implemented
                    default:
                        return Results.BadRequest($"Knowledge area {knowledgeArea} is not valid.");
                }
            }
            catch (JsonException)
            {
                return Results.BadRequest("Invalid JSON format");
            }
            catch (Exception ex)
            {
                // Log the exception
                return Results.BadRequest($"Invalid request: {ex.Message}");
            }
        });

        app.Run();
    }

    private static async Task<JeopardyClue> GetNextClue(DataContext db, Categories category)
    {
        var knowledgeArea = (KnowledgeAreas)Enum.Parse(typeof(KnowledgeAreas), category.GetDisplayDescription() ?? "");

        switch (knowledgeArea)
        {
            case KnowledgeAreas.Countries:
                return await GetCountryClue(db, category);
            case KnowledgeAreas.Shakespeare:
                throw new NotImplementedException();
            default:
                throw new InvalidOperationException($"Knowledge area {knowledgeArea} is not valid.");
        }
    }

    private static async Task<JeopardyClue> GetCountryClue(DataContext db, Categories category)
    {
        var country = await GetRandomCountry(db);
        string clueValue;

        switch (category)
        {
            case Countries_Flags:
                clueValue = country.Flag;
                break;
            case Countries_WorldCapitals:
                clueValue = country.Capital;
                break;
            case Countries_CountriesByCapital:
                clueValue = country.Name;
                break;
            default:
                throw new InvalidOperationException($"Category value {category} is not valid.");
        }

        return new JeopardyClue(clueValue, category);
    }

    private static async Task<Country> GetRandomCountry(DataContext db)
    {
        var countries = await db.Countries.ToListAsync();
        var random = new Random();
        var randomCountry = countries[random.Next(countries.Count)];
        return randomCountry;
    }

    private static async Task<JeopardyResponseResult> CheckCountryAnswer(DataContext db, JeopardyResponse answer)
    {
        // Find the matching country based on the question category and clue
        Country country;
        string correctAnswer;

        switch (answer.Question.Category)
        {
            case Countries_Flags:
                country = await db.Countries.FirstAsync(c => c.Flag == answer.Question.Clue);
                correctAnswer = country.Name;
                break;
            case Countries_WorldCapitals:
                country = await db.Countries.FirstAsync(c => c.Capital == answer.Question.Clue);
                correctAnswer = country.Name;
                break;
            case Countries_CountriesByCapital:
                country = await db.Countries.FirstAsync(c => c.Name == answer.Question.Clue);
                correctAnswer = country.Capital;
                break;
            default:
                throw new InvalidOperationException($"Category is not valid.");
        }

        // Normalize strings for comparison: trim and remove punctuation
        var normalizedCorrectAnswer = new string(correctAnswer.Trim()
            .Where(c => !char.IsPunctuation(c)).ToArray());
        var normalizedResponse = new string(answer.Response.Trim()
            .Where(c => !char.IsPunctuation(c)).ToArray());

        return new JeopardyResponseResult
        {
            CorrectResponse = correctAnswer,
            IsCorrect = string.Equals(normalizedResponse, normalizedCorrectAnswer, StringComparison.OrdinalIgnoreCase)
        };
    }

    private static bool IsValidCategory(string? categoryString, out Categories category)
    {
        category = default;
        return int.TryParse(categoryString, out int categoryNumber) &&
               Enum.IsDefined(typeof(Categories), categoryNumber) &&
               Enum.TryParse(categoryString, out category);
    }
}
