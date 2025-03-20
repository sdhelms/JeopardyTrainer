namespace JeopardyTrainer.Server.Models
{
    public class Country
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Capital { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string Flag { get; set; } = string.Empty;
        public int Population { get; set; }
    }

}
