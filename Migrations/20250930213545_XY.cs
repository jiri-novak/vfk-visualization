using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VfkVisualization.Migrations
{
    /// <inheritdoc />
    public partial class XY : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "historie",
                table: "vfk_export_price");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "x",
                table: "vfk_export_price");

            migrationBuilder.DropColumn(
                name: "y",
                table: "vfk_export_price");

            migrationBuilder.AddColumn<string>(
                name: "historie",
                table: "vfk_export_price",
                type: "TEXT",
                nullable: true);
        }
    }
}
