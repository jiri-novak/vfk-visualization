using System.Collections.Generic;

namespace VfkVisualization.Models;

public class LvInfoModel
{
    public required IReadOnlyCollection<VfkDataModel> Vlastnici { get; set; }
    public PriceModel? Cena { get; set; }
}