using System;

namespace VfkVisualization.Models;

public class PriceModel
{
    public required long TelId { get; set; }
    
    public required float X { get; set; }
    
    public required float Y { get; set; }
    
    public required DateTime CreatedAt { get; set; }

    public required int? CenaNabidkova { get; set; }
    
    public required string? Poznamka { get; set; }
}