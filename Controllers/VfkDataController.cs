using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using VfkVisualization.Extensions;
using VfkVisualization.Models;
using VfkVisualization.Repositories;
using VfkVisualization.Services;

namespace VfkVisualization.Controllers;

[Route("api/[controller]")]
[ApiController]
public class VfkDataController(VfkDataService service) : ControllerBase
{
    [HttpGet("{telId}")]
    public ActionResult<IEnumerable<VfkData>> Get([FromRoute] long? telId)
    {
        if (!telId.HasValue)
            return BadRequest();

        return Ok(service.Get(telId.Value).Select(x => x.ToModel()).ToArray());
    }

    [HttpPost("{telId}/price")]
    public IActionResult SetPrice([FromRoute] long telId, [FromBody] SetPriceModel model)
    {
        service.SetPrice(telId, model.ExportId, model.Price);
        return Ok();
    }
    
    [HttpPost("{telId}/comment")]
    public IActionResult SetComment([FromRoute] long telId, [FromBody] SetCommentModel model)
    {
        service.SetComment(telId, model.ExportId, model.Comment);
        return Ok();
    }

    [HttpPost("generate/excel")]
    public IActionResult Export([FromBody] GenerateExcelModel model)
    {
        var export = service.GetExport(model.ExportId);
        
        if (export == null)
            return NotFound();

        return File(service.Export(export), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"nabidka_{DateTime.Now:s}.xlsx");
    }

    [HttpPost("export")]
    public IActionResult CreateExport([FromBody] CreateExportModel export)
    {
        service.CreateExport(export);
        return Ok();
    }

    [HttpGet("kus")]
    public IActionResult GetKus([FromQuery] string? startsWith = null)
    {
        var kus = service.GetKus(startsWith).Select(x => x.ToModel());
        return Ok(kus);
    }
    
    [HttpGet("export")]
    public IActionResult GetExistingExports([FromQuery] string? startsWith = null)
    {
        var existing = service.GetExistingExports(startsWith).Select(x => x.ToIdModel());
        return Ok(existing);
    }
    
    [HttpGet("export/{id}")]
    public IActionResult GetExport([FromRoute] string id)
    {
        var existing = service.GetExport(id);
        if (existing == null) return NotFound();
        return Ok(existing.ToModel());
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
        var session = service.SetActiveKatuze(activeKatuze);
        return Ok(session);
    }

    [HttpPost("session/export")]
    public IActionResult SetActiveExport([FromBody] SetActiveExportModel activeExport)
    {
        var session = service.SetActiveExport(activeExport);
        return Ok(session);
    }
}