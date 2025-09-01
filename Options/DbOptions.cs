namespace ServerApp.Options;

public class DbOptions
{
    public required string VfkReadOnly { get; set; }
    
    public required string VfkReadWrite { get; set; }
}