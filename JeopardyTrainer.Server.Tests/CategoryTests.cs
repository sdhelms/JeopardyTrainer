using Xunit;
using JeopardyTrainer.Server.Models;

namespace JeopardyTrainer.Server.Tests
{
    public class CategoryTests
    {
        [Fact]
        public void Category_Constructor_SetsProperties()
        {
            // Arrange & Act
            var category = new Category(Categories.Countries_Flags);

            // Assert
            Assert.Equal(Categories.Countries_Flags, category.CategoryType);
            Assert.Equal("Flags", category.Name);
            Assert.Equal("Countries", category.KnowledgeArea);
        }
    }
}
