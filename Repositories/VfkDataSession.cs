namespace VfkVisualization.Repositories;

public class VfkDataSession
{
    public int Id { get; set; }
    
    public int? ActiveKatuzeKod { get; set; }
    
    public string? ActiveKatuzeName { get; set; }

    public int? ActiveExportId { get; set; }
    
    public VfkDataExport? ActiveExport { get; set; } 
}