namespace VfkVisualization.Models;

public class SetPriceModel
{
    public required int ExportId { get; set; }
    
    public required float X { get; set; }
    
    public required float Y { get; set; }
    
    public int? Price { get; set; }
}