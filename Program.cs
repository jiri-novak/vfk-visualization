using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using VfkVisualization.Repositories;

namespace VfkVisualization;

public class Program
{
    public static async Task Main(string[] args)
    {
        var host = CreateWebHostBuilder(args).Build();
            
        using (var scope = host.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<VfkDataReadWriteContext>();
            await db.Database.MigrateAsync();
        }
            
        await host.RunAsync();
    }

    private static IWebHostBuilder CreateWebHostBuilder(string[] args)
    {
        var appSettingsConfiguration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json")
            .Build();

        return WebHost.CreateDefaultBuilder(args)
            .UseStartup<Startup>()
            .UseUrls(appSettingsConfiguration["Urls"]);
    }
}