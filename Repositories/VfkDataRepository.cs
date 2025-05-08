using System.Collections.Generic;
using System.Linq;

public class VfkDataRepository
{
    private readonly VfkDataContext vfkDbContext;

    public VfkDataRepository(VfkDataContext vfkDbContext)
    {
        this.vfkDbContext = vfkDbContext;
    }

    public IEnumerable<VfkData> Get(long telId) {
        return vfkDbContext.Entries.Where(x => x.TelId == telId);
    }

    public IEnumerable<VfkData> Get(IList<long> telIds) {
        // return vfkDbContext.Entries.Where(x => telIds.Contains(x.TelId));
        foreach (var telId in telIds)
        {
            foreach (var data in Get(telId))
            {
                yield return data;
            }
        }
    }
}