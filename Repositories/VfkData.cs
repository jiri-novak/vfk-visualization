using System;
using System.ComponentModel;
using VfkVisualization.Services;

namespace VfkVisualization.Repositories;

public class VfkData
{
    [EpplusIgnore] public int Id { get; set; }
    
    [Description("kraj")] 
    [EpplusOrder(2)] 
    public string? Kraj { get; set; }

    [Description("okres")]
    [EpplusOrder(3)]
    public string? Okres { get; set; }

    [Description("pracoviste")]
    [EpplusOrder(1)]
    public string? Pracoviste { get; set; }

    [Description("obec")] [EpplusOrder(4)] public string? Obec { get; set; }

    [Description("katastralni_uzemi")]
    [EpplusOrder(5)]
    public string? KatastralniUzemi { get; set; }

    [Description("lv_id")]
    [EpplusOrder(6)]
    public int? LvId { get; set; }

    [Description("typ_vlastnika")]
    [EpplusOrder(7)]
    public string? TypVlastnika { get; set; }

    [Description("prijmeni")]
    [EpplusOrder(8)]
    public string? Prijmeni { get; set; }

    [Description("jmeno")]
    [EpplusOrder(9)]
    public string? Jmeno { get; set; }

    [Description("titul_pred_jmenem")]
    [EpplusOrder(10)]
    public string? TitulPredJmenem { get; set; }

    [Description("titul_za_jmenem")]
    [EpplusOrder(11)]
    public string? TitulZaJmenem { get; set; }

    [Description("nazev")]
    [EpplusOrder(12)]
    public string? Nazev { get; set; }

    [Description("rodne_cislo")]
    [EpplusOrder(13)]
    public string? RodneCislo { get; set; }

    [Description("vek")] [EpplusOrder(14)] public int? Vek { get; set; }

    [Description("osloveni")]
    [EpplusOrder(15)]
    public string? Osloveni { get; set; }

    [Description("ico")] [EpplusOrder(16)] public int? Ico { get; set; }

    [Description("cislo_domovni")]
    [EpplusOrder(17)]
    public int? CisloDomovni { get; set; }

    [Description("cislo_orientacni")]
    [EpplusOrder(18)]
    public string? CisloOrientacni { get; set; }

    [Description("ulice")]
    [EpplusOrder(19)]
    public string? Ulice { get; set; }

    [Description("cast_obce")]
    [EpplusOrder(20)]
    public string? CastObce { get; set; }

    [Description("obec_vl")]
    [EpplusOrder(21)]
    public string? ObecVl { get; set; }

    [Description("okres_vl")]
    [EpplusOrder(22)]
    public string? OkresVl { get; set; }

    [Description("psc")] [EpplusOrder(23)] public int? Psc { get; set; }

    [Description("mestska_cast")]
    [EpplusOrder(24)]
    public string? MestskaCast { get; set; }

    [Description("cp_ce")]
    [EpplusOrder(25)]
    public string? CpCe { get; set; }

    [Description("adresa_VDP")]
    [EpplusOrder(26)]
    public string? AdresaVdp { get; set; }

    [Description("vymera")]
    [EpplusOrder(27)]
    public int? Vymera { get; set; }

    [Description("podil")]
    [EpplusOrder(28)]
    public string? Podil { get; set; }

    [Description("podil_procenta")]
    [EpplusOrder(29)]
    public int? PodilProcenta { get; set; }

    [Description("duplicita_vla")]
    [EpplusOrder(30)]
    public string? DuplicitaVla { get; set; }

    [Description("pocet_vlastniku")]
    [EpplusOrder(31)]
    public int? PocetVlastniku { get; set; }

    [Description("podil_m2")]
    [EpplusOrder(32)]
    public int? PodilM2 { get; set; }

    [Description("vymera_orna_puda")]
    [EpplusOrder(33)]
    public int? VymeraOrnaPuda { get; set; }

    [Description("vymera_ttp")]
    [EpplusOrder(34)]
    public int? VymeraTtp { get; set; }

    [Description("vymera_chmelnice")]
    [EpplusOrder(35)]
    public int? VymeraChmelnice { get; set; }

    [Description("vymera_vinice")]
    [EpplusOrder(36)]
    public int? VymeraVinice { get; set; }

    [Description("vymera_ovocny_sad")]
    [EpplusOrder(37)]
    public int? VymeraOvocnySad { get; set; }

    [Description("vymera_lesni_pozemek")]
    [EpplusOrder(38)]
    public int? VymeraLesniPozemek { get; set; }

    [Description("vymera_ostatni_plocha")]
    [EpplusOrder(39)]
    public int? VymeraOstatniPlocha { get; set; }

    [Description("vymera_pze")]
    [EpplusOrder(40)]
    public int? VymeraPze { get; set; }

    [Description("cena_pozemku")]
    [EpplusOrder(41)]
    public int? CenaPozemku { get; set; }

    [Description("prumerne_bpej")]
    [EpplusOrder(42)]
    public string? PrumerneBpej { get; set; }

    [Description("vymera_bpej")]
    [EpplusOrder(43)]
    public double VymeraBpej { get; set; }

    [Description("cena_m2")]
    [EpplusOrder(44)]
    public double CenaM2 { get; set; }

    [Description("cena_nabidkova")]
    [EpplusOrder(45)]
    public int? CenaNabidkova { get; set; }

    [Description("staveb")]
    [EpplusOrder(46)]
    public int? Staveb { get; set; }

    [Description("parcel")]
    [EpplusOrder(47)]
    public int? Parcel { get; set; }

    [Description("jednotka")]
    [EpplusOrder(48)]
    public int? Jednotka { get; set; }

    [Description("prav_stavby")]
    [EpplusOrder(49)]
    public int? PravStavby { get; set; }

    [Description("stejny_okres")]
    [EpplusOrder(50)]
    public string? StejnyOkres { get; set; }

    [Description("stejna_obec")]
    [EpplusOrder(51)]
    public string? StejnaObec { get; set; }

    [Description("odkaz_nahlizeni")]
    [EpplusOrder(52)]
    public string? OdkazNahlizeni { get; set; }

    [Description("zemedelec")]
    [EpplusOrder(53)]
    public string? Zemedelec { get; set; }

    [Description("dotace")]
    [EpplusOrder(54)]
    public string? Dotace { get; set; }

    [Description("vymera_lpis")]
    [EpplusOrder(55)]
    public int? VymeraLpis { get; set; }

    [Description("vymera_lpis_procenta")]
    [EpplusOrder(56)]
    public int? VymeraLpisProcenta { get; set; }

    [Description("vektorova_mapa")]
    [EpplusOrder(57)]
    public string? VektorovaMapa { get; set; }

    [Description("poznamka")]
    [EpplusOrder(58)]
    public string? Poznamka { get; set; }

    [EpplusIgnore] public int KatuzeKod { get; set; }
    [EpplusIgnore] public long TelId { get; set; }

    internal class EpplusIgnore : Attribute
    {
    }

    public class EpplusOrder(int order) : Attribute
    {
        public int Order { get; set; } = order;
    }
}