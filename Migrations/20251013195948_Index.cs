using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VfkVisualization.Migrations
{
    /// <inheritdoc />
    public partial class Index : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_vfk_export_price_tel_id",
                table: "vfk_export_price",
                column: "tel_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_vfk_export_price_tel_id",
                table: "vfk_export_price");
        }
    }
}
