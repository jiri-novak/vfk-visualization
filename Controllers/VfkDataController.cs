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

    [HttpPost("generate/excel")]
    public IActionResult Export([FromBody] IReadOnlyCollection<LvRefModel> data)
    {
        if (!data.Any())
            return BadRequest();

        return File(service.Export(data), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"nabidka_{DateTime.Now:s}.xlsx");
    }

    [HttpPost("export")]
    public IActionResult CreateExport([FromBody] CreateExportModel export)
    {
        service.CreateExport(export);
        return Ok();
    }

    [HttpGet("export")]
    public IActionResult GetExistingExports([FromQuery] string startsWith)
    {
        var existing = service.GetExistingExports(startsWith).Select(x => x.ToModel());
        return Ok(existing);
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
}