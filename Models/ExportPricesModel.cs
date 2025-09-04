using System;
using System.Collections.Generic;

namespace VfkVisualization.Models;

public class ExportPricesModel
{
    public required string Id { get; set; }
    
    public required DateTimeOffset CreatedAt { get; set; }
    
    public required IReadOnlyCollection<PriceModel> Prices { get; set; }
}