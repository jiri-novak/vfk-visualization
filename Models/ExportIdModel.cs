using System;

namespace VfkVisualization.Models;

public class ExportIdModel
{
    public required int Id { get; set; }
    
    public required string Name { get; set; }
    
    public required DateTimeOffset CreatedAt { get; set; }
}