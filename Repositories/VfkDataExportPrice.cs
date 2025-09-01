using System;

namespace VfkVisualization.Repositories;

public class VfkDataExportPrice
{
    public long TelId { get; set; }
    
    public DateTime CreatedAtUtc { get; set; }

    public int CenaNabidkova { get; set; }
    
    public string Poznamka { get; set; }
    
    public string ExportId { get; set; }

    public VfkDataExport Export { get; set; } = null!;
}