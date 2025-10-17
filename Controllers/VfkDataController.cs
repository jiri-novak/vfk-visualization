using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using VfkVisualization.Extensions;
using VfkVisualization.Models;
using VfkVisualization.Repositories;
using VfkVisualization.Services;

namespace VfkVisualization.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VfkDataController(VfkDataService service, KusCache kusCache) : ControllerBase
{
    [HttpGet("{telId}")]
    public ActionResult<IEnumerable<VfkData>> Get([FromRoute] long? telId)
    {
        if (!telId.HasValue)
            return BadRequest();

        var vfkData = service.Get(telId.Value);
        var exportPrice = service.GetExportPrice(telId.Value);

        var model = new LvInfoModel
        {
            Vlastnici = vfkData.Select(x => x.ToModel()).ToList(),
            Cena = exportPrice?.ToModel()
        };
        
        return Ok(model);
    }

    [HttpPost("{telId}/price-and-comment")]
    public IActionResult SetPrice([FromRoute] long telId, [FromBody] SetPriceAndCommentModel model)
    {
        var session = service.SetPriceAndComment(telId, model.ExportId, model.Price, model.Comment).ToModel();
        return Ok(session);
    }

    [HttpPost("generate/excel")]
    public IActionResult Export([FromBody] GenerateExcelModel model)
    {
        var (export, _) = service.GetExport(model.ExportId);
        
        if (export == null)
            return NotFound();

        return File(service.Export(export), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"nabidka_{DateTime.Now:s}.xlsx");
    }

    [HttpPost("export")]
    public IActionResult CreateExport([FromBody] CreateExportModel export)
    {
        try
        {
            var created = service.CreateExport(export).ToModel();
            return Ok(created);
        }
        catch (Exception ex) when (ex.InnerException is SqliteException { ErrorCode: 19 })
        {
            throw new Exception($"Seznam se jménem {export.Name} již existuje...");
        }
    }
    
    [HttpDelete("export/{id}")]
    public IActionResult DeleteExport(int id)
    {
        var session = service.DeleteExport(id).ToModel();
        return Ok(session);
    }
    
    [HttpPatch("export/{id}")]
    public IActionResult RenameExport(int id, RenameExportModel export)
    {
        var session = service.RenameExport(id, export.NewName).ToModel();
        return Ok(session);
    }

    [HttpGet("kus")]
    public IActionResult GetKus([FromQuery] string? startsWith = null)
    {
        // var kus = service.GetKus(startsWith).Select(x => x.ToModel());
        var kus = kusCache.Get(startsWith).Select(x => x.ToModel());
        return Ok(kus);
    }
    
    [HttpGet("exports")]
    public IActionResult GetAllExistingExports()
    {
        var existing = service.GetAllExistingExports().Select(x => x.ToModel());
        return Ok(existing);
    }
    
    [HttpGet("export")]
    public IActionResult GetExistingExports([FromQuery] string? startsWith = null)
    {
        var existing = service.GetExistingExports(startsWith).Select(x => x.ToIdModel());
        return Ok(existing);
    }
    
    [HttpGet("export/{id}")]
    public IActionResult GetExport([FromRoute] int id)
    {
        var (export, labels) = service.GetExport(id);
        if (export == null) return NotFound();
        return Ok(export.ToDetailsModel(labels));
    }

    [HttpGet("session")]
    public IActionResult GetSession()
    {
        var session = service.GetOrCreateSession().ToModel();
        return Ok(session);
    }

    [HttpPost("session/katuze")]
    public IActionResult SetActiveKatuze([FromBody] SetActiveKatuzeModel activeKatuze)
    {
        var session = service.SetActiveKatuze(activeKatuze).ToModel();
        return Ok(session);
    }
    
    [HttpDelete("session/katuze")]
    public IActionResult SetNoActiveKatuze()
    {
        var session = service.SetNoActiveKatuze().ToModel();
        return Ok(session);
    }

    [HttpPost("session/export")]
    public IActionResult SetActiveExport([FromBody] SetActiveExportModel activeExport)
    {
        var session = service.SetActiveExport(activeExport).ToModel();
        return Ok(session);
    }
    
    [HttpDelete("session/export")]
    public IActionResult SetNoActiveExport()
    {
        var session = service.SetNoActiveExport().ToModel();
        return Ok(session);
    }
}