namespace JeopardyTrainer.Server.Models
{
    public class JeopardyResponse
    {
        public required JeopardyClue Question { get; set; }
        public required string Response { get; set; }
    }
}