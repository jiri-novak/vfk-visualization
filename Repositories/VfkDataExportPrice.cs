using System;

namespace VfkVisualization.Repositories;

public class VfkDataExportPrice
{
    public required long TelId { get; set; }
    
    public required DateTime CreatedAtUtc { get; set; }

    public required int? CenaNabidkova { get; set; }
    
    public required string? Poznamka { get; set; }
    
    public required int ExportId { get; set; }
    
    public required float X { get; set; }
    
    public required float Y { get; set; }

    public VfkDataExport Export { get; set; } = null!;
}