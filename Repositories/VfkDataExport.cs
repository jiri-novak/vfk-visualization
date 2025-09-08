using System;
using System.Collections.Generic;

namespace VfkVisualization.Repositories;

public class VfkDataExport
{
    public int Id { get; set; }
    
    public required string Name { get; set; }
    
    public required DateTime CreatedAtUtc { get; set; }

    public ICollection<VfkDataExportPrice> Prices { get; } = [];

    public VfkDataSession? Session { get; set; }
}