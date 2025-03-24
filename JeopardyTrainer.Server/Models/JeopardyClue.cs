using JeopardyTrainer.Server.Extensions;
using System.Drawing;

namespace JeopardyTrainer.Server.Models
{
    public class JeopardyClue
    {
        public JeopardyClue(string clue, Categories category)
        {
            this.Clue = clue;
            this.Category = category;
        }

        public string Clue { get; set; }
        public Categories Category { get; set; }

        public KnowledgeAreas GetKnowledgeArea()
        {
            return (KnowledgeAreas)Enum.Parse(typeof(KnowledgeAreas), Category.GetDisplayDescription() ?? "");
        }
    }
}
