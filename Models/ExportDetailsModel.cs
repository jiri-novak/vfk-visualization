using System.Collections.Generic;

namespace VfkVisualization.Models;

public class ExportDetailsModel
{
    public required IReadOnlyCollection<PriceDetailsModel> Prices { get; set; }
}