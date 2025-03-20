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

internal class Program
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
            return Enum.GetValues<Categories>().Select(e => new Category(e));
        });

        app.MapGet("Clues/{category}/{pointValue}", async (DataContext db, Categories category, int pointValue) =>
        {
            return await GetNextClue(db, category, pointValue);
        });

        app.Run();
    }

    private static async Task<JeopardyClue> GetNextClue(DataContext db, Categories category, int pointValue)
    {
        var knowledgeArea = (KnowledgeAreas)Enum.Parse(typeof(KnowledgeAreas), category.GetDisplayDescription() ?? "");

        switch (knowledgeArea)
        {
            case KnowledgeAreas.Countries:
                return await GetCountryClue(db, category, pointValue);
            case KnowledgeAreas.Shakespeare:
                throw new NotImplementedException();
            default:
                throw new InvalidOperationException($"Knowledge area {knowledgeArea} is not valid.");
        }
    }

    private static async Task<JeopardyClue> GetCountryClue(DataContext db, Categories category, int pointValue)
    {
        var country = await GetRandomCountry(db);

        switch (category)
        {
            case Countries_Flags:
                return new JeopardyClue { Clue = country.Flag, ExpectedResponse = country.Name, PointValue = pointValue };
            case Countries_WorldCapitals:
                return new JeopardyClue { Clue = country.Capital, ExpectedResponse = country.Name, PointValue = pointValue };
            case Countries_CountriesByCapital:
                return new JeopardyClue { Clue = country.Name, ExpectedResponse = country.Capital, PointValue = pointValue };
            default:
                throw new InvalidOperationException($"Category value {category} is not valid.");
        }
    }

    private static async Task<Country> GetRandomCountry(DataContext db)
    {
        var countries = await db.Countries.ToListAsync();
        var random = new Random();
        var randomCountry = countries[random.Next(countries.Count)];
        return randomCountry;
    }

    
}