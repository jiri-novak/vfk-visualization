namespace VfkVisualization.Repositories;

public class VfkDataLabels
{
    public required long TelId { get; set; }
    
    public required int? CisloLv { get; set; }
    
    public required string? Pracoviste { get; set; } 
    
    public required string? Katuze { get; set; }
    
    public required int KatuzeKod { get; set; }
}