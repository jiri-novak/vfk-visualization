using System.Collections.Generic;

namespace VfkVisualization.Models;

public class ExportDetailsModel
{
    public required int ExportId { get; set; }
    public required IReadOnlyCollection<PriceDetailsModel> Prices { get; set; }
}