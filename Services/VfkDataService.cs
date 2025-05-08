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

        public IEnumerable<VfkData> Get(long telId)
        {
            return repository.Get(telId);
        }

        public Stream Export(IEnumerable<LvRefModel> lvRefs)
        {
            var refs = lvRefs.ToDictionary(x => x.TelId, x => x);
            var data = repository.Get(lvRefs.Select(x => x.TelId).ToList());
            var excelData = new List<VfkDataExcel>();

            foreach (var d in data)
            {
                var e = new VfkDataExcel
                {
                    Id = d.Id,
                    Kraj = d.Kraj,
                    Okres = d.Okres,
                    Pracoviste = d.Pracoviste,
                    Obec = d.Obec,
                    KatastralniUzemi = d.KatastralniUzemi,
                    LvId = d.LvId,
                    TypVlastnika = d.TypVlastnika,
                    Prijmeni = d.Prijmeni,
                    Jmeno = d.Jmeno,
                    TitulPredJmenem = d.TitulPredJmenem,
                    TitulZaJmenem = d.TitulZaJmenem,
                    Nazev = d.Nazev,
                    RodneCislo = d.RodneCislo,
                    Vek = d.Vek,
                    Osloveni = d.Osloveni,
                    Ico = d.Ico,
                    CisloDomovni = d.CisloDomovni,
                    CisloOrientacni = d.CisloOrientacni,
                    Ulice = d.Ulice,
                    CastObce = d.CastObce,
                    ObecVl = d.ObecVl,
                    OkresVl = d.OkresVl,
                    Psc = d.Psc,
                    MestskaCast = d.MestskaCast,
                    CpCe = d.CpCe,
                    AdresaVdp = d.AdresaVdp,
                    Vymera = d.Vymera,
                    Podil = d.Podil,
                    PodilProcenta = d.PodilProcenta,
                    DuplicitaVla = d.DuplicitaVla,
                    PocetVlastniku = d.PocetVlastniku,
                    PodilM2 = d.PodilM2,
                    VymeraOrnaPuda = d.VymeraOrnaPuda,
                    VymeraTtp = d.VymeraTtp,
                    VymeraChmelnice = d.VymeraChmelnice,
                    VymeraVinice = d.VymeraVinice,
                    VymeraOvocnySad = d.VymeraOvocnySad,
                    VymeraLesniPozemek = d.VymeraLesniPozemek,
                    VymeraOstatniPlocha = d.VymeraOstatniPlocha,
                    VymeraPze = d.VymeraPze,
                    CenaPozemku = d.CenaPozemku,
                    PrumerneBpej = d.PrumerneBpej,
                    VymeraBpej = d.VymeraBpej,
                    CenaM2 = d.CenaM2,
                    CenaNabidkova = d.CenaNabidkova,
                    Staveb = d.Staveb,
                    Parcel = d.Parcel,
                    Jednotka = d.Jednotka,
                    PravStavby = d.PravStavby,
                    StejnyOkres = d.StejnyOkres,
                    StejnaObec = d.StejnaObec,
                    OdkazNahlizeni = d.OdkazNahlizeni,
                    Zemedelec = d.Zemedelec,
                    Dotace = d.Dotace,
                    VymeraLpis = d.VymeraLpis,
                    VymeraLpisProcenta = d.VymeraLpisProcenta,
                    VektorovaMapa = d.VektorovaMapa,
                    KatuzeKod = d.KatuzeKod,
                    TelId = d.TelId,
                    Poznamka = refs[d.TelId].Poznamka,
                };
                
                if (refs[d.TelId].Cena.HasValue)
                {
                    e.CenaM2 = refs[d.TelId].Cena.Value;
                }
                
                excelData.Add(e);
            }

            var ms = new MemoryStream();

            using (var p = new ExcelPackage())
            {
                var ws = p.Workbook.Worksheets.Add("Nabídka");

                var membersToInclude = typeof(VfkDataExcel)
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
}