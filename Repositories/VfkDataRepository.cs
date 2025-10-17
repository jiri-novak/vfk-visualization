using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

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
        // return vfkDbReadOnlyContext.Entries.Where(x => telIds.Contains(x.TelId));
        foreach (var telId in telIds)
        {
            foreach (var data in Get(telId))
            {
                yield return data;
            }
        }
    }

    public IEnumerable<VfkDataLabels> GetLabels(IReadOnlyCollection<long> telIds)
    {
        foreach (var telId in telIds)
        {
            var data = vfkDbReadOnlyContext.Entries
                .Select(x => new { x.TelId, x.LvId, x.Pracoviste, x.KatastralniUzemi, x.KatuzeKod })
                .FirstOrDefault(x => x.TelId == telId);

            if (data != null)
            {
                yield return new VfkDataLabels
                {
                    TelId = data.TelId,
                    CisloLv = data.LvId,
                    Katuze = data.KatastralniUzemi,
                    KatuzeKod = data.KatuzeKod,
                    Pracoviste = data.Pracoviste,
                };
            }
        }
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
                        x.Name.StartsWith(startsWith) ||
                        x.Id.ToString().StartsWith(startsWith))
            .OrderBy(x => x.Name)
            .Take(10);
    }
    
    public IReadOnlyCollection<Ku> GetAllKus()
    {
        return vfkDbReadOnlyContext.Kus
            .OrderBy(x => x.Name)
            .ToList();
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

    public VfkDataSession DeleteExport(int id)
    {
        var session = GetOrCreateSession();
        if (session.ActiveExportId == id)
        {
            session.ActiveExport = null;
            session.ActiveExportId = null;
            vfkDataReadWriteContext.SaveChanges();
        }

        vfkDataReadWriteContext.Exports.Where(x => x.Id == id).ExecuteDelete();
        vfkDataReadWriteContext.SaveChanges();

        return session;
    }
    
    public VfkDataSession RenameExport(int id, string newName)
    {
        var export = vfkDataReadWriteContext.Exports.FirstOrDefault(x => x.Id == id);

        if (export != null)
        {
            export.Name = newName;
            export.CreatedAtUtc = DateTime.UtcNow;
            vfkDataReadWriteContext.SaveChanges();
        }
        
        var session = GetOrCreateSession();
        return session;
    }

    public VfkDataExport? GetExport(int id)
    {
        return vfkDataReadWriteContext.Exports
            .Include(x => x.Prices)
            .FirstOrDefault(x => x.Id == id);
    }

    public IEnumerable<VfkDataExport> GetAllExports()
    {
        return vfkDataReadWriteContext.Exports.AsNoTracking()
            .Include(x => x.Prices)
            .OrderBy(x => x.Name);
    }

    public IEnumerable<VfkDataExport> GetExports(string? startsWith)
    {
        return vfkDataReadWriteContext.Exports.AsNoTracking()
            .Where(x => string.IsNullOrEmpty(startsWith) || x.Name.StartsWith(startsWith))
            .OrderBy(x => x.Name)
            .Take(10);
    }

    public VfkDataSession GetOrCreateSession()
    {
        var existing = vfkDataReadWriteContext.Sessions
            .Include(x => x.ActiveExport)
            .Include(x => x.ActiveExport!.Prices)
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
        var session = GetOrCreateSession();
        session.ActiveKatuzeKod = katuzeCode;
        session.ActiveKatuzeName = katuzeName;
        vfkDataReadWriteContext.SaveChanges();
        return session;
    }

    public VfkDataSession SetNoActiveKatuze()
    {
        var session = GetOrCreateSession();
        session.ActiveKatuzeKod = null;
        session.ActiveKatuzeName = null;
        vfkDataReadWriteContext.SaveChanges();
        return session;
    }

    public VfkDataSession SetActiveExport(int exportId)
    {
        var session = GetOrCreateSession();
        var export = vfkDataReadWriteContext.Exports.FirstOrDefault(x => x.Id == exportId);
        if (export != null)
        {
            session.ActiveExportId = export.Id;
            session.ActiveExport = export;
        }

        vfkDataReadWriteContext.SaveChanges();
        return session;
    }

    public VfkDataSession SetNoActiveExport()
    {
        var session = GetOrCreateSession();
        session.ActiveExportId = null;
        session.ActiveExport = null;
        
        vfkDataReadWriteContext.SaveChanges();
        return session;
    }

    public VfkDataSession SetPriceAndComment(long telId, int exportId, int? price, string? comment)
    {
        vfkDataReadWriteContext.ExportPrices
            .Where(x => x.ExportId == exportId && x.TelId == telId)
            .ExecuteDelete();

        if (price.HasValue || !string.IsNullOrEmpty(comment))
        {
            vfkDataReadWriteContext.ExportPrices
                .Add(new VfkDataExportPrice
                {
                    TelId = telId,
                    CreatedAtUtc = DateTime.UtcNow,
                    CenaNabidkova = price,
                    Poznamka = comment,
                    ExportId = exportId,
                });
            
            vfkDataReadWriteContext.SaveChanges();
        }

        var session = GetOrCreateSession();
        return session;
    }
}