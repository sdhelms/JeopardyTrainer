using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using JeopardyTrainer.Server.Models;
using Xunit;
using Microsoft.VisualStudio.TestPlatform.TestHost;

namespace JeopardyTrainer.Server.Tests;

public class CategoryEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CategoryEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetCategories_ReturnsSuccessAndAllCategories()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/Categories");
        var categories = await response.Content.ReadFromJsonAsync<IEnumerable<Category>>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(categories);
        Assert.Equal(3, categories.Count()); // Based on your enum with 3 categories
    }
}
