using System;
using System.Collections.Generic;

namespace VfkVisualization.Repositories;

public class VfkDataExport
{
    public string Id { get; set; }
    
    public string FileName { get; set; }
    
    public DateTime CreatedAtUtc { get; set; }

    public ICollection<VfkDataExportPrice> Prices { get; } = [];
}