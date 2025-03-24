using JeopardyTrainer.Server.Extensions;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Serialization;

namespace JeopardyTrainer.Server.Models
{
    public class Category
    {
        public Category(Categories categoryType)
        {
            CategoryType = categoryType;
        }

        public Categories CategoryType { get; set; }
        public string Name => CategoryType.GetDisplayName();
        public string KnowledgeArea => CategoryType.GetDisplayDescription() ?? "";
    }

    public enum Categories
    {
        [Display(Name = "Flags", Description = "Countries")]
        Countries_Flags = 1,
        [Display(Name = "World Capitals", Description = "Countries")]
        Countries_WorldCapitals,
        [Display(Name = "Countries by Capital", Description = "Countries")]
        Countries_CountriesByCapital
    }

    public enum KnowledgeAreas
    {
        Countries,
        Shakespeare
    }
}
