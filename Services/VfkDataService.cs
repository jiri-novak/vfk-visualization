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
                .ToArray();

            ws.Cells.LoadFromCollection(excelData, true, OfficeOpenXml.Table.TableStyles.Light1, BindingFlags.Instance | BindingFlags.Public, membersToInclude);

            p.SaveAs(ms);
        }

        ms.Seek(0, SeekOrigin.Begin);
        return ms;
    }

    public void CreateExport(CreateExportModel export)
    {
        repository.CreateExport(export.Name);
    }

    public IEnumerable<Ku> GetKus(string? startsWith)
    {
        return repository.GetKus(startsWith);
    }
    
    public IEnumerable<VfkDataExport> GetExistingExports(string? startsWith)
    {
        return repository.GetExports(startsWith);
    }

    public VfkDataExport? GetExport(string id)
    {
        return repository.GetExport(id);
    }

    public VfkDataSession GetOrCreateSession()
    {
        return repository.GetOrCreateSession();
    }

    public VfkDataSession SetActiveKatuze(SetActiveKatuzeModel activeKatuze)
    {
        return repository.SetActiveKatuze(activeKatuze.Code, activeKatuze.Name);
    }

    public VfkDataSession SetActiveExport(SetActiveExportModel activeExport)
    {
        return repository.SetActiveExport(activeExport.ExportId);
    }

    public void SetPrice(long telId, string exportId, int? price)
    {
        repository.SetPrice(telId, exportId, price);
    }

    public void SetComment(long telId, string exportId, string? comment)
    {
        repository.SetComment(telId, exportId, comment);
    }
}