using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using VfkVisualization.Repositories;

namespace VfkVisualization.Services;

internal class KusHostedService(IServiceProvider serviceProvider, KusCache kusCache) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var repository = scope.ServiceProvider.GetRequiredService<VfkDataRepository>();
        var allKus = repository.GetAllKus();
        kusCache.Set(allKus);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}