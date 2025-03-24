using JeopardyTrainer.Server.Database;
using JeopardyTrainer.Server.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace JeopardyTrainer.Server.Tests
{
    public static class TestHelpers
    {
        public static async Task<Country> GetCountryByFlag(
            WebApplicationFactory<Program> factory, string flagUrl)
        {
            using var scope = factory.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<DataContext>();
            return await dbContext.Countries.FirstAsync(c => c.Flag == flagUrl);
        }

        public static async Task VerifyCorrectAnswerResponse(
            HttpResponseMessage response, string expectedAnswer)
        {
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<JeopardyResponseResult>();
            Assert.NotNull(result);
            Assert.True(result.IsCorrect);
            Assert.Equal(expectedAnswer, result.CorrectResponse);
        }
    }

}
