using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using JeopardyTrainer.Server.Models;
using JeopardyTrainer.Server.Database;
using JeopardyTrainer.Server.Extensions;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using static JeopardyTrainer.Server.Models.Categories;
using Microsoft.VisualStudio.TestPlatform.TestHost;

namespace JeopardyTrainer.Server.Tests
{
    public class ProgramTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public ProgramTests(WebApplicationFactory<Program> factory)
        {
            // Configure the factory to use in-memory database with a unique name for tests
            _factory = factory.WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Replace the real DataContext with a test one
                    var serviceProvider = services.BuildServiceProvider();
                    using var scope = serviceProvider.CreateScope();
                    var scopedServices = scope.ServiceProvider;
                    var db = scopedServices.GetRequiredService<DataContext>();

                    // Ensure database is created and seed test data
                    db.Database.EnsureCreated();
                    if (!db.Countries.Any())
                    {
                        db.Countries.Add(new Country
                        {
                            Name = "Canada",
                            Capital = "Ottawa",
                            Flag = "https://example.com/flag/canada.png",
                            Region = "Americas"
                        });
                        db.Countries.Add(new Country
                        {
                            Name = "France",
                            Capital = "Paris",
                            Flag = "https://example.com/flag/france.png",
                            Region = "Europe"
                        });
                        db.SaveChanges();
                    }
                });
            });

            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task GetCategories_ReturnsAllCategories()
        {
            // Act
            var response = await _client.GetAsync("/Categories");

            // Assert
            response.EnsureSuccessStatusCode();

            var categories = await response.Content.ReadFromJsonAsync<List<Category>>();
            Assert.NotNull(categories);
            Assert.Equal(3, categories.Count);

            // Verify category names match expected values
            Assert.Contains(categories, c => c.Name == "Flags");
            Assert.Contains(categories, c => c.Name == "World Capitals");
            Assert.Contains(categories, c => c.Name == "Countries by Capital");
        }

        [Fact]
        public async Task GetClues_WithValidCategory_ReturnsClue()
        {
            // Act
            var response = await _client.GetAsync("/Clues/1"); // 1 = Countries_Flags

            // Assert
            response.EnsureSuccessStatusCode();

            var clue = await response.Content.ReadFromJsonAsync<JeopardyClue>();
            Assert.NotNull(clue);
            Assert.Equal(Categories.Countries_Flags, clue.Category);

            // The clue should be a URL to a flag image
            Assert.StartsWith("https://", clue.Clue);
            Assert.Contains("/flag/", clue.Clue);
        }

        [Fact]
        public async Task CheckResponse_WithCorrectAnswer_ReturnsTrue()
        {
            // Arrange
            var clueResponse = await _client.GetAsync("/Clues/1"); // Get a flag clue
            var clue = await clueResponse.Content.ReadFromJsonAsync<JeopardyClue>();
            Assert.NotNull(clue);

            // Find the country by flag URL
            var country = await GetCountryByFlag(clue.Clue);

            var payload = new JeopardyResponse
            {
                Question = clue,
                Response = country.Name // Correct answer
            };

            // Act
            var response = await _client.PostAsJsonAsync("/Clues/CheckResponse", payload);

            // Assert
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JeopardyResponseResult>();
            Assert.NotNull(result);
            Assert.True(result.IsCorrect);
            Assert.Equal(country.Name, result.CorrectResponse);
        }

        [Fact]
        public async Task CheckResponse_WithIncorrectAnswer_ReturnsFalse()
        {
            // Arrange
            var clueResponse = await _client.GetAsync("/Clues/1"); // Get a flag clue
            var clue = await clueResponse.Content.ReadFromJsonAsync<JeopardyClue>();
            Assert.NotNull(clue);

            // Find the country by flag URL
            var country = await GetCountryByFlag(clue.Clue);

            var payload = new JeopardyResponse
            {
                Question = clue,
                Response = "Wrong Answer"
            };

            // Act
            var response = await _client.PostAsJsonAsync("/Clues/CheckResponse", payload);

            // Assert
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JeopardyResponseResult>();
            Assert.NotNull(result);
            Assert.False(result.IsCorrect);
            Assert.Equal(country.Name, result.CorrectResponse);
        }

        private async Task<Country> GetCountryByFlag(string flagUrl)
        {
            using var scope = _factory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();
            return await dbContext.Countries.FirstAsync(c => c.Flag == flagUrl);
        }
    }

    public class ExtensionsTests
    {
        [Fact]
        public void GetDisplayName_ReturnsCorrectName()
        {
            // Arrange
            var category = Categories.Countries_Flags;

            // Act
            var displayName = category.GetDisplayName();

            // Assert
            Assert.Equal("Flags", displayName);
        }

        [Fact]
        public void GetDisplayDescription_ReturnsCorrectDescription()
        {
            // Arrange
            var category = Categories.Countries_WorldCapitals;

            // Act
            var description = category.GetDisplayDescription();

            // Assert
            Assert.Equal("Countries", description);
        }

        [Fact]
        public void GetJson_ReturnsCorrectPropertyValue()
        {
            // Arrange
            var json = JsonDocument.Parse(@"{""name"": ""Test"", ""age"": 30}").RootElement;

            // Act
            var nameElement = json.Get("name");
            var ageElement = json.Get("age");
            var missingElement = json.Get("missing");

            // Assert
            Assert.NotNull(nameElement);
            Assert.Equal("Test", nameElement?.GetString());

            Assert.NotNull(ageElement);
            Assert.Equal(30, ageElement?.GetInt32());

            Assert.Null(missingElement);
        }

        [Fact]
        public void GetJsonByIndex_ReturnsCorrectArrayElement()
        {
            // Arrange
            var json = JsonDocument.Parse(@"[""first"", ""second"", ""third""]").RootElement;

            // Act
            var firstElement = json.Get(0);
            var secondElement = json.Get(1);
            var outOfRangeElement = json.Get(10);

            // Assert
            Assert.NotNull(firstElement);
            Assert.Equal("first", firstElement?.GetString());

            Assert.NotNull(secondElement);
            Assert.Equal("second", secondElement?.GetString());

            Assert.Null(outOfRangeElement);
        }
    }

    public class CategoryTests
    {
        [Fact]
        public void Category_Constructor_SetsProperties()
        {
            // Arrange & Act
            var category = new Category(Categories.Countries_Flags);

            // Assert
            Assert.Equal(Categories.Countries_Flags, category.CategoryType);
            Assert.Equal("Flags", category.Name);
            Assert.Equal("Countries", category.KnowledgeArea);
        }
    }

    public class JeopardyClueTests
    {
        [Fact]
        public void JeopardyClue_Constructor_SetsProperties()
        {
            // Arrange & Act
            var clue = new JeopardyClue("Test clue", Categories.Countries_WorldCapitals);

            // Assert
            Assert.Equal("Test clue", clue.Clue);
            Assert.Equal(Categories.Countries_WorldCapitals, clue.Category);
        }

        [Fact]
        public void GetKnowledgeArea_ReturnsCorrectArea()
        {
            // Arrange
            var clue = new JeopardyClue("Test clue", Categories.Countries_WorldCapitals);

            // Act
            var area = clue.GetKnowledgeArea();

            // Assert
            Assert.Equal(KnowledgeAreas.Countries, area);
        }
    }
}

