using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using OfficeOpenXml;
using VfkVisualization.Models;
using VfkVisualization.Repositories;

namespace VfkVisualization.Services;

public class VfkDataService(VfkDataRepository repository)
{
    public IEnumerable<VfkData> Get(long telId)
    {
        return repository.Get(telId);
    }

    public VfkDataExportPrice? GetExportPrice(long telId)
    {
        return repository.GetExportPrice(telId);
    }

    public Stream Export(VfkDataExport export)
    {
        var refs = export.Prices.ToDictionary(x => x.TelId, x => x);
        var data = repository.Get(export.Prices.Select(x => x.TelId).ToList());
        var excelData = new List<VfkData>();

        foreach (var d in data)
        {
            var @ref = refs[d.TelId];
                
            if (@ref.CenaNabidkova.HasValue)
            {
                d.CenaM2 = @ref.CenaNabidkova.Value;
            }

            d.Poznamka = @ref.Poznamka;
                
            excelData.Add(d);
        }

        var ms = new MemoryStream();

        using (var p = new ExcelPackage())
        {
            var ws = p.Workbook.Worksheets.Add("Nabídka");

            var membersToInclude = typeof(VfkData)
                .GetProperties(BindingFlags.Instance | BindingFlags.Public)
                .Where(a => !Attribute.IsDefined(a, typeof(VfkData.EpplusIgnore)))
                .OrderBy(a => a.GetCustomAttribute<VfkData.EpplusOrder>()!.Order)
                .ToArray();

            ws.Cells.LoadFromCollection(excelData, true, OfficeOpenXml.Table.TableStyles.Light1, BindingFlags.Instance | BindingFlags.Public, membersToInclude);

            p.SaveAs(ms);
        }

        ms.Seek(0, SeekOrigin.Begin);
        return ms;
    }

    public VfkDataExport CreateExport(CreateExportModel export)
    {
        return repository.CreateExport(export.Name);
    }
    
    public VfkDataSession DeleteExport(int exportId)
    {
        return repository.DeleteExport(exportId);
    }

    public IEnumerable<Ku> GetKus(string? startsWith)
    {
        return repository.GetKus(startsWith);
    }
    
    public IEnumerable<VfkDataExport> GetAllExistingExports()
    {
        return repository.GetAllExports();
    }
    
    public IEnumerable<VfkDataExport> GetExistingExports(string? startsWith)
    {
        return repository.GetExports(startsWith);
    }

    public (VfkDataExport? Export, IReadOnlyDictionary<long, VfkDataLabels> Labels) GetExport(int id)
    {
        var export = repository.GetExport(id);
        if (export == null) return (null, new Dictionary<long, VfkDataLabels>());
        var telIds = export.Prices.Select(x => x.TelId).Distinct().ToList();
        var labels = repository.GetLabels(telIds).ToDictionary(x => x.TelId);
        return (export, labels);
    }

    public VfkDataSession GetOrCreateSession()
    {
        return repository.GetOrCreateSession();
    }

    public VfkDataSession SetActiveKatuze(SetActiveKatuzeModel activeKatuze)
    {
        return repository.SetActiveKatuze(activeKatuze.Id, activeKatuze.Name);
    }
    
    public VfkDataSession SetNoActiveKatuze()
    {
        return repository.SetNoActiveKatuze();
    }
    
    public VfkDataSession SetNoActiveExport()
    {
        return repository.SetNoActiveExport();
    }

    public VfkDataSession SetActiveExport(SetActiveExportModel activeExport)
    {
        return repository.SetActiveExport(activeExport.ExportId);
    }

    public VfkDataSession SetPriceAndComment(long telId, int exportId, int? price, string? comment)
    {
        return repository.SetPriceAndComment(telId, exportId, price, comment);
    }
}