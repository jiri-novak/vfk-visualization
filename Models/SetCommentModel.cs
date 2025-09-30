namespace VfkVisualization.Models;

public class SetCommentModel
{
    public required int ExportId { get; set; }
    
    public required float X { get; set; }
    
    public required float Y { get; set; }
    
    public required string? Comment { get; set; }
}