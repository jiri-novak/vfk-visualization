using System;
using System.Collections.Generic;

namespace VfkVisualization.Repositories;

public class VfkDataExport
{
    public required string Id { get; set; }
    
    public DateTime CreatedAtUtc { get; set; }

    public ICollection<VfkDataExportPrice> Prices { get; } = [];

    public VfkDataSession? Session { get; set; }
}