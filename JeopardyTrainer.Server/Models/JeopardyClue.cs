using System.Drawing;

namespace JeopardyTrainer.Server.Models
{
    public class JeopardyClue
    {
        public required string Clue { get; set; }
        public required string ExpectedResponse { get; set; }
        public int PointValue { get; set; }
    }
}
