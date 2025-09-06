using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using VfkVisualization.Services;

namespace VfkVisualization.Repositories;

public class VfkDataRepository(
    VfkDataReadOnlyContext vfkDbReadOnlyContext,
    VfkDataReadWriteContext vfkDataReadWriteContext)
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

    public IEnumerable<Ku> GetKus(string? startsWith)
    {
        return vfkDbReadOnlyContext.Kus
            .Where(x => string.IsNullOrEmpty(startsWith) ||
                        x.Name.StartsWith(startsWith))
            .OrderBy(x => x.Name)
            .Take(10);
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

    public VfkDataExport? GetExport(string id)
    {
        return vfkDataReadWriteContext.Exports
            .Include(x => x.Prices)
            .FirstOrDefault(x => x.Id == id);
    }
    
    public IEnumerable<VfkDataExport> GetExports(string? startsWith)
    {
        return vfkDataReadWriteContext.Exports.AsNoTracking()
            .Where(x => string.IsNullOrEmpty(startsWith) ||
                        x.Id.StartsWith(startsWith));
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

    public VfkDataSession SetActiveExport(string exportId)
    {
        var session = vfkDataReadWriteContext.Sessions.First();
        var export = vfkDataReadWriteContext.Exports.FirstOrDefault(x => x.Id == exportId);
        if (export != null)
        {
            session.ActiveExportId = export.Id;
            session.ActiveExport = export;
        }

        vfkDataReadWriteContext.SaveChanges();
        return session;
    }

    public void SetPrice(long telId, string exportId, int? price)
    {
        if (price == null)
        {
            vfkDataReadWriteContext.ExportPrices
                .Where(x => x.ExportId == exportId && x.TelId == telId)
                .ExecuteDelete();
        }
        else
        {
            var existing = vfkDataReadWriteContext.ExportPrices
                .FirstOrDefault(x => x.ExportId == exportId && x.TelId == telId);

            if (existing != null)
            {
                existing.CenaNabidkova = price.Value;
                existing.CreatedAtUtc = DateTime.UtcNow;
            }
            else
            {
                vfkDataReadWriteContext.ExportPrices
                    .Add(new VfkDataExportPrice
                    {
                        TelId = telId,
                        CreatedAtUtc = DateTime.UtcNow,
                        CenaNabidkova = price.Value,
                        Poznamka = null,
                        ExportId = exportId,
                    });
            }
        }

        vfkDataReadWriteContext.SaveChanges();
    }

    public void SetComment(long telId, string exportId, string? comment)
    {
        if (comment == null)
        {
            vfkDataReadWriteContext.ExportPrices
                .Where(x => x.ExportId == exportId && x.TelId == telId)
                .ExecuteDelete();
        }
        else
        {
            var existing = vfkDataReadWriteContext.ExportPrices
                .FirstOrDefault(x => x.ExportId == exportId && x.TelId == telId);

            if (existing != null)
            {
                existing.Poznamka = comment;
                existing.CreatedAtUtc = DateTime.UtcNow;
            }
            else
            {
                vfkDataReadWriteContext.ExportPrices
                    .Add(new VfkDataExportPrice
                    {
                        TelId = telId,
                        CreatedAtUtc = DateTime.UtcNow,
                        CenaNabidkova = null,
                        Poznamka = comment,
                        ExportId = exportId,
                    });
            }
        }

        vfkDataReadWriteContext.SaveChanges();
    }
}