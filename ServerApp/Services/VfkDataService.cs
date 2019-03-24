using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using OfficeOpenXml;
using ServerApp.Controllers;

namespace ServerApp.Services
{
    public class VfkDataService
    {
        private readonly VfkDataRepository repository;

        public VfkDataService(VfkDataRepository repository)
        {
            this.repository = repository;
        }

        public IEnumerable<VfkData> Get(int telId)
        {
            return repository.Get(telId);
        }

        public Stream Export(IEnumerable<LvRefModel> lvRefs)
        {
            var refs = lvRefs.ToDictionary(x => x.TelId, x => x.Cena);
            var data = repository.Get(lvRefs.Select(x => x.TelId).ToList());

            foreach (var d in data)
            {
                if (refs[d.TelId].HasValue)
                {
                    d.CenaM2 = refs[d.TelId].Value;
                }
            }

            var ms = new MemoryStream();

            using (var p = new ExcelPackage())
            {
                var ws = p.Workbook.Worksheets.Add("Nabídka");

                var membersToInclude = typeof(VfkData)
                            .GetProperties(BindingFlags.Instance | BindingFlags.Public)
                            .Where(a => !Attribute.IsDefined(a, typeof(EpplusIgnore)))
                            .ToArray();

                ws.Cells.LoadFromCollection(data, true, OfficeOpenXml.Table.TableStyles.Light1, BindingFlags.Instance | BindingFlags.Public, membersToInclude);

                p.SaveAs(ms);
            }

            ms.Seek(0, SeekOrigin.Begin);
            return ms;
        }
    }
}