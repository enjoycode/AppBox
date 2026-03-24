using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Tests;

[Table("sys.Employee")]
public class EmployeeEF
{
    public Guid Id { get; set; }
    public string Name { get; set; }

    public bool? Male { get; set; }

    public DateTime? Birthday { get; set; }

    public string? Account { get; set; }
    
    public byte[]? Password { get; set; }
}

public class TestDbContext : DbContext
{
    public DbSet<EmployeeEF> Employees { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(ServerRuntimeHelper.ConnectionString);
    }
}