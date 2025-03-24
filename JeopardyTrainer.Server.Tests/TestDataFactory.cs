using JeopardyTrainer.Server.Database;
using JeopardyTrainer.Server.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JeopardyTrainer.Server.Tests
{
    public static class TestDataFactory
    {
        public static Country CreateCanadaCountry() => new()
        {
            Name = "Canada",
            Capital = "Ottawa",
            Flag = "https://example.com/flag/canada.png",
            Region = "Americas"
        };

        public static Country CreateFranceCountry() => new()
        {
            Name = "France",
            Capital = "Paris",
            Flag = "https://example.com/flag/france.png",
            Region = "Europe"
        };

        public static void SeedTestDatabase(DataContext context)
        {
            // Add test countries if they don't exist
            if (!context.Countries.Any())
            {
                context.Countries.AddRange(
                    CreateCanadaCountry(),
                    CreateFranceCountry()
                );
                context.SaveChanges();
            }
        }
    }

}
