namespace Backend.DTOs
{
  public class AuthResponse
  {
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;

    // JWT Token
    public string? Token { get; set; }

    // Basic user info to send after login/register
    public UserDto? User { get; set; }
  }

  public class UserDto
  {
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
  }

  
}
