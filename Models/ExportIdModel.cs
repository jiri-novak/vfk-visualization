using System;

namespace VfkVisualization.Models;

public class ExportIdModel
{
    public required string Id { get; set; }
    
    public required DateTimeOffset CreatedAt { get; set; }
}