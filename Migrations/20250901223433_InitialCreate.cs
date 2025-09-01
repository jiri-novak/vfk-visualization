using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VfkVisualization.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "vfk_export",
                columns: table => new
                {
                    id = table.Column<string>(type: "TEXT", nullable: false),
                    file_name = table.Column<string>(type: "TEXT", nullable: true),
                    created_at_utc = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vfk_export", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "vfk_export_price",
                columns: table => new
                {
                    tel_id = table.Column<long>(type: "INTEGER", nullable: false),
                    created_at_utc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    export_id = table.Column<string>(type: "TEXT", nullable: false),
                    cena_nabidkova = table.Column<int>(type: "INTEGER", nullable: false),
                    poznamka = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vfk_export_price", x => new { x.export_id, x.tel_id, x.created_at_utc });
                    table.ForeignKey(
                        name: "FK_vfk_export_price_vfk_export_export_id",
                        column: x => x.export_id,
                        principalTable: "vfk_export",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "vfk_export_price");

            migrationBuilder.DropTable(
                name: "vfk_export");
        }
    }
}
