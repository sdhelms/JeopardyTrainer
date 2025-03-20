using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.IO;
using JeopardyTrainer.Server.Extensions;
using JeopardyTrainer.Server.Models;

namespace JeopardyTrainer.Server.Database
{
    public class DataContext(DbContextOptions<DataContext> options, IHttpClientFactory httpClientFactory) : DbContext(options)
    {
        private readonly IHttpClientFactory _httpClientFactory = httpClientFactory;
        private readonly string _countryDataFile = "Database/countries.json";

        public DbSet<Country> Countries => Set<Country>();

        public async Task LoadCountriesAsync()
        {
            if (!await Countries.AnyAsync())
            {
                try
                {
                    var countries = await LoadCountriesFromApi();
                    await Countries.AddRangeAsync(countries);
                    await SaveChangesAsync();

                    // save the latest result as a backup
                    var jsonData = JsonSerializer.Serialize(countries);
                    await File.WriteAllTextAsync(_countryDataFile, jsonData);
                }
                catch (HttpRequestException)
                {
                    // If API call fails, try to load from file
                    var countries = LoadCountriesFromFile();
                    await Countries.AddRangeAsync(countries);
                    await SaveChangesAsync();
                }
            }
        }

        private async Task<IEnumerable<Country>> LoadCountriesFromApi()
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetStringAsync("https://restcountries.com/v3.1/all");
            var countries = JsonSerializer.Deserialize<JsonElement[]>(response) ?? [];

            return countries.Select(c => new Country
                {
                    Name = c.Get("name")?.Get("common")?.GetString() ?? "",
                    Capital = c.Get("capital")?.EnumerateArray().FirstOrDefault().GetString() ?? "",
                    Region = c.Get("region")?.GetString() ?? "",
                    Flag = c.Get("flags")?.Get("svg")?.GetString() ?? "",
                    Population = c.Get("population")?.GetInt32() ?? 0
                })
                .Where(c => c.Name != "" && c.Capital != "" && c.Region != "" && c.Flag != "" && c.Population > 0);
        }

        private IEnumerable<Country> LoadCountriesFromFile()
        {
            if (File.Exists(_countryDataFile))
            {
                var jsonData = File.ReadAllText(_countryDataFile);
                var countries = JsonSerializer.Deserialize<IEnumerable<Country>>(jsonData);

                return countries ?? [];
            } 
            else
            {
                throw new FileNotFoundException($"couldn't locate backup file {_countryDataFile}.");
            }
        }
    }
}
