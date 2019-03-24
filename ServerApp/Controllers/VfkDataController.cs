using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ServerApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VfkDataController : ControllerBase
    {
        private readonly VfkDataRepository repository;

        public VfkDataController(VfkDataRepository repository)
        {
            this.repository = repository;
        }

        [Route("sessionId")]
        [HttpGet]
        public ActionResult<IEnumerable<VfkData>> Get(string sessionId)
        {
            return Ok(repository.Get(1934034101).ToArray());
        }

        [Route("sessionId")]
        [HttpPost]
        public ActionResult<FileContentResult> Export(string sessionId) {
            throw new NotImplementedException();
        }
    }
}
