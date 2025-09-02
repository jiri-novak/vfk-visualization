using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace VfkVisualization.Repositories;

public class VfkDataRepository(VfkDataReadOnlyContext vfkDbReadOnlyContext, VfkDataReadWriteContext vfkDataReadWriteContext)
{
    public IEnumerable<VfkData> Get(long telId)
    {
        return vfkDbReadOnlyContext.Entries.Where(x => x.TelId == telId);
    }

    public IEnumerable<VfkData> Get(IReadOnlyCollection<long> telIds)
    {
        return vfkDbReadOnlyContext.Entries.Where(x => telIds.Contains(x.TelId));
        // foreach (var telId in telIds)
        // {
        //     foreach (var data in Get(telId))
        //     {
        //         yield return data;
        //     }
        // }
    }

    public void CreateExport(string name)
    {
        var export = new VfkDataExport
        {
            Id = name,
            CreatedAtUtc = DateTime.UtcNow,
        };

        vfkDataReadWriteContext.Exports.Add(export);
        vfkDataReadWriteContext.SaveChanges();
    }

    public IEnumerable<VfkDataExport> GetExports(string startsWith)
    {
        return vfkDataReadWriteContext.Exports.AsNoTracking()
            .Where(x => string.IsNullOrEmpty(startsWith) || 
                        x.Id.ToLower().StartsWith(startsWith.ToLower()));
    }

    public VfkDataSession GetOrCreateSession()
    {
        var existing = vfkDataReadWriteContext.Sessions.AsNoTracking().FirstOrDefault();
        
        if (existing == null)
        {
            existing = new VfkDataSession { Id = 1 };
            vfkDataReadWriteContext.Sessions.Add(existing);
            vfkDataReadWriteContext.SaveChanges();
        }

        return existing;
    }

    public VfkDataSession SetActiveKatuze(int katuzeCode, string katuzeName)
    {
        var session = vfkDataReadWriteContext.Sessions.First();
        session.ActiveKatuzeKod = katuzeCode;
        session.ActiveKatuzeName = katuzeName;
        vfkDataReadWriteContext.SaveChanges();
        return session;
    }
}