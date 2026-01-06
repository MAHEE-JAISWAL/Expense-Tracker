using Backend.Config;
using Backend.DTOs;
using Backend.Models;
using Backend.Requests;
using BCrypt.Net;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Backend.Services
{
  public class AuthService
  {
    private readonly IMongoCollection<User> _users;
    private readonly string _jwtKey;

    public AuthService(IOptions<MongoDbSettings> options, IConfiguration config)
    {
      var settings = options.Value;
      var client = new MongoClient(settings.ConnectionString);
      var database = client.GetDatabase(settings.DatabaseName);
      _users = database.GetCollection<User>("Users");

      _jwtKey = config["JwtSettings:SecretKey"]
                ?? Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? throw new Exception("JWT secret not configured!");

      var keyBytes = Encoding.UTF8.GetBytes(_jwtKey);
      if (keyBytes.Length < 32)
        throw new Exception($"JWT secret too short! Need >= 32 bytes, got {keyBytes.Length}");
    }

    // change return type to include UserDto and token
    public async Task<(bool Success, string Message, Backend.DTOs.UserDto? User, string? Token)> RegisterAsync(RegisterRequest req)
    {
      var existing = await _users.Find(u => u.Email == req.Email).FirstOrDefaultAsync();
      if (existing != null)
        return (false, "Email already registered.", null, null);

      var hashedPwd = BCrypt.Net.BCrypt.HashPassword(req.Password);
      var user = new User { Name = req.Name, Email = req.Email, PasswordHash = hashedPwd };
      await _users.InsertOneAsync(user);

      var dto = new Backend.DTOs.UserDto { Id = user.Id ?? string.Empty, Name = user.Name, Email = user.Email };
      var token = GenerateJwtToken(user);

      return (true, "Registered successfully.", dto, token);
    }

    public async Task<(bool Success, string Message, UserDto? User, string? Token)> LoginAsync(LoginRequest req)
    {
      var user = await _users.Find(u => u.Email == req.Email).FirstOrDefaultAsync();
      if (user == null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
        return (false, "Invalid email or password.", null, null);

      var token = GenerateJwtToken(user);
      var dto = new UserDto { Id = user.Id ?? string.Empty, Name = user.Name, Email = user.Email };
      return (true, "Login successful.", dto, token);
    }

    private string GenerateJwtToken(User user)
    {
      var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

      var claims = new List<Claim>
      {
        new Claim("id", user.Id ?? string.Empty),
        new Claim("email", user.Email)
      };

      var token = new JwtSecurityToken(
        claims: claims,
        expires: DateTime.UtcNow.AddDays(7),
        signingCredentials: creds
      );

      return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<UserDto?> GetUserByIdAsync(string id)
    {
      var user = await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
      if (user == null) return null;

      return new UserDto { Id = user.Id ?? string.Empty, Name = user.Name, Email = user.Email };
    }

    public async Task<(bool Success, string Message, UserDto? User)> UpdateUserAsync(string id, string name, string email)
    {
      var filter = Builders<User>.Filter.Eq(u => u.Id, id);
      var update = Builders<User>.Update.Set(u => u.Name, name).Set(u => u.Email, email);
      var result = await _users.UpdateOneAsync(filter, update);

      if (result.ModifiedCount == 0)
        return (false, "User not found.", null);

      var user = await GetUserByIdAsync(id);
      return (true, "Updated successfully.", user);
    }

    public async Task<(bool Success, string Message)> DeleteUserAsync(string id)
    {
      var result = await _users.DeleteOneAsync(u => u.Id == id);
      if (result.DeletedCount == 0)
        return (false, "User not found.");
      return (true, "User deleted.");
    }
  }
}
