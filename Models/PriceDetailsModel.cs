namespace VfkVisualization.Models;

public class PriceDetailsModel : PriceModel
{
    public required string Pracoviste { get; set; }
    
    public required string Ku { get; set; }
    
    public required int CisloLv { get; set; }
}