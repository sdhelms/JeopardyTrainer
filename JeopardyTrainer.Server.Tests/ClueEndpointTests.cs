using Xunit;
using System.Net.Http.Json;
using JeopardyTrainer.Server.Models;
using JeopardyTrainer.Server.Database;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace JeopardyTrainer.Server.Tests
{
    public class ClueEndpointTests : ApiTestFixture
    {
        public ClueEndpointTests(WebApplicationFactory<Program> factory) : base(factory) { }

        [Fact]
        public async Task GetClues_WithValidCategory_ReturnsClue()
        {
            // Act
            var response = await Client.GetAsync("/Clues/1"); // 1 = Countries_Flags

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
        public async Task GetClues_WithInvalidCategory_ReturnsNotFound()
        {
            // Act
            var response = await Client.GetAsync("/Clues/999"); // Invalid category

            // Assert
            Assert.Equal(System.Net.HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task CheckResponse_WithCorrectAnswer_ReturnsTrue()
        {
            // Arrange
            var clueResponse = await Client.GetAsync("/Clues/1"); // Get a flag clue
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
            var response = await Client.PostAsJsonAsync("/Clues/CheckResponse", payload);

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
            var clueResponse = await Client.GetAsync("/Clues/1"); // Get a flag clue
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
            var response = await Client.PostAsJsonAsync("/Clues/CheckResponse", payload);

            // Assert
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<JeopardyResponseResult>();
            Assert.NotNull(result);
            Assert.False(result.IsCorrect);
            Assert.Equal(country.Name, result.CorrectResponse);
        }

        [Theory]
        [InlineData(2)]  // Countries_WorldCapitals
        [InlineData(3)]  // Countries_CountriesByCapital
        public async Task GetClues_WithOtherValidCategories_ReturnsClue(int categoryId)
        {
            // Act
            var response = await Client.GetAsync($"/Clues/{categoryId}");

            // Assert
            response.EnsureSuccessStatusCode();

            var clue = await response.Content.ReadFromJsonAsync<JeopardyClue>();
            Assert.NotNull(clue);
            Assert.Equal((Categories)categoryId, clue.Category);
        }

        [Theory]
        [InlineData("abc")]  // Non-numeric
        [InlineData("0")]    // Zero
        [InlineData("-1")]   // Negative
        public async Task GetClues_WithMalformedCategory_ReturnsNotFound(string categoryValue)
        {
            // Act
            var response = await Client.GetAsync($"/Clues/{categoryValue}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Fact]
        public async Task CheckResponse_WithWorldCapitalsCategory_WorksCorrectly()
        {
            // Arrange
            var clueResponse = await Client.GetAsync("/Clues/2"); // World Capitals category
            var clue = await clueResponse.Content.ReadFromJsonAsync<JeopardyClue>();
            Assert.NotNull(clue);

            // Find the country by capital
            using var scope = Factory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();
            var country = await dbContext.Countries.FirstAsync(c => c.Capital == clue.Clue);

            var payload = new JeopardyResponse
            {
                Question = clue,
                Response = country.Name // Correct answer
            };

            // Act
            var response = await Client.PostAsJsonAsync("/Clues/CheckResponse", payload);

            // Assert
            await TestHelpers.VerifyCorrectAnswerResponse(response, country.Name);
        }

        [Fact]
        public async Task CheckResponse_WithCountriesByCapitalCategory_WorksCorrectly()
        {
            // Arrange
            var clueResponse = await Client.GetAsync("/Clues/3"); // Countries by Capital category
            var clue = await clueResponse.Content.ReadFromJsonAsync<JeopardyClue>();
            Assert.NotNull(clue);

            // Find the country by name
            using var scope = Factory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();
            var country = await dbContext.Countries.FirstAsync(c => c.Name == clue.Clue);

            var payload = new JeopardyResponse
            {
                Question = clue,
                Response = country.Capital // Correct answer
            };

            // Act
            var response = await Client.PostAsJsonAsync("/Clues/CheckResponse", payload);

            // Assert
            await TestHelpers.VerifyCorrectAnswerResponse(response, country.Capital);
        }

        [Fact]
        public async Task CheckResponse_WithAnswerContainingPunctuation_StillCorrect()
        {
            // Arrange
            var clueResponse = await Client.GetAsync("/Clues/1"); // Flag clue
            var clue = await clueResponse.Content.ReadFromJsonAsync<JeopardyClue>();
            Assert.NotNull(clue);

            var country = await TestHelpers.GetCountryByFlag(Factory, clue.Clue);

            // Add punctuation to the response
            var responseWithPunctuation = $"{country.Name}!!!,";

            var payload = new JeopardyResponse
            {
                Question = clue,
                Response = responseWithPunctuation
            };

            // Act
            var response = await Client.PostAsJsonAsync("/Clues/CheckResponse", payload);

            // Assert
            await TestHelpers.VerifyCorrectAnswerResponse(response, country.Name);
        }

        [Fact]
        public async Task CheckResponse_WithMalformedRequest_ReturnsBadRequest()
        {
            // Act
            var response = await Client.PostAsJsonAsync("/Clues/CheckResponse", new { InvalidProperty = "value" });

            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }

        private async Task<Country> GetCountryByFlag(string flagUrl)
        {
            using var scope = Factory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();
            return await dbContext.Countries.FirstAsync(c => c.Flag == flagUrl);
        }
    }
}
