namespace JeopardyTrainer.Server.Models
{
    public class JeopardyResponseResult
    {
        public required string CorrectResponse { get; set; }
        public bool IsCorrect { get; set; }
    }
}