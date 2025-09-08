using System;
using System.Collections.Generic;

namespace VfkVisualization.Models;

public class ExportModel
{
    public required int Id { get; set; }

    public required string Name { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public required IReadOnlyCollection<PriceModel> Prices { get; set; }
}