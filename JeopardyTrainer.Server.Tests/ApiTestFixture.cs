using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http;
using Microsoft.Extensions.DependencyInjection;
using JeopardyTrainer.Server.Database;
using Microsoft.EntityFrameworkCore;
using JeopardyTrainer.Server.Models;

namespace JeopardyTrainer.Server.Tests
{
    public abstract class ApiTestFixture : IClassFixture<WebApplicationFactory<Program>>
    {
        protected readonly WebApplicationFactory<Program> Factory;
        protected readonly HttpClient Client;

        protected ApiTestFixture(WebApplicationFactory<Program> factory)
        {
            Factory = factory.WithWebHostBuilder(builder =>
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
                    SeedTestDatabase(db);
                });
            });

            Client = Factory.CreateClient();
        }

        private void SeedTestDatabase(DataContext db)
        {
            if (!db.Countries.Any())
            {
                db.Countries.AddRange(
                    new Country
                    {
                        Name = "Canada",
                        Capital = "Ottawa",
                        Flag = "https://example.com/flag/canada.png",
                        Region = "Americas"
                    },
                    new Country
                    {
                        Name = "France",
                        Capital = "Paris",
                        Flag = "https://example.com/flag/france.png",
                        Region = "Europe"
                    }
                );
                db.SaveChanges();
            }
        }
    }
}
