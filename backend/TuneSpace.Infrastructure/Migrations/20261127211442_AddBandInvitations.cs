using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TuneSpace.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBandInvitations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BandInvitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BandId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    InvitedById = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BandInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BandInvitations_AspNetUsers_InvitedById",
                        column: x => x.InvitedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BandInvitations_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BandInvitations_Bands_BandId",
                        column: x => x.BandId,
                        principalTable: "Bands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BandInvitations_BandId_UserId",
                table: "BandInvitations",
                columns: new[] { "BandId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BandInvitations_InvitedById",
                table: "BandInvitations",
                column: "InvitedById");

            migrationBuilder.CreateIndex(
                name: "IX_BandInvitations_UserId",
                table: "BandInvitations",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BandInvitations");
        }
    }
}
