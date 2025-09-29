using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using VfkVisualization.Options;

namespace VfkVisualization.Repositories;

public class VfkDataReadWriteContext(IOptions<DbOptions> options) : DbContext
{
    public DbSet<VfkDataExport> Exports => Set<VfkDataExport>();
    
    public DbSet<VfkDataExportPrice> ExportPrices => Set<VfkDataExportPrice>();

    public DbSet<VfkDataSession> Sessions => Set<VfkDataSession>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlite(options.Value.VfkReadWrite);
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<VfkDataExport>(e =>
            {
                e.ToTable("vfk_export");
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).HasColumnName("id");
                e.Property(x => x.Name).HasColumnName("name");
                e.Property(x => x.CreatedAtUtc).HasColumnName("created_at_utc");
                e.HasMany(x => x.Prices)
                    .WithOne(x => x.Export)
                    .HasForeignKey(x => x.ExportId)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => x.Name).IsDescending(false).IsUnique();
            });

        modelBuilder
            .Entity<VfkDataExportPrice>(e =>
            {
                e.ToTable("vfk_export_price");
                e.Property(x => x.TelId).HasColumnName("tel_id");
                e.Property(x => x.ExportId).HasColumnName("export_id");
                e.Property(x => x.CenaNabidkova).HasColumnName("cena_nabidkova");
                e.Property(x => x.Poznamka).HasColumnName("poznamka");
                e.Property(x => x.Historie).HasColumnName("historie");
                e.HasKey(x => new { x.ExportId, x.TelId });
            });

        modelBuilder.Entity<VfkDataSession>(e =>
        {
            e.ToTable("vfk_session");
            e.Property(x => x.Id).HasColumnName("id");
            e.Property(x => x.ActiveKatuzeKod).HasColumnName("active_katuze_kod");
            e.Property(x => x.ActiveKatuzeName).HasColumnName("active_katuze_name");
            e.Property(x => x.ActiveExportId).HasColumnName("active_export_id");
            e.HasOne(x => x.ActiveExport)
                .WithOne(x => x.Session)
                .HasForeignKey<VfkDataSession>(x => x.ActiveExportId)
                .IsRequired(false);
        });
    }
}