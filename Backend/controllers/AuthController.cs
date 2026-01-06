using Backend.Services;
using Microsoft.AspNetCore.Mvc;
using Backend.Requests;
using Microsoft.AspNetCore.Authorization;

namespace Backend.Controllers
{
  [ApiController]
  [Route("api/[controller]")]
  public class AuthController : ControllerBase
  {
    private readonly AuthService _auth;

    public AuthController(AuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
      if (!ModelState.IsValid)
        return BadRequest(ModelState);

      var (success, message, user, token) = await _auth.RegisterAsync(req);
      if (!success)
        return BadRequest(new { success, message });

      return Ok(new { success, message, user, token });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
      var (success, message, user, token) = await _auth.LoginAsync(req);
      if (!success)
        return Unauthorized(new { success, message });

      return Ok(new { success, message, user, token });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
      var userId = HttpContext.Items["UserId"]?.ToString();
      if (string.IsNullOrEmpty(userId))
        return Unauthorized(new { success = false, message = "Token missing or invalid." });

      var user = await _auth.GetUserByIdAsync(userId);
      if (user == null)
        return NotFound(new { success = false, message = "User not found." });

      return Ok(new { success = true, user });
    }

    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest req)
    {
      var userId = HttpContext.Items["UserId"]?.ToString();
      if (string.IsNullOrEmpty(userId))
        return Unauthorized(new { success = false, message = "Token missing or invalid." });

      if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Email))
        return BadRequest(new { success = false, message = "Name and Email are required." });

      var (success, message, user) = await _auth.UpdateUserAsync(userId, req.Name.Trim(), req.Email.Trim());
      if (!success) return BadRequest(new { success = false, message });

      return Ok(new { success = true, message, user });
    }

    [HttpDelete("delete")]
    [Authorize]
    public async Task<IActionResult> DeleteUser()
    {
      var userId = HttpContext.Items["UserId"]?.ToString();
      if (string.IsNullOrEmpty(userId))
        return Unauthorized(new { success = false, message = "Token missing or invalid." });

      var (success, message) = await _auth.DeleteUserAsync(userId);
      if (!success)
        return BadRequest(new { success, message });

      return Ok(new { success, message });
    }
  }
}
