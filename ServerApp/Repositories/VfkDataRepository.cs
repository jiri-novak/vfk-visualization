using System.Collections.Generic;
using System.Linq;

public class VfkDataRepository
{
    private readonly VfkDataContext vfkDbContext;

    public VfkDataRepository(VfkDataContext vfkDbContext)
    {
        this.vfkDbContext = vfkDbContext;
    }

    public IEnumerable<VfkData> Get(int telId) {
        return vfkDbContext.Entries.Where(x => x.TelId == telId.ToString());
    }
}