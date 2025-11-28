using Backend.Config;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Read FRONTEND_URL from env (Render) or appsettings (local dev)
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL")
                  ?? builder.Configuration["FrontendUrl"]
                  ?? "http://localhost:5173";

Console.WriteLine($"✅ Frontend URL: {frontendUrl}");

// ADD THIS BLOCK — validate MongoDB connection
var mongoConn = builder.Configuration["MongoDbSettings:ConnectionString"]
                 ?? Environment.GetEnvironmentVariable("MongoDbSettings__ConnectionString")
                 ?? throw new Exception("❌ Mongo Connection missing. Set MongoDbSettings__ConnectionString env var or appsettings.json");

Console.WriteLine($"✅ MongoDB connected to: {mongoConn.Substring(0, 50)}...");

// ADD THIS BLOCK — validate JWT secret
var jwtKey = builder.Configuration["JwtSettings:SecretKey"]
             ?? Environment.GetEnvironmentVariable("JWT_SECRET")
             ?? throw new Exception("❌ JWT secret not found. Set JWT_SECRET env var.");

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);
if (keyBytes.Length < 32)
  throw new Exception($"❌ JWT secret too short! Must be >= 32 bytes. Current: {keyBytes.Length} bytes.");

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
    options.TokenValidationParameters = new TokenValidationParameters
    {
      ValidateIssuerSigningKey = true,
      IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
      ValidateIssuer = false,
      ValidateAudience = false,
      ValidateLifetime = true
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