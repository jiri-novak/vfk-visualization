using System.ComponentModel;
using ServerApp.Services;

public class VfkData
{
    [EpplusIgnore]
    public int Id { get; set; }

    [Description("kraj")]
    public string Kraj { get; set; }
    [Description("okres")]
    public string Okres { get; set; }
    [Description("pracoviste")]
    public string Pracoviste { get; set; }
    [Description("obec")]
    public string Obec { get; set; }
    [Description("katastralni_uzemi")]
    public string KatastralniUzemi { get; set; }
    [Description("Lvid")]
    public int? LvId { get; set; }
    [Description("typ_vlastnika")]
    public string TypVlastnika { get; set; }
    [Description("prijmeni")]
    public string Prijmeni { get; set; }
    [Description("jmeno")]
    public string Jmeno { get; set; }
    [Description("titul_pred_jmenem")]
    public string TitulPredJmenem { get; set; }
    [Description("titul_za_jmenem")]
    public string TitulZaJmenem { get; set; }
    [Description("nazev")]
    public string Nazev { get; set; }
    [Description("rodne_cislo")]
    public string RodneCislo { get; set; }
    [Description("vek")]
    public int? Vek { get; set; }
    [Description("osloveni")]
    public string Osloveni { get; set; }
    [Description("ico")]
    public int? Ico { get; set; }
    [Description("cislo_domovni")]
    public int? CisloDomovni { get; set; }
    [Description("cislo_orientacni")]
    public string CisloOrientacni { get; set; }
    [Description("ulice")]
    public string Ulice { get; set; }
    [Description("cast_obce")]
    public string CastObce { get; set; }
    [Description("obec_vl")]
    public string ObecVl { get; set; }
    [Description("okres_vl")]
    public string OkresVl { get; set; }
    [Description("psc")]
    public int? Psc { get; set; }
    [Description("mestska_cast")]
    public string MestskaCast { get; set; }
    [Description("cp_ce")]
    public string CpCe { get; set; }
    [Description("adresa_VDP")]
    public string AdresaVdp { get; set; }
    [Description("vymera")]
    public int? Vymera { get; set; }
    [Description("podil")]
    public string Podil { get; set; }
    [Description("podil_procenta")]
    public int? PodilProcenta { get; set; }
    [Description("duplicita_vla")]
    public string DuplicitaVla { get; set; }
    [Description("pocet_vlastniku")]
    public int? PocetVlastniku { get; set; }
    [Description("podil_m2")]
    public int? PodilM2 { get; set; }
    [Description("vymera_orna_puda")]
    public int? VymeraOrnaPuda { get; set; }
    [Description("vymera_ttp")]
    public int? VymeraTtp { get; set; }
    [Description("vymera_chmelnice")]
    public int? VymeraChmelnice { get; set; }
    [Description("vymera_vinice")]
    public int? VymeraVinice { get; set; }
    [Description("vymera_ovocny_sad")]
    public int? VymeraOvocnySad { get; set; }
    [Description("vymera_lesni_pozemek")]
    public int? VymeraLesniPozemek { get; set; }
    [Description("vymera_ostatni_plocha")]
    public int? VymeraOstatniPlocha { get; set; }
    [Description("vymera_pze")]
    public int? VymeraPze { get; set; }
    [Description("cena_pozemku")]
    public int? CenaPozemku { get; set; }
    [Description("prumerne_bpej")]
    public string PrumerneBpej { get; set; }
    [Description("vymera_bpej")]
    public double VymeraBpej { get; set; }
    [Description("cena_m2")]
    public double CenaM2 { get; set; }
    [Description("cena_nabidkova")]
    public int? CenaNabidkova { get; set; }
    [Description("staveb")]
    public int? Staveb { get; set; }
    [Description("parcel")]
    public int? Parcel { get; set; }
    [Description("jednotka")]
    public int? Jednotka { get; set; }
    [Description("prav_stavby")]
    public int? PravStavby { get; set; }
    [Description("stejny_okres")]
    public string StejnyOkres { get; set; }
    [Description("stejna_obec")]
    public string StejnaObec { get; set; }
    [Description("odkaz_Nahlizeni")]
    public string OdkazNahlizeni { get; set; }
    [Description("zemedelec")]
    public string Zemedelec { get; set; }
    [Description("dotace")]
    public string Dotace { get; set; }
    [Description("vymera_lpis")]
    public int? VymeraLpis { get; set; }
    [Description("vymera_lpis_procenta")]
    public int? VymeraLpisProcenta { get; set; }
    [Description("vektorova_mapa")]
    public string VektorovaMapa { get; set; }
    [EpplusIgnore]
    public int KatuzeKod { get; set; }
    [EpplusIgnore]
    public long TelId { get; set; }
}