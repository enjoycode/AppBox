using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Tests;

[Table("Employee")]
public class EmployeeEF
{
    public Guid Id { get; set; }
    public string Name { get; set; }
}

public class TestDbContext : DbContext
{
    public DbSet<EmployeeEF> Employees { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(ServerRuntimeHelper.ConnectionString);
    }
}