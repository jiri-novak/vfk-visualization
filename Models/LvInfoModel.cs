using System.Collections.Generic;

namespace VfkVisualization.Models;

public class VfkDataModels
{
    public required IReadOnlyCollection<VfkDataModel> Vlastnici { get; set; }
    public PriceModel? Cena { get; set; }
}