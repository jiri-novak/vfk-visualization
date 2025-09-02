using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using VfkVisualization.Options;

namespace VfkVisualization.Repositories;

public class VfkDataReadOnlyContext(IOptions<DbOptions> options) : DbContext
{
    public IQueryable<VfkData> Entries => Set<VfkData>().AsNoTracking();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite(options.Value.VfkReadOnly);
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<VfkData>().ToTable("data_vfk", "main");
        modelBuilder.Entity<VfkData>(e =>
        {
            e.HasKey(x => x.Id);

            e.Property(x => x.Id).HasColumnName("ID");
            e.Property(x => x.Kraj).HasColumnName("KRAJ");
            e.Property(x => x.Okres).HasColumnName("OKRES");
            e.Property(x => x.Pracoviste).HasColumnName("PRACOVISTEtext");
            e.Property(x => x.Obec).HasColumnName("OBECtext");
            e.Property(x => x.KatastralniUzemi).HasColumnName("KATASTRALNI_UZEMItext");
            e.Property(x => x.LvId).HasColumnName("LVIDINTEGER");
            e.Property(x => x.TypVlastnika).HasColumnName("TYP_VLASTNIKAtext");
            e.Property(x => x.Prijmeni).HasColumnName("PRIJMENItext");
            e.Property(x => x.Jmeno).HasColumnName("JMENOtext");
            e.Property(x => x.TitulPredJmenem).HasColumnName("TITUL_PRED_JMENEMtext");
            e.Property(x => x.TitulZaJmenem).HasColumnName("TITUL_ZA_JMENEMtext");
            e.Property(x => x.Nazev).HasColumnName("NAZEVtext");
            e.Property(x => x.RodneCislo).HasColumnName("RODNE_CISLOtext");
            e.Property(x => x.Vek).HasColumnName("VEKINTEGER");
            e.Property(x => x.Osloveni).HasColumnName("OSLOVENItext");
            e.Property(x => x.Ico).HasColumnName("ICOINTEGER");
            e.Property(x => x.CisloDomovni).HasColumnName("CISLO_DOMOVNIINTEGER");
            e.Property(x => x.CisloOrientacni).HasColumnName("CISLO_ORIENTACNItext");
            e.Property(x => x.Ulice).HasColumnName("ULICEtext");
            e.Property(x => x.CastObce).HasColumnName("CAST_OBCEtext");
            e.Property(x => x.ObecVl).HasColumnName("OBEC_VLtext");
            e.Property(x => x.OkresVl).HasColumnName("OKRES_VLtext");
            e.Property(x => x.Psc).HasColumnName("PSCINTEGER");
            e.Property(x => x.MestskaCast).HasColumnName("MESTSKA_CASTtext");
            e.Property(x => x.CpCe).HasColumnName("CP_CEtext");
            e.Property(x => x.AdresaVdp).HasColumnName("ADRESA_VDPtext");
            e.Property(x => x.Vymera).HasColumnName("VYMERAINTEGER");
            e.Property(x => x.Podil).HasColumnName("PODILtext");
            e.Property(x => x.PodilProcenta).HasColumnName("PODIL_PROCENTAINTEGER");
            e.Property(x => x.DuplicitaVla).HasColumnName("DUPLICITA_VLAtext");
            e.Property(x => x.PocetVlastniku).HasColumnName("POCET_VLASTNIKUINTEGER");
            e.Property(x => x.PodilM2).HasColumnName("PODIL_M2INTEGER");
            e.Property(x => x.VymeraOrnaPuda).HasColumnName("VYMERA_ORNA_PUDAINTEGER");
            e.Property(x => x.VymeraTtp).HasColumnName("VYMERA_TTPINTEGER");
            e.Property(x => x.VymeraChmelnice).HasColumnName("VYMERA_CHMELNICEINTEGER");
            e.Property(x => x.VymeraVinice).HasColumnName("VYMERA_VINICEINTEGER");
            e.Property(x => x.VymeraOvocnySad).HasColumnName("VYMERA_OVOCNY_SADINTEGER");
            e.Property(x => x.VymeraLesniPozemek).HasColumnName("VYMERA_LESNI_POZEMEKINTEGER");
            e.Property(x => x.VymeraOstatniPlocha).HasColumnName("VYMERA_OSTATNI_PLOCHAINTEGER");
            e.Property(x => x.VymeraPze).HasColumnName("VYMERA_PZEINTEGER");
            e.Property(x => x.CenaPozemku).HasColumnName("CENA_POZEMKUINTEGER");
            e.Property(x => x.VymeraBpej).HasColumnName("VYMERA_BPEJINTEGER");
            e.Property(x => x.CenaM2).HasColumnName("CENA_M2INTEGER");
            e.Property(x => x.CenaNabidkova).HasColumnName("CENA_NABIDKOVAINTEGER");
            e.Property(x => x.Staveb).HasColumnName("STAVEBINTEGER");
            e.Property(x => x.Parcel).HasColumnName("PARCELINTEGER");
            e.Property(x => x.Jednotka).HasColumnName("JEDNOTKAINTEGER");
            e.Property(x => x.PravStavby).HasColumnName("PRAV_STAVBYINTEGER");
            e.Property(x => x.StejnyOkres).HasColumnName("STEJNY_OKREStext");
            e.Property(x => x.StejnaObec).HasColumnName("STEJNA_OBECtext");
            e.Property(x => x.OdkazNahlizeni).HasColumnName("ODKAZ_NAHLIZENItext");
            e.Property(x => x.Zemedelec).HasColumnName("ZEMEDELECtext");
            e.Property(x => x.Dotace).HasColumnName("DOTACEtext");
            e.Property(x => x.VymeraLpis).HasColumnName("VYMERA_LPISINTEGER");
            e.Property(x => x.VymeraLpisProcenta).HasColumnName("VYMERA_LPIS_PROCENTAINTEGER");
            e.Property(x => x.VektorovaMapa).HasColumnName("VEKTOROVA_MAPAtext");
            e.Property(x => x.PrumerneBpej).HasColumnName("PRUMERNE_BPEJtext");
            e.Property(x => x.KatuzeKod).HasColumnName("KATUZE_KODINTEGER");
            e.Property(x => x.TelId).HasColumnName("TEL_IDINTEGER");
            e.Property(x => x.Poznamka).HasColumnName("POZNAMKAtext");
        });

        base.OnModelCreating(modelBuilder);
    }
    
    public override int SaveChanges()
    {
        throw new InvalidOperationException("This context is read-only.");
    }
}