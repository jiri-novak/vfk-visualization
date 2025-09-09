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

    public VfkDataExportPrice? GetExportPrice(long telId)
    {
        return vfkDataReadWriteContext.ExportPrices.AsNoTracking()
            .FirstOrDefault(x => x.TelId == telId);
    }

    public IEnumerable<Ku> GetKus(string? startsWith)
    {
        return vfkDbReadOnlyContext.Kus
            .Where(x => string.IsNullOrEmpty(startsWith) ||
                        x.Name.StartsWith(startsWith))
            .OrderBy(x => x.Name)
            .Take(10);
    }

    public VfkDataExport CreateExport(string name)
    {
        var export = new VfkDataExport
        {
            Name = name,
            CreatedAtUtc = DateTime.UtcNow,
        };

        vfkDataReadWriteContext.Exports.Add(export);
        vfkDataReadWriteContext.SaveChanges();

        return export;
    }

    public void DeleteExport(int id)
    {
        var session = vfkDataReadWriteContext.Sessions.First();
        session.ActiveExport = null;
        session.ActiveExportId = null;
        vfkDataReadWriteContext.SaveChanges();
        
        vfkDataReadWriteContext.Exports.Where(x => x.Id == id).ExecuteDelete();
        vfkDataReadWriteContext.SaveChanges();
    }
    
    public VfkDataExport? GetExport(int id)
    {
        return vfkDataReadWriteContext.Exports
            .Include(x => x.Prices)
            .FirstOrDefault(x => x.Id == id);
    }

    public IEnumerable<VfkDataExport> GetExports(string? startsWith)
    {
        return vfkDataReadWriteContext.Exports.AsNoTracking()
            .Where(x => string.IsNullOrEmpty(startsWith) ||
                        x.Name.StartsWith(startsWith));
    }

    public VfkDataSession GetOrCreateSession()
    {
        var existing = vfkDataReadWriteContext.Sessions.AsNoTracking()
            .Include(x => x.ActiveExport)
            .FirstOrDefault();

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

    public VfkDataSession SetActiveExport(int exportId)
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

    public void SetPrice(long telId, int exportId, int? price)
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

    public void SetComment(long telId, int exportId, string? comment)
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