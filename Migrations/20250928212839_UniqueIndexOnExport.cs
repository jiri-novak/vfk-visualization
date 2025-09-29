using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VfkVisualization.Migrations
{
    /// <inheritdoc />
    public partial class UniqueIndexOnExport : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_vfk_export_name",
                table: "vfk_export");

            migrationBuilder.CreateIndex(
                name: "IX_vfk_export_name",
                table: "vfk_export",
                column: "name",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_vfk_export_name",
                table: "vfk_export");

            migrationBuilder.CreateIndex(
                name: "IX_vfk_export_name",
                table: "vfk_export",
                column: "name");
        }
    }
}
