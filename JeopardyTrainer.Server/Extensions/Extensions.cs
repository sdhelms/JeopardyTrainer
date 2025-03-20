using JeopardyTrainer.Server.Database;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Text.Json;

namespace JeopardyTrainer.Server.Extensions
{
    public static class Extensions
    {
        #region ApplicationBuilder

        public static async Task InitializeDatabaseAsync(this IApplicationBuilder app)
        {
            using var scope = app.ApplicationServices.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<DataContext>();
            await context.LoadCountriesAsync();
        }

        #endregion

        #region Enum DisplayAttribute

        /// <summary>
        /// Gets the name from the DisplayAttribute or returns the enum as a string
        /// if there is no DisplayAttribute name
        /// </summary>
        public static string GetDisplayName(this Enum value)
        {
            return value.GetType()
                .GetMember(value.ToString())
                .First()
                .GetCustomAttribute<DisplayAttribute>()
                ?.Name
                ?? value.ToString();
        }

        /// <summary>Gets the description from the DisplayAttribute</summary>
        public static string? GetDisplayDescription(this Enum value)
        {
            return value.GetType()
                .GetMember(value.ToString())
                .FirstOrDefault()
                ?.GetCustomAttribute<DisplayAttribute>()
                ?.Description;
        }

        #endregion

        #region Json

        public static JsonElement? Get(this JsonElement element, string name) =>
            element.ValueKind != JsonValueKind.Null && element.ValueKind != JsonValueKind.Undefined && element.TryGetProperty(name, out var value)
                ? value : null;

        public static JsonElement? Get(this JsonElement element, int index)
        {
            if (element.ValueKind == JsonValueKind.Null || element.ValueKind == JsonValueKind.Undefined)
                return null;
            // Throw if index < 0
            return index < element.GetArrayLength() ? element[index] : null;
        }

        #endregion
    }
}
