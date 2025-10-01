using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VfkVisualization.Migrations
{
    /// <inheritdoc />
    public partial class NoMoreXY : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "x",
                table: "vfk_export_price");

            migrationBuilder.DropColumn(
                name: "y",
                table: "vfk_export_price");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "x",
                table: "vfk_export_price",
                type: "REAL",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "y",
                table: "vfk_export_price",
                type: "REAL",
                nullable: false,
                defaultValue: 0f);
        }
    }
}
