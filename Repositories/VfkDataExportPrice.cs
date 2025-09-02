using System;

namespace VfkVisualization.Repositories;

public class VfkDataExportPrice
{
    public long TelId { get; set; }
    
    public DateTime CreatedAtUtc { get; set; }

    public int CenaNabidkova { get; set; }
    
    public required string Poznamka { get; set; }
    
    public required string ExportId { get; set; }

    public required VfkDataExport Export { get; set; } = null!;
}