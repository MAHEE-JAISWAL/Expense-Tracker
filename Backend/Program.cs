using Backend.Config;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Read FRONTEND_URL from env (Render priority) or appsettings (local dev)
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL")
                  ?? builder.Configuration["FrontendUrl"]
                  ?? "http://localhost:5173";

Console.WriteLine($"✅ Frontend URL: {frontendUrl}");

// Read MongoDB connection from env FIRST, then appsettings
var mongoConn = Environment.GetEnvironmentVariable("MongoDbSettings__ConnectionString")
                ?? builder.Configuration["MongoDbSettings:ConnectionString"];

if (string.IsNullOrEmpty(mongoConn))
  throw new Exception("❌ MongoDB connection string missing. Set env var MongoDbSettings__ConnectionString on Render.");

Console.WriteLine($"✅ MongoDB connection: {mongoConn.Substring(0, Math.Min(50, mongoConn.Length))}...");

// Read JWT secret from env FIRST, then appsettings
var jwtKey = Environment.GetEnvironmentVariable("JWT_SECRET")
             ?? builder.Configuration["JwtSettings:SecretKey"];

if (string.IsNullOrEmpty(jwtKey))
  throw new Exception("❌ JWT secret not found. Set env var JWT_SECRET on Render.");

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);
if (keyBytes.Length < 32)
  throw new Exception($"❌ JWT secret too short! Need >= 32 bytes, got {keyBytes.Length} bytes.");

Console.WriteLine($"✅ JWT Secret loaded: {keyBytes.Length} bytes");

// Add services
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy.WithOrigins(
        frontendUrl,
        "https://smartexpensee.netlify.app",
        "http://localhost:5173",
        "http://localhost:3000"
      )
      .AllowAnyMethod()
      .AllowAnyHeader()
      .AllowCredentials();
  });
});

// MongoDB config
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ExpenseService>();

// JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
      ValidateIssuer = false,
      ValidateAudience = false,
      ValidateLifetime = true
    };
    options.Events = new JwtBearerEvents
    {
      OnTokenValidated = context =>
      {
        var idClaim = context.Principal?.FindFirst("id")?.Value;
        if (!string.IsNullOrEmpty(idClaim))
          context.HttpContext.Items["UserId"] = idClaim;
        return Task.CompletedTask;
      }
    };
  });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
  app.UseDeveloperExceptionPage();
}

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health endpoint
app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }))
  .WithName("Health")
  .WithOpenApi();

app.Run();