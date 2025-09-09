using System.Linq;
using VfkVisualization.Models;
using VfkVisualization.Repositories;

namespace VfkVisualization.Extensions;

internal static class ModelExtensions
{
    public static VfkDataModel ToModel(this VfkData d)
    {
        var cOr = string.IsNullOrEmpty(d.CisloOrientacni) ? "" : $"/{d.CisloOrientacni}";

        return new VfkDataModel
        {
            Pracoviste = d.Pracoviste,
            Jmeno = string.IsNullOrEmpty(d.Jmeno) ? d.Nazev : $"{d.Jmeno} {d.Prijmeni}",
            Adresa = $"{d.Ulice} {d.CpCe} {d.CisloDomovni}{cOr}, {d.CastObce}, {d.Psc} {d.ObecVl}",
            Podil = d.PodilProcenta,
            PodilM2 = d.PodilM2,
            Typ = d.TypVlastnika,
            Zemedelec = string.IsNullOrEmpty(d.Zemedelec) ? null : d.Zemedelec == "true"
        };
    }

    public static ExportIdModel ToIdModel(this VfkDataExport e)
    {
        return new ExportIdModel
        {
            Id = e.Id,
            Name = e.Name,
            CreatedAt = e.CreatedAtUtc.ToLocalTime(),
        };
    }
    
    public static ExportModel ToModel(this VfkDataExport e)
    {
        return new ExportModel
        {
            Id = e.Id,
            Name = e.Name,
            CreatedAt = e.CreatedAtUtc.ToLocalTime(),
            Prices = e.Prices.Select(x => x.ToModel()).ToList()
        };
    }

    public static PriceModel ToModel(this VfkDataExportPrice p)
    {
        return new PriceModel
        {
            TelId = p.TelId,
            CreatedAtUtc = p.CreatedAtUtc.ToLocalTime(),
            CenaNabidkova = p.CenaNabidkova,
            Poznamka = p.Poznamka
        };
    }

    public static SessionModel ToModel(this VfkDataSession s)
    {
        return new SessionModel
        {
            ActiveKatuzeKod = s.ActiveKatuzeKod,
            ActiveKatuzeName = s.ActiveKatuzeName,
            ActiveExport = s.ActiveExport?.ToModel(),
        };
    }

    public static KuModel ToModel(this Ku k)
    {
        return new KuModel
        {
            Id = k.Id,
            Name = k.Name,
        };
    }
}