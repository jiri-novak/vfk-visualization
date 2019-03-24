using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServerApp.Converters;
using ServerApp.Services;

namespace ServerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VfkDataController : ControllerBase
    {
        private readonly VfkDataService service;
        private readonly VfkDataConverter converter;

        public VfkDataController(VfkDataService service, VfkDataConverter converter)
        {
            this.service = service;
            this.converter = converter;
        }

        [Route("{telId}")]
        [HttpGet]
        public ActionResult<IEnumerable<VfkData>> Get([FromRoute] int? telId)
        {
            if (!telId.HasValue)
                return BadRequest();

            return Ok(service.Get(telId.Value).Select(converter.ToModel).ToArray());
        }

        [Route("generate/excel")]
        [HttpPost]
        public IActionResult Export([FromBody] IEnumerable<LvRefModel> data)
        {
            if (!data.Any())
                return BadRequest();

            return File(service.Export(data), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", $"nabidka_{DateTime.Now.ToShortDateString()}.xlsx");
        }
    }
}
