using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ServerApp.Converters;

namespace ServerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VfkDataController : ControllerBase
    {
        private readonly VfkDataRepository repository;
        private readonly VfkDataConverter converter;

        public VfkDataController(VfkDataRepository repository, VfkDataConverter converter)
        {
            this.repository = repository;
            this.converter = converter;
        }

        [Route("{telId}")]
        [HttpGet]
        public ActionResult<IEnumerable<VfkData>> Get([FromRoute] int? telId)
        {
            if (!telId.HasValue)
                return BadRequest();

            return Ok(repository.Get(telId.Value).Select(converter.ToModel).ToArray());
        }

        // [Route("sessionId")]
        // [HttpGet]
        // public ActionResult<IEnumerable<VfkData>> Get(string sessionId)
        // {
        //     return Ok(repository.Get(1934034101).ToArray());
        // }

        [Route("sessionId")]
        [HttpPost]
        public ActionResult<FileContentResult> Export(string sessionId)
        {
            throw new NotImplementedException();
        }
    }
}
