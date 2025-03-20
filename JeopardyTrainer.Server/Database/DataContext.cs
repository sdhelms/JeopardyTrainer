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
        private readonly string _countryListFile = "Database/countries.json";

        public DbSet<Country> Countries => Set<Country>();

        public async Task LoadCountryListAsync()
        {
            if (!await Countries.AnyAsync())
            {
                try
                {
                    var countryList = await LoadCountryListFromApi();
                    await Countries.AddRangeAsync(countryList);
                    await SaveChangesAsync();

                    // save the latest result as a backup
                    var jsonData = JsonSerializer.Serialize(countryList);
                    await File.WriteAllTextAsync(_countryListFile, jsonData);
                }
                catch (HttpRequestException)
                {
                    // If API call fails, try to load from file
                    var countryList = LoadCountryListFromFile();
                    await Countries.AddRangeAsync(countryList);
                    await SaveChangesAsync();
                }
            }
        }

        private async Task<List<Country>> LoadCountryListFromApi()
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
            }).ToList();
        }

        private List<Country> LoadCountryListFromFile()
        {
            if (File.Exists(_countryListFile))
            {
                var jsonData = File.ReadAllText(_countryListFile);
                var countryList = JsonSerializer.Deserialize<List<Country>>(jsonData);

                return countryList ?? [];
            } 
            else
            {
                throw new FileNotFoundException($"couldn't locate backup file {_countryListFile}.");
            }
        }
    }
}
