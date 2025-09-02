using System;

namespace VfkVisualization.Models;

public class ExportModel
{
    public required string Id { get; set; }
    
    public required DateTimeOffset CreatedAt { get; set; }
}