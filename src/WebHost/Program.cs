using AppBoxCore;
using AppBoxWebHost;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

var app = builder.Build();

// Configure the HTTP request pipeline.

// app.UseHttpsRedirection();

// app.UseAuthorization();

app.UseWebSockets();

app.MapControllers();

// 初始化
RuntimeContext.Init(new HostRuntimeContext());

app.Run();