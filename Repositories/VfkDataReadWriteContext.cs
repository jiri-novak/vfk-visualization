using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using ServerApp.Options;

namespace VfkVisualization.Repositories;

public class VfkDataReadWriteContext(IOptions<DbOptions> options) : DbContext
{
    public DbSet<VfkDataExport> Exports => Set<VfkDataExport>();

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
                e.Property(x => x.FileName).HasColumnName("file_name");
                e.Property(x => x.CreatedAtUtc).HasColumnName("created_at_utc");
            });
        
        modelBuilder
            .Entity<VfkDataExportPrice>(e =>
            {
                e.ToTable("vfk_export_price");
                e.Property(x => x.TelId).HasColumnName("tel_id");
                e.Property(x => x.ExportId).HasColumnName("export_id");
                e.Property(x => x.CenaNabidkova).HasColumnName("cena_nabidkova");
                e.Property(x => x.Poznamka).HasColumnName("poznamka");
                e.Property(x => x.CreatedAtUtc).HasColumnName("created_at_utc");
                e.HasKey(x => new { x.ExportId, x.TelId, x.CreatedAtUtc });
            });
        
        modelBuilder.Entity<VfkDataExport>()
            .HasMany(e => e.Prices)
            .WithOne(e => e.Export)
            .HasForeignKey(e => e.ExportId)
            .IsRequired();
    }
}