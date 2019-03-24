
using System;
using ServerApp.Models;

namespace ServerApp.Converters
{
    public class VfkDataConverter
    {
        public VfkDataModel ToModel(VfkData d)
        {
            var cOr = string.IsNullOrEmpty(d.CisloOrientacni) ? "" : $"/{d.CisloOrientacni}";

            return new VfkDataModel
            {
                Jmeno = string.IsNullOrEmpty(d.Jmeno) ? d.Nazev : $"{d.Jmeno} {d.Prijmeni}",
                Adresa = $"{d.Ulice} {d.CpCe} {d.CisloDomovni}{cOr}, {d.CastObce}, {d.Psc} {d.Obec}",
                Podil = Convert.ToInt32(d.PodilProcenta),
                PodilM2 = Convert.ToInt32(d.PodilM2),
                Typ = d.TypVlastnika,
                Zemedelec = string.IsNullOrEmpty(d.Zemedelec) ? (bool?)null : Convert.ToBoolean(d.Zemedelec)
            };
        }
    }
}