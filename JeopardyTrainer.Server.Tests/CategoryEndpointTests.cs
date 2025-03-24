using Xunit;
using System.Net.Http.Json;
using JeopardyTrainer.Server.Models;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc.Testing;

namespace JeopardyTrainer.Server.Tests
{
    public class CategoryEndpointTests : ApiTestFixture
    {
        public CategoryEndpointTests(WebApplicationFactory<Program> factory) : base(factory) { }

        [Fact]
        public async Task GetCategories_ReturnsAllCategories()
        {
            // Act
            var response = await Client.GetAsync("/Categories");

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
    }
}
