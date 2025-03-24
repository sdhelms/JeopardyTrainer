using Xunit;
using JeopardyTrainer.Server.Models;

namespace JeopardyTrainer.Server.Tests
{
    public class JeopardyClueTests
    {
        [Fact]
        public void JeopardyClue_Constructor_SetsProperties()
        {
            // Arrange & Act
            var clue = new JeopardyClue("Test clue", Categories.Countries_WorldCapitals);

            // Assert
            Assert.Equal("Test clue", clue.Clue);
            Assert.Equal(Categories.Countries_WorldCapitals, clue.Category);
        }

        [Fact]
        public void GetKnowledgeArea_ReturnsCorrectArea()
        {
            // Arrange
            var clue = new JeopardyClue("Test clue", Categories.Countries_WorldCapitals);

            // Act
            var area = clue.GetKnowledgeArea();

            // Assert
            Assert.Equal(KnowledgeAreas.Countries, area);
        }
    }
}
