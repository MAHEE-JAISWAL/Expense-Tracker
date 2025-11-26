using Backend.Config;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
          .AllowAnyMethod()
          .AllowAnyHeader();
  });
});

// MongoDB
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<ExpenseService>();

// JWT Secret from user-secrets or env var
var jwtKey = builder.Configuration["JwtSettings:SecretKey"]
             ?? Environment.GetEnvironmentVariable("JWT_SECRET")
             ?? throw new Exception("❌ JWT secret not found! Run: dotnet user-secrets set \"JwtSettings:SecretKey\" \"your-32-char-secret\"");

var keyBytes = Encoding.UTF8.GetBytes(jwtKey);
if (keyBytes.Length < 32)
  throw new Exception($"❌ JWT secret too short! Must be >= 32 bytes. Current: {keyBytes.Length} bytes. Use a longer secret.");

Console.WriteLine($"✅ JWT Secret loaded: {keyBytes.Length} bytes");

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
  options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
  options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
  options.RequireHttpsMetadata = false;
  options.SaveToken = true;
  options.TokenValidationParameters = new TokenValidationParameters
  {
    ValidateIssuer = false,
    ValidateAudience = false,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
    ClockSkew = TimeSpan.Zero
  };
  options.Events = new JwtBearerEvents
  {
    OnTokenValidated = context =>
    {
      var idClaim = context.Principal?.FindFirst("id")?.Value;
      if (!string.IsNullOrEmpty(idClaim))
        context.HttpContext.Items["UserId"] = idClaim;
      return Task.CompletedTask;
    },
    OnAuthenticationFailed = context =>
    {
      Console.WriteLine($"❌ Auth failed: {context.Exception.Message}");
      return Task.CompletedTask;
    }
  };
});

var app = builder.Build();

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();