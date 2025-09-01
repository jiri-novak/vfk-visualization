using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using OfficeOpenXml;
using ServerApp.Controllers;
using ServerApp.Services;
using VfkVisualization.Repositories;

namespace VfkVisualization.Services;

public class VfkDataService(VfkDataRepository repository)
{
    public IEnumerable<VfkData> Get(long telId)
    {
        return repository.Get(telId);
    }

    public Stream Export(IReadOnlyCollection<LvRefModel> lvRefs)
    {
        var refs = lvRefs.ToDictionary(x => x.TelId, x => x);
        var data = repository.Get(lvRefs.Select(x => x.TelId).ToList());
        var excelData = new List<VfkData>();

        foreach (var d in data)
        {
            var @ref = refs[d.TelId];
                
            if (@ref.Cena.HasValue)
            {
                d.CenaM2 = @ref.Cena.Value;
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
                .Where(a => !Attribute.IsDefined(a, typeof(EpplusIgnore)))
                .ToArray();

            ws.Cells.LoadFromCollection(excelData, true, OfficeOpenXml.Table.TableStyles.Light1, BindingFlags.Instance | BindingFlags.Public, membersToInclude);

            p.SaveAs(ms);
        }

        ms.Seek(0, SeekOrigin.Begin);
        return ms;
    }
}