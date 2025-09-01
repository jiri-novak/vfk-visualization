using System.Collections.Generic;
using System.Linq;

namespace VfkVisualization.Repositories;

public class VfkDataRepository(VfkDataReadOnlyContext vfkDbReadOnlyContext)
{
    public IEnumerable<VfkData> Get(long telId) {
        return vfkDbReadOnlyContext.Entries.Where(x => x.TelId == telId);
    }

    public IEnumerable<VfkData> Get(IReadOnlyCollection<long> telIds) {
        return vfkDbReadOnlyContext.Entries.Where(x => telIds.Contains(x.TelId));
        // foreach (var telId in telIds)
        // {
        //     foreach (var data in Get(telId))
        //     {
        //         yield return data;
        //     }
        // }
    }
}