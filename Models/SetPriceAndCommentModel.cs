namespace VfkVisualization.Models;

public class SetPriceAndCommentModel
{
    public required int ExportId { get; set; }
    
    public int? Price { get; set; }
    
    public string? Comment { get; set; }
}